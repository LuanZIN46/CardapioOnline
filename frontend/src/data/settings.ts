import type { StoreSettings } from '@/types';

export const storeSettings: StoreSettings = {
  name: 'Bar do Pardal',
  tagline: 'Bons drinks · Boa resenha · Sempre',
  logoUrl: '/logo.jpg',
  logoMarkUrl: '/logo-mark.png',
  bannerUrl: '/fachada.jpg',
  whatsappNumber: '5514996440787',
  phone: '(14) 99644-0787',
  instagram: 'https://instagram.com/bardopardal',
  facebook: 'https://facebook.com/bardopardal',
  address: 'Rua dos Sabiás, 01 - Esplanada',
  deliveryFee: 200,
  pixKey: '14996440787',
  deliveryTimeMinutes: { min: 35, max: 50 },
  pickupTimeMinutes: { min: 15, max: 25 },
  // Horário informado pelo estabelecimento: 19h às 23h, todos os dias.
  openingHours: [
    { weekday: 0, opensAt: '19:00', closesAt: '23:00', closed: false },
    { weekday: 1, opensAt: '19:00', closesAt: '23:00', closed: false },
    { weekday: 2, opensAt: '19:00', closesAt: '23:00', closed: false },
    { weekday: 3, opensAt: '19:00', closesAt: '23:00', closed: false },
    { weekday: 4, opensAt: '19:00', closesAt: '23:00', closed: false },
    { weekday: 5, opensAt: '19:00', closesAt: '23:00', closed: false },
    { weekday: 6, opensAt: '19:00', closesAt: '23:00', closed: false },
  ],
};
