FROM node:alpine

WORKDIR /app

COPY package.json /app
COPY package-lock.json /app
COPY prisma /app/prisma

RUN npm install
RUN npm run generate

COPY . /app

RUN npm run build

EXPOSE 3000

# CMD ["npm", "start"]
CMD ["sh", "-c", "npm run seed && npm start"]
