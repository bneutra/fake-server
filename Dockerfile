FROM node:8-alpine3.9
COPY . /var/app/
WORKDIR /var/app
RUN npm install

EXPOSE 3000
STOPSIGNAL SIGTERM
CMD npm run start
