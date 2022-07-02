import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import {
    ChangeEventHandler,
    FormEventHandler,
    useCallback,
    useContext,
} from "react";
import useSWR, { useSWRConfig } from "swr";
import useSWRImmutable from "swr/immutable";
import { UsernameContext } from "../../lib/contexts";
import { ProblemLeaderboardEntry, ProblemMetadata } from "../../types/Problem";

const ProblemId: NextPage = () => {
    // Problem ID is encoded in query parameters captured by the Next.js router
    const { query } = useRouter();
    const problemId = query.id;

    const { mutate } = useSWRConfig();

    const problemMetadata = useSWRImmutable<ProblemMetadata>(
        problemId ? `/api/problem/${problemId}` : null
    );
    const problemLeaderboard = useSWR<readonly ProblemLeaderboardEntry[]>(
        problemId ? `/api/problem/${problemId}/leaderboard` : null,
        // Update leaderboard every minute
        { refreshInterval: 60000 }
    );

    // Pull in user's name from shared context
    const { value: username, onChange: setUsername } =
        useContext(UsernameContext);

    const handleSolutionFormSubmit: FormEventHandler<HTMLFormElement> =
        useCallback(
            async (e) => {
                // Stop default form submission behaviour
                e.preventDefault();

                // Get input value
                const solutionInput = e.currentTarget.elements.namedItem(
                    "solution-input"
                ) as HTMLInputElement;

                const solutionValue = solutionInput.value;
                const requestBody = {
                    userName: username,
                    solutionValue,
                };

                // Send solution off to server
                const response = await fetch(
                    `/api/problem/${problemId}/solution`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(requestBody),
                    }
                );

                // TODO: Handle response
                if (response.status === 200) {
                    window.alert("Successfully received");
                } else {
                    window.alert("An error occurred");
                }

                // Trigger update of leaderboard
                mutate(`/api/problem/${problemId}/leaderboard`);
            },
            [username, problemId, mutate]
        );

    const handleUsernameInputChange: ChangeEventHandler<HTMLInputElement> =
        useCallback(
            (e) => {
                setUsername(e.currentTarget.value);
            },
            [setUsername]
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
                <p>
                    <a
                        href={problemMetadata.data?.url}
                        rel="noreferrer noopener"
                        target="_blank"
                    >
                        View this problem on Project Euler
                    </a>
                </p>
                <p>{problemMetadata.data?.license}</p>
                <h3>Submit your solution</h3>
                <div>
                    <form onSubmit={handleSolutionFormSubmit}>
                        <div>
                            <label>
                                Your name:{" "}
                                <input
                                    value={username}
                                    onChange={handleUsernameInputChange}
                                    placeholder="Enter your name here..."
                                    required
                                />
                            </label>
                        </div>
                        <div>
                            <label>
                                Solution:{" "}
                                <input
                                    name="solution-input"
                                    placeholder="Enter solution here..."
                                    required
                                />
                            </label>
                        </div>
                        <div>
                            <button type="submit">Submit solution</button>
                        </div>
                    </form>
                </div>
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
