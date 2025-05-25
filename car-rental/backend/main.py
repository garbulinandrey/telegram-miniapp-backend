from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import gspread
from oauth2client.service_account import ServiceAccountCredentials

app = FastAPI()

# Обновляем CORS настройки
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # В продакшене заменить на конкретные домены
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Функция для получения данных из Google Sheets
def get_sheet():
    scope = [
        'https://spreadsheets.google.com/feeds',
        'https://www.googleapis.com/auth/drive'
    ]
    creds = ServiceAccountCredentials.from_json_keyfile_name('credentials.json', scope)
    client = gspread.authorize(creds)
    return client.open('CarRental')

@app.get("/")
def read_root():
    return {"message": "Car Rental API is running"}

@app.get("/api/cars")
def get_cars():
    try:
        sheet = get_sheet()
        cars = sheet.worksheet('Cars').get_all_records()
        return cars
    except Exception as e:
        print(f"Error getting cars: {str(e)}")  # Добавляем логирование
        return {"error": str(e)}

@app.get("/api/promos")
def get_promos():
    try:
        sheet = get_sheet()
        promos = sheet.worksheet('Promos').get_all_records()
        return promos
    except Exception as e:
        print(f"Error getting promos: {str(e)}")  # Добавляем логирование
        return {"error": str(e)}

class BookingData(BaseModel):
    car_id: str
    contact: str

@app.post("/api/book")
async def book_car(data: BookingData):
    return {
        "status": "success",
        "message": f"Бронирование автомобиля {data.car_id} для {data.contact}"
    }