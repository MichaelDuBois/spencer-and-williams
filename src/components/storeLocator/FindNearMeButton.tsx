'use client'

import { LocateFixed } from 'lucide-react'

import { Button } from '@/components/ui/button/Button'
import { useUserLocation } from '@/hooks/useUserLocation'

export const FindNearMeButton = () => {
  const { requestLocation } = useUserLocation()

  return (
    <Button variant="outline" size="sm" onClick={requestLocation}>
      <LocateFixed />
      Find near me
    </Button>
  )
}
