export const MOCK_PRODUCTS = [
  {
    id: 'prod-1',
    title: 'ASUS ROG Strix G15 Gaming Laptop - RTX 4070, 16GB RAM',
    store: 'Sigma Computer',
    original_url: 'https://sigma-computer.com/product/asus-rog-strix-g15',
    last_price: '49999',
    in_stock: true,
    last_scraped_at: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    price_history: [{ price: '52999' }, { price: '51250' }],
  },
  {
    id: 'prod-2',
    title: 'Samsung Galaxy S24 Ultra 512GB Titanium Black',
    store: 'B.TECH',
    original_url: 'https://btech.com/eg-en/samsung-galaxy-s24-ultra.html',
    last_price: '34500',
    in_stock: true,
    last_scraped_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    price_history: [{ price: '35100' }, { price: '34500' }],
  },
  {
    id: 'prod-3',
    title: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
    store: 'Carrefour Egypt',
    original_url: 'https://carrefouregypt.com/sony-wh1000xm5',
    last_price: '8999',
    in_stock: false,
    last_scraped_at: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
    price_history: [{ price: '9500' }, { price: '9299' }],
  },
];

export const MOCK_TRACKED_ITEMS = MOCK_PRODUCTS.map((product) => ({
  id: `track-${product.id}`,
  product,
}));

export function generatePriceHistory(productId: string) {
  const basePrice = productId === 'prod-1' ? 49999 : productId === 'prod-2' ? 34500 : 8999;
  const days = 30;
  const history = [];

  for (let i = days; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const variation = (Math.random() - 0.5) * 0.08 * basePrice;
    history.push({
      scraped_at: date.toISOString(),
      price: Math.round(basePrice + variation),
      in_stock: Math.random() > 0.1,
    });
  }

  return history;
}

export const MOCK_ALERT_RULES: Array<{
  id: string;
  tracked_item_id: string;
  type: 'PERCENTAGE_DROP' | 'TARGET_PRICE';
  threshold: number;
  last_fired_at: string | null;
}> = [
  {
    id: 'rule-1',
    tracked_item_id: 'track-prod-1',
    type: 'PERCENTAGE_DROP',
    threshold: 10,
    last_fired_at: null,
  },
  {
    id: 'rule-2',
    tracked_item_id: 'track-prod-1',
    type: 'TARGET_PRICE',
    threshold: 45000,
    last_fired_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
