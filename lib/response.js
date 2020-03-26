const dynogels = require('dynogels');
dynogels.AWS.config.update({ region: process.env.REGION });

const Response = require('../models/Response');

async function updateSession(values) {
  console.log(`Updating response for session ${values.id}...`, values);

  return new Promise((resolve, reject) => {
    Response.update(values, (err, result) => {
      return err ? reject(err) : resolve(result);
    });
  });
}

module.exports = {
  updateSession,
}