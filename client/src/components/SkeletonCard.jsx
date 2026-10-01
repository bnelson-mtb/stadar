// Loading placeholder in the shape of an EventRow.
export default function SkeletonCard() {
  return (
    <div className="shimmer flex items-center gap-3 rounded-[14px] border border-white/5 bg-night-900 p-3.5">
      <div className="flex w-11 flex-none flex-col items-center gap-1.5">
        <div className="h-3 w-8 rounded bg-white/[.06]" />
        <div className="h-2 w-7 rounded bg-white/[.04]" />
      </div>
      <div className="w-px self-stretch bg-white/[.07]" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-[22px] w-[22px] rounded-full bg-white/[.06]" />
          <div className="h-3.5 w-24 rounded bg-white/[.06]" />
          <div className="h-3 w-16 rounded bg-white/[.04]" />
        </div>
        <div className="h-2.5 w-36 rounded bg-white/[.04]" />
      </div>
    </div>
  )
}

// Loading placeholder for the Discover "next up" hero.
export function SkeletonHero() {
  return (
    <div className="shimmer h-[216px] rounded-[18px] border border-white/5 bg-night-900 p-[18px]">
      <div className="h-3 w-32 rounded bg-white/[.06]" />
      <div className="mt-5 flex items-center gap-3.5">
        <div className="h-14 w-14 rounded-full bg-white/[.06]" />
        <div className="space-y-2">
          <div className="h-6 w-28 rounded bg-white/[.06]" />
          <div className="h-6 w-36 rounded bg-white/[.04]" />
        </div>
      </div>
      <div className="mt-6 h-9 w-40 rounded bg-white/[.05]" />
    </div>
  )
}
