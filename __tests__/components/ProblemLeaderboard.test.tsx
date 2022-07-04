/**
 * @jest-environment jest-environment-jsdom
 */

import { getAllByRole, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ProblemLeaderboard from "../../components/ProblemLeaderboard";
import { swrConfigWrapper } from "../../lib/test";

describe("ProblemLeaderboard", () => {
    it("renders expected table header", () => {
        render(<ProblemLeaderboard problemId={42} />);

        const columnHeaders = screen
            .getAllByRole("columnheader")
            .map((x) => x.textContent);

        expect(columnHeaders).toEqual([
            "Name",
            "Submission time",
            "Number of attempts",
        ]);
    });

    it("renders data from API", async () => {
        const data = [
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
        ];

        const fetcher = jest.fn(() => Promise.resolve(data));

        render(
            swrConfigWrapper(<ProblemLeaderboard problemId={42} />, { fetcher })
        );

        const getTableBodyDataRows = () =>
            getAllByRole(screen.getByTestId("table-body"), "row");

        await waitFor(() => getTableBodyDataRows().length > 0);

        expect(getTableBodyDataRows()).toMatchSnapshot();
    });

    it("renders error message when service unavailable", async () => {
        const fetcher = jest.fn(() => {
            throw new Error();
        });

        render(
            swrConfigWrapper(<ProblemLeaderboard problemId={42} />, { fetcher })
        );

        const getErrorMessage = () =>
            screen.getByText("Leaderboard could not be retrieved.");

        await waitFor(() => getErrorMessage());

        expect(getErrorMessage()).toBeInTheDocument;
    });

    it("does not fetch when problem ID not provided", async () => {
        const fetcher = jest.fn(() => Promise.resolve());

        render(
            swrConfigWrapper(<ProblemLeaderboard problemId={undefined} />, {
                fetcher,
            })
        );

        expect(fetcher).not.toBeCalled();
    });
});
