'use client'

import { useAtom } from 'jotai'

import { PageTransitionTemplate } from '@/components/layout/PageTransitionTemplate'
import { isFromHomePageAtom } from '@/stores/travel'

const Template = ({ children }: { children: React.ReactNode }) => {
  const [isFromHomePage, setIsFromHomePage] = useAtom(isFromHomePageAtom)

  return (
    <PageTransitionTemplate
      isFromHomePage={isFromHomePage}
      onAnimationComplete={() => setIsFromHomePage(false)}>
      {children}
    </PageTransitionTemplate>
  )
}

export default Template
