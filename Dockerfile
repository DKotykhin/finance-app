FROM node:alpine

WORKDIR /app

COPY package.json /app
COPY package-lock.json /app
COPY prisma /app/prisma

RUN npm install

COPY . /app

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
