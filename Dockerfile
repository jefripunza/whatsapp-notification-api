FROM node:18.2.0-buster-slim
LABEL maintainer="Jefri Herdi Triyanto jefriherditriyanto@gmail.com"

RUN  apt-get update \
    && apt-get install -y wget gnupg ca-certificates procps libxss1 \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    # We install Chrome to get all the OS level dependencies, but Chrome itself
    # is not actually used as it's packaged in the node puppeteer library.
    # Alternatively, we could could include the entire dep list ourselves
    # (https://github.com/puppeteer/puppeteer/blob/master/docs/troubleshooting.md#chrome-headless-doesnt-launch-on-unix)
    # but that seems too easy to get out of date.
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/* \
    && wget --quiet https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh -O /usr/sbin/wait-for-it.sh \
    && chmod +x /usr/sbin/wait-for-it.sh

# RUN apk add git
# RUN git config --global url."https://".insteadOf git://

WORKDIR /app 
COPY . .

# === BASIC ENVIRONMENT === #
ENV CI_CD=true

# 🌊 Install Dependencies
RUN yarn install
RUN yarn install:fe

# ⚒️ Build
RUN yarn build:fe

# 💯 Last Configuration
RUN sed -i 's/localhost/host.docker.internal/g' .env

# 🚀 Finish !!
EXPOSE 4000
ENV NODE_ENV=development
CMD ["yarn", "start"]
