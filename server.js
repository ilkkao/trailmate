require('dotenv').config();

const Koa = require('koa');
const Router = require('koa-router');
const koaBody = require('koa-body');
const logger = require('koa-logger');

const app = new Koa();
const router = new Router();

app.use(logger());

router.get('/', ctx => {
  ctx.body = 'Tulossa pian...';
});

router.post(`/upload-image-${process.env.URL_SECRET_KEY}`, koaBody({ multipart: true }), ctx => {
  console.log(ctx.request.body);
  console.log(ctx.request.files);
  ctx.response.status = 200;
});

app.use(router.routes()).use(router.allowedMethods());

console.log('Server starting...');
app.listen(3000);
