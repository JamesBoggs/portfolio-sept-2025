// components/SkeletonCard.js
export default function SkeletonCard() {
  return (
    <div className="circuit-frame rounded-2xl animate-pulse bg-black/10">
      <div className="circuit-inner rounded-2xl p-4">
        <div className="h-5 w-32 bg-gray-700/40 rounded mb-3" />
        <div className="h-3 w-16 bg-gray-700/30 rounded mb-5" />
        <div className="h-[200px] w-full bg-gray-700/20 rounded-md mb-3" />
        <div className="space-y-1">
          <div className="h-3 w-3/4 bg-gray-700/20 rounded" />
          <div className="h-3 w-1/2 bg-gray-700/10 rounded" />
        </div>
      </div>
    </div>
  );
}
