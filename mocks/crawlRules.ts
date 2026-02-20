import { CrawlRule } from '@/types';

const now = new Date();
const dayMs = 86400000;

function dateStr(offset: number): string {
  return new Date(now.getTime() + offset * dayMs).toISOString();
}

export const crawlRules: CrawlRule[] = [
  {
    id: 'cr-1',
    brand_id: 'brand-1',
    url: 'https://www.trendyol.com/butik/liste/kampanyalar',
    selector_title: '.campaign-title, h2.title',
    selector_discount: '.discount-badge, .discount-rate',
    selector_image: '.campaign-image img, .hero-image',
    selector_description: '.campaign-description, .detail-text',
    schedule: 'hourly',
    is_active: true,
    last_crawled_at: dateStr(0),
    created_at: dateStr(-30),
  },
  {
    id: 'cr-2',
    brand_id: 'brand-2',
    url: 'https://www.hepsiburada.com/kampanyalar',
    selector_title: '.campaign-card__title',
    selector_discount: '.campaign-card__discount',
    selector_image: '.campaign-card__image img',
    selector_description: '.campaign-card__desc',
    schedule: 'daily',
    is_active: true,
    last_crawled_at: dateStr(-1),
    created_at: dateStr(-20),
  },
  {
    id: 'cr-3',
    brand_id: 'brand-3',
    url: 'https://www.migros.com.tr/kampanyalar',
    selector_title: '.promo-title',
    selector_discount: '.promo-discount',
    selector_image: '.promo-image img',
    selector_description: '.promo-detail',
    schedule: 'daily',
    is_active: false,
    last_crawled_at: dateStr(-5),
    created_at: dateStr(-15),
  },
];
