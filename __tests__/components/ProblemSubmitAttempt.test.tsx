/**
 * @jest-environment jest-environment-jsdom
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ProblemSubmitAttempt from "../../components/ProblemSubmitAttempt";
import { act } from "react-dom/test-utils";
import { UsernameContext } from "../../lib/contexts";

// Mock `fetch`
globalThis.fetch = jest.fn(() => Promise.resolve({}));

beforeEach(() => {
    fetch.mockClear();
});

describe("ProblemSubmitAttempt", () => {
    it("renders input fields", () => {
        render(<ProblemSubmitAttempt problemId={42} />);

        const nameInput = screen.getByPlaceholderText(
            "Enter your name here..."
        );
        const solutionInput = screen.getByPlaceholderText(
            "Enter solution here..."
        );

        expect(nameInput).toBeInTheDocument();
        expect(solutionInput).toBeInTheDocument();
    });

    it("captures user name into context", () => {
        const onChange = jest.fn();

        render(
            <UsernameContext.Provider value={{ value: "", onChange }}>
                <ProblemSubmitAttempt problemId={42} />
            </UsernameContext.Provider>
        );

        const nameInput = screen.getByPlaceholderText(
            "Enter your name here..."
        );

        act(() => {
            fireEvent.change(nameInput, {
                target: { value: "Test user" },
            });
        });

        expect(onChange).toBeCalled();
        expect(onChange.mock.calls[0][0]).toBe("Test user");
    });

    it("restores user name from context", () => {
        const onChange = jest.fn();

        render(
            <UsernameContext.Provider value={{ value: "Test user", onChange }}>
                <ProblemSubmitAttempt problemId={42} />
            </UsernameContext.Provider>
        );

        const nameInput = screen.getByPlaceholderText(
            "Enter your name here..."
        );

        act(() => {
            fireEvent.change(nameInput, {
                target: { value: "Test user" },
            });
        });

        expect(nameInput).toHaveValue("Test user");
    });

    it("submits solution to API", async () => {
        const onChange = jest.fn();

        render(
            <UsernameContext.Provider value={{ value: "Test user", onChange }}>
                <ProblemSubmitAttempt problemId={42} />
            </UsernameContext.Provider>
        );

        const response = {
            status: 200,
            json: () =>
                Promise.resolve({
                    problemId: 42,
                    userName: "Test user",
                    dateTime: "2022-06-30T12:34:56.789Z",
                    attemptValue: "123456789",
                    attemptSuccessful: true,
                }),
        };

        globalThis.fetch.mockImplementationOnce(() => response);

        const solutionInput = screen.getByPlaceholderText(
            "Enter solution here..."
        );

        const submitButton = screen.getByRole("button");

        act(() => {
            fireEvent.change(solutionInput, {
                target: { value: "123456789" },
            });

            fireEvent.click(submitButton);
        });

        await waitFor(() => screen.getByText("Your solution is correct"));

        expect(globalThis.fetch).toHaveBeenCalledTimes(1);
        expect(globalThis.fetch.mock.calls[0][0]).toBe(
            "/api/problem/42/solution"
        );
        expect(globalThis.fetch.mock.calls[0][1]).toEqual({
            body: `{"userName":"Test user","attemptValue":"123456789"}`,
            headers: {
                "Content-Type": "application/json",
            },
            method: "POST",
        });
    });

    it("renders solution is incorrect message", async () => {
        const onChange = jest.fn();

        render(
            <UsernameContext.Provider value={{ value: "Test user", onChange }}>
                <ProblemSubmitAttempt problemId={42} />
            </UsernameContext.Provider>
        );

        const response = {
            status: 200,
            json: () =>
                Promise.resolve({
                    problemId: 42,
                    userName: "Test user",
                    dateTime: "2022-06-30T12:34:56.789Z",
                    attemptValue: " ",
                    attemptSuccessful: false,
                }),
        };

        globalThis.fetch.mockImplementationOnce(() => response);

        const solutionInput = screen.getByPlaceholderText(
            "Enter solution here..."
        );

        const submitButton = screen.getByRole("button");

        act(() => {
            fireEvent.change(solutionInput, {
                target: { value: " " },
            });

            fireEvent.click(submitButton);
        });

        await waitFor(() =>
            expect(
                screen.getByText("Your solution is incorrect")
            ).toBeInTheDocument()
        );
    });

    it("handles error in API", async () => {
        const onChange = jest.fn();

        render(
            <UsernameContext.Provider value={{ value: "Test user", onChange }}>
                <ProblemSubmitAttempt problemId={42} />
            </UsernameContext.Provider>
        );

        const response = {
            status: 400,
            json: () => Promise.reject(),
        };

        globalThis.fetch.mockImplementationOnce(() => response);

        const solutionInput = screen.getByPlaceholderText(
            "Enter solution here..."
        );

        const submitButton = screen.getByRole("button");

        act(() => {
            fireEvent.change(solutionInput, {
                target: { value: " " },
            });

            fireEvent.click(submitButton);
        });

        await waitFor(() =>
            expect(
                screen.getByText("Error occurred during submission")
            ).toBeInTheDocument()
        );
    });

    it("handles error in `fetch`", async () => {
        const onChange = jest.fn();

        render(
            <UsernameContext.Provider value={{ value: "Test user", onChange }}>
                <ProblemSubmitAttempt problemId={42} />
            </UsernameContext.Provider>
        );

        globalThis.fetch.mockImplementationOnce(() => {
            throw new Error("Error occurred with fetch");
        });

        const solutionInput = screen.getByPlaceholderText(
            "Enter solution here..."
        );

        const submitButton = screen.getByRole("button");

        act(() => {
            fireEvent.change(solutionInput, {
                target: { value: " " },
            });

            fireEvent.click(submitButton);
        });

        await waitFor(() =>
            expect(
                screen.getByText("Error occurred with fetch")
            ).toBeInTheDocument()
        );
    });

    it("does not submit to server when no problem ID is present", () => {
        const onChange = jest.fn();

        render(
            <UsernameContext.Provider value={{ value: "Test user", onChange }}>
                <ProblemSubmitAttempt problemId={undefined} />
            </UsernameContext.Provider>
        );

        const solutionInput = screen.getByPlaceholderText(
            "Enter solution here..."
        );

        const submitButton = screen.getByRole("button");

        act(() => {
            fireEvent.change(solutionInput, {
                target: { value: " " },
            });

            fireEvent.click(submitButton);
        });

        expect(globalThis.fetch).not.toBeCalled();
    });

    it("runs `onSubmit` handler after submission", async () => {
        const onChange = jest.fn();
        const onSubmit = jest.fn();

        render(
            <UsernameContext.Provider value={{ value: "Test user", onChange }}>
                <ProblemSubmitAttempt problemId={42} onSubmit={onSubmit} />
            </UsernameContext.Provider>
        );

        const response = {
            status: 200,
            json: () =>
                Promise.resolve({
                    problemId: 42,
                    userName: "Test user",
                    dateTime: "2022-06-30T12:34:56.789Z",
                    attemptValue: " ",
                    attemptSuccessful: false,
                }),
        };

        globalThis.fetch.mockImplementationOnce(() => response);

        const solutionInput = screen.getByPlaceholderText(
            "Enter solution here..."
        );

        const submitButton = screen.getByRole("button");

        act(() => {
            fireEvent.change(solutionInput, {
                target: { value: " " },
            });

            fireEvent.click(submitButton);
        });

        await waitFor(() => expect(onSubmit).toBeCalled());
    });
});
