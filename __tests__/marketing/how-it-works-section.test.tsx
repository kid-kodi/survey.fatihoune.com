import { render, screen } from "@testing-library/react";
import { HowItWorksSection } from "@/components/marketing/how-it-works-section";
import { NextIntlClientProvider } from "next-intl";

// Mock next/link
jest.mock("next/link", () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
  MockLink.displayName = "Link";
  return MockLink;
});

const messages = {
  Landing: {
    how_it_works_heading: "How It Works",
    step_1_title: "Sign Up",
    step_1_desc: "Create your free account in seconds",
    step_2_title: "Build Your Survey",
    step_2_desc: "Choose a template or start from scratch",
    step_3_title: "Share & Collect",
    step_3_desc: "Send your survey link and gather responses",
    step_4_title: "Analyze Results",
    step_4_desc: "View insights and export your data",
    start_creating: "Start Creating Surveys",
  },
};

describe("HowItWorksSection", () => {
  const renderComponent = () => {
    return render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <HowItWorksSection />
      </NextIntlClientProvider>
    );
  };

  it("renders the section heading", () => {
    renderComponent();
    expect(screen.getByText("How It Works")).toBeInTheDocument();
  });

  it("renders all 4 steps with correct numbering", () => {
    renderComponent();

    // Check step numbers
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("renders step 1 with correct content", () => {
    renderComponent();

    expect(screen.getByText("Sign Up")).toBeInTheDocument();
    expect(screen.getByText("Create your free account in seconds")).toBeInTheDocument();
  });

  it("renders step 2 with correct content", () => {
    renderComponent();

    expect(screen.getByText("Build Your Survey")).toBeInTheDocument();
    expect(screen.getByText("Choose a template or start from scratch")).toBeInTheDocument();
  });

  it("renders step 3 with correct content", () => {
    renderComponent();

    expect(screen.getByText("Share & Collect")).toBeInTheDocument();
    expect(screen.getByText("Send your survey link and gather responses")).toBeInTheDocument();
  });

  it("renders step 4 with correct content", () => {
    renderComponent();

    expect(screen.getByText("Analyze Results")).toBeInTheDocument();
    expect(screen.getByText("View insights and export your data")).toBeInTheDocument();
  });

  it("renders CTA button with correct text and link", () => {
    renderComponent();

    const ctaButton = screen.getByText("Start Creating Surveys");
    expect(ctaButton).toBeInTheDocument();

    const link = ctaButton.closest("a");
    expect(link).toHaveAttribute("href", "/register");
  });

  it("renders all icons", () => {
    const { container } = renderComponent();

    // Check that there are 4 icons (one for each step)
    const icons = container.querySelectorAll("svg");
    expect(icons.length).toBeGreaterThanOrEqual(4);
  });

  it("applies correct responsive classes for mobile layout", () => {
    const { container } = renderComponent();

    // Check that the grid container has responsive classes
    const gridContainer = container.querySelector(".grid");
    expect(gridContainer).toHaveClass("grid-cols-1");
    expect(gridContainer).toHaveClass("md:grid-cols-4");
  });

  it("has proper section styling", () => {
    const { container } = renderComponent();

    const section = container.querySelector("section");
    expect(section).toHaveClass("bg-muted/30");
    expect(section).toHaveClass("py-16");
    expect(section).toHaveClass("md:py-24");
  });
});
