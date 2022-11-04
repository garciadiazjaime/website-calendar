const AWS = require("aws-sdk");

const EMAIL_STATUS = {
  NOT_SEND: "NOT_SEND",
  SEND: "SEND",
};

AWS.config.update({
  region: "us-east-1",
  accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY,
});

exports.handler = async function (event, _context) {
  const params = {
    Destination: {
      ToAddresses: ["garciadiazjaime@gmail.com"],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: "HTML_FORMAT_BODY",
        },
        Text: {
          Charset: "UTF-8",
          Data: "TEXT_FORMAT_BODY",
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: "Reservation Request | Lúptico",
      },
    },
    Source: "info@luptico.com" /* required */,
  };

  const sendEmail = new AWS.SES({ apiVersion: "2010-12-01" }).sendEmail(params);

  let response;
  try {
    response = await sendEmail.promise();
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        status: EMAIL_STATUS.NOT_SEND,
        message: error.toString(),
      }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      status: EMAIL_STATUS.SEND,
      message: response.MessageId,
    }),
  };
};
