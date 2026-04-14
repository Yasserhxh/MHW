export type CategoryType = 'expense' | 'income';

export interface CategoryPayload {
  name: string;
  type: CategoryType;
  color: string;
  icon: string;
}

export interface CategoryView extends CategoryPayload {
  id: string;
  isDefault: boolean;
  usageCount: number;
  totalAmount: number;
}
