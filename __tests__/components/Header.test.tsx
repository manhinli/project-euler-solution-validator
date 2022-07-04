/**
 * @jest-environment jest-environment-jsdom
 */

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Header from "../../components/Header";

describe("Header", () => {
    it("renders the name of the project", () => {
        render(<Header />);

        const el = screen.getByText("Project Euler Solution Validator");

        expect(el).toBeInTheDocument();
    });

    it("renders breadcrumbs", () => {
        render(
            <Header
                breadcrumbs={[
                    { href: "/#link-1", label: "Link 1" },
                    { href: "/#link-2", label: "Link 2" },
                ]}
            />
        );

        const link1 = screen.getByText("Link 1");
        const link2 = screen.getByText("Link 2");

        expect(link1).toBeInTheDocument();
        expect(link1).toHaveAttribute("href", "/#link-1");
        expect(link2).toBeInTheDocument();
        expect(link2).toHaveAttribute("href", "/#link-2");
    });
});
