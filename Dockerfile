FROM node:8-alpine3.10
COPY . /var/app/
WORKDIR /var/app
RUN apk update -U
RUN npm install

EXPOSE 3000
STOPSIGNAL SIGTERM
CMD npm run start
