const dynogels = require('dynogels');
const Joi = require('joi');

const DYNAMO_TABLE_NAME =
  process.env.DYNAMODB_TABLE_NAME || 'MANZLinkResponses';

const Response = dynogels.define(DYNAMO_TABLE_NAME, {
  hashKey : 'id',

  // add the timestamp attributes (updatedAt, createdAt)
  timestamps : true,

  schema : {
    id: Joi.string(),
    source: Joi.string().required(),
    number: Joi.string(),
    name: Joi.string(),
    address: Joi.string().optional(),
    postcode: Joi.string().required(),
    guessedPostcode: Joi.string().optional(),
    suburb: Joi.string().optional(),
    region: Joi.string().optional(),
    city: Joi.string().optional(),
    guessedCity: Joi.string().optional(),
    selfIsolating: Joi.string().required(),
    requirements: Joi.string().required(),
    status: Joi.string().default('Submitted').optional(),
  }
});

module.exports = Response;