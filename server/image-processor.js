const path = require('path');
const sharp = require('sharp');
const uuid = require('uid2');
const Tesseract = require('tesseract.js');
const logger = require('./logger');
const { insertStmt } = require('./database');
const config = require('./config');

async function processNewImage(dateString, filePath) {
  const baseFileName = uuid(42);
  const emailCreatedAtDate = new Date(dateString);

  logger.info('Saving the main image');
  await saveMainImage(filePath, `${baseFileName}.jpg`);

  logger.info('Saving the 1x thumbnail image');
  await saveThumbnailImage(filePath, 170, `${baseFileName}_thumb.jpg`);

  logger.info('Extracting the metadata region');
  const metaDataImage = await extractMetaDataImage(filePath);

  logger.info('OCR reading the metadata region');
  const { ocrDate, ocrTemperature } = await ocrMetaDataImage(metaDataImage);

  const emailCreatedAtDateInSeconds = Math.floor(emailCreatedAtDate.getTime() / 1000);

  logger.info('Creating a database entry', { emailCreatedAtDateInSeconds, baseFileName, ocrDate, ocrTemperature });

  try {
    insertStmt.run({
      file_name: baseFileName,
      email_created_at: emailCreatedAtDateInSeconds,
      ocr_created_at: ocrDate && Math.floor(ocrDate.getTime() / 1000),
      temperature: ocrTemperature,
      created_at: Math.floor(Date.now() / 1000)
    });

    logger.info('Image processed successfully');
  } catch (e) {
    logger.info('Failed to add image metadata to the db, ignoring', e);
  }
}

async function saveMainImage(filePath, fileName) {
  return sharp(filePath)
    .extract({ left: 0, top: 0, width: 1279, height: 928 })
    .toFile(path.join(config.get('image_dir'), fileName));
}

async function saveThumbnailImage(filePath, width, thumbnailFileName) {
  return sharp(filePath)
    .extract({ left: 0, top: 0, width: 1279, height: 928 })
    .resize(width)
    .toFile(path.join(config.get('image_dir'), thumbnailFileName));
}

async function extractMetaDataImage(filePath) {
  return sharp(filePath)
    .extract({ left: 520, top: 932, width: 635, height: 26 })
    .toBuffer({ resolveWithObject: true })
    .then(({ data }) => data);
}

async function ocrMetaDataImage(metaDataImage) {
  return new Promise((resolve, reject) => {
    Tesseract.recognize(metaDataImage)
      .catch(err => reject(err))
      .then(({ data: { text } }) => {
        let ocrDate = null;
        let ocrTemperature = null;

        logger.info(`OCR string: ${text.replace(/\n/, '')}`);

        try {
          const [, day, month, year] = text.match(/(\d\d)\/(\d\d)\/(\d\d\d\d)/);
          const [, hours, minutes, seconds] = text.match(/(\d\d):(\d\d):(\d\d)/);

          const dateParts = [year, month, day, hours, minutes, seconds].map(part => parseInt(part));
          dateParts[1] -= 1; // The argument monthIndex is 0-based

          ocrDate = new Date(Date.UTC(...dateParts));
          ocrDate.setHours(ocrDate.getHours() - parseInt(config.get('camera_tz_offset')));
        } catch (e) {
          logger.warn('OCR date parsing failed');
        }

        try {
          const [, temperature] = text.match(/(-?\d+)°/);
          ocrTemperature = parseInt(temperature);
        } catch (e) {
          logger.warn('OCR temperature parsing failed');
        }

        return resolve({ ocrDate, ocrTemperature });
      });
  });
}

module.exports = {
  processNewImage
};
