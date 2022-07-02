import { z } from "zod";

/**
 * Parses a value that is intended to be a problem ID.
 *
 * @param id Value to be parsed as problem ID
 * @returns {number} Problem ID value
 */
export function parseProblemId(id: any): number {
    const schema = z
        .number()
        .int("Problem ID must be integer")
        .positive("Problem ID must be positive integer");

    return (
        z
            // Apply value transforms before testing against schema
            .preprocess((value) => {
                // If already number, continue
                if (typeof value === "number") {
                    return value;
                }

                // If string, parse as number
                if (typeof value === "string") {
                    return Number.parseFloat(value);
                }

                // Otherwise ignore value
                return undefined;
            }, schema)
            // Parse value
            .parse(id)
    );
}
