import React from 'react';
import { useRouteError, isRouteErrorResponse, Link } from 'react-router';
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react';

export default function ErrorPage() {
  const error = useRouteError();

  let title = 'Something went wrong';
  let message = 'An unexpected error occurred while loading this page.';
  let statusCode = 'Error';

  if (isRouteErrorResponse(error)) {
    statusCode = error.status;
    if (error.status === 404) {
      title = 'Page Not Found';
      message = "The screen or page you're looking for doesn't exist or has been moved.";
    } else if (error.status === 403) {
      title = 'Access Denied';
      message = 'You do not have permission to view this resource.';
    } else {
      message = error.statusText || message;
    }
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans text-slate-900">
      <div className="w-16 h-16 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-center text-rose-600 mb-4 shadow-sm">
        <AlertTriangle className="w-8 h-8" />
      </div>

      <span className="text-xs font-extrabold uppercase tracking-widest text-rose-600 mb-1">
        {statusCode}
      </span>
      <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mb-2">
        {title}
      </h1>
      <p className="text-slate-500 text-sm max-w-md mb-8">
        {message}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => window.history.back()}
          className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>
        <Link
          to="/"
          className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-rose-600/25 flex items-center gap-2"
        >
          <Home className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}