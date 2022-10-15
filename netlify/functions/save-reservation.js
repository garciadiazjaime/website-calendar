const AWS = require("aws-sdk");

AWS.config.update({
  region: "us-east-1",
  accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY,
});

const documentClient = new AWS.DynamoDB.DocumentClient();


exports.handler = async function (event, _context) {
  if (!event.body) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "EMPTY_BODY" }),
    };
  }

  let reservations = [];
  try {
    reservations = JSON.parse(event.body);
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error }),
    };
  }

  const batch = reservations.map(({ placeId, checkIn, checkOut, name }) => ({
    PutRequest: {
      Item: {
        placeId,
        checkIn,
        checkOut,
        name,
      },
    },
  }));

  const params = {
    RequestItems: {
      valle_reservations: batch,
    },
  };

  try {
    await documentClient.batchWrite(params).promise();
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify(error),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "SAVED" }),
  };
};
