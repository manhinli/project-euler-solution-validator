import { ProblemMetadata, ProblemSolutionValidator } from "../types/Problem";

export const metadata: ProblemMetadata = {
    problemId: 3,
    title: "Largest prime factor",
    description: `<p>The prime factors of 13195 are 5, 7, 13 and 29.</p>
<p>What is the largest prime factor of the number 600851475143 ?</p>`,
    url: "https://projecteuler.net/problem=3",
    license:
        "This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.",
};

export const validateSolution: ProblemSolutionValidator = (value) => {
    // TODO: Implement solution validator
    return false;
};
