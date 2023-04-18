FROM node:18-alpine

RUN apk upgrade --no-cache --available \
    && apk add --no-cache \
        make \
        chromium \
        ttf-freefont \
        font-noto-emoji \
    && apk add --no-cache \
        --repository=https://dl-cdn.alpinelinux.org/alpine/edge/testing \
        font-wqy-zenhei

ENV CHROME_BIN=/usr/bin/chromium-browser \
    CHROME_PATH=/usr/lib/chromium/

COPY package.json package.json

RUN npm install

RUN rm package.json

RUN mkdir -p /apps

WORKDIR /apps
