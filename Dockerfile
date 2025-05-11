FROM node:20-bullseye-slim

# Install Chrome for Puppeteer
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/googlechrome-linux-keyring.gpg \
    && echo "deb [arch=amd64 signed-by=/usr/share/keyrings/googlechrome-linux-keyring.gpg] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-freefont-ttf \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

# Copy package files first for better caching
COPY package*.json ./

# Clean install (try regular npm install if ci fails)
RUN npm install --production

COPY . .

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable \
    NODE_ENV=production

CMD ["node", "index.js"]