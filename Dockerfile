FROM node:10

COPY package.json yarn.lock .env server.js /app/server/
WORKDIR /app/server/

RUN wget https://github.com/Yelp/dumb-init/releases/download/v1.2.1/dumb-init_1.2.1_amd64.deb
RUN dpkg -i dumb-init_*.deb

ENTRYPOINT ["/usr/bin/dumb-init", "--"]

RUN yarn install --production

EXPOSE 3000
CMD [ "node", "server.js" ]
