'use client'

import { useAtomValue } from 'jotai'

import { activeConfigAtom } from '@/stores/activeConfig'
import type { VerticalConfig } from '@/types'

export const useActiveConfig = (): VerticalConfig | null =>
  useAtomValue(activeConfigAtom)
