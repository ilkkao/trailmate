# Trailmate

[![Build Status](https://travis-ci.org/ilkkao/trailmate.svg?branch=master)](https://travis-ci.org/ilkkao/trailmate)

:bear: **Check the demo: [Live Trailmate in action](https://riistakamera.eu)**

Trailmate is a simple companion web app for trail cameras that support email transport. It includes a SMTP server which the camera can directly connect to. You don't need to setup email servers, MX records or email to HTTP gateways.

## Installation with Docker compose

Recommended way to run Trailmate is with docker. Example `docker-compose.yml` file:

```yml
version: '3'
services:
  trailmate:
    image: ilkkao/trailmate:latest
    restart: unless-stopped
    volumes:
      - trailmate-data:/data
    ports:
      - "80:3001"
    environment:
      - HTTP_SERVER_URL=http://example.com
      - SECRET_EMAIL_ADDRESS=topsecret@example.com
      - CAMERA_TZ_OFFSET=3
      - IMAGE_DIR=/data/images
      - DB_FILE=/data/database.db
      - ADMIN_PASSWORD=verysecret
volumes:
  trailmate-data:
```

### Configuration

| Environment variable | Type | Default value | Description |
| -------------------- | ---- | ------------- | ----------- |
| HTTP_SERVER_URL | Mandatory | - | Public URL of the web site. For example `http://myowntrailcam.com`. |
| SECRET_EMAIL_ADDRESS | Mandatory | - | The to: email address the trail camera has to use. This acts as a password. |
| CAMERA_TZ_OFFSET | Mandatory | - | Timezone the camera is configured to use. |
| IMAGE_DIR | Mandatory | - | Persisten directory for received images. |
| DB_FILE | Mandatory | - | Location for the SQLite database file. |
| ADMIN_PASSWORD | Mandatory | - | Admin password, currently needed for image deletion via the web page. |
| LOCALE | Optional | en-us | Default user interface language. |
| HTTP_SERVER_PORT | Optional | 3001 | Port for the nodejs web server. |
| SMTP_SERVER_PORT | Optional | 2526 | SMTP port for incoming mails. Default 2526 is selected so that it is unlikely blocked by ISPs. |
| MAILGUN_API_KEY | Optional | -not set- | Mailgun API key notification emails. Has the form `key-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` |
| MAILGUN_DOMAIN | Optional | -not set- | Mailgun API domain. |
| MAILGUN_FROM | Optional | -not set- | From: header used in notification emails. For example `My camera <info@example.com>` |
| MAILGUN_TO | Optional | -not set- | Comma separated list of email addresses that receive the notifications. For example `addruser@examle.com,user2@example.com` |
| GOOGLE_ANALYTICS_ID | Optional | -not set- | Google Analytics ID. Has the form `UA-111111111-1` |
| VERBOSE | Optional | false | Log web server requests to stdout. |

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
