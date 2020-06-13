const path = require('path');
const fs = require('fs');
const Koa = require('koa');
const send = require('koa-send');
const Router = require('koa-router');
const koaBody = require('koa-body');
const koaLogger = require('koa-logger');
const { queryStmt, deleteStmt } = require('./database');
const emailNotificationSender = require('./email-notification-sender');
const imageProcessor = require('./image-processor');
const config = require('./config');
const logger = require('./logger');

emailNotificationSender.start();

const GROUPING_THRESHOLD = 60 * 20; // 20 minutes
const ONE_YEAR_IN_MILLISECONDS = 1000 * 60 * 60 * 24 * 365;

const indexPage = fs.readFileSync(path.join(__dirname, '../client/build/index.html'), 'utf8');

init();

async function init() {
  const app = new Koa();
  const router = new Router();

  if (config.get('verbose')) {
    app.use(koaLogger());
  }

  router.post(
    `/api/upload-image-${config.get('url_secret_key')}`,
    koaBody({ multipart: true }),
    imageProcessor.processNewImageRequest
  );
  router.post(
    `/upload-image-${config.get('url_secret_key')}`,
    koaBody({ multipart: true }),
    imageProcessor.processNewImageRequest
  ); // Legacy support
  router.get('/api/images.json', listImages);
  router.delete('/api/delete_image/:image_id/:password', deleteImage);
  router.get(/^\/camera-images\/(.*)/, serveCameraImage);
  router.get(/(.*)/, renderAsset);

  app.use(router.routes());
  app.use(router.allowedMethods());

  const port = config.get('server_port');
  logger.info(`Server starting, port ${port}...`);
  app.listen(port);
}

async function serveCameraImage(ctx) {
  const imageFile = ctx.params['0'];

  try {
    await send(ctx, imageFile, {
      root: config.get('image_dir'),
      maxAge: ONE_YEAR_IN_MILLISECONDS,
      immutable: true
    });
  } catch (e) {
    ctx.status = 404;
  }
}

async function renderAsset(ctx) {
  const filePath = ctx.params['0'];

  try {
    if (filePath === '/' || filePath === 'index.html') {
      throw new Error('Serve index instead');
    }

    await send(ctx, filePath, {
      root: path.join(__dirname, '../client/build'),
      maxAge: ONE_YEAR_IN_MILLISECONDS,
      immutable: true
    });
  } catch (e) {
    const preloadedImages = `\nwindow.preloadedImages = ${JSON.stringify(imageList(), null, 2)};\n`;
    ctx.response.body = indexPage.replace('/*!!!preloadedImages!!!*/', preloadedImages);
  }
}

async function listImages({ response }) {
  response.body = imageList();
}

async function deleteImage({ response, params }) {
  if (params.password === config.get('admin_password')) {
    deleteStmt.run({
      file_name: params.image_id,
      deleted_at: Math.floor(Date.now() / 1000)
    });
  }

  response.status = 200;
}

function imageList() {
  const images = [];
  let previousImageTs = 0;

  queryStmt.all().forEach(image => {
    const currentImageTs = image.email_created_at;

    if (currentImageTs - previousImageTs > GROUPING_THRESHOLD) {
      images.push([]);
    }

    images[images.length - 1].push(image);

    previousImageTs = image.email_created_at;
  });

  return images.reverse();
}
