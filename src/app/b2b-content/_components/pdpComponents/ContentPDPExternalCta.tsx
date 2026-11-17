import { ExternalLink } from 'lucide-react'

import { Button } from '@/components/ui/button/Button'

const ALGOLIA_BASE_URL = 'https://www.algolia.com'

const getExternalUrl = (url: string): string =>
  url.startsWith('https://') || url.startsWith('http://')
    ? url
    : `${ALGOLIA_BASE_URL}${url}`

interface ContentPDPExternalCtaProps {
  href: string | null | undefined
  children: React.ReactNode
}

export const ContentPDPExternalCta = ({
  href,
  children,
}: ContentPDPExternalCtaProps) => {
  if (!href) return null

  return (
    <div className="mt-10">
      <Button asChild size="lg">
        <a href={getExternalUrl(href)} target="_blank" rel="noreferrer">
          {children}
          <ExternalLink className="h-4 w-4" />
        </a>
      </Button>
    </div>
  )
}
