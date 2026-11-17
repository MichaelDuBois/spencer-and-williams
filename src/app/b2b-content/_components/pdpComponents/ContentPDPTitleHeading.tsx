interface ContentPDPTitleHeadingProps {
  children: React.ReactNode
}

export const ContentPDPTitleHeading = ({
  children,
}: ContentPDPTitleHeadingProps) => (
  <p className="text-muted-foreground mb-3 text-sm font-medium tracking-wider uppercase">
    {children}
  </p>
)
