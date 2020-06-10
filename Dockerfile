FROM node:14-alpine3.12
RUN apk add --no-cache dumb-init sqlite python3 build-base

WORKDIR /app/server/
COPY package.json yarn.lock /app/server/
RUN yarn install --production

WORKDIR /app/client/
COPY client /app/client
RUN yarn install && yarn build

FROM node:14-alpine3.12
RUN apk add --no-cache dumb-init
WORKDIR /app/

COPY server.js eng.traineddata package.json /app/
COPY --from=0 /app/server/node_modules /app/node_modules
COPY --from=0 /app/client/build /app/client/build/

EXPOSE 3000
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD [ "node", "server.js" ]
