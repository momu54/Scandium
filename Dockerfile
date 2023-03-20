FROM node:current-slim

RUN curl -sL https://unpkg.com/@pnpm/self-installer | node

RUN apt-get update && apt-get install -y wget --no-install-recommends \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-unstable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst ttf-freefont \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get purge --auto-remove -y curl \
    && rm -rf /src/*.deb

RUN groupadd -r momu54 && useradd -r -g momu54 -G audio,video momu54 \
    && mkdir -p /home/momu54/Downloads \
    && chown -R momu54:momu54 /home/momu54 \
    && chown -R momu54:momu54 /app

USER pptruser

WORKDIR /usr/src/app

COPY package.json ./

RUN pnpm i

COPY . .

CMD [ "pnpm", "start:docker" ]
