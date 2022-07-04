import type { NextApiRequest, NextApiResponse } from "next";
import {
    respondClientError,
    respondMethodNotAllowed,
    respondNotFound,
    respondSuccessWithJson,
} from "../../../../lib/api";
import { getCollection } from "../../../../lib/database";
import { parseProblemId } from "../../../../lib/parsers";
import { ProblemMetadata } from "../../../../types/Problem";

/**
 * Handler for GET requests to `/api/problem/{id}`.
 *
 * @param req Request data
 * @param res Response data
 */
export default async function ApiProblemIdIndex(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // Handle only GET requests
    switch (req.method) {
        // Return problem information for given problem
        case "GET": {
            try {
                const problemId = parseProblemId(req.query.id);

                // Get problem information from database
                const problems = await getCollection<ProblemMetadata>("problems");

                // Get all available problem information from database
                const requestedProblem = await problems.findOne(
                    { problemId },
                    { projection: { _id: 0 } }
                );

                // If requested problem does not exist, return 404 Not Found
                if (requestedProblem === null) {
                    return respondNotFound(res);
                }

                return respondSuccessWithJson(res, requestedProblem);
            } catch (e) {
                return respondClientError(res, undefined, e);
            }
        }

        default: {
            return respondMethodNotAllowed(res);
        }
    }
}
