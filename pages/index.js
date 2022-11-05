import { useState, useRef } from "react";
import Head from "next/head";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

import Loading from "../components/loading";
import {
  saveReservation,
  getReservationErrors,
  REQUEST_STATUS,
} from "../support/reservation-service";

const places = [
  {
    id: "167e753d-9d6a-43bd-930f-8ae1db3a35c3",
    title: "Cabain #1",
  },
  {
    id: "2421452e-b801-4040-a6df-86450d9b98f6",
    title: "Cabain #2",
  },
  {
    id: "3fe13ccf-bfe5-4f5a-ab30-e4f154c25d9c",
    title: "Cabain #3",
  },
];

function getErrorMessage(data) {
  let payload;
  try {
    payload = JSON.parse(data);
  } catch (_) {}

  const { status, message } = payload || {};
  if (status === REQUEST_STATUS.INVALID_DATES) {
    const invalidDates = message.map(({ date }) => `${date} is not available`);
    return invalidDates;
  }

  return ["Error, please try again"];
}

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [placeId, setPlaceId] = useState(null);
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [loading, setLoading] = useState(false);
  const emailInputRef = useRef(null);

  const cleanForm = () => {
    setPlaceId("");
    setCheckIn("");
    setCheckOut("");
    emailInputRef.current.value = "";
  };

  const reserveClickHandler = async () => {
    setMessages([]);

    const errors = getReservationErrors({
      placeId,
      checkIn,
      checkOut,
      email: emailInputRef.current.value,
    });
    if (errors.length) {
      setMessages(errors);
      return;
    }

    setMessages([]);
    setLoading(true);

    const payload = {
      place: placeId,
      checkIn: checkIn.toJSON().split("T")[0],
      checkOut: checkOut.toJSON().split("T")[0],
      email: emailInputRef.current.value,
    };

    const response = await saveReservation(payload);
    if (response.status !== 201) {
      const errorMessage = getErrorMessage(response.body);

      setMessages(errorMessage);
    } else {
      setMessages(["Request submitted, check your email for confirmation."]);
      setTimeout(() => {
        setMessages("");
      }, 1000 * 6);
      cleanForm();
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
              onClick={() => setPlaceId(place.id)}
              className={placeId === place.id ? "place-selected" : ""}
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
            Email <br />
            <input type="text" ref={emailInputRef} />
          </div>
        </div>

        <div className="message">
          {messages.map((message, index) => (
            <p key={index}>{message}</p>
          ))}
        </div>

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
