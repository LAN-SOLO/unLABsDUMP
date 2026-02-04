export interface ReportTemplate {
  id: string
  name: string
  description: string
  category: 'sales' | 'inventory' | 'burn' | 'delivery' | 'admin'
  fields: string[]
}

export const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'sales_summary',
    name: 'Sales Summary',
    description: 'Overview of package sales, revenue, and trends',
    category: 'sales',
    fields: ['date_range', 'total_sales', 'total_revenue', 'top_packages', 'daily_breakdown'],
  },
  {
    id: 'sales_by_package',
    name: 'Sales by Package',
    description: 'Detailed breakdown of sales per package',
    category: 'sales',
    fields: ['package_name', 'total_sold', 'revenue', 'currency_breakdown'],
  },
  {
    id: 'inventory_status',
    name: 'Inventory Status',
    description: 'Current inventory levels across all packages',
    category: 'inventory',
    fields: ['package_name', 'total_nfts', 'available', 'reserved', 'sold'],
  },
  {
    id: 'nft_status',
    name: 'NFT Status Report',
    description: 'Status distribution and metadata analysis of all NFTs',
    category: 'inventory',
    fields: ['status_breakdown', 'tier_distribution', 'color_distribution', 'collection_summary'],
  },
  {
    id: 'burn_report',
    name: 'Burn Activity Report',
    description: 'Summary of _unSC token burn events',
    category: 'burn',
    fields: ['total_burned', 'period_burned', 'unique_burners', 'daily_burns', 'top_burners'],
  },
  {
    id: 'delivery_report',
    name: 'Delivery Performance',
    description: 'Delivery status, processing times, and completion rates',
    category: 'delivery',
    fields: ['status_breakdown', 'avg_processing_time', 'completion_rate', 'daily_deliveries'],
  },
  {
    id: 'admin_activity',
    name: 'Admin Activity Report',
    description: 'Summary of admin actions and audit trail',
    category: 'admin',
    fields: ['actions_by_admin', 'action_type_breakdown', 'daily_activity', 'top_admins'],
  },
]

export function getTemplate(templateId: string): ReportTemplate | undefined {
  return REPORT_TEMPLATES.find((t) => t.id === templateId)
}

export function getTemplatesByCategory(category: string): ReportTemplate[] {
  return REPORT_TEMPLATES.filter((t) => t.category === category)
}
