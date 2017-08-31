FROM node:boron

RUN mkdir -p /usr/src/puckiq-api
WORKDIR /usr/src/puckiq-api

COPY package.json /usr/src/puckiq-api
RUN npm install

COPY . /usr/src/puckiq-api

EXPOSE 3001

CMD [ "npm", "start" ]