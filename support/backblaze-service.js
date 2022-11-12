const base64 = require("base-64");
const fetch = require("node-fetch");
const sha1 = require("sha1");
require('dotenv').config()


async function getToken() {
  const keyID = process.env.BACKBLAZEB2_KEY_ID;
  const applicationKey = process.env.BACKBLAZEB2_APP_KEY;

  const id_and_key = `${keyID}:${applicationKey}`;
  const basic_auth_string = "Basic " + base64.encode(id_and_key);
  const headers = { Authorization: basic_auth_string };

  const url = "https://api.backblazeb2.com/b2api/v2/b2_authorize_account";
  const response = await fetch(url, {
    headers,
  });

  const data = await response.json();

  return {
    apiUrl: data.apiUrl,
    authorizationToken: data.authorizationToken,
  };
}

async function getUploadURL() {
  const tokenResponse = await getToken();
  const { apiUrl, authorizationToken } = tokenResponse;
  const bucketId = process.env.BACKBLAZEB2_BUCKET_ID;
  const headers = {
    Authorization: authorizationToken,
  };

  const url = `${apiUrl}/b2api/v2/b2_get_upload_url`;
  const response = await fetch(url, {
    method: "post",
    body: JSON.stringify({
      bucketId,
    }),
    headers,
  });

  const data = await response.json();

  return {
    authorizationToken: data.authorizationToken,
    uploadUrl: data.uploadUrl,
  };
}

module.exports.uploadCalendar = (calendar) => {
  const authorizationToken = process.env.BACKBLAZEB2_TOKEN;
  const uploadUrl = process.env.BACKBLAZEB2_URL;
  const fileData = JSON.stringify(calendar);
  const sha1FileData = sha1(fileData);

  const headers = {
    Authorization: authorizationToken,
    "X-Bz-File-Name": "calendar.json",
    "Content-Type": "application/json",
    "X-Bz-Content-Sha1": sha1FileData,
  };

  return fetch(uploadUrl, {
    method: "post",
    body: fileData,
    headers,
  });
};

if (require.main === module) {
  getUploadURL().then(data => {
    console.log(JSON.stringify(data, null, 2))
  })
} 
