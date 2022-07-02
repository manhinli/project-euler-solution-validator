export interface ProblemMetadata {
    problemId: number;
    title: string;
    description: string;
    url: string;
    license: string;
}

export type ProblemSolutionValidator = (value: string) => Promise<boolean>;

export interface ProblemLeaderboardEntry {
    userName: string;
    /** String encoded Date */
    earliestSuccessfulAttempt: string;
    numberOfAttempts: number;
}
