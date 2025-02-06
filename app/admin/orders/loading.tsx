export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse">
        <div className="h-8 w-48 bg-gray-200"></div>
        <div className="mt-8 space-y-4">
          <div className="h-12 rounded bg-gray-200"></div>
          <div className="h-12 rounded bg-gray-200"></div>
          <div className="h-12 rounded bg-gray-200"></div>
        </div>
      </div>
    </div>
  );
}
