import React, { Dispatch, SetStateAction } from "react";

/**
 * Context that holds the user's name for use across the app while the session
 * is active
 */
export const UsernameContext = React.createContext<{
    value: string;
    onChange: Dispatch<SetStateAction<string>>;
}>({
    value: "",
    onChange: () => {},
});
