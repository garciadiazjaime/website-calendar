const { isEmailValid } = require("./validation");

module.exports.REQUEST_STATUS = {
  EMPTY_BODY: "EMPTY_BODY",
  INVALID_FORMAT: "INVALID_FORMAT",
  INVALID_DATA: "INVALID_DATA",
  INVALID_DATES: "INVALID_DATES",
  DB_ERROR: "DB_ERROR",
  SUCCESS: "SUCCESS",
};

module.exports.RESERVATION_STATUS = {
  REQUESTED: "REQUESTED",
  CONFIRMED: "CONFIRMED",
  CANCELED: "CANCELED",
};

module.exports.saveReservation = (payload) => {
  const url = ".netlify/functions/save-reservation";
  const { placeId, hotelId, checkIn, checkOut, email } = payload;

  const reservation = {
    placeId,
    checkIn,
    checkOut,
    email,
    hotelId,
  };

  return fetch(url, {
    method: "POST",
    body: JSON.stringify(reservation),
    headers: {
      "Content-Type": "application/json",
    },
  });
};

module.exports.getReservationErrors = (props) => {
  const { placeId, checkIn, checkOut, email } = props;
  const errors = [];
  if (!placeId) {
    errors.push("Select a cabin");
  }

  if (!checkIn) {
    errors.push("Check-in is empty");
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (checkIn < yesterday) {
    errors.push("Check-in can't be before today");
  }

  if (!checkOut) {
    errors.push("Check-out is empty");
  }

  if (checkIn >= checkOut) {
    errors.push("Check-in needs to be before Check-out");
  }

  if (!isEmailValid(email)) {
    errors.push("Email is invalid");
  }

  return errors;
};

module.exports.getOccupancy = (reservation) => {
  const checkIn = new Date(reservation.checkIn);
  const checkOut = new Date(reservation.checkOut);
  const occupancy = [];

  while (checkIn < checkOut) {
    occupancy.push({
      placeId: reservation.placeId,
      checkIn: checkIn.toJSON().split("T")[0],
      reservation: reservation.uuid,
    });
    checkIn.setDate(checkIn.getDate() + 1);
  }

  return occupancy;
};

const getKey = (item) => `${item.checkIn}-${item.placeId}`;
module.exports.getKey = getKey

const getTakenDatesByDayAndPlaceId = (takenDates) => {
  return takenDates.reduce((accu, item) => {
    accu[getKey(item)] = true;

    return accu;
  }, {});
};

module.exports.getTakenDatesByDayAndPlaceId = getTakenDatesByDayAndPlaceId;

module.exports.getInvalidDates = (occupancy, takenDates) => {
  if (!Array.isArray(occupancy) || !Array.isArray(takenDates)) {
    return [];
  }

  const takenDatesByDayAndPlayceId = getTakenDatesByDayAndPlaceId(takenDates);

  const invalidDates = occupancy.reduce((accu, item) => {
    if (takenDatesByDayAndPlayceId[getKey(item)]) {
      accu.push(item);
    }

    return accu;
  }, []);

  return invalidDates;
};
