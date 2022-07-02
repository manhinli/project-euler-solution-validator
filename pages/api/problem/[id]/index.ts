import type { NextApiRequest, NextApiResponse } from "next";
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
                const problems = getCollection<ProblemMetadata>("problems");

                // Get all available problem information from database
                const requestedProblem = await problems.findOne({
                    problemId,
                });

                // If requested problem does not exist, return 404 Not Found
                if (requestedProblem === null) {
                    return res.status(404).send(null);
                }

                return res.status(200).send(requestedProblem);
            } catch (e) {
                // TODO: Consolidate error handling and pass validation errors
                // to client
                return res.status(400).send({});
            }
        }

        default: {
            // TODO: Return unsupported method error
        }
    }
}
