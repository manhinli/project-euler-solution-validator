import type { NextApiRequest, NextApiResponse } from "next";
import { getCollection } from "../../../lib/database";
import { ProblemMetadata } from "../../../types/Problem";

/**
 * Handler for GET requests to `/api/problem`.
 *
 * @param req Request data
 * @param res Response data
 */
export default async function ApiProblemIndex(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // Handle only GET requests
    switch (req.method) {
        // Return all problems
        case "GET": {
            const problems = getCollection<ProblemMetadata>("problems");

            // Get all available problem information from database
            const allProblems = await problems
                .find()
                .sort("problemId", "ascending")
                .toArray();

            return res.status(200).send(allProblems);
        }

        default: {
            // TODO: Return unsupported method error
        }
    }
}
