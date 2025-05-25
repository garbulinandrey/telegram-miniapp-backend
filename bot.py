import os
import re
import logging
from dotenv import load_dotenv
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, InputMediaPhoto
from telegram.ext import (
    Application, CommandHandler, CallbackQueryHandler,
    MessageHandler, ConversationHandler, filters
)
import gspread
from oauth2client.service_account import ServiceAccountCredentials

# Загрузка .env
load_dotenv()
BOT_TOKEN = os.getenv('BOT_TOKEN')
MANAGER_CHAT_ID = int(os.getenv('MANAGER_CHAT_ID'))

# Логирование
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s', level=logging.INFO
)
logger = logging.getLogger(__name__)

# Состояния
ENTER_CONTACT = 0

# Регулярки
PHONE_RE = re.compile(r'^\+?\d{10,15}$')
USERNAME_RE = re.compile(r'^@[\w\d_]{5,32}$')

# Google Sheets
GS_CRED_FILE = 'credentials.json'
SHEET_NAME = 'CarRental'

def load_sheets_data():
    scope = [
        'https://spreadsheets.google.com/feeds',
        'https://www.googleapis.com/auth/drive'
    ]
    creds = ServiceAccountCredentials.from_json_keyfile_name(GS_CRED_FILE, scope)
    client = gspread.authorize(creds)
    sheet = client.open(SHEET_NAME)
    cars = sheet.worksheet('Cars').get_all_records()
    promos = sheet.worksheet('Promos').get_all_records()
    return cars, promos

# Загрузка и нормализация данных
_raw_cars, _raw_promos = load_sheets_data()
# Приводим поле available к булеву типу
CARS = []
for c in _raw_cars:
    avail = c.get('available')
    c['available'] = (
        True if (isinstance(avail, bool) and avail)
        or (isinstance(avail, str) and avail.strip().lower() in ('true', '1', 'yes'))
        else False
    )
    CARS.append(c)
PROMOS = _raw_promos

async def start(update: Update, context):
    chat_id = update.effective_chat.id
    keyboard = [
        [InlineKeyboardButton("🚗 Парк", callback_data='park')],
        [InlineKeyboardButton("🔥 Акции", callback_data='promos')],
        [InlineKeyboardButton("💰 Выкуп", url="https://t.me/+62DE0gWGFBFlYWEy")],
        [InlineKeyboardButton("💬 Чат с менеджером", url="https://t.me/yotaxi")],
        [InlineKeyboardButton("🔧 Сервис", callback_data='service')]
    ]
    await context.bot.send_message(
        chat_id=chat_id,
        text="Добро пожаловать! Выберите раздел:",
        reply_markup=InlineKeyboardMarkup(keyboard)
    )

async def show_list(update: Update, context, items, prefix):
    query = update.callback_query
    await query.answer()
    idx_key = f"{prefix}_idx"
    idx = context.user_data.get(idx_key, 0)
    action = query.data.split("_")[-1]
    idx = (idx + 1) % len(items) if action == 'next' else (idx - 1) % len(items)
    context.user_data[idx_key] = idx

    item = items[idx]
    title = item.get('title') or item.get('name', '')
    photo_url = item.get('photo_url')

    if prefix == 'car':
        avail = '✅ В наличии' if item.get('available') else '❌ Нет в наличии'
        caption = f"{title}\n{avail}\n{item.get('description', '')}"
    elif prefix == 'promo':
        caption = f"{title}\n{item.get('description', '')}"
    else:
        caption = title

    buttons = [
        InlineKeyboardButton('◀️', callback_data=f"{prefix}_back"),
        InlineKeyboardButton(f"{idx+1}/{len(items)}", callback_data='noop'),
        InlineKeyboardButton('▶️', callback_data=f"{prefix}_next")
    ]
    kb = [buttons]
    if prefix == 'car':
        kb.append([InlineKeyboardButton("Забронировать 🚀", callback_data=f"book_{item['id']}")])
    kb.append([InlineKeyboardButton("🏠 Меню", callback_data='back')])

    await query.edit_message_media(
        media=InputMediaPhoto(photo_url, caption=caption),
        reply_markup=InlineKeyboardMarkup(kb)
    )

