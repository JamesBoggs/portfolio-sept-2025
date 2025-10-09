import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <div className="min-h-screen bg-slate-900 text-gray-100">
      <main className="max-w-5xl mx-auto p-6">
        <Component {...pageProps} />
      </main>
    </div>
  );
}

export default MyApp;
