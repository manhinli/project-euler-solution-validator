import type { NextApiRequest, NextApiResponse } from "next";
import { getCollection } from "../../../../lib/database";
import { parseProblemId } from "../../../../lib/parsers";
import { Attempt } from "../../../../types/Attempt";
import { ProblemMetadata } from "../../../../types/Problem";

/**
 * Handler for GET requests to `/api/problem/{id}/leaderboard`.
 *
 * @param req Request data
 * @param res Response data
 */
export default async function ApiProblemIdLeaderboard(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // Handle only GET requests
    switch (req.method) {
        // Generate leaderboard for given problem
        case "GET": {
            try {
                const problemId = parseProblemId(req.query.id);

                // Check problem registered in database
                const problems = getCollection<ProblemMetadata>("problems");
                const requestedProblem = await problems.findOne({ problemId });

                // If requested problem does not exist, return 404 Not Found
                if (requestedProblem === null) {
                    return res.status(404).send(null);
                }

                // Get problem leaderboard via query from database
                const attempts = getCollection<Attempt>("attempts");

                const query = attempts.aggregate([
                    // Get attempts against this problem
                    { $match: { problemId: requestedProblem.problemId } },

                    // Sort information by attempt date, ascending
                    { $sort: { dateTime: 1 } },

                    // Run query against each user's first successful attempt
                    // and
                    {
                        $facet: {
                            usersWithSuccessfulAttempt: [
                                { $match: { attemptSuccessful: true } },
                                {
                                    $group: {
                                        _id: "$userName",
                                        earliestSuccessfulAttempt: {
                                            $first: "$dateTime",
                                        },
                                    },
                                },
                            ],
                            userAttemptCounts: [
                                {
                                    $group: {
                                        _id: "$userName",
                                        numberOfAttempts: { $sum: 1 },
                                    },
                                },
                            ],
                        },
                    },

                    // Gather the information from the above facet together
                    {
                        $project: {
                            _all: {
                                $concatArrays: [
                                    "$usersWithSuccessfulAttempt",
                                    "$userAttemptCounts",
                                ],
                            },
                        },
                    },
                    {
                        $unwind: "$_all",
                    },
                    {
                        $group: {
                            _id: "$_all._id",
                            _data: { $push: "$_all" },
                        },
                    },

                    // Fold fields into the same document
                    {
                        $replaceRoot: {
                            newRoot: {
                                $mergeObjects: {
                                    $concatArrays: ["$_data", ["$$ROOT"]],
                                },
                            },
                        },
                    },

                    // Remove unsuccessful attempts
                    {
                        $match: {
                            earliestSuccessfulAttempt: { $ne: null },
                        },
                    },

                    // Clean up result
                    {
                        $project: {
                            userName: "$_id",
                            earliestSuccessfulAttempt: 1,
                            numberOfAttempts: 1,
                        },
                    },
                    {
                        $unset: "_id",
                    },

                    // Sort by earliest attempt and number of attempts, both
                    // ascending
                    {
                        $sort: {
                            earliestSuccessfulAttempt: 1,
                            numberOfAttempts: 1,
                        },
                    },
                ]);

                const result = await query.toArray();

                return res.status(200).send(result);
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
