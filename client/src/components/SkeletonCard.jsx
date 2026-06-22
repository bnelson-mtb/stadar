export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 border-l-4 border-l-gray-200 animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Badge row */}
          <div className="flex items-center gap-2 mb-3">
            <div className="h-5 w-14 bg-gray-200 rounded-full" />
            <div className="h-4 w-10 bg-gray-100 rounded" />
          </div>
          {/* Home team row */}
          <div className="flex items-center gap-2 mb-1">
            <div className="h-8 w-8 bg-gray-200 rounded-full" />
            <div className="h-5 w-32 bg-gray-200 rounded" />
          </div>
          {/* Away team row */}
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-gray-100 rounded-full" />
            <div className="h-4 w-24 bg-gray-100 rounded" />
          </div>
          {/* Location row */}
          <div className="mt-3 flex items-center gap-3">
            <div className="h-4 w-36 bg-gray-100 rounded" />
            <div className="h-4 w-20 bg-gray-100 rounded" />
          </div>
        </div>
        {/* Date column */}
        <div className="text-right shrink-0 space-y-1">
          <div className="h-3 w-8 bg-gray-100 rounded ml-auto" />
          <div className="h-5 w-12 bg-gray-200 rounded ml-auto" />
          <div className="h-4 w-14 bg-gray-100 rounded ml-auto" />
        </div>
      </div>
    </div>
  )
}
