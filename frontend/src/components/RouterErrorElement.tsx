const RouteErrorElement = () => {
  const error = (window as any).__routerError || 'Unknown error';
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 shadow-2xl text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Oops! Something went wrong</h1>
        <p className="text-white/70 mb-4">
          We encountered an error while loading this page.
        </p>
        
        {/* Debug information - remove in production */}
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-6 text-left">
          <p className="text-red-200 text-xs font-mono">
            Debug Info: {JSON.stringify(error, null, 2)}
          </p>
          <p className="text-red-200 text-xs mt-2">
            Current URL: {window.location.href}
          </p>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
          >
            Go Home
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gray-600 text-white py-2 rounded-xl font-semibold hover:bg-gray-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  );
};
export default RouteErrorElement;