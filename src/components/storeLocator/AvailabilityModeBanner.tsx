import Link from 'next/link'

interface AvailabilityModeBannerProps {
  productName: string | undefined
  backHref: string
  nounPlural?: string
}

export const AvailabilityModeBanner = ({
  productName,
  backHref,
  nounPlural = 'stores',
}: AvailabilityModeBannerProps) => (
  <div className="border-border bg-muted/40 flex flex-col gap-1 border-b px-4 py-3">
    <span className="text-foreground line-clamp-2 text-sm">
      Showing {nounPlural} carrying <strong>{productName}</strong>
    </span>
    <Link
      href={backHref}
      className="text-muted-foreground hover:text-foreground text-xs tracking-widest uppercase transition-colors">
      Back to all {nounPlural}
    </Link>
  </div>
)
