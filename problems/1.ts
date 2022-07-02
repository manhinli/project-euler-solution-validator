import { ProblemMetadata, ProblemSolutionValidator } from "../types/Problem";

export const metadata: ProblemMetadata = {
    problemId: 1,
    title: "Multiples of 3 or 5",
    description: `<p>If we list all the natural numbers below 10 that are multiples of 3 or 5, we get 3, 5, 6 and 9. The sum of these multiples is 23.</p>
<p>Find the sum of all the multiples of 3 or 5 below 1000.</p>`,
    url: "https://projecteuler.net/problem=1",
    license:
        "This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.",
};

export const validateSolution: ProblemSolutionValidator = (value) => {
    // TODO: Implement solution validator
    return false;
};
