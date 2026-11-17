'use client'

import { Package } from 'lucide-react'

import { Image } from '@/components/image/Image'
import type { OrderContextData } from '@/features/aiAssistant/types'

interface OrderContextCardProps {
  data: OrderContextData
}

export const OrderContextCard = ({ data }: OrderContextCardProps) => (
  <div className="bg-muted/50 border-border mb-2 rounded-lg border p-3">
    <div className="text-muted-foreground mb-2 flex items-center gap-2 text-xs font-medium">
      <Package className="h-3.5 w-3.5" />
      <span>Your order:</span>
    </div>

    <div className="scrollbar-slim flex gap-2 overflow-x-auto">
      {data.items.slice(0, 4).map((item) => (
        <div
          key={item.objectID}
          className="bg-background border-border flex w-16 shrink-0 flex-col items-center rounded-md border p-1.5">
          <div className="bg-muted relative mb-1 h-10 w-10 overflow-hidden rounded">
            <Image
              src={item.image}
              alt={item.name}
              fill
              sizes="40px"
              className="object-contain"
            />
          </div>
          <p className="text-micro w-full truncate text-center leading-tight">
            {item.name.split(' ').slice(0, 2).join(' ')}
          </p>
        </div>
      ))}
      {data.items.length > 4 && (
        <div className="bg-background border-border flex w-16 shrink-0 flex-col items-center justify-center rounded-md border p-1.5">
          <span className="text-muted-foreground text-xs">
            +{data.items.length - 4}
          </span>
        </div>
      )}
    </div>
  </div>
)
