import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  // DB
  MONGODB_URI: Joi.string().uri().required(),
  DB_TYPE: Joi.string().valid('mongodb').required(),

  // JWT
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().required(),

  // Server
  PORT: Joi.number().default(3000),
  NODE_ENV: Joi.string().valid('development', 'production').required(),

  // AI
  DEEPSEEK_API_KEY: Joi.string().required(),
  DEEPSEEK_MODEL: Joi.string().default('deepseek-chat'),
  MAX_TOKENS: Joi.number().default(4000),
});
