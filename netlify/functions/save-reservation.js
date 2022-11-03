const { getReservationErrors } = require("../../support/reservation-service");
const dynamoService = require("../../support/dynamo-service");

function getOccupancy(reservation) {
  const checkIn = new Date(reservation.checkIn);
  const checkOut = new Date(reservation.checkOut);
  const occupancy = [];

  while (checkIn < checkOut) {
    occupancy.push({
      placeId: reservation.placeId,
      date: checkIn.toJSON().split("T")[0],
    });
    checkIn.setDate(checkIn.getDate() + 1);
  }

  return occupancy;
}

exports.handler = async function (event, _context) {
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        code: "EMPTY_BODY",
      }),
    };
  }

  let reservation;
  try {
    reservation = JSON.parse(event.body);
    if (reservation.placeId) {
      reservation.placeId = reservation.placeId.toString();
    }
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: error.toString(),
      }),
    };
  }

  const errors = getReservationErrors(reservation);
  if (errors.length) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        code: "INVALID_DATA",
        message: errors,
      }),
    };
  }

  const occupancy = getOccupancy(reservation);

  const cabinAvailability = await dynamoService.getCabinAvailability(occupancy);
  if (cabinAvailability.Responses?.occupancy?.length) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        code: "INVALID_DATES",
        message: cabinAvailability.Responses.occupancy,
      }),
    };
  }

  try {
    await dynamoService.saveReservation(reservation);
    await dynamoService.saveOccupancy(occupancy);
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: error.toString(),
      }),
    };
  }

  return {
    statusCode: 201,
    body: JSON.stringify({
      code: "SAVED",
    }),
  };
};
