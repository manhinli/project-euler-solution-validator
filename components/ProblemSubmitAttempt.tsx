import React, {
    ChangeEventHandler,
    FormEventHandler,
    useCallback,
    useContext,
    useState,
} from "react";
import { UsernameContext } from "../lib/contexts";
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

                    // TODO: Handle response
                    if (response.status === 200) {
                        window.alert("Successfully received");
                    } else {
                        window.alert("An error occurred");
                    }

                    // Run onSubmit callback
                    onSubmit?.();
                } catch (e) {
                    // TODO: Handle error
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
        </form>
    );
};

export default ProblemSubmitAttempt;
