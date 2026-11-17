'use client'

import { usePathname } from 'next/navigation'

import {
  getChatWidgetMode,
  type ChatWidgetMode,
} from '@/features/chatWidget/utils/chatWidgetMode'

export const useChatWidgetMode = (basePath: string): ChatWidgetMode =>
  getChatWidgetMode(usePathname() ?? '', basePath)
