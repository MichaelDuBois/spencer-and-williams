'use client'

import { use } from 'react'

import { AffinitiesView } from '@/components/AffinitiesView'

const AffinitiesPage = ({ params }: { params: Promise<{ token: string }> }) => {
  const { token } = use(params)
  return <AffinitiesView token={token} />
}

export default AffinitiesPage
