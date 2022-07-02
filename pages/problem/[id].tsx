import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import useSWR from "swr";
import { ProblemLeaderboardEntry, ProblemMetadata } from "../../types/Problem";

const ProblemId: NextPage = () => {
    const { query } = useRouter();
    const problemMetadata = useSWR<ProblemMetadata>(
        query.id ? `/api/problem/${query.id}` : null
    );
    const problemLeaderboard = useSWR<readonly ProblemLeaderboardEntry[]>(
        query.id ? `/api/problem/${query.id}/leaderboard` : null
    );

    return (
        <div>
            <Head>
                <title>
                    Project Euler Solution Validator -{" "}
                    {problemMetadata.data?.title}
                </title>
            </Head>

            <main>
                <h1>{problemMetadata.data?.title}</h1>
                <div
                    dangerouslySetInnerHTML={{
                        __html: problemMetadata.data?.description ?? "",
                    }}
                />
                <h3>Submit your solution</h3>
                <div>{/* TODO: Add content */}</div>
                <h3>Leaderboard</h3>
                <div>
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Submission time</th>
                                <th>Number of attempts</th>
                            </tr>
                        </thead>
                        <tbody>
                            {problemLeaderboard.data?.map(
                                ({
                                    userName,
                                    earliestSuccessfulAttempt,
                                    numberOfAttempts,
                                }) => (
                                    <tr key={userName}>
                                        <td>{userName}</td>
                                        <td>{earliestSuccessfulAttempt}</td>
                                        <td>{numberOfAttempts}</td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
};

export default ProblemId;
