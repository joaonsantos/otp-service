const fs = require('fs');
const Koa = require('koa');
const Router = require('koa-router');

const UIDGenerator = require('uid-generator');
const uidgen = new UIDGenerator(32, UIDGenerator.BASE62);

const Redis = require("ioredis");

const router = new Router({ prefix: '/api/v1/auth' });

router.post('/create', async (ctx, next) => {
  try {
    let validRequest = false;
    const key = ctx.query.key;
    const auth_token = await uidgen.generate();

    if (!key) {
      ctx.response.status = 400;
      const message = 'Missing \'key\' url query parameter.';
      ctx.body = message
      throw new Error(message)
    }

    var redis = await new Redis(process.env.REDIS_PORT, process.env.REDIS_HOST);
    console.log(`Connected to redis...`);
    await redis.set(key, auth_token, 'ex', process.env.EXPIRATION);

    await redis.disconnect();
    console.log(`Closed redis connection...`);
    ctx.body = 'ok';
  } catch(err) {
    console.log('Something went wrong saving data.');
    console.log(err.stack);
  }
});

router.get('/validate', async (ctx, next) => {
  try {
    var redis = await new Redis(process.env.REDIS_PORT, process.env.REDIS_HOST);
    console.log(`Connected to redis...`);

    let response = 'nok';

    const key = ctx.query.key;
    const received_token = ctx.query.token;
    const authToken = await redis.get(key);

    if (!key || !received_token) {
      ctx.response.status = 400;
      const message = 'Missing \'key\' or \'token\' url query parameter.';
      ctx.body = message
      throw new Error(message)
    }

    if (authToken === received_token) {
      await redis.del(key);
      response = 'ok';
    }

    await redis.disconnect();
    console.log(`Closed redis connection...`);

    ctx.body = response;
  } catch(err) {
    console.log('Something went wrong saving data.');
    console.log(err.stack);
  }
});

module.exports = router;
