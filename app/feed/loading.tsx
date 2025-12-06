export default function FeedLoading() {
  return (
    <div
      className="min-h-screen max-w-[480px] mx-auto pb-12 animate-pulse"
      style={{ backgroundColor: '#FAF8F5' }}
    >
      {/* Header Skeleton */}
      <header className="sticky top-0 z-10 flex justify-between items-center px-5 py-4 border-b border-[#E8E5E0] bg-[#FAF8F5]">
        <div className="h-6 w-16 bg-[#E8E5E0] rounded" />
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#E8E5E0] rounded-lg" />
          <div className="w-8 h-8 rounded-full bg-[#E8E5E0]" />
        </div>
      </header>

      {/* Input Bar Skeleton */}
      <div className="mx-5 my-4 h-12 bg-[#E8E5E0] rounded-xl" />

      {/* Collection Header Skeleton */}
      <div className="px-5 py-2">
        <div className="h-4 w-28 bg-[#E8E5E0] rounded mb-5" />

        {/* Artifact Cards Skeleton */}
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#F7F5F1] rounded-xl overflow-hidden border border-[#E8E5E0]">
              {/* Image skeleton */}
              <div className="aspect-[4/3] bg-[#E8E5E0]" />
              {/* Content skeleton */}
              <div className="p-4 pb-[18px]">
                <div className="h-5 w-3/4 bg-[#E8E5E0] rounded mb-2" />
                <div className="h-3 w-1/2 bg-[#E8E5E0] rounded mb-3" />
                <div className="h-4 w-full bg-[#E8E5E0] rounded mb-1" />
                <div className="h-4 w-2/3 bg-[#E8E5E0] rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


