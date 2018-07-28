
### Simulate upload from Mailgun

```
curl -X POST \
  -F "Date=Thu, 26 Jul 2018 21:34:01 +0200" \
  -F "attachment-count=1" \
  -F "attachment-1=@PICT0005.jpg" \
  http://localhost:3000/api/upload-image-foobar
```
