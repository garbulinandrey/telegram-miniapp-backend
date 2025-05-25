import axios from 'axios';

const API = 'http://localhost:8000/api';

export const getCars = async () => {
  const response = await axios.get(`${API}/cars`);
  return response.data;
};

export const getPromos = async () => {
  const response = await axios.get(`${API}/promos`);
  return response.data;
};

export const bookCar = async (car_id: string, contact: string) => {
  const response = await axios.post(`${API}/book`, { car_id, contact });
  return response.data;
};