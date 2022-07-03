import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Index from "../../pages";
import { swrConfigWrapper } from "../../lib/test";
import { act } from "react-dom/test-utils";

describe("Index", () => {
    it("renders welcome", () => {
        render(<Index />);

        expect(screen.getByText("Welcome")).toBeInTheDocument();
    });

    it("renders problems fetched from server", async () => {
        const fetcher = jest.fn(() =>
            Promise.resolve([
                {
                    problemId: 42,
                    title: "Ultimate Question of Life, the Universe, and Everything",
                },
                {
                    problemId: 85,
                    title: "Number of Known Primes that existed before 1984",
                },
            ])
        );

        render(swrConfigWrapper(<Index />, { fetcher }));

        const table = screen.getByRole("table");

        // Wait for data to be processed and updated on the page
        await act(async () => {
            await Promise.resolve();
        });

        expect(table).toMatchSnapshot();
        expect(fetcher.mock.calls[0][0]).toBe("/api/problem");
    });
});
