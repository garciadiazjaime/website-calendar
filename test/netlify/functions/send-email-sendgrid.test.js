const sgMail = require("@sendgrid/mail");

const {
  handler: emailService,
} = require("../../../netlify/functions/send-email-sendgrid");

describe("send-email-sendgrid", () => {
  describe("when email-service returns a valid response", () => {
    it("returns expected response", async () => {
      jest.spyOn(sgMail, "setApiKey").mockImplementation(() => {});
      const sendMock = jest
        .spyOn(sgMail, "send")
        .mockImplementation(() => Promise.resolve());

      const event = {
        body: JSON.stringify({
          text: "text",
          html: "html",
          subject: "subject",
          from: "from@domain.com",
          to: "to@domain.com",
        }),
      };

      const response = await emailService(event);

      expect(response).toEqual({ statusCode: 200, body: '{"status":"SEND"}' });
      expect(sendMock).toHaveBeenCalledWith({
        bcc: "info@mintitmedia.com",
        from: "from@domain.com",
        html: "html",
        subject: "subject",
        text: "text",
        to: "to@domain.com",
      });
    });
  });

  describe("when body is empty", () => {
    it("returns expected error", async () => {
      jest.spyOn(sgMail, "setApiKey").mockImplementation(() => {});
      const sendMock = jest.spyOn(sgMail, "send");
      sendMock.mockReset();

      const event = {};

      const response = await emailService(event);

      expect(response).toEqual({
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: '{"status":"ERROR_PAYLOAD","message":"SyntaxError: Unexpected token u in JSON at position 0"}',
      });
      expect(sendMock).not.toHaveBeenCalled();
    });
  });

  describe("when body misses an expected property", () => {
    it("returns expected error", async () => {
      jest.spyOn(sgMail, "setApiKey").mockImplementation(() => {});
      const sendMock = jest.spyOn(sgMail, "send");

      const event = {
        body: JSON.stringify({
          text: "text",
          html: "html",
        }),
      };

      const response = await emailService(event);

      expect(response).toEqual({
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: '{"status":"INVALID_PAYLOAD"}',
      });
      expect(sendMock).not.toHaveBeenCalled();
    });
  });

  describe("when email format is invalid", () => {
    it("returns expected error", async () => {
      jest.spyOn(sgMail, "setApiKey").mockImplementation(() => {});
      const sendMock = jest.spyOn(sgMail, "send");

      const event = {
        body: JSON.stringify({
          text: "text",
          html: "html",
          subject: "subject",
          from: "from@domain",
          to: "domain.com",
        }),
      };

      const response = await emailService(event);

      expect(response).toEqual({
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: '{"status":"INVALID_EMAIL"}',
      });
      expect(sendMock).not.toHaveBeenCalled();
    });
  });
});
