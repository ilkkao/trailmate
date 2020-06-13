# Trailmate

[![Build Status](https://travis-ci.org/ilkkao/trailmate.svg?branch=master)](https://travis-ci.org/ilkkao/trailmate)

:bear: **Check the demo: [Live Trailmate in action](https://riistakamera.eu)**

Trailmate is a simple companion web app for trail cameras that support email transport. It includes a SMTP server which the camera can directly connect to. You don't need to setup email servers, MX records or email to HTTP gateways.

## Installation with Docker compose

Recommended way to run Trailmate is with docker. Example `docker-compose.yml` file:

```
version: '3'
services:
  trailmate:
    image: ilkkao/trailmate:latest
    restart: unless-stopped
    volumes:
      - ./data/:/data
    ports:
      - "3001:3001"
    environment:
      - LOCALE=en-us
      - SERVER_PORT=3001
      - SERVER_URL=http://example.com
      - SMTP_SERVER_PORT=465
      - SECRET_URL_KEY=topsecret
      - SECRET_EMAIL_ADDRESS=topsecret@example.com
      - CAMERA_TZ_OFFSET=3
      - IMAGE_DIR=/data
      - DB_FILE=/data/database.db
      - ADMIN_PASSWORD=verysecret
      - MAILGUN_API_KEY=key-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
      - MAILGUN_DOMAIN=example.com
      - MAILGUN_FROM=My camera <info@example.com>
      - MAILGUN_TO=user@examle.com,user2@example.com
      - GOOGLE_ANALYTICS_ID=UA-111111111-1
      - VERBOSE=false
```

## Develpment

### Run locally in dev mode

Install node modules:

```bash
$ cd client && yarn
$ cd server && yarn
```

Run client dev server in first terminal:

```bash
$ cd client && yarn start-dev
```

Run server in second terminal:

```bash
$ cd server && yarn start-dev
```

Access the website at http://localhost:3000/

### Simulate upload from Mailgun

```
curl -X POST \
  -F "Date=Thu, 28 Jul 2018 21:34:01 +0200" \
  -F "attachment-count=1" \
  -F "attachment-1=@fixtures/sample-burrel-camera-image.jpg" \
  http://localhost:3001/api/upload-image-foobar
```
