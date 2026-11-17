import { BackToResults } from '@/components/BackToResults'

interface PdpNotFoundStateProps {
  title: string
  backHref: string
  backLabel: string
  eyebrow?: string
}

export const PdpNotFoundState = ({
  title,
  backHref,
  backLabel,
  eyebrow,
}: PdpNotFoundStateProps) => (
  <div className="mx-auto flex max-w-4xl flex-col items-center px-6 py-16 text-center">
    {eyebrow && (
      <p className="text-muted-foreground text-sm tracking-[0.25em] uppercase">
        {eyebrow}
      </p>
    )}
    <h1 className="text-foreground mt-4 text-3xl font-light tracking-tight">
      {title}
    </h1>
    <BackToResults fallbackHref={backHref} label={backLabel} className="mt-6" />
  </div>
)
