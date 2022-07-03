import React from "react";
import useSWR from "swr";
import styles from "./ProblemLeaderboard.module.css";
import { ProblemLeaderboardEntry } from "../types/Problem";

// Client-side local region-dependent formatting of date/time
const SOLUTION_DATETIME_FORMAT = Intl.DateTimeFormat(undefined, {
    dateStyle: "short",
    timeStyle: "medium",
});

export interface Props {
    /** ID of the problem */
    problemId: string | number | undefined;
}

export const ProblemLeaderboard: React.FC<Props> = ({ problemId }) => {
    const { data, error } = useSWR<readonly ProblemLeaderboardEntry[]>(
        problemId ? `/api/problem/${problemId}/leaderboard` : null,
        // Update leaderboard every minute
        { refreshInterval: 60000 }
    );

    if (error) {
        return (
            <div className={styles.error}>
                Leaderboard could not be retrieved.
            </div>
        );
    }

    return (
        <table className={styles.leaderboard}>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Submission time</th>
                    <th>Number of attempts</th>
                </tr>
            </thead>
            <tbody data-testid="table-body">
                {data?.map(
                    ({
                        userName,
                        earliestSuccessfulAttempt,
                        numberOfAttempts,
                    }) => (
                        <tr key={userName}>
                            <td>{userName}</td>
                            <td>
                                <time
                                    dateTime={earliestSuccessfulAttempt}
                                    title={earliestSuccessfulAttempt}
                                >
                                    {SOLUTION_DATETIME_FORMAT.format(
                                        new Date(earliestSuccessfulAttempt)
                                    )}
                                </time>
                            </td>
                            <td>{numberOfAttempts}</td>
                        </tr>
                    )
                )}
            </tbody>
        </table>
    );
};

export default ProblemLeaderboard;
