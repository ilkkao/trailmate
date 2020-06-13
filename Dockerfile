FROM node:14-alpine3.12
RUN apk add --no-cache sqlite python3 build-base

WORKDIR /app/server/
COPY server/package.json server/yarn.lock /app/server/
RUN yarn install --production

WORKDIR /app/client/
COPY client/package.json client/yarn.lock /app/client/
RUN yarn install
COPY client /app/client
RUN yarn build

FROM node:14-alpine3.12
RUN apk add --no-cache dumb-init sqlite
WORKDIR /app/server/

COPY server /app/server
COPY locales /app/locales
COPY --from=0 /app/server/node_modules /app/server/node_modules
COPY --from=0 /app/client/build /app/client/build

EXPOSE 3000
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD [ "node", "server.js" ]
