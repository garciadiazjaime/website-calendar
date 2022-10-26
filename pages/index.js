import { useState, useRef } from "react";
import Head from "next/head";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

import Loading from "../components/loading";
import { saveReservation } from "../support/reservation-service";

const places = [
  {
    id: 1,
    title: "Cabain #1",
  },
  {
    id: 2,
    title: "Cabain #2",
  },
  {
    id: 3,
    title: "Cabain #3",
  },
];

export default function Home() {
  const [message, setMessage] = useState("");
  const [selectedPlace, setSelectedPlace] = useState({});
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [loading, setLoading] = useState(false);
  const nameInputRef = useRef(null);

  const placeClickHandler = (id) => {
    const newState = {
      ...selectedPlace,
    };
    newState[id] = newState[id] === undefined ? true : !newState[id];

    setSelectedPlace(newState);
  };

  const isReservationValid = () => {
    const isCabinValid = Object.keys(selectedPlace).reduce((accu, id) => {
      if (selectedPlace[id]) {
        accu = true;
      }

      return accu;
    }, false);

    if (!isCabinValid) {
      setMessage("Select a cabin");
      return false;
    }

    if (!checkIn) {
      setMessage("Check-in is empty");
      return false;
    }

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    if (checkIn < yesterday) {
      setMessage("Check-in can't be before today");
      return false;
    }


    if (!checkOut) {
      setMessage("Check-out is empty");
      return false;
    }

    if (checkIn >= checkOut) {
      setMessage("Check-in needs to be before Check-out");
      return false;
    }

    if (!nameInputRef.current.value) {
      setMessage("Name is empty");
      return false;
    }

    return true;
  };

  const reserveClickHandler = async () => {
    if (!isReservationValid()) {
      return;
    }

    setMessage("");
    setLoading(true);

    checkIn.setUTCHours(22, 0, 0, 0);
    checkOut.setUTCHours(18, 0, 0, 0);

    const payload = {
      places: selectedPlace,
      checkIn: checkIn,
      checkOut: checkOut,
      name: nameInputRef.current.value,
    };

    const response = await saveReservation(payload);
    if (response.status !== 200) {
      setMessage("Error, try again");
    }

    setLoading(false);
  };

  return (
    <div className="container">
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header>Reservas</header>
      <main>
        <div className="place-selection">
          {places.map((place) => (
            <div
              key={place.id}
              onClick={() => placeClickHandler(place.id)}
              className={selectedPlace[place.id] ? "place-selected" : ""}
            >
              {place.title}
            </div>
          ))}
        </div>

        <div className="dates-selection">
          <div>
            Check-in: <br />
            <Calendar
              className="calendar"
              onChange={setCheckIn}
              value={checkIn}
            />
          </div>
          <br />
          <div>
            Check-out: <br />
            <Calendar
              className="calendar"
              onChange={setCheckOut}
              value={checkOut}
            />
          </div>
        </div>

        <div className="contact-reservation">
          <div>
            Name <br />
            <input type="text" ref={nameInputRef} />
          </div>
        </div>

        <div className="message">{message}</div>

        <div className="control">
          <div className="btn" onClick={reserveClickHandler}>
            <div className="flex">
              Reserve
              {loading ? (
                <div className="loading-wrapper">
                  <Loading />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </main>

      <footer>Lúptico</footer>

      <style jsx>{`
        header,
        footer {
          height: 120px;
          border: 1px solid;
          text-align: center;
          font-size: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
        }

        .loading-wrapper {
          margin-left: 16px;
        }

        .flex {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .place-selection {
          margin-top: 20px;
          display: flex;
        }

        .place-selection div {
          padding: 30px;
          flex: 1;
          border: 1px solid;
          text-align: center;
        }

        .place-selected {
          background: lightblue;
        }

        .dates-selection {
          padding: 30px 0;
        }

        .contact-reservation input {
          padding: 12px;
          font-size: 40px;
          width: 100%;
        }

        .message {
          padding: 30px 0;
          font-size: 30px;
          text-align: center;
          color: red;
        }

        .control {
          padding: 30px 0;
        }

        .btn {
          padding: 30px;
          font-size: 40px;
          text-align: center;
          border: 1px solid;
        }

        @media (max-width: 600px) {
          .grid {
            width: 100%;
            flex-direction: column;
          }
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }

        * {
          box-sizing: border-box;
        }

        .calendar {
          width: 100%;
        }
      `}</style>
    </div>
  );
}
