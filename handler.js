const { geocode } = require('./lib/here');
const { createTask, DEFAULT_LIST_ID } = require('./lib/clickup');

module.exports.response = async event => {
  const body = JSON.parse(event.body);

  if (!body) {
    console.error('Error: No body present.');
    return {
      statusCode: 400
    };
  }

  let response;

  // TODO: Validate incoming requests
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
  
  const { city, street, county, state } = await geocode(response.postcode);

  if (!city) {
    console.error('Unable to parse city from postcode');
    
    await createTask(response, DEFAULT_LIST_ID);

    return {
      statusCode: 400,
      body: JSON.stringify({ code: 'NO_POSTCODE' })
    };
  }

  // Populate the response object with the geocode result
  response = {
    city,
    street,
    county,
    state,
    ...response
  }

  try {
    // TODO: Seperate this to an SQS queue handler
    await createTask(response);

    return {
      statusCode: 200,
      body: JSON.stringify({ status: 'updated' })
    };
  } catch (e) {
    console.error(e);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e })
    };
  }
};
