import gspread
from oauth2client.service_account import ServiceAccountCredentials
from pprint import pprint

def test_google_sheets_connection():
    print("Начинаем тестирование подключения к Google Sheets...")
    
    try:
        # 1. Определяем scope (права доступа)
        scope = [
            'https://spreadsheets.google.com/feeds',
            'https://www.googleapis.com/auth/drive'
        ]
        print("✓ Scope определен")

        # 2. Пытаемся загрузить учетные данные
        creds = ServiceAccountCredentials.from_json_keyfile_name('credentials.json', scope)
        print("✓ Учетные данные загружены")

        # 3. Авторизуемся в Google Sheets
        client = gspread.authorize(creds)
        print("✓ Авторизация успешна")

        # 4. Пытаемся открыть таблицу
        sheet = client.open('CarRental')
        print("✓ Таблица найдена")

        # 5. Получаем данные из листа Cars
        cars = sheet.worksheet('Cars').get_all_records()
        print("\nДанные из листа Cars:")
        pprint(cars)

        # 6. Получаем данные из листа Promos
        promos = sheet.worksheet('Promos').get_all_records()
        print("\nДанные из листа Promos:")
        pprint(promos)

        print("\n✅ Тестирование успешно завершено!")
        
    except FileNotFoundError:
        print("❌ Ошибка: Файл credentials.json не найден!")
        print("Убедитесь, что файл credentials.json находится в той же папке, что и этот скрипт.")
    
    except gspread.exceptions.SpreadsheetNotFound:
        print("❌ Ошибка: Таблица 'CarRental' не найдена!")
        print("Убедитесь, что:")
        print("1. Таблица создана в Google Sheets")
        print("2. Таблица называется точно 'CarRental'")
        print("3. Вы предоставили доступ сервисному аккаунту (email из credentials.json)")
    
    except Exception as e:
        print(f"❌ Произошла ошибка: {str(e)}")
        print("Проверьте:")
        print("1. Правильность файла credentials.json")
        print("2. Наличие необходимых разрешений")
        print("3. Подключение к интернету")

if __name__ == "__main__":
    test_google_sheets_connection()