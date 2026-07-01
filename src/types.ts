export interface WebScreenshot {
  id: string;
  title: string;
  brandName: string;
  url: string;
  theme: 'dark' | 'light' | 'colorful' | 'dashboard' | 'minimal';
  screenshotType: string;
  imagePath: string;
}
