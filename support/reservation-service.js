const { isEmailValid } = require('./validation')

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
  const { place: placeId, checkIn, checkOut, email } = payload;

  const reservation = {
    placeId,
    checkIn,
    checkOut,
    email,
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
