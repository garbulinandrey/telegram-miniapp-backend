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

// Данные о машинах
const cars = [
  {
    id: 1,
    title: "Jetta VA3",
    photo_url: "https://cdn.jsdelivr.net/gh/garbulinandrey/images@main/Jetta.JPG",
    description: "от 2300р в сутки. 2023г., АКПП, Надежный, комфортный, экономичный автомобиль",
    available: "TRUE"
  }
  // Добавьте остальные машины из вашего списка
];

// Данные об акциях
const promos = [
  {
    id: 1,
    title: "Приведи друга!",
    description: "Приведи друга на аренду автомобиля и если он отработает 2 недели, ты получишь 6000 рублей!",
    photo_url: "https://cdn.jsdelivr.net/gh/garbulinandrey/images@main/promo1.jpg"
  }
  // Добавьте остальные акции
];

// API endpoints
app.get('/api/cars', (_, res) => {
  res.json(cars);
});

app.get('/api/promos', (_, res) => {
  res.json(promos);
});

// Статические файлы фронтенда
app.use(express.static(path.join(__dirname, '../frontend/car-rental-frontend/build')));

// Команда /start
bot.command('start', (ctx) => {
  ctx.reply('Добро пожаловать в YoTaxi! 🚗', {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🚗 Каталог автомобилей', web_app: { url: process.env.WEBAPP_URL || 'http://localhost:3000' } }],
        [{ text: '💬 Чат с менеджером', url: 'https://t.me/yotaxi' }],
        [{ text: '🛒 Выкуп', url: 'https://t.me/+62DE0gWGFBFlYWEy' }],
        [{ text: '🔧 Сервис', callback_data: 'service' }]
      ]
    }
  });
});

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