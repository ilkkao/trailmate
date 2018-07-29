require('dotenv').config();

const path = require('path');
const Koa = require('koa');
const Router = require('koa-router');
const koaBody = require('koa-body');
const logger = require('koa-logger');
const staticServer = require('koa-static');
const mount = require('koa-mount');
const sharp = require('sharp');
const Tesseract = require('tesseract.js');
const uuid = require('uid2');
const Database = require('better-sqlite3');

const db = new Database(process.env.DB_FILE);

const GROUPING_THRESHOLD = 60 * 10; // 10 minutes

db.prepare(
  `
  CREATE TABLE IF NOT EXISTS images (
    id integer PRIMARY KEY AUTOINCREMENT,
    file_name text NOT NULL UNIQUE,
    created_at integer,
    email_created_at integer NOT NULL,
    ocr_created_at integer,
    temperature integer,
    deleted_at integer)`
).run();

db.prepare(
  `
  CREATE UNIQUE INDEX IF NOT EXISTS idx_images_email_created_at ON images (
    email_created_at
  )`
).run();

const insertStmt = db.prepare(`
  INSERT INTO images (
    file_name,
    created_at,
    email_created_at,
    ocr_created_at,
    temperature
  ) VALUES (
    $file_name,
    $created_at,
    $email_created_at,
    $ocr_created_at,
    $temperature
  )`);

const queryStml = db.prepare(`
  SELECT
    file_name, email_created_at, ocr_created_at, temperature
  FROM
    images
  WHERE
    deleted_at IS NULL
  ORDER BY
    email_created_at ASC`);

const deleteStml = db.prepare(`
  UPDATE
    images
  SET
    deleted_at=$deleted_at
  WHERE
    file_name=$file_name`);

init();

process.on('exit', () => Tesseract.terminate());

async function init() {
  const app = new Koa();
  const router = new Router();

  app.use(logger());

  router.post(`/api/upload-image-${process.env.URL_SECRET_KEY}`, koaBody({ multipart: true }), processNewImageRequest);
  router.get('/api/images.json', listImages);
  router.delete('/api/delete_image/:image_id/:password', deleteImage);

  app.use(router.routes()).use(router.allowedMethods());

  app.use(
    mount(
      '/camera-images',
      staticServer(process.env.IMAGE_DIR, {
        maxage: 1000 * 60 * 60 * 24 * 365 // 1 year
      })
    )
  );

  app.use(staticServer(path.join(__dirname, 'client/build')));

  console.warn('Server starting...');
  app.listen(process.env.SERVER_PORT);
}

async function listImages({ response }) {
  const images = [];
  let previousImageTs = 0;

  queryStml.all().forEach(image => {
    const currentImageTs = image.email_created_at;

    if (currentImageTs - previousImageTs > GROUPING_THRESHOLD) {
      images.push([]);
    }

    images[images.length - 1].push(image);

    previousImageTs = image.email_created_at;
  });

  response.body = images.reverse();
}

async function deleteImage({ response, params }) {
  console.log(params.password, process.env.ADMIN_PASSWORD);

  if (params.password === process.env.ADMIN_PASSWORD) {
    const info = deleteStml.run({
      file_name: params.image_id,
      deleted_at: Math.floor(Date.now() / 1000)
    });

    console.log({ info });
  }

  response.status = 200;
}

async function processNewImageRequest({ request, response }) {
  if (request.body['attachment-count'] === '1') {
    const date = request.body.Date;
    const file = request.files['attachment-1'];

    await processNewImage(date, file.path);
  } else {
    console.error('Unexpected amount of attachments in the email.');
  }

  response.status = 200;
}

async function processNewImage(dateString, filePath) {
  const baseFileName = uuid(42);
  const emailCreatedAtDate = new Date(dateString);

  console.log('Saving the main image');
  await saveMainImage(filePath, `${baseFileName}.jpg`);

  console.log('Saving the 1x thumbnail image');
  await saveThumbnailImage(filePath, 170, `${baseFileName}_thumb.jpg`);

  console.log('Extracting the metadata region');
  const metaDataImage = await extractMetaDataImage(filePath);

  console.log('OCR reading the metadata region');
  const { ocrDate, ocrTemperature } = await ocrMetaDataImage(metaDataImage);

  // TODO: Delete temp file

  console.log('Creating a database entry');
  insertStmt.run({
    file_name: baseFileName,
    email_created_at: emailCreatedAtDate.getTime() / 1000,
    ocr_created_at: ocrDate && ocrDate.getTime() / 1000,
    temperature: ocrTemperature,
    created_at: Math.floor(Date.now() / 1000)
  });

  console.log({ baseFileName, emailCreatedAtDate, ocrDate, ocrTemperature });
  console.log('Image processed succesfully');
}

async function extractMetaDataImage(filePath) {
  return sharp(filePath)
    .extract({ left: 520, top: 932, width: 565, height: 26 })
    .toBuffer({ resolveWithObject: true })
    .then(({ data }) => data);
}

async function saveMainImage(filePath, fileName) {
  return sharp(filePath)
    .extract({ left: 0, top: 0, width: 1279, height: 928 })
    .toFile(path.join(process.env.IMAGE_DIR, fileName));
}

async function saveThumbnailImage(filePath, width, thumbnailFileName) {
  return sharp(filePath)
    .extract({ left: 0, top: 0, width: 1279, height: 928 })
    .resize(width)
    .toFile(path.join(process.env.IMAGE_DIR, thumbnailFileName));
}

async function ocrMetaDataImage(metaDataImage) {
  return new Promise((resolve, reject) => {
    Tesseract.recognize(metaDataImage)
      .catch(err => reject(err))
      .then(({ text }) => {
        let ocrDate = null;
        let ocrTemperature = null;

        console.log(`OCR string: ${text}`);

        try {
          const [, day, month, year] = text.match(/(\d\d)\/(\d\d)\/(\d\d\d\d)/);
          const [, hours, minutes, seconds] = text.match(/(\d\d):(\d\d):(\d\d)/);

          const dateParts = [year, month, day, hours, minutes, seconds].map(part => parseInt(part));
          dateParts[1] -= 1; // The argument monthIndex is 0-based

          ocrDate = new Date(Date.UTC(...dateParts));
          ocrDate.setHours(ocrDate.getHours() - parseInt(process.env.CAMERA_TZ_OFFSET));
        } catch (e) {
          console.warn('OCR date parsing failed');
        }

        try {
          const [, temperature] = text.match(/(-?\d+)°/);
          ocrTemperature = parseInt(temperature);
        } catch (e) {
          console.warn('OCR temperature parsing failed');
        }

        return resolve({ ocrDate, ocrTemperature });
      });
  });
}
