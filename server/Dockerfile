FROM node:20-slim

# Create a non-root user group and user (node user is already included in node images, just setting up perms)
WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .
RUN chown -R node:node /app

USER node
EXPOSE 5000

CMD ["node", "index.js"]
