const dynogels = require('dynogels');
const axios = require('axios');

const Response = require('./models/Response');

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

dynogels.AWS.config.update({ region: process.env.REGION });

async function updateSession(values) {
  console.log(`Updating response for session ${values.id}...`, values);

  return new Promise((resolve, reject) => {
    Response.update(values, (err, result) => {
      return err ? reject(err) : resolve(result);
    });
  });
}

module.exports.response = async event => {
  const body = JSON.parse(event.body);

  if (!body) {
    console.error('Error: No body present.');
    return {
      statusCode: 400
    };
  }

  let response;
  if (!body.responseId) {
    response = {
      id: body.id,
      source: 'twilio',
      name: body.name.trim(),
      number: body.number,
      postcode: body.postcode,
      guessedPostcode: body.guessedZip || 'unknown',
      selfIsolating: body.selfIsolating === '1' ? 'yes' : 'no',
      guessedCity: body.guessedCity || 'unknown',
      requirements: body.requirements.trim()
    };
  } else {
    response = {
      id: body.responseId,
      source: 'dialogflow',
      name: body.queryResult.parameters.Name.trim(),
      number: body.queryResult.parameters.PhoneNumber.trim(),
      postcode: body.queryResult.parameters.Postcode.trim(),
      selfIsolating: body.queryResult.parameters.SelfIsolating.toLowerCase().trim(),
      requirements: body.queryResult.parameters.Requirements.join(', ')
    };
  }

  try {
    // Write to Dynamo
    await updateSession({
      ...response,
      status: 'Submitted'
    });

    // Notify Slack channel
    await axios.post(SLACK_WEBHOOK_URL, {
      username: 'ActionLineBot',
      text: `Incoming Action Line request. Please reply on the thread if you are dealing with this request.`,
      attachments: [
        {
          fallback: 'Incoming Action Line Request',
          pretext: 'Incoming Action Line Request:',
          color: '#D00000',
          fields: [
            {
              title: 'Name',
              value: response.name,
              short: false
            },
            {
              title: 'Phone Number',
              value: response.number,
              short: false
            },
            {
              title: 'Postcode',
              value: response.postcode,
              short: false
            },
            {
              title: 'Self isolating?',
              value: response.selfIsolating
            },
            {
              title: 'Requirements',
              value: response.requirements
            }
          ]
        }
      ]
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ status: 'updated' })
    };
  } catch (e) {
    console.log(e);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e })
    };
  }
};
