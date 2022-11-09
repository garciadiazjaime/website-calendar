const AWS = require("aws-sdk");

AWS.config.update({
  region: "us-east-1",
  accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY,
});

const documentClient = new AWS.DynamoDB.DocumentClient();

module.exports.getCabinAvailability = (occupancy) => {
  const items = occupancy.map((item) => ({
    placeId: item.placeId,
    checkIn: item.checkIn,
  }));

  const params = {
    RequestItems: {
      occupancy: {
        Keys: items,
      },
    },
  };

  return documentClient.batchGet(params).promise();
};

module.exports.saveOccupancy = (occupancy) => {
  const batch = occupancy.map(({ placeId, checkIn, reservation }) => ({
    PutRequest: {
      Item: {
        placeId,
        checkIn,
        reservation,
      },
    },
  }));

  const params = {
    RequestItems: {
      occupancy: batch,
    },
  };

  return documentClient.batchWrite(params).promise();
};

module.exports.saveReservation = (reservation) => {
  const { placeId, hotelId, checkIn, checkOut, email, status, uuid } = reservation;

  const batch = [
    {
      PutRequest: {
        Item: {
          placeId,
          hotelId,
          checkIn,
          checkOut,
          email,
          status,
          uuid,
          created: new Date().toJSON(),
          updated: new Date().toJSON(),
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
};
