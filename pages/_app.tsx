import "../styles/globals.css";
import type { AppProps } from "next/app";
import { SWRConfig } from "swr";

const DEFAULT_SWR_CONFIG = {
    // Default fetcher executes GETs and returns JSON encoded data as objects
    fetcher: (url: string) => fetch(url).then((res) => res.json()),
};

function AireTCApp({ Component, pageProps }: AppProps) {
    return (
        <SWRConfig value={DEFAULT_SWR_CONFIG}>
            <Component {...pageProps} />
        </SWRConfig>
    );
}

export default AireTCApp;
