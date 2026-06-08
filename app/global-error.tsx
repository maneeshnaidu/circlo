'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center font-sans">
        <h2 className="text-xl font-semibold">Something went wrong</h2>
        <p className="text-sm text-gray-500 max-w-sm">
          {process.env.NODE_ENV === 'development'
            ? error.message
            : 'An unexpected error occurred. Please try again.'}
        </p>
        <button
          onClick={reset}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700"
        >
          Try again
        </button>
      </body>
    </html>
  )
}
