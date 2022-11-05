const { getReservationErrors } = require("./reservation-service");

const sendEmail = (props) => {
  const url = ".netlify/functions/send-email-sendgrid";
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
            <h1>Reservation confirmed!<h1>
            <p>
                Check-in: ${reservation.checkIn} 3:00 PM
            </p>
            <p>
                Check-out: ${reservation.checkOut} 11:00 AM
            </p>
            <p>
                <b>Lúptico</b>
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
