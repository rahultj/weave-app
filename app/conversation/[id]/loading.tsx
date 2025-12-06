export default function ConversationLoading() {
  return (
    <div
      className="min-h-screen max-w-[480px] mx-auto flex flex-col animate-pulse"
      style={{ backgroundColor: '#FAF8F5' }}
    >
      {/* Header Skeleton */}
      <header className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 border-b border-[#E8E5E0] bg-[#FAF8F5]">
        <div className="w-9 h-9 rounded-lg bg-[#E8E5E0]" />
        <div className="flex-1">
          <div className="h-4 w-32 bg-[#E8E5E0] rounded mb-1" />
          <div className="h-3 w-24 bg-[#E8E5E0] rounded" />
        </div>
        <div className="w-7 h-7 rounded-full bg-[#E8E5E0]" />
      </header>

      {/* Artifact Banner Skeleton */}
      <div className="mx-4 mt-4 p-3 rounded-lg border border-[#E8E5E0] bg-[#F7F5F1] flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[#E8E5E0]" />
        <div className="flex-1">
          <div className="h-3 w-28 bg-[#E8E5E0] rounded mb-1" />
          <div className="h-4 w-40 bg-[#E8E5E0] rounded" />
        </div>
      </div>

      {/* Messages Skeleton */}
      <div className="flex-1 px-4 py-5 space-y-4">
        {/* User message */}
        <div className="flex justify-end">
          <div className="w-48 h-12 bg-[#E8E5E0] rounded-[18px] rounded-br-[4px]" />
        </div>
        
        {/* Bobbin message */}
        <div className="flex justify-start gap-[10px]">
          <div className="w-7 h-7 rounded-full bg-[#E8E5E0] flex-shrink-0" />
          <div className="w-64 h-20 bg-[#E8E5E0] rounded-[18px] rounded-bl-[4px]" />
        </div>

        {/* User message */}
        <div className="flex justify-end">
          <div className="w-36 h-10 bg-[#E8E5E0] rounded-[18px] rounded-br-[4px]" />
        </div>

        {/* Bobbin message */}
        <div className="flex justify-start gap-[10px]">
          <div className="w-7 h-7 rounded-full bg-[#E8E5E0] flex-shrink-0" />
          <div className="w-56 h-16 bg-[#E8E5E0] rounded-[18px] rounded-bl-[4px]" />
        </div>
      </div>

      {/* Bottom Skeleton */}
      <div className="px-4 pb-6 pt-3 border-t border-[#E8E5E0] bg-[#FAF8F5]">
        <div className="h-12 bg-[#E8E5E0] rounded-xl" />
      </div>
    </div>
  )
}


