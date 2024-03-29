import type { NextApiRequest, NextApiResponse } from "next";
import {
    respondMethodNotAllowed,
    respondSuccessWithJson,
} from "../../../lib/api";
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
            const problems = await getCollection<ProblemMetadata>("problems");

            // Get all available problem information from database
            const allProblems = await problems
                .find({}, { projection: { _id: 0 } })
                .sort("problemId", "ascending")
                .toArray();

            return respondSuccessWithJson(res, allProblems);
        }

        default: {
            return respondMethodNotAllowed(res);
        }
    }
}
