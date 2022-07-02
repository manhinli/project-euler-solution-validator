import "../styles/globals.css";
import type { AppProps } from "next/app";

function AireTCApp({ Component, pageProps }: AppProps) {
    return <Component {...pageProps} />;
}

export default AireTCApp;
