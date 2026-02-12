FROM node:24-alpine

RUN apk upgrade --no-cache --available \
    && apk add --no-cache \
        make \
        chromium \
        chromium-swiftshader \
        ttf-freefont

ENV CHROME_BIN=/usr/bin/chromium-browser \
    CHROME_PATH=/usr/lib/chromium/

COPY package.json package.json

RUN npm install

RUN rm package.json

RUN mkdir -p /apps

WORKDIR /apps
