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
};

module.exports.saveOccupancy = (occupancy) => {
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
};

module.exports.saveReservation = (reservation) => {
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
};