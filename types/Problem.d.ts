export interface ProblemMetadata {
    problemId: number;
    title: string;
    description: string;
    url: string;
    license: string;
}

export type ProblemSolutionValidator = (value: string) => boolean;
