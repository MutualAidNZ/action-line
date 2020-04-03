const axios = require('axios');

const instance = axios.create({
  baseURL:
    process.env.AROHA_BASE_URL,
  timeout: 5000
});

async function getAccessToken() {
  console.log('Requesting access token for Aroha API...');
  const request = await axios.post(
    process.env.AROHA_TOKEN_URL,
    {
      client_id: process.env.AROHA_CLIENT_ID,
      client_secret: process.env.AROHA_CLIENT_SECRET,
      audience: 'https://actionline.mutualaid.org.nz',
      grant_type: 'client_credentials'
    }
  );

  console.log('Got access token from Aroha!');

  return request.data;
}

async function createRequest(response) {
  const { access_token } = await getAccessToken();

  console.log('Creating request in Aroha!');

  try {
    const task = await instance.post(
      `/tasks`,
      {
        requester: {
          name: response.name,
          phoneNumber: response.number,
          postcode: response.postcode
        },
        body: response.requirements,
        title: response.requirements
      },
      {
        headers: {
          authorization: `Bearer ${access_token}`
        }
      }
    );

    return task;
  } catch (e) {
    console.error('Unable to create task in Aroha', e);
    return {};
  }
}

module.exports = {
  createRequest
};
