FROM node:current-alpine

RUN curl -sL https://unpkg.com/@pnpm/self-installer | node

RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont \
      nodejs \
      yarn

WORKDIR /usr/src/app

COPY package.json ./

RUN pnpm i

COPY . .

CMD [ "pnpm", "start:docker" ]
