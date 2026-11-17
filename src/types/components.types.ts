export type Variant = 'standard' | 'editorial'

export interface FacetComponentProps {
  title: string
  attribute: string | readonly string[]
  prefix?: string
  defaultOpen?: boolean
  variant?: Variant
}
