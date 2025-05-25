import React from 'react';
import type { Promo } from '../api';
import { Box, Card, CardContent, CardMedia, Typography } from '@mui/material';

interface PromoListProps {
  promos: Promo[];
}

export const PromoList: React.FC<PromoListProps> = ({ promos }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {promos.map((promo) => (
        <Card key={promo.id}>
          <Box sx={{ 
            position: 'relative',
            width: '100%',
            paddingTop: '40%', // Соотношение сторон 5:2
            overflow: 'hidden'
          }}>
            <CardMedia
              component="img"
              image={promo.photo_url}
              alt={promo.title}
              sx={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </Box>
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              {promo.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {promo.description}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};