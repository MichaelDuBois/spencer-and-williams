'use client'

import { createContext, useContext } from 'react'

import type { ProductRecommendModel } from '@/hooks/useRecommend'

export const RecommendModelContext = createContext<
  ProductRecommendModel | undefined
>(undefined)

export const useRecommendModel = () => useContext(RecommendModelContext)
