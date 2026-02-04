export type NotificationType =
  | 'delivery_complete'
  | 'trade_sold'
  | 'trade_offer'
  | 'purchase_confirmed'
  | 'price_drop'
  | 'new_nft_available'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  created_at: string
  data?: Record<string, unknown>
}

export interface NotificationFilters {
  unreadOnly?: boolean
  type?: NotificationType
  limit?: number
  offset?: number
}

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  delivery_complete: 'Delivery Complete',
  trade_sold: 'Trade Sold',
  trade_offer: 'Trade Offer',
  purchase_confirmed: 'Purchase Confirmed',
  price_drop: 'Price Drop',
  new_nft_available: 'New NFT Available',
}
