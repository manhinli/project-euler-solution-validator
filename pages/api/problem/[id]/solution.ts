import type { NextApiRequest, NextApiResponse } from "next";
import { join } from "path";
import { z } from "zod";
import { getCollection } from "../../../../lib/database";
import { parseProblemId } from "../../../../lib/parsers";
import { Attempt } from "../../../../types/Attempt";
import { ProblemMetadata } from "../../../../types/Problem";

const PostRequestBodySchema = z.object({
    userName: z
        .string()
        .min(3, { message: "User name must be at least 3 characters long" }),
    solutionValue: z
        .string()
        .min(1, { message: "Solution value must be a non-empty string" }),
});

const PROBLEM_VALIDATOR_DIR = "/app/dist/problems";

/**
 * Handler for POST requests to `/api/problem/{id}/solution`.
 *
 * @param req Request data
 * @param res Response data
 */
export default async function ApiProblemIdSolution(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // Handle only POST requests
    switch (req.method) {
        // Capture solution submissions from user for given problem
        case "POST": {
            try {
                const problemId = parseProblemId(req.query.id);
                const { userName, solutionValue } = PostRequestBodySchema.parse(
                    req.body
                );

                // Check if user has already submitted successful solution
                const attempts = getCollection<Attempt>("attempts");
                const previousSuccessfulAttempts =
                    await attempts.countDocuments({
                        problemId,
                        userName,
                        attemptSuccessful: true,
                    });

                // If already successful, return 200 immediately
                if (previousSuccessfulAttempts > 0) {
                    return res.status(200).send(null);
                }

                // Capture the request date time now as we want to know the
                // _attempt_ time, not validation time
                const requestDateTime = new Date();

                // Check problem registered in database
                const problems = getCollection<ProblemMetadata>("problems");
                const requestedProblem = await problems.findOne({ problemId });

                // If requested problem does not exist, return 404 Not Found
                if (requestedProblem === null) {
                    return res.status(404).send(null);
                }

                // Get problem validator
                const modulePath = join(
                    PROBLEM_VALIDATOR_DIR,
                    `${requestedProblem.problemId}.js`
                );

                // FIXME: Currently encountering dynamic module import issues
                const { validateSolution } = await import(modulePath);

                // Run solution value validation against problem
                //
                // May need to consider async validation in separate
                // thread/worker
                const validationResult = validateSolution(solutionValue);

                // Record submission into database
                await attempts.insertOne({
                    problemId: requestedProblem.problemId,
                    userName,
                    dateTime: requestDateTime,
                    attemptValue: solutionValue,
                    attemptSuccessful: validationResult,
                });

                return res.status(200).send(null);
            } catch (e) {
                // TODO: Consolidate error handling and pass validation errors
                // to client
                return res.status(400).send({ error: e });
            }
        }

        default: {
            // TODO: Return unsupported method error
        }
    }
}
