import type { AppProps } from "next/app";
import { useState } from "react";
import { SWRConfig } from "swr";
import { UsernameContext } from "../lib/contexts";
import "../styles/globals.css";

const DEFAULT_SWR_CONFIG = {
    // Default fetcher executes GETs and returns JSON encoded data as objects
    fetcher: (url: string) =>
        fetch(url).then((res) => {
            if (res.status !== 200) {
                throw new Error("Request failed");
            }

            return res.json();
        }),
};

function ProjEulerApp({ Component, pageProps }: AppProps) {
    // User's name is held at the top of the app like a state store
    const [username, setUsername] = useState("");

    return (
        // Set up SWR default configuration, and the username context that holds
        // the user's name throughout the app
        <SWRConfig value={DEFAULT_SWR_CONFIG}>
            <UsernameContext.Provider
                value={{ value: username, onChange: setUsername }}
            >
                <Component {...pageProps} />
            </UsernameContext.Provider>
        </SWRConfig>
    );
}

export default ProjEulerApp;
