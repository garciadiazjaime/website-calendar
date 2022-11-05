const dynamoService = require("../../../support/dynamo-service");
const emailService = require("../../../support/email-service");

const {
  handler: saveReservation,
} = require("../../../netlify/functions/save-reservation");

jest.mock("aws-sdk", () => ({
  config: {
    update: () => {},
  },
  DynamoDB: {
    DocumentClient: function () {},
  },
}));

jest.mock("uuid", () => ({
  v4: () => "reservation-random-uuid",
}));

describe("save-reservation", () => {
  describe("when body is empty", () => {
    it("returns expected response", async () => {
      const event = {};

      const response = await saveReservation(event);

      expect(response).toEqual({
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: '{"status":"EMPTY_BODY"}',
      });
    });
  });

  describe("when body is not an object", () => {
    it("returns expected response", async () => {
      const event = {
        body: "string",
      };

      const response = await saveReservation(event);

      expect(response).toEqual({
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: '{"status":"INVALID_FORMAT","message":"SyntaxError: Unexpected token s in JSON at position 0"}',
      });
    });
  });

  describe("when data is missing", () => {
    it("returns expected response", async () => {
      const event = {
        body: '{"email": "test@gmail"}',
      };

      const response = await saveReservation(event);

      expect(response).toEqual({
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: '{"status":"INVALID_DATA","message":["Select a cabin","Check-in is empty","Check-out is empty","Email is invalid"]}',
      });
    });
  });

  describe("when cabin is not available", () => {
    it("returns expected response", async () => {
      jest.spyOn(dynamoService, "getCabinAvailability").mockImplementation(() =>
        Promise.resolve({
          Responses: {
            occupancy: [{}],
          },
        })
      );

      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const event = {
        body: JSON.stringify({
          placeId: "1",
          checkIn: today.toJSON().split("T")[0],
          checkOut: tomorrow.toJSON().split("T")[0],
          email: "test@domain.com",
        }),
      };

      const response = await saveReservation(event);

      expect(response).toEqual({
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: '{"status":"INVALID_DATES","message":[{}]}',
      });
    });
  });

  describe("when reservation is not saved", () => {
    it("returns expected response", async () => {
      jest.spyOn(dynamoService, "getCabinAvailability").mockImplementation(() =>
        Promise.resolve({
          Responses: {
            occupancy: [],
          },
        })
      );
      jest
        .spyOn(dynamoService, "saveReservation")
        .mockImplementation(() => Promise.reject("saveReservation-error"));

      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const event = {
        body: JSON.stringify({
          placeId: "1",
          checkIn: today.toJSON().split("T")[0],
          checkOut: tomorrow.toJSON().split("T")[0],
          email: "test@domain.com",
        }),
      };

      const response = await saveReservation(event);

      expect(response).toEqual({
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: '{"status":"DB_ERROR","message":"saveReservation-error"}',
      });
    });
  });

  describe("when occupancy is not saved", () => {
    it("returns expected response", async () => {
      jest.spyOn(dynamoService, "getCabinAvailability").mockImplementation(() =>
        Promise.resolve({
          Responses: {
            occupancy: [],
          },
        })
      );
      jest
        .spyOn(dynamoService, "saveReservation")
        .mockImplementation(() => Promise.resolve());
      jest
        .spyOn(dynamoService, "saveOccupancy")
        .mockImplementation(() => Promise.reject("saveOccupancy-error"));

      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const event = {
        body: JSON.stringify({
          placeId: "1",
          checkIn: today.toJSON().split("T")[0],
          checkOut: tomorrow.toJSON().split("T")[0],
          email: "test@domain.com",
        }),
      };

      const response = await saveReservation(event);

      expect(response).toEqual({
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: '{"status":"DB_ERROR","message":"saveOccupancy-error"}',
      });
    });
  });

  describe("when reservation is saved", () => {
    it("returns expected response", async () => {
      jest.spyOn(dynamoService, "getCabinAvailability").mockImplementation(() =>
        Promise.resolve({
          Responses: {
            occupancy: [],
          },
        })
      );
      const mockSaveReservation = jest
        .spyOn(dynamoService, "saveReservation")
        .mockImplementation(() => Promise.resolve());
      const mockSaveOccupancy = jest
        .spyOn(dynamoService, "saveOccupancy")
        .mockImplementation(() => Promise.resolve());
      const mockSendReservationEmail = jest
        .spyOn(emailService, "sendReservationEmail")
        .mockImplementation(() => {});

      mockSaveReservation.mockClear();
      mockSaveOccupancy.mockClear();

      const today = new Date("2022-11-03");
      const tomorrow = new Date("2022-11-03");
      tomorrow.setDate(tomorrow.getDate() + 2);

      const event = {
        body: JSON.stringify({
          placeId: 1,
          checkIn: today.toJSON().split("T")[0],
          checkOut: tomorrow.toJSON().split("T")[0],
          email: "test@domain.com",
        }),
      };

      const response = await saveReservation(event);

      expect(response).toEqual({
        statusCode: 201,
        headers: { 'Content-Type': 'application/json' },
        body: '{"status":"SUCCESS"}',
      });
      expect(mockSaveReservation).toHaveBeenCalledWith({
        checkIn: "2022-11-03",
        checkOut: "2022-11-05",
        email: "test@domain.com",
        placeId: "1",
        status: "REQUESTED",
        uuid: "reservation-random-uuid",
      });
      expect(mockSaveOccupancy).toHaveBeenCalledWith([
        {
          date: "2022-11-03",
          placeId: "1",
          reservation: "reservation-random-uuid",
        },
        {
          date: "2022-11-04",
          placeId: "1",
          reservation: "reservation-random-uuid",
        },
      ]);
      expect(mockSendReservationEmail).toHaveBeenCalledWith({
        checkIn: "2022-11-03",
        checkOut: "2022-11-05",
        email: "test@domain.com",
        placeId: "1",
        status: "REQUESTED",
        uuid: "reservation-random-uuid",
      });
    });
  });
});
