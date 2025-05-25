import React, { useEffect, useState } from 'react'; // Добавили импорт useState
import { Container, Typography, Box, Button, Stack } from '@mui/material';
import { Car, Promo, getCars, getPromos } from './api';
import { CarList } from './components/CarList';
import { PromoList } from './components/PromoList';

// Объявляем глобальный интерфейс для Telegram WebApp
declare global {
  interface Window {
    Telegram?: {
      WebApp?: any;
    };
  }
}

function App() {
  const [cars, setCars] = useState<Car[]>([]);
  const [promos, setPromos] = useState<Promo[]>([]);

  useEffect(() => {
    // Инициализация Telegram WebApp
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }

    const fetchData = async () => {
      try {
        const [carsData, promosData] = await Promise.all([
          getCars(),
          getPromos()
        ]);
        setCars(carsData);
        setPromos(promosData);
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Аренда автомобилей
        </Typography>

        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2} 
          justifyContent="center" 
          sx={{ mb: 4 }}
        >
          <Button
            variant="contained"
            href="https://t.me/yotaxi"
            target="_blank"
            sx={{ minWidth: 200 }}
          >
            Чат с менеджером
          </Button>
          <Button
            variant="contained"
            href="https://t.me/+62DE0gWGFBFlYWEy"
            target="_blank"
            sx={{ minWidth: 200 }}
          >
            Выкуп
          </Button>
          <Button
            variant="contained"
            href="tel:+79297344555"
            sx={{ minWidth: 200 }}
          >
            📞 Сервис
          </Button>
        </Stack>
        
        {promos.length > 0 && (
          <>
            <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4 }}>
              Акции
            </Typography>
            <PromoList promos={promos} />
          </>
        )}

        <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4 }}>
          Модельный ряд {cars.length > 0 && `(${cars.length})`}
        </Typography>
        <CarList cars={cars} />
      </Box>
    </Container>
  );
}

export default App;