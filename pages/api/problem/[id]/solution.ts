import type { NextApiRequest, NextApiResponse } from "next";
import { join } from "path";
import { z } from "zod";
import {
    respondClientError,
    respondMethodNotAllowed,
    respondSuccessWithJson,
} from "../../../../lib/api";
import { getCollection } from "../../../../lib/database";
import { getEnv } from "../../../../lib/env";
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

const PROBLEMS_COMPILED_PATH = getEnv("PROBLEMS_COMPILED_PATH");

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
                    PROBLEMS_COMPILED_PATH,
                    `${requestedProblem.problemId}.js`
                );

                // NOTE: Dynamic imports require the `webpackIgnore` declaration
                // or Webpack will mangle the import path
                const { validateSolution } = await import(
                    /* webpackIgnore: true */ modulePath
                );

                // Run solution value validation against problem
                //
                // NOTE: We pass strings in not numbers as some problems have
                // complex answers that are not able to be dealt with as numbers
                //
                // May need to consider async validation in separate
                // thread/worker
                const attemptValue = solutionValue.trim();
                const validationResult = await validateSolution(attemptValue);

                // Record submission into database
                const attempts = getCollection<Attempt>("attempts");
                const { insertedId } = await attempts.insertOne({
                    problemId: requestedProblem.problemId,
                    userName,
                    dateTime: requestDateTime,
                    attemptValue,
                    attemptSuccessful: validationResult,
                });

                // Fetch record
                const successfulAttempt = await attempts.findOne(
                    { _id: insertedId },
                    { projection: { _id: 0 } }
                );

                return respondSuccessWithJson(res, successfulAttempt!);
            } catch (e) {
                return respondClientError(res, undefined, e);
            }
        }

        default: {
            return respondMethodNotAllowed(res);
        }
    }
}
