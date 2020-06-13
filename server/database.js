const Database = require('better-sqlite3');
const config = require('./config');

const databaseFilePath = config.test ? ':memory:' : config.get('db_file');
const database = new Database(databaseFilePath);

database
  .prepare(
    `
  CREATE TABLE IF NOT EXISTS images (
    id integer PRIMARY KEY AUTOINCREMENT,
    file_name text NOT NULL UNIQUE,
    created_at integer,
    email_created_at integer NOT NULL,
    ocr_created_at integer,
    temperature integer,
    deleted_at integer)`
  )
  .run();

database
  .prepare(
    `
  CREATE UNIQUE INDEX IF NOT EXISTS idx_images_email_created_at ON images (
    email_created_at
  )`
  )
  .run();

const insertStmt = database.prepare(`
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

const queryStmt = database.prepare(`
  SELECT
    file_name, email_created_at, ocr_created_at, temperature
  FROM
    images
  WHERE
    deleted_at IS NULL
  ORDER BY
    email_created_at ASC`);

const deleteStmt = database.prepare(`
  UPDATE
    images
  SET
    deleted_at=$deleted_at
  WHERE
    file_name=$file_name`);

const queryNewStmt = database.prepare(`
    SELECT
      count(*) AS new_images
    FROM
      images
    WHERE
      datetime(email_created_at, 'unixepoch') >= datetime('now', '-24 Hour') AND deleted_at IS NULL`);

module.exports = {
  database,
  insertStmt,
  queryStmt,
  deleteStmt,
  queryNewStmt
};
