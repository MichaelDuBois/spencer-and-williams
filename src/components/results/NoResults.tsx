import { SearchX } from 'lucide-react'

interface NoResultsProps {
  message?: string
}

export const NoResults = ({ message = 'No results found' }: NoResultsProps) => (
  <div className="text-muted-foreground flex flex-col items-center gap-2 py-10">
    <SearchX className="h-8 w-8 opacity-40" />
    <p className="text-sm">{message}</p>
  </div>
)
