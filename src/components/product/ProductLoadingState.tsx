export const ProductLoadingState = () => (
  <div className="container mx-auto px-6 py-8">
    <div className="animate-pulse">
      <div className="bg-muted mb-2 h-4 w-32 rounded" />
      <div className="bg-muted mb-6 h-3 w-56 rounded" />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div className="bg-muted rounded-card aspect-square" />

        <div className="space-y-5">
          <div className="bg-muted h-3 w-20 rounded" />
          <div className="bg-muted h-7 w-3/4 rounded" />
          <div className="bg-muted h-4 w-28 rounded" />
          <div className="bg-muted h-8 w-24 rounded" />
          <div className="bg-muted rounded-button h-12 w-full" />
          <div className="space-y-3 pt-4">
            <div className="bg-muted h-4 w-full rounded" />
            <div className="bg-muted h-4 w-11/12 rounded" />
            <div className="bg-muted h-4 w-9/12 rounded" />
          </div>
        </div>
      </div>
    </div>
  </div>
)
