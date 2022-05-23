const path = require('path');
const fs = require('fs');
const Koa = require('koa');
const send = require('koa-send');
const Router = require('koa-router');
const koaLogger = require('koa-logger');

const config = require('./config');

config.init();

const { queryStmt, deleteStmt } = require('./database');
const emailNotificationSender = require('./email-notification-sender');
const smtpServer = require('./smtp-server');
const logger = require('./logger');
const i18n = require('./i18n');

const GROUPING_THRESHOLD = 60 * 20; // 20 minutes
const ONE_YEAR_IN_MILLISECONDS = 1000 * 60 * 60 * 24 * 365;

init();

async function init() {
  const app = new Koa();
  const router = new Router();

  i18n.init();
  emailNotificationSender.init();
  smtpServer.init();

  if (config.get('verbose')) {
    app.use(koaLogger());
  }

  router.get('/api/images.json', listImages);
  router.get('/api/images/:image_file_name', serveCameraImage);
  router.delete('/api/images/:image_id/:password', deleteImage);

  router.get(/\/(index.html)?\/*$/, renderIndex);
  router.get(/(.*)/, renderAsset);

  app.use(router.routes());
  app.use(router.allowedMethods());

  const port = config.get('http_server_port');
  app.listen(port, () => {
    logger.info(`HTTP server started, port: ${port}`);
  });
}

async function serveCameraImage(ctx) {
  return renderStaticFile(ctx, ctx.params.image_file_name, config.get('image_dir'));
}

async function renderAsset(ctx) {
  return renderStaticFile(ctx, ctx.params['0'], path.join(__dirname, '../client/build'));
}

async function renderStaticFile(ctx, file, rootDir) {
  try {
    await send(ctx, file, {
      root: rootDir,
      maxAge: ONE_YEAR_IN_MILLISECONDS,
      immutable: true
    });
  } catch (e) {
    ctx.status = 404;
  }
}

function renderIndex({ response }) {
  try {
    const indexPage = fs.readFileSync(path.join(__dirname, '../client/build/index.html'), 'utf8');
    const vars = {
      locale: JSON.stringify(config.get('locale')),
      translations: JSON.stringify(i18n.translations),
      google_analytics_id: JSON.stringify(config.get('google_analytics_id')),
      title: i18n.t('index.title'),
      description: i18n.t('index.description'),
      no_js_warning: i18n.t('index.no_js_warning'),
      preloaded_images: JSON.stringify(imageList(), null, 2)
    };

    response.body = indexPage.replace(/__([A-Z_]+)__/g, (_, name) => vars[name.toLowerCase()]);
  } catch {
    response.body = 'Index.html does not exist';
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
