import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Codemanager (with-electron)</title>
        <meta name="description" content="A Codebase Manager." />
      </Head>

      <Component {...pageProps} />
    </>
  );
}
