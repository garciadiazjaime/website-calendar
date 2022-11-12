const dynamoService = require("../../support/dynamo-service");
const backblazebService = require("../../support/backblaze-service");

exports.handler = async function (_event, _context) {
  const response = await dynamoService.getCalendar();

  const calendar = response.Items.map(({ placeId, checkIn }) => ({
    placeId,
    checkIn,
  }));

  await backblazebService.uploadCalendar(calendar);

  return {
    statusCode: 201,
    headers: {
      "Content-Type": "application/json",
    },
  };
};
