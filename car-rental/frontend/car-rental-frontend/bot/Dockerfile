FROM node:18-alpine

WORKDIR /app

# Установка зависимостей бота
COPY package*.json ./
RUN npm install

# Копирование файлов бота
COPY index.js .

# Копирование собранного фронтенда
COPY ../frontend/car-rental-frontend/build ./public

EXPOSE 3000

CMD ["npm", "start"]