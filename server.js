require('dotenv').config();

const Koa = require('koa');
const Router = require('koa-router');
const koaBody = require('koa-body');
const logger = require('koa-logger');

const app = new Koa();
const router = new Router();

app.use(koaBody());
app.use(logger());

router.get('/', ctx => {
  ctx.body = 'Tulossa pian...';
});

router.post(`/upload-image-${process.env.URL_SECRET_KEY}`, ctx => {
  console.log(JSON.stringify(ctx.request.body));
  ctx.response.status = 200;
});

app.use(router.routes()).use(router.allowedMethods());

console.log('Server starting...');
app.listen(3000);
