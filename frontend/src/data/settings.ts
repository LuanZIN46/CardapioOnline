import type { StoreSettings } from '@/types';

export const storeSettings: StoreSettings = {
  name: 'Bar do Pardal',
  tagline: 'Bons drinks · Boa resenha · Sempre',
  logoUrl: '/logo.jpg',
  logoMarkUrl: '/logo-mark.png',
  bannerUrl: '/fachada.jpg',
  whatsappNumber: '5514998580049',
  phone: '(14) 99858-0049',
  instagram: 'https://instagram.com/bardopardal',
  facebook: 'https://facebook.com/bardopardal',
  address: 'Rua das Palmeiras, 120 — Centro',
  deliveryFee: 200,
  pixKey: '14998580049',
  deliveryTimeMinutes: { min: 35, max: 50 },
  pickupTimeMinutes: { min: 15, max: 25 },
  openingHours: [
    { weekday: 0, opensAt: '18:00', closesAt: '23:00', closed: false },
    { weekday: 1, opensAt: '18:00', closesAt: '23:00', closed: true },
    { weekday: 2, opensAt: '18:00', closesAt: '23:00', closed: false },
    { weekday: 3, opensAt: '18:00', closesAt: '23:00', closed: false },
    { weekday: 4, opensAt: '18:00', closesAt: '23:30', closed: false },
    { weekday: 5, opensAt: '18:00', closesAt: '01:00', closed: false },
    { weekday: 6, opensAt: '18:00', closesAt: '01:00', closed: false },
  ],
};