async def show_park(update: Update, context):
    context.user_data['car_idx'] = 0
    await show_list(update, context, CARS, 'car')

async def show_promos(update: Update, context):
    query = update.callback_query
    await query.answer()
    if not PROMOS:
        await query.message.reply_text('Сейчас нет активных акций.')
        return
    context.user_data['promo_idx'] = 0
    await show_list(update, context, PROMOS, 'promo')

async def service_call(update: Update, context):
    query = update.callback_query
    await query.answer()
    service_phone = "+79297344555"
    text = f"📞 Для связи с сервисом позвоните по номеру: {service_phone}"
    keyboard = [[InlineKeyboardButton("🏠 Меню", callback_data='back')]]
    await context.bot.send_message(
        chat_id=query.message.chat.id,
        text=text,
        reply_markup=InlineKeyboardMarkup(keyboard)
    )

async def go_back(update: Update, context):
    query = update.callback_query
    await query.answer()
    await start(update, context)

async def select_car(update: Update, context):
    q = update.callback_query
    await q.answer()
    context.user_data['car_id'] = q.data.split("_")[1]
    await context.bot.send_message(
        chat_id=q.message.chat.id,
        text="Оставьте телефон +79001234567 или @username:",
        reply_markup=InlineKeyboardMarkup(
            [[InlineKeyboardButton("🏠 В меню", callback_data='back')]]
        )
    )
    return ENTER_CONTACT

async def enter_contact(update: Update, context):
    contact = update.message.text.strip()
    if not (PHONE_RE.match(contact) or USERNAME_RE.match(contact)):
        await update.message.reply_text(
            "Неверный формат.",
            reply_markup=InlineKeyboardMarkup(
                [[InlineKeyboardButton("🏠 В меню", callback_data='back')]]
            )
        )
        return ENTER_CONTACT
    car_id = context.user_data.get('car_id')
    car = next((c for c in CARS if str(c['id']) == str(car_id)), None)
    if not car:
        await update.message.reply_text("Автомобиль не найден.")
        return ConversationHandler.END
    text = (
        "📌 *Аренда автомобиля*\n"
        f"Марка: {car['title']}\n"
        f"Контакт: {contact}"
    )
    await context.bot.send_message(
        chat_id=MANAGER_CHAT_ID,
        text=text,
        parse_mode='Markdown'
    )
    await update.message.reply_text(
        "Спасибо! Заявка отправлена.",
        reply_markup=InlineKeyboardMarkup(
            [[InlineKeyboardButton("🏠 В меню", callback_data='back')]]
        )
    )
    return ConversationHandler.END

async def noop(update: Update, context):
    await update.callback_query.answer()


def main():
    app = Application.builder().token(BOT_TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CallbackQueryHandler(show_park, pattern='^park$'))
    app.add_handler(CallbackQueryHandler(show_promos, pattern='^promos$'))
    app.add_handler(CallbackQueryHandler(service_call, pattern='^service$'))
    app.add_handler(CallbackQueryHandler(go_back, pattern='^back$'))
    app.add_handler(CallbackQueryHandler(
        lambda u, c: show_list(u, c, CARS, 'car'), pattern='^car_(back|next)$'
    ))
    app.add_handler(CallbackQueryHandler(
        lambda u, c: show_list(u, c, PROMOS, 'promo'), pattern='^promo_(back|next)$'
    ))
    app.add_handler(CallbackQueryHandler(noop, pattern='^noop$'))

    conv = ConversationHandler(
        entry_points=[CallbackQueryHandler(select_car, pattern='^book_')],
        states={ENTER_CONTACT: [MessageHandler(filters.TEXT & ~filters.COMMAND, enter_contact)]},
        fallbacks=[CallbackQueryHandler(go_back, pattern='^back$')]
    )
    app.add_handler(conv)
    app.run_polling()

if __name__ == '__main__':
    main()
