import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { parseProblemId } from "../../../../lib/parsers";

const PostRequestBodySchema = z.object({
    problemId: z.number(),
    userName: z
        .string()
        .min(3, { message: "User name must be at least 3 characters long" }),
    solutionValue: z
        .string()
        .min(1, { message: "Solution value must be a non-empty string" }),
});

/**
 * Handler for POST requests to `/api/problem/{id}/solution`.
 *
 * @param req Request data
 * @param res Response data
 */
export default function ApiProblemIdSolution(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // Handle only POST requests
    switch (req.method) {
        // Capture solution submissions from user for given problem
        case "POST": {
            try {
                const problemId = parseProblemId(req.query.id);
                const body = PostRequestBodySchema.parse(req.body);

                // TODO: Run solution value validation against problem
                //
                // May need to consider async validation in separate
                // thread/worker

                // TODO: Record submission into database

                return res.status(200).send({
                    problemId,
                    body,
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
