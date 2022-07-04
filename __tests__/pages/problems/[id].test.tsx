/**
 * @jest-environment jest-environment-jsdom
 */

import {
    fireEvent,
    getAllByRole,
    render,
    screen,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import { swrConfigWrapper } from "../../../lib/test";
import { useRouter } from "next/router";
import { act } from "react-dom/test-utils";
import ProblemId from "../../../pages/problem/[id]";
import { UsernameContext } from "../../../lib/contexts";

// Mock `fetch`
globalThis.fetch = jest.fn(() => Promise.resolve({}));

jest.mock("next/router", () => ({
    useRouter: jest.fn(),
}));

beforeEach(() => {
    fetch.mockClear();
    useRouter.mockClear();
});

describe("ProblemId", () => {
    it("renders problem info fetched from server", async () => {
        // Mock page is for problem #42
        useRouter.mockImplementation(() => {
            return {
                query: {
                    id: "42",
                },
            };
        });

        const fetcher = jest.fn((url) => {
            switch (url) {
                case "/api/problem/42":
                    return Promise.resolve({
                        problemId: 42,
                        title: "Ultimate Question of Life, the Universe, and Everything",
                        description: `<p>What is the solution to the ultimate question?</p>`,
                        url: "http://example.com/problem/42",
                        license:
                            "This work is available under the Creative Commons Zero license.",
                    });
                case "/api/problem/42/leaderboard":
                    return Promise.resolve([]);
            }
        });

        render(swrConfigWrapper(<ProblemId />, { fetcher }));

        // Wait for data to be processed and updated on the page
        await act(async () => {
            await Promise.resolve();
        });

        expect(
            screen.getByText(
                "Ultimate Question of Life, the Universe, and Everything",
                { selector: "h2" }
            )
        ).toBeInTheDocument();
        expect(
            screen.getByText("What is the solution to the ultimate question?")
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                "This work is available under the Creative Commons Zero license."
            )
        ).toBeInTheDocument();
    });

    it("renders leaderboard", async () => {
        // Mock page is for problem #42
        useRouter.mockImplementation(() => {
            return {
                query: {
                    id: "42",
                },
            };
        });

        const fetcher = jest.fn((url) => {
            switch (url) {
                case "/api/problem/42":
                    return Promise.resolve({
                        problemId: 42,
                        title: "Ultimate Question of Life, the Universe, and Everything",
                        description: `<p>What is the solution to the ultimate question?</p>`,
                        url: "http://example.com/problem/42",
                        license:
                            "This work is available under the Creative Commons Zero license.",
                    });
                case "/api/problem/42/leaderboard":
                    return Promise.resolve([
                        {
                            userName: "First User",
                            earliestSuccessfulAttempt:
                                "2020-06-30T23:59:59.999Z",
                            numberOfAttempts: 16,
                        },
                        {
                            userName: "Second User",
                            earliestSuccessfulAttempt:
                                "2022-03-26T08:26:31.582Z",
                            numberOfAttempts: 32,
                        },
                    ]);
            }
        });

        render(swrConfigWrapper(<ProblemId />, { fetcher }));

        // Wait for data to be processed and updated on the page
        await act(async () => {
            await Promise.resolve();
        });

        const getTableBodyDataRows = () =>
            getAllByRole(screen.getByTestId("table-body"), "row");

        expect(getTableBodyDataRows()).toMatchSnapshot();
    });

    it("renders error page", async () => {
        // Mock page is for invalid problem ID
        useRouter.mockImplementation(() => {
            return {
                query: {
                    id: "0xdeadbeef",
                },
            };
        });

        const fetcher = jest.fn(() => {
            throw new Error();
        });

        render(swrConfigWrapper(<ProblemId />, { fetcher }));

        // Wait for data to be processed and updated on the page
        await act(async () => {
            await Promise.resolve();
        });

        expect(screen.getByText("Problem not found")).toBeInTheDocument();
    });

    it("reruns leaderboard fetch after submit", async () => {
        // Mock page is for problem #42
        useRouter.mockImplementation(() => {
            return {
                query: {
                    id: "42",
                },
            };
        });

        const problemFetch = jest.fn(() =>
            Promise.resolve({
                problemId: 42,
                title: "Ultimate Question of Life, the Universe, and Everything",
                description: `<p>What is the solution to the ultimate question?</p>`,
                url: "http://example.com/problem/42",
                license:
                    "This work is available under the Creative Commons Zero license.",
            })
        );

        const leaderboardFetch = jest.fn(() =>
            Promise.resolve([
                {
                    userName: "First User",
                    earliestSuccessfulAttempt: "2020-06-30T23:59:59.999Z",
                    numberOfAttempts: 16,
                },
                {
                    userName: "Second User",
                    earliestSuccessfulAttempt: "2022-03-26T08:26:31.582Z",
                    numberOfAttempts: 32,
                },
            ])
        );

        const fetcher = jest.fn((url) => {
            switch (url) {
                case "/api/problem/42":
                    return problemFetch();
                case "/api/problem/42/leaderboard":
                    return leaderboardFetch();
            }
        });

        render(
            swrConfigWrapper(
                <UsernameContext.Provider
                    value={{ value: "Test user", onChange: jest.fn() }}
                >
                    <ProblemId />
                </UsernameContext.Provider>,
                { fetcher }
            )
        );

        // Wait for data to be processed and updated on the page
        await act(async () => {
            await Promise.resolve();
        });

        const solutionInput = screen.getByPlaceholderText(
            "Enter solution here..."
        );

        const submitButton = screen.getByRole("button");

        // Before submitting solution
        expect(leaderboardFetch).toBeCalledTimes(1);

        // Fill in solution
        act(() => {
            fireEvent.change(solutionInput, {
                target: { value: "123456789" },
            });

            fireEvent.click(submitButton);
        });

        // Wait for data to be processed and updated on the page
        await act(async () => {
            await Promise.resolve();
        });

        // After submitting solution
        expect(leaderboardFetch).toBeCalledTimes(2);
    });
});
