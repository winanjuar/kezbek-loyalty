FROM node:18-alpine
RUN apk add --no-cache --virtual .build-deps alpine-sdk python3
RUN mkdir -p /var/www/loyalty
WORKDIR /var/www/loyalty
ADD . /var/www/loyalty
RUN npm install
CMD npm start