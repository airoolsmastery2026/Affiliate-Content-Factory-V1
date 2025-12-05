import Head from 'next/head';
import dynamic from 'next/dynamic';

// Dynamically import the main App component to ensure it runs only on the client
// This prevents hydration mismatches and allows the use of browser-specific APIs in child components if needed
const App = dynamic(() => import('../App'), { ssr: false });

export default function Home() {
  return (
    <>
      <Head>
        <title>Affiliate Content Factory</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <App />
    </>
  );
}