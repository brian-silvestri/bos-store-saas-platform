import { Promotion } from '../models/promotion.model'

export const PROMOTIONS_MOCK: Promotion[] = [
  {
    id: 'promo-1',
    name: '2x1 Empanadas',
    type: 'nxm',
    productIds: ['1', '2', '5'],
    description: 'Llevas 2 y pagas 1 en empanadas seleccionadas.',
    imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=900&q=80',
    buyQty: 2,
    payQty: 1,
    active: true,
  },
  {
    id: 'promo-2',
    name: '30% en Pizzas',
    type: 'discount',
    productIds: ['3', '6'],
    description: 'Descuento especial en pizzas seleccionadas.',
    imageUrl: 'https://images.unsplash.com/photo-1548365328-9f547107e9ec?auto=format&fit=crop&w=900&q=80',
    percentage: 30,
    active: true,
  },
]
