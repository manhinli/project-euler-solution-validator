import type { NextApiRequest, NextApiResponse } from "next";
import { parseProblemId } from "../../../../lib/parsers";

/**
 * Handler for GET requests to `/api/problem/{id}`.
 *
 * @param req Request data
 * @param res Response data
 */
export default function ApiProblemIdIndex(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // Handle only GET requests
    switch (req.method) {
        // Return problem information for given problem
        case "GET": {
            try {
                const problemId = parseProblemId(req.query.id);

                // TODO: Get problem information from database

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
