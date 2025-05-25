import axios from 'axios';

const API = 'http://localhost:8000/api';

// Интерфейсы
export interface Car {
  id: string | number;
  title: string;
  description: string;
  photo_url: string;
  photo_preview?: string;
  available: boolean | string;
  price?: string | number;
}

export interface Promo {
  id: string | number;
  title: string;
  description: string;
  photo_url: string;
}

// API функции
export const getCars = async (): Promise<Car[]> => {
  try {
    const response = await axios.get<Car[]>(`${API}/cars`);
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении машин:', error);
    throw error;
  }
};

export const getPromos = async (): Promise<Promo[]> => {
  try {
    const response = await axios.get<Promo[]>(`${API}/promos`);
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении акций:', error);
    throw error;
  }
};

export const bookCar = async (car_id: string, contact: string) => {
  try {
    const response = await axios.post(`${API}/book`, { car_id, contact });
    return response.data;
  } catch (error) {
    console.error('Ошибка при бронировании:', error);
    throw error;
  }
};