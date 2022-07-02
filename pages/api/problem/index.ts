import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Handler for GET requests to `/api/problem`.
 *
 * @param req Request data
 * @param res Response data
 */
export default function ApiProblemIndex(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // Handle only GET requests
    switch (req.method) {
        // Return all problems
        case "GET": {
            // TODO: Get all available problem information from database
            return res.status(200).send({});
        }

        default: {
            // TODO: Return unsupported method error
        }
    }
}
