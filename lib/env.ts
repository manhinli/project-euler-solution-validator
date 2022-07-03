export const ENVIRONMENT_VARIABLES = [
    "DATABASE_URI",
    "DATABASE_NAME",
    "PROBLEMS_COMPILED_PATH",
] as const;

export function getEnv(variable: typeof ENVIRONMENT_VARIABLES[number]) {
    const value = process.env[variable];

    if (!value) {
        throw new Error(`${variable} not defined`);
    }

    return value;
}
