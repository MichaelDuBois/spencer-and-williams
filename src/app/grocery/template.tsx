'use client'

import { ViewTransition } from 'react'

const Template = ({ children }: { children: React.ReactNode }) => (
  <ViewTransition enter="grocery-page-enter" exit="grocery-page-exit">
    {children}
  </ViewTransition>
)

export default Template
