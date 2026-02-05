const RouteErrorElement = () => {
  const error = (window as any).__routerError || "Unknown error";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="max-w-md w-full bg-white rounded-xl p-8 shadow-lg border border-slate-200 text-center">
        <h1 className="text-2xl font-semibold text-slate-800 mb-3">
          Something went wrong
        </h1>

        <p className="text-slate-600 mb-6">
          We couldn’t load this page. Please try again or return to the homepage.
        </p>

        {/* Debug info – remove in production */}
        <div className="bg-slate-50 border border-slate-200 rounded-md p-3 mb-6 text-left">
          <p className="text-slate-500 text-xs font-mono whitespace-pre-wrap">
            {JSON.stringify(error, null, 2)}
          </p>
          <p className="text-slate-400 text-xs mt-2">
            URL: {window.location.href}
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => (window.location.href = "/")}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Go to Home
          </button>

          <button
            onClick={() => window.location.reload()}
            className="w-full bg-slate-200 text-slate-700 py-2.5 rounded-lg font-medium hover:bg-slate-300 transition"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  );
};

export default RouteErrorElement;
