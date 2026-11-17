'use client'

import { useSetAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { travelConfig } from '@/app/travel/config'
import { useOpenAssistantPanel } from '@/features/aiAssistant'
import {
  isFromHeroAtom,
  isFromHomePageAtom,
  shouldFocusSearchAtom,
} from '@/stores/travel'

const basePath = `/${travelConfig.slug}`

export const useTravelHeroBanner = () => {
  const router = useRouter()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const setFocusSearch = useSetAtom(shouldFocusSearchAtom)
  const setIsFromHero = useSetAtom(isFromHeroAtom)
  const setIsFromHomePage = useSetAtom(isFromHomePageAtom)
  const { openWithMessage } = useOpenAssistantPanel({ basePath })

  const handleSearchClick = () => {
    setIsTransitioning(true)
    setFocusSearch(true)
    setIsFromHomePage(true)
    setIsFromHero(true)
    router.push(`${basePath}/search`)
  }

  const handleAIModeClick = () => {
    openWithMessage('', {
      expanded: true,
      navigate: false,
      clearHistory: false,
    })
  }

  return { isTransitioning, handleSearchClick, handleAIModeClick }
}
