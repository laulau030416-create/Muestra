import { WebScreenshot } from './types';
import imgSpace from './assets/images/web_space_logistics_1782861206611.avif';
import imgNexori from './assets/images/web_nexori_finance_1782861215529.avif';
import imgLuma from './assets/images/web_luma_emotional_1782861224125.avif';
import imgAcru from './assets/images/web_acru_wealth_1782861236968.avif';

export const webScreenshots: WebScreenshot[] = [
  {
    id: 'space',
    title: 'SPACE Logistics',
    brandName: 'SPACE CO',
    url: 'space.io',
    theme: 'dark',
    screenshotType: 'Industrial Logistics & Telemetry',
    imagePath: imgSpace
  },
  {
    id: 'nexori',
    title: 'Nexori DeFi',
    brandName: 'Nexori FinTech',
    url: 'nexori.finance',
    theme: 'light',
    screenshotType: 'DeFi Investment Protocol',
    imagePath: imgNexori
  },
  {
    id: 'emotional-ai',
    title: 'Luma Emotional AI',
    brandName: 'Luma AI',
    url: 'luma.ai',
    theme: 'colorful',
    screenshotType: 'Cognitive State Analytics',
    imagePath: imgLuma
  },
  {
    id: 'acru',
    title: 'ACRU Business',
    brandName: 'ACRU Dashboard',
    url: 'acru.co',
    theme: 'dashboard',
    screenshotType: 'SaaS Cost Intelligence',
    imagePath: imgAcru
  }
];

