const sgMail = require("@sendgrid/mail");

const { isEmailValid } = require("../../support/validation");

const EMAIL_STATUS = {
  NOT_SEND: "NOT_SEND",
  SEND: "SEND",
  ERROR_PAYLOAD: "ERROR_PAYLOAD",
  INVALID_PAYLOAD: "INVALID_PAYLOAD",
  INVALID_EMAIL: "INVALID_EMAIL",
};

exports.handler = async function (event, _context) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch (error) {
    return {
      statusCode: 400,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: EMAIL_STATUS.ERROR_PAYLOAD,
        message: error.toString(),
      }),
    };
  }

  const { text, html, subject, from, to } = payload;

  if (!text || !html || !subject || !from || !to) {
    return {
      statusCode: 400,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: EMAIL_STATUS.INVALID_PAYLOAD,
      }),
    };
  }

  if (!isEmailValid(from) || !isEmailValid(to)) {
    return {
      statusCode: 400,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: EMAIL_STATUS.INVALID_EMAIL,
      }),
    };
  }

  const msg = {
    text,
    html,
    subject,
    from,
    to,
    cc: "info@mintitmedia.com",
  };

  try {
    await sgMail.send(msg);
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
    }),
  };
};
