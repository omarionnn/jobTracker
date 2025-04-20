import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Job Application Tracker</h1>
      <div className="flex flex-col space-y-4">
        <Link 
          href="/login" 
          className="bg-primary text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
        >
          Login
        </Link>
        <Link 
          href="/register" 
          className="bg-secondary text-white px-6 py-3 rounded-md hover:bg-slate-800 transition-colors"
        >
          Register
        </Link>
      </div>
    </main>
  );
}
