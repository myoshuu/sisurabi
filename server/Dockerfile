FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate

# Dev command (hot reload with ts-node-dev)
CMD ["npm", "run", "dev"]
