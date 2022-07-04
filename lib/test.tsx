import "@testing-library/jest-dom";
import { SWRConfig } from "swr";

// Provide a fresh provider every time we use SWR
export const swrConfigWrapper = (
    children: any,
    config: React.ComponentProps<typeof SWRConfig>["value"] = {}
) => (
    <SWRConfig value={{ provider: () => new Map(), ...config }}>
        {children}
    </SWRConfig>
);

// Utility to deep clone objects
export const deepClone = (o: object) => JSON.parse(JSON.stringify(o));
