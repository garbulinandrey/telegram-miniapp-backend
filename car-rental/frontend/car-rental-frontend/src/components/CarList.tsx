import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Chip, 
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tab,
  Tabs
} from '@mui/material';
import type { Car } from '../api';
import { bookCar } from '../api';

interface CarListProps {
  cars: Car[];
}

interface BookingDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (contact: string) => void;
}

const BookingDialog: React.FC<BookingDialogProps> = ({ open, onClose, onSubmit }) => {
  const [contactType, setContactType] = useState(0);
  const [contact, setContact] = useState('');

  const handleSubmit = () => {
    if (contact) {
      onSubmit(contact);
      setContact('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Забронировать автомобиль</DialogTitle>
      <DialogContent>
        <Tabs
          value={contactType}
          onChange={(_, newValue) => setContactType(newValue)}
          sx={{ mb: 2 }}
        >
          <Tab label="Телефон" />
          <Tab label="Telegram" />
        </Tabs>
        <TextField
          autoFocus
          margin="dense"
          label={contactType === 0 ? "Номер телефона" : "Username Telegram"}
          type={contactType === 0 ? "tel" : "text"}
          fullWidth
          variant="outlined"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder={contactType === 0 ? "+7 (999) 999-99-99" : "@username"}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!contact}>
          Забронировать
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const CarList: React.FC<CarListProps> = ({ cars }) => {
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleBooking = async (contact: string) => {
    if (selectedCar) {
      try {
        await bookCar(selectedCar.id.toString(), contact);
        alert('Бронирование успешно отправлено!');
      } catch (error) {
        console.error('Ошибка при бронировании:', error);
        alert('Ошибка при бронировании. Попробуйте позже.');
      }
    }
  };

  const isAvailable = (available: any): boolean => {
    if (typeof available === 'boolean') {
      return available;
    }
    return String(available).toUpperCase() === 'TRUE';
  };

  const formatPrice = (car: Car): string => {
    if (car.price) {
      return typeof car.price === 'number' ? `${car.price}₽` : car.price;
    }
    const priceMatch = car.description.match(/от (\d+)р/);
    return priceMatch ? `от ${priceMatch[1]}₽` : '';
  };

  return (
    <>
      <Box sx={{ 
        display: 'grid',
        gap: 3,
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
        },
        p: 2
      }}>
        {cars.map((car) => (
          <Box key={car.id}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.02)'
                }
              }}
            >
              <CardMedia
                component="img"
                height="200"
                image={car.photo_url}
                alt={car.title}
                sx={{ 
                  objectFit: 'cover',
                  borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
                }}
              />
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography 
                  variant="h6" 
                  component="div"
                  sx={{ 
                    mb: 1,
                    fontWeight: 'bold'
                  }}
                >
                  {car.title}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    mb: 2,
                    flexGrow: 1
                  }}
                >
                  {car.description}
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  gap: 1,
                  mt: 'auto'
                }}>
                  <Typography 
                    variant="h6" 
                    color="primary"
                    sx={{ 
                      fontWeight: 'bold',
                      fontSize: '1.1rem'
                    }}
                  >
                    {formatPrice(car)}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Chip 
                      label={isAvailable(car.available) ? "Доступен" : "Занят"}
                      color={isAvailable(car.available) ? "success" : "error"}
                      size="small"
                      sx={{ 
                        fontWeight: 'medium',
                        '& .MuiChip-label': {
                          px: 1
                        }
                      }}
                    />
                    <Button
                      variant="contained"
                      size="small"
                      disabled={!isAvailable(car.available)}
                      onClick={() => {
                        setSelectedCar(car);
                        setDialogOpen(true);
                      }}
                    >
                      Забронировать
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>
      <BookingDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleBooking}
      />
    </>
  );
};

export default CarList;