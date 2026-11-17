export const PdpLoadingState = () => (
  <div className="mx-auto max-w-5xl px-6 py-12 md:py-16">
    <div className="animate-pulse space-y-6">
      <div className="bg-muted h-3 w-56 rounded" />
      <div className="bg-muted h-4 w-40 rounded" />
      <div className="bg-muted h-10 w-full max-w-2xl rounded-2xl" />
      <div className="flex gap-2">
        <div className="bg-muted h-6 w-16 rounded-full" />
        <div className="bg-muted h-6 w-20 rounded-full" />
        <div className="bg-muted h-6 w-14 rounded-full" />
      </div>
      <div className="space-y-3 pt-2">
        <div className="bg-muted h-4 w-full rounded" />
        <div className="bg-muted h-4 w-11/12 rounded" />
        <div className="bg-muted h-4 w-10/12 rounded" />
      </div>
      <div className="bg-muted h-48 w-full rounded-2xl" />
    </div>
  </div>
)
