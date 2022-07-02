import type { NextApiRequest, NextApiResponse } from "next";
import { parseProblemId } from "../../../../lib/parsers";

/**
 * Handler for GET requests to `/api/problem/{id}/leaderboard`.
 *
 * @param req Request data
 * @param res Response data
 */
export default function ApiProblemIdLeaderboard(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // Handle only GET requests
    switch (req.method) {
        // Generate leaderboard for given problem
        case "GET": {
            try {
                const problemId = parseProblemId(req.query.id);

                // TODO: Get problem leaderboard via query from database

                return res.status(200).send({
                    problemId,
                });
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
