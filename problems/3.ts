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

export const validateSolution: ProblemSolutionValidator = async (value) => {
    // Problem 3
    // Largest prime factor
    //
    // Solution is to divide repeatedly by smallest factors which will leave us
    // with the largest prime factor at the end.

    // Initial known prime factor
    let largestKnownPrimeFactor = 2;

    // This is the divisor being trialled
    let factor = 2;

    // The number is progressively divided down in the loop below
    // We start off with the number in the problem statement (600851475143)
    let targetNumber = 600851475143;

    // Go over all prime factors
    // Factors here are prime because we exhaust division by smaller factors
    // until we can divide no longer
    //
    // Note that we don't need to go beyond the square root of the target
    // number

    while (factor <= Math.sqrt(targetNumber)) {
        // Check that `factor` is indeed a factor
        if (targetNumber % factor === 0) {
            // `factor` will always be prime at this point as we are dividing
            // from the smallest known factors upwards
            if (factor > largestKnownPrimeFactor) {
                largestKnownPrimeFactor = factor;
            }

            targetNumber = targetNumber / factor; // Divide through, repeat
            continue;
        }

        // Try next divisor
        // This is basically naive, but is fast enough going through all
        // combinations before hitting the next prime
        ++factor;
    }

    // `targetNumber` holds the remaining factor, which may be larger than what
    // we have at the moment
    if (targetNumber > largestKnownPrimeFactor) {
        largestKnownPrimeFactor = targetNumber;
    }

    // Compare answer and input value
    //
    // NOTE: Input values are passed as strings
    return value === largestKnownPrimeFactor.toFixed(0);
};
