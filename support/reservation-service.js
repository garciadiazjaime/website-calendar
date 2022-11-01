export async function saveReservation(payload) {
  const url = ".netlify/functions/save-reservation";
  const { place: placeId, checkIn, checkOut, name } = payload;

  const reservation = {
    placeId,
    checkIn,
    checkOut,
    name,
  }

  return fetch(url, {
    method: "POST",
    body: JSON.stringify(reservation),
    headers: {
      "Content-Type": "application/json",
    },
  });
}
