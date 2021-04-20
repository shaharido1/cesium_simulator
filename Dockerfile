ARG BASE_IMAGE=webiks/node:15.6.0-alpine3.12-ffmpeg-4.3.1
FROM $BASE_IMAGE
RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# RUN wget http://security.ubuntu.com/ubuntu/pool/main/a/apt/apt_1.0.1ubuntu2.24.tar.xz -O apt_1.0.1ubuntu2.24.tar.xz
# RUN mkdir ./apt
# RUN tar xf apt_1.0.1ubuntu2.24.tar.xz
# RUN apk add make
# RUN (cd ./apt_1.0.1ubuntu2.24&&ls)
# RUN dpkg --add-architecture i386
# RUN dpkg -i apt.deb
# RUN apt-get update && apt-get install gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget x11vnc x11-xkb-utils xfonts-100dpi xfonts-75dpi xfonts-scalable xfonts-cyrillic x11-apps xvfb
RUN apk add xvfb
RUN apk add xvfb-run
# Puppeteer v6.0.0 works with Chromium 89.
# RUN yarn add puppeteer@6.0.0

# Add user so we don't need --no-sandbox.
# RUN addgroup -S pptruser && adduser -S -g pptruser pptruser \
#     && mkdir -p /home/pptruser/Downloads /app \
#    && chown -R pptruser:pptruser /home/pptruser \
#     && chown -R pptruser:pptruser /app

# Run everything after as non-privileged user.
# USER pptruser
WORKDIR /opt/app/dist/
RUN apk update && apk add ffmpeg
COPY package.json /opt/app/dist
COPY package-lock.json /opt/app/dist
RUN (cd /opt/app/dist && npm install --production)
COPY ./src /opt/app/dist/src
CMD npm start


