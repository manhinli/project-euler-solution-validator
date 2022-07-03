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

export const validateSolution: ProblemSolutionValidator = async (value) => {
    // Problem 1
    // Multiples of 3 or 5
    //
    // Solution is to run through all numbers between [3, 1000) and sum the
    // numbers that are known to have 3 or 5 as a factor.
    //
    // We skip numbers 1 and 2 because they are definitely not multiples of 3
    // and 5 which saves us two rounds.

    let sum = 0;
    const lowBound = 3;
    const highBound = 1000;

    for (let i = lowBound; i < highBound; i += 1) {
        if (i % 3 === 0 || i % 5 === 0) {
            sum += i;
        }
    }

    // Compare answer and input value
    //
    // NOTE: Input values are passed as strings
    return value === sum.toFixed(0);
};
