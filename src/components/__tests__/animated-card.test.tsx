import { render, screen, fireEvent } from "@testing-library/react";
import { AnimatedCard } from "../animated-card";

jest.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      onClick,
      className,
      ...props
    }: React.HTMLProps<HTMLDivElement>) => (
      <div onClick={onClick} className={className} {...props}>
        {children}
      </div>
    ),
  },
}));

describe("AnimatedCard", () => {
  it("renders children correctly", () => {
    render(
      <AnimatedCard>
        <div>Test Content</div>
      </AnimatedCard>,
    );

    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <AnimatedCard className="custom-class">
        <div>Test Content</div>
      </AnimatedCard>,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("calls onClick when clicked", () => {
    const mockOnClick = jest.fn();

    render(
      <AnimatedCard onClick={mockOnClick}>
        <div>Test Content</div>
      </AnimatedCard>,
    );

    const card = screen.getByText("Test Content").closest("div");
    if (card?.parentElement) {
      fireEvent.click(card.parentElement);
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    }
  });

  it("renders without onClick handler", () => {
    render(
      <AnimatedCard>
        <div>Test Content</div>
      </AnimatedCard>,
    );

    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });
});
