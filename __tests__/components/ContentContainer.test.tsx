/**
 * @jest-environment jest-environment-jsdom
 */

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import ContentContainer from "../../components/ContentContainer";

describe("ContentContainer", () => {
    it("renders given children", () => {
        render(
            <ContentContainer>
                <span data-testid="child-element" />
            </ContentContainer>
        );

        const childElement = screen.getByTestId("child-element");

        expect(childElement).toBeInTheDocument();
    });

    it("applies className to the correct element", () => {
        const result = render(
            <ContentContainer className="test-class-name">
                <span />
            </ContentContainer>
        );

        expect(
            result.container.firstChild.classList.contains("test-class-name")
        ).toBe(true);
        expect(
            result.container.firstChild.firstChild.classList.contains(
                "test-class-name"
            )
        ).toBe(false);
    });

    it("applies childrenWrapperClassName", () => {
        const result = render(
            <ContentContainer childrenWrapperClassName="test-class-name">
                <span />
            </ContentContainer>
        );

        expect(
            result.container.firstChild.classList.contains("test-class-name")
        ).toBe(false);
        expect(
            result.container.firstChild.firstChild.classList.contains(
                "test-class-name"
            )
        ).toBe(true);
    });
});
