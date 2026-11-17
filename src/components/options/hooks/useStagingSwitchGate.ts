'use client'

import { useCallback, useState } from 'react'

import { useAlgoliaEnvironment } from '@/hooks/useAlgoliaEnvironment'

interface StagingSwitchGateOptions {
  onNoticeOpenChange?: (isOpen: boolean) => void
}

interface StagingSwitchGate {
  isNoticeOpen: boolean
  requestChange: (checked: boolean) => void
  confirm: () => void
  cancel: () => void
  reopen: () => void
}

export const useStagingSwitchGate = ({
  onNoticeOpenChange,
}: StagingSwitchGateOptions = {}): StagingSwitchGate => {
  const {
    setEnvironment,
    hasAcknowledgedStagingNotice,
    acknowledgeStagingNotice,
  } = useAlgoliaEnvironment()
  const [isNoticeOpen, setIsNoticeOpen] = useState(false)

  const setNoticeOpen = useCallback(
    (isOpen: boolean) => {
      setIsNoticeOpen(isOpen)
      onNoticeOpenChange?.(isOpen)
    },
    [onNoticeOpenChange],
  )

  const requestChange = useCallback(
    (checked: boolean) => {
      // Only enabling staging is gated; turning it off is always safe.
      if (!checked) {
        setEnvironment('production')
        return
      }
      if (hasAcknowledgedStagingNotice) {
        setEnvironment('staging')
        return
      }
      setNoticeOpen(true)
    },
    [hasAcknowledgedStagingNotice, setEnvironment, setNoticeOpen],
  )

  const confirm = useCallback(() => {
    acknowledgeStagingNotice()
    setEnvironment('staging')
    setNoticeOpen(false)
  }, [acknowledgeStagingNotice, setEnvironment, setNoticeOpen])

  const cancel = useCallback(() => setNoticeOpen(false), [setNoticeOpen])

  const reopen = useCallback(() => setNoticeOpen(true), [setNoticeOpen])

  return { isNoticeOpen, requestChange, confirm, cancel, reopen }
}
