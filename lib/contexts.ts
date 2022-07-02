import React, { Dispatch, SetStateAction } from "react";

export const UsernameContext = React.createContext<{
    value: string;
    onChange: Dispatch<SetStateAction<string>>;
}>({
    value: "",
    onChange: () => {},
});
