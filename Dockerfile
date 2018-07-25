FROM node:10

WORKDIR /app/server/

COPY package.json yarn.lock /app/server/

RUN wget https://github.com/Yelp/dumb-init/releases/download/v1.2.1/dumb-init_1.2.1_amd64.deb
RUN dpkg -i dumb-init_*.deb

ENTRYPOINT ["/usr/bin/dumb-init", "--"]

RUN yarn install --production

COPY .env server.js /app/server/

EXPOSE 3000
CMD [ "node", "server.js" ]
