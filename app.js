require('dotenv').config()
const json = require('koa-json');
const logger = require('koa-logger');
const bodyParser = require('koa-bodyparser');
const Router = require('koa-router');
const Koa = require('koa');

const authRoutes = require('./routes/auth');

const app = new Koa();
app.use(logger());

// if nothing parsed, body will be an empty object {}
app.use(bodyParser({
    detectJSON: function (ctx) {
        return /\.json$/i.test(ctx.path);
    }
}));

app.use(json());
app
  .use(authRoutes.routes())
  .use(authRoutes.allowedMethods())

// listen
if (!module.parent) app.listen(3030);
