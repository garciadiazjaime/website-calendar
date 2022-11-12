const fetch = require("node-fetch");

const { getReservationErrors } = require("./reservation-service");

const LAMBDA_BASE_URL = process.env.LAMBDA_BASE_URL;

const sendEmail = (props) => {
  const url = `${LAMBDA_BASE_URL}/.netlify/functions/send-email-sendgrid`;
  const { text, html, subject, from, to } = props;

  const payload = {
    text,
    html,
    subject,
    from,
    to,
  };

  return fetch(url, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
  });
};

module.exports.sendReservationEmail = (reservation) => {
  const errors = getReservationErrors(reservation);
  if (errors.length) {
    return;
  }

  const html = `
    <div>
      <h1>Reservation confirmed!</h1>
      <p>
        Check-in: <b>${reservation.checkIn}</b> 3:00 PM
      </p>
      <p>
        Check-out: <b>${reservation.checkOut}</b> 11:00 AM
      </p>
      <p>
        <small>Team Lúptico</small>
      </p>
    </div>
  `;

  return sendEmail({
    text: html,
    html,
    subject: "Reservation Confirmed @ Lúptico",
    from: "info@luptico.com",
    to: reservation.email,
  });
};
