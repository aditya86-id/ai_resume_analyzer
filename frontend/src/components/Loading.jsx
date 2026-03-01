export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"/>
    </div>
  );
}

export function LoadingBar() {
  return (
    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
      <div className="h-full bg-primary-600 animate-pulse"/>
    </div>
  );
}
