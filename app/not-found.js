import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-extrabold text-primary mb-4">404</h1>
        <h2 className="text-2xl md:text-4xl font-bold mb-8">
          Oops! Page Not Found
        </h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved to another
          URL.
        </p>
        <Link
          href="/"
          className="inline-block bg-primary text-white px-6 py-3 rounded-md hover:bg-primary/90 transition-colors duration-200"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
