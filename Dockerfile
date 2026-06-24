FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

ENV NODE_ENV=production

# No correr como root: el usuario `node` ya viene en la imagen oficial.
RUN chown -R node:node /app
USER node

EXPOSE 3000

CMD ["npm", "start"]
