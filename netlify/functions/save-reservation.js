const AWS = require("aws-sdk");

AWS.config.update({
  region: "us-east-1",
  accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY,
});

const documentClient = new AWS.DynamoDB.DocumentClient();

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

function getCabinAvailability(occupancy) {
  const items = occupancy.map((item) => ({
    placeId: item.placeId,
    date: item.date,
  }));

  const params = {
    RequestItems: {
      occupancy: {
        Keys: items,
      },
    },
  };

  return documentClient.batchGet(params).promise();
}

function saveOccupancy(occupancy) {
  const batch = occupancy.map((item) => ({
    PutRequest: {
      Item: {
        placeId: item.placeId,
        date: item.date,
      },
    },
  }));

  const params = {
    RequestItems: {
      occupancy: batch,
    },
  };

  return documentClient.batchWrite(params).promise();
}

function saveReservation(reservation) {
  const { placeId, checkIn, checkOut, name } = reservation;

  const batch = [
    {
      PutRequest: {
        Item: {
          placeId,
          checkIn,
          checkOut,
          name,
        },
      },
    },
  ];

  const params = {
    RequestItems: {
      reservation: batch,
    },
  };

  return documentClient.batchWrite(params).promise();
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
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: error.toString(),
      }),
    };
  }

  const occupancy = getOccupancy(reservation);

  const cabinAvailability = await getCabinAvailability(occupancy);

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
    await saveReservation(reservation);
    await saveOccupancy(occupancy);
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: error.toString(),
      }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      code: "SAVED",
    }),
  };
};
