FROM node:14

WORKDIR /app/server/

COPY package.json yarn.lock /app/server/

RUN wget https://github.com/Yelp/dumb-init/releases/download/v1.2.2/dumb-init_1.2.2_amd64.deb
RUN dpkg -i dumb-init_*.deb

RUN apt-get update && apt-get install sqlite3

ENTRYPOINT ["/usr/bin/dumb-init", "--"]

RUN yarn install --production

COPY client /app/server/client

RUN cd client && \
  yarn install && \
  yarn build && \
  rm -fr node_modules

COPY server.js eng.traineddata /app/server/

EXPOSE 3000
CMD [ "node", "server.js" ]
