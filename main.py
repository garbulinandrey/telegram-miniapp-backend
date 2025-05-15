# main.py
import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import gspread
from oauth2client.service_account import ServiceAccountCredentials
from dotenv import load_dotenv

load_dotenv()
BOT_TOKEN = os.getenv("BOT_TOKEN")
MANAGER_CHAT_ID = int(os.getenv("MANAGER_CHAT_ID"))
GS_CRED_FILE = os.getenv("GS_CRED_FILE")
SHEET_NAME = os.getenv("SHEET_NAME")
ORIGINS = os.getenv("ORIGINS", "").split(",")

app = FastAPI()

# CORS для вашего фронтенда
app.add_middleware(
    CORSMiddleware,
    allow_origins=ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def load_data():
    scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
    creds = ServiceAccountCredentials.from_json_keyfile_name(GS_CRED_FILE, scope)
    client = gspread.authorize(creds)
    sheet = client.open(SHEET_NAME)
    cars = sheet.worksheet("Cars").get_all_records()
    promos = sheet.worksheet("Promos").get_all_records()
    # нормализация available → bool
    for c in cars:
        a = c.get("available")
        c["available"] = bool(a) if isinstance(a, bool) else str(a).strip().lower() in ("true", "1", "yes")
    return cars, promos

@app.get("/api/data")
async def get_data():
    cars, promos = load_data()
    return {"cars": cars, "promos": promos}

class Booking(BaseModel):
    id: int
    contact: str

@app.post("/api/book")
async def book_car(b: Booking):
    from telegram import Bot
    bot = Bot(token=BOT_TOKEN)
    cars, _ = load_data()
    car = next((c for c in cars if c["id"] == b.id), None)
    if not car:
        return {"status": "error", "msg": "Car not found"}
    text = f"📌 *Аренда автомобиля*\nМарка: {car['title']}\nКонтакт: {b.contact}"
    bot.send_message(chat_id=MANAGER_CHAT_ID, text=text, parse_mode="Markdown")
    return {"status": "ok"}
