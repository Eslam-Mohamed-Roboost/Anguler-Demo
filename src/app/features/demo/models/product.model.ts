// Product domain model — designed to demonstrate every form feature
export interface Product {
  id: number;
  name: string;
  description: string;
  sku: string;
  price: number;
  quantity: number;
  contactEmail: string;
  isActive: boolean;
  discount: number;
  promoCode: string;
  category: string;
}

export const PRODUCT_CATEGORIES = [
  'Electronics',
  'Clothing',
  'Food',
  'Books',
  'Other',
] as const;
