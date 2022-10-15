const getReservations = (payload) => {
  const { places, checkIn, checkOut, name } = payload;
  const reservations = Object.keys(places)
    .filter((id) => places[id])
    .map((placeId) => ({
      placeId,
      checkIn,
      checkOut,
      name,
    }));

  return reservations;
};

export async function saveReservation(payload) {
  const url = ".netlify/functions/save-reservation";

  const reservations = getReservations(payload);

  return fetch(url, {
    method: "POST",
    body: JSON.stringify(reservations),
    headers: {
      "Content-Type": "application/json",
    },
  });
}
