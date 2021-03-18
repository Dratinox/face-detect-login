FROM node:14

WORKDIR /usr/src/app

COPY . .

RUN npm install
RUN npm run tsc


EXPOSE 5000
CMD [ "node", "dist/src/server.js" ]
