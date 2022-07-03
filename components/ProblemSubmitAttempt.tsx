import classnames from "classnames";
import React, {
    ChangeEventHandler,
    FormEventHandler,
    useCallback,
    useContext,
    useState,
} from "react";
import { UsernameContext } from "../lib/contexts";
import { Attempt } from "../types/Attempt";
import styles from "./ProblemSubmitAttempt.module.css";

export interface Props {
    /** ID of the problem */
    problemId: string | number | undefined;
    /** Callback after submission executes */
    onSubmit?: () => void;
}

export const ProblemSubmitAttempt: React.FC<Props> = ({
    problemId,
    onSubmit,
}) => {
    // Pull in user's name from shared context
    const { value: username, onChange: setUsername } =
        useContext(UsernameContext);

    // Keep track of whether submission is in progress
    const [submitInProgress, setSubmitInProgress] = useState<boolean>(false);

    // State to show submission success/error to user
    const [lastAttempt, setLastAttempt] = useState<
        | { state: "submitted"; attempt: Attempt }
        | { state: "error"; error: unknown }
        | undefined
    >();

    const handleSolutionFormSubmit: FormEventHandler<HTMLFormElement> =
        useCallback(
            async (e) => {
                // Stop default form submission behaviour
                e.preventDefault();

                // If we are in the process of dealing with another submission,
                // stop
                if (submitInProgress) {
                    return;
                }

                // Stop if no problem ID available
                if (problemId === undefined) {
                    return;
                }

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
                setSubmitInProgress(true);

                try {
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

                    // Handle response
                    if (response.status === 200) {
                        // Submission accepted successfully (this does not
                        // necessarily mean the solution was correct, but we
                        // don't care about that here)
                        const attempt = (await response.json()) as Attempt;

                        setLastAttempt({
                            state: "submitted",
                            attempt,
                        });
                    } else {
                        // An error occurred in submission
                        setLastAttempt({
                            state: "error",
                            error: new Error(
                                "Error occurred during submission"
                            ),
                        });
                    }

                    // Run onSubmit callback
                    onSubmit?.();
                } catch (e) {
                    // Handle error
                    setLastAttempt({
                        state: "error",
                        error: e,
                    });
                } finally {
                    setSubmitInProgress(false);
                }
            },
            [username, problemId, onSubmit]
        );

    const handleUsernameInputChange: ChangeEventHandler<HTMLInputElement> =
        useCallback(
            (e) => {
                setUsername(e.currentTarget.value);
            },
            [setUsername]
        );

    return (
        <form onSubmit={handleSolutionFormSubmit} className={styles.form}>
            <label htmlFor="username-input">Name</label>
            <input
                id="username-input"
                value={username}
                onChange={handleUsernameInputChange}
                placeholder="Enter your name here..."
                required
            />
            <label htmlFor="solution-input">Solution</label>
            <input
                id="solution-input"
                name="solution-input"
                placeholder="Enter solution here..."
                required
            />
            <button type="submit" disabled={submitInProgress}>
                {submitInProgress ? "Submitting..." : "Submit solution"}
            </button>
            {lastAttempt?.state === "submitted" &&
            lastAttempt.attempt.attemptSuccessful ? (
                <div
                    className={classnames(
                        styles.attemptResponse,
                        styles.attemptCorrect
                    )}
                >
                    Your solution is correct
                </div>
            ) : (
                <div
                    className={classnames(
                        styles.attemptResponse,
                        styles.attemptIncorrect
                    )}
                >
                    Your solution is incorrect
                </div>
            )}
            {lastAttempt?.state === "error" && (
                <div
                    className={classnames(
                        styles.attemptResponse,
                        styles.attemptError
                    )}
                >
                    {(lastAttempt.error as Error).message ??
                        "An error occurred during submission; please try again later."}
                </div>
            )}
        </form>
    );
};

export default ProblemSubmitAttempt;
