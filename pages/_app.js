import '../styles/globals.css';
import Link from 'next/link';

function MyApp({ Component, pageProps }) {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="bg-slate-800 text-white py-4 shadow-md">
        <div className="max-w-5xl mx-auto flex justify-between items-center px-4">
          <h1 className="text-xl font-semibold">James Boggs</h1>
          <nav className="space-x-4">
            <Link href="/" className="hover:text-sky-400">Home</Link>
            <Link href="/pricing-tier" className="hover:text-sky-400">Pricing</Link>
            <Link href="/monte-carlo" className="hover:text-sky-400">Monte Carlo</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        <Component {...pageProps} />
      </main>
    </div>
  );
}

export default MyApp;
