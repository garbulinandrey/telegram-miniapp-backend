const { Telegraf } = require('telegraf');
const express = require('express');
const cors = require('cors');
const path = require('path');

// Инициализация бота
const bot = new Telegraf('7796056682:AAEPYxPuL2KBtsT_Gv02HxMXLyACowwIsng');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Статические файлы фронтенда
app.use(express.static(path.join(__dirname, '../frontend/car-rental-frontend/build')));

// Команда /start
bot.command('start', (ctx) => {
  ctx.reply('Добро пожаловать в YoTaxi! 🚗', {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🚗 Каталог автомобилей', web_app: { url: process.env.WEBAPP_URL || 'https://your-app-url.railway.app' } }],
        [{ text: '💬 Чат с менеджером', url: 'https://t.me/yotaxi' }],
        [{ text: '🛒 Выкуп', url: 'https://t.me/+62DE0gWGFBFlYWEy' }],
        [{ text: '🔧 Сервис', callback_data: 'service' }]
      ]
    }
  });
});

// Обработка кнопки "Сервис"
bot.action('service', (ctx) => {
  ctx.answerCbQuery();
  ctx.reply('📞 Сервис: +79297344555', {
    reply_markup: {
      inline_keyboard: [
        [{ text: '📞 Позвонить', url: 'tel:+79297344555' }]
      ]
    }
  });
});

// API endpoints с данными
app.get('/api/cars', (_, res) => {
  // Ваши текущие данные об автомобилях
  const cars = [/* ваши данные */];
  res.json(cars);
});

app.get('/api/promos', (_, res) => {
  // Ваши текущие акции
  const promos = [/* ваши данные */];
  res.json(promos);
});

// Запуск
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  bot.launch();
  console.log('Bot is running!');
});

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));