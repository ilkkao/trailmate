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

router.post(`/upload-image-${process.env.URL_SECRET_KEY}`, koaBody({ multipart: true }), ({ request, response }) => {
  if (request.body['attachment-count'] === '1') {
    const date = request.body.Date;
    const file = request.files['attachment-1'];

    console.log({ date, file });
  } else {
    console.error('Unexpected amount of attachments in the email.');
  }

  response.status = 200;
});

app.use(router.routes()).use(router.allowedMethods());

console.log('Server starting...');
app.listen(3000);
