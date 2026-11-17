import type { CustomerGroupProfile } from '@/types'

export const GROUP_0: CustomerGroupProfile = {
  type: 'customerGroup',
  id: 'customer-group-0',
  label: 'Customer Group 0',
  description: '15% group discount',
  token: 'customer-group-0',
  groupId: 'customer_group_0',
  discount: 0.15,
}

export const GROUP_1: CustomerGroupProfile = {
  ...GROUP_0,
  id: 'customer-group-1',
  label: 'Customer Group 1',
  description: '30% group discount',
  token: 'customer-group-1',
  groupId: 'customer_group_1',
  discount: 0.3,
}
