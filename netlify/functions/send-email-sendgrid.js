const sgMail = require("@sendgrid/mail");

const EMAIL_STATUS = {
  NOT_SEND: "NOT_SEND",
  SEND: "SEND",
};
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.handler = async function (event, _context) {
  const { text, html, subject, from, to } =
    event.multiValueQueryStringParameters;

  const msg = {
    text,
    html,
    subject,
    from,
    to,
    cc: "info@mintitmedia.com",
  };

  let response;
  try {
    response = await sgMail.send(msg);
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
