import { render, screen } from "@testing-library/react";
import { TestimonialsSection } from "@/components/marketing/testimonials-section";
import { NextIntlClientProvider } from "next-intl";

// Mock next/image
jest.mock("next/image", () => {
  const MockImage = ({ src, alt }: { src: string; alt: string }) => {
    return <img src={src} alt={alt} />;
  };
  MockImage.displayName = "Image";
  return MockImage;
});

const messages = {
  Landing: {
    testimonials_heading: "Loved by teams everywhere",
    testimonial_1_quote: "This platform made survey creation so easy! I went from idea to collecting responses in under 10 minutes.",
    testimonial_1_name: "Sarah Johnson",
    testimonial_1_title: "Owner, Johnson Consulting",
    testimonial_2_quote: "The real-time analytics and data export features are exactly what our research team needed. Highly recommended!",
    testimonial_2_name: "Dr. Michael Chen",
    testimonial_2_title: "Research Professor, State University",
    testimonial_3_quote: "Our team loves the collaboration features. We can work together seamlessly and manage permissions easily.",
    testimonial_3_name: "Emily Rodriguez",
    testimonial_3_title: "Team Lead, Tech Innovations Inc.",
  },
};

describe("TestimonialsSection", () => {
  const renderComponent = () => {
    return render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <TestimonialsSection />
      </NextIntlClientProvider>
    );
  };

  it("renders the section heading", () => {
    renderComponent();
    expect(screen.getByText("Loved by teams everywhere")).toBeInTheDocument();
  });

  it("renders all 3 testimonials", () => {
    renderComponent();

    // Check that all 3 testimonial names are present
    expect(screen.getByText("Sarah Johnson")).toBeInTheDocument();
    expect(screen.getByText("Dr. Michael Chen")).toBeInTheDocument();
    expect(screen.getByText("Emily Rodriguez")).toBeInTheDocument();
  });

  it("renders testimonial 1 with complete content", () => {
    renderComponent();

    expect(screen.getByText(/This platform made survey creation so easy/i)).toBeInTheDocument();
    expect(screen.getByText("Sarah Johnson")).toBeInTheDocument();
    expect(screen.getByText("Owner, Johnson Consulting")).toBeInTheDocument();
  });

  it("renders testimonial 2 with complete content", () => {
    renderComponent();

    expect(screen.getByText(/The real-time analytics and data export/i)).toBeInTheDocument();
    expect(screen.getByText("Dr. Michael Chen")).toBeInTheDocument();
    expect(screen.getByText("Research Professor, State University")).toBeInTheDocument();
  });

  it("renders testimonial 3 with complete content", () => {
    renderComponent();

    expect(screen.getByText(/Our team loves the collaboration features/i)).toBeInTheDocument();
    expect(screen.getByText("Emily Rodriguez")).toBeInTheDocument();
    expect(screen.getByText("Tech Innovations Inc.")).toBeInTheDocument();
  });

  it("renders star ratings for all testimonials", () => {
    const { container } = renderComponent();

    // Each testimonial should have 5 stars (3 testimonials × 5 stars = 15 stars)
    const stars = container.querySelectorAll("svg.fill-yellow-400");
    expect(stars.length).toBe(15);
  });

  it("renders quote icons", () => {
    const { container } = renderComponent();

    // There should be 3 quote icons (one per testimonial)
    const quoteIcons = container.querySelectorAll("svg.text-blue-500");
    expect(quoteIcons.length).toBe(3);
  });

  it("renders avatar images for all testimonials", () => {
    renderComponent();

    const avatars = screen.getAllByRole("img");
    expect(avatars.length).toBe(3);

    // Check that all avatars have alt text matching the names
    expect(screen.getByAltText("Sarah Johnson")).toBeInTheDocument();
    expect(screen.getByAltText("Dr. Michael Chen")).toBeInTheDocument();
    expect(screen.getByAltText("Emily Rodriguez")).toBeInTheDocument();
  });

  it("applies correct responsive grid layout", () => {
    const { container } = renderComponent();

    // Check that the grid container has responsive classes
    const gridContainer = container.querySelector(".grid");
    expect(gridContainer).toHaveClass("grid-cols-1");
    expect(gridContainer).toHaveClass("md:grid-cols-3");
  });

  it("has proper section styling", () => {
    const { container } = renderComponent();

    const section = container.querySelector("section");
    expect(section).toHaveClass("bg-gray-50");
    expect(section).toHaveClass("py-16");
    expect(section).toHaveClass("sm:py-24");
  });

  it("renders testimonial cards with proper styling", () => {
    const { container } = renderComponent();

    // Check that testimonial cards have correct styling
    const cards = container.querySelectorAll(".bg-white.rounded-lg.shadow-md");
    expect(cards.length).toBe(3);
  });

  it("renders quotes with proper quotation marks", () => {
    renderComponent();

    // Check that quotes include opening quotation marks
    const quoteElements = screen.getAllByText(/^"/);
    expect(quoteElements.length).toBeGreaterThanOrEqual(3);
  });

  it("supports French translations", () => {
    const frenchMessages = {
      Landing: {
        testimonials_heading: "Apprécié par les équipes du monde entier",
        testimonial_1_quote: "Cette plateforme a rendu la création de sondages si facile !",
        testimonial_1_name: "Sarah Johnson",
        testimonial_1_title: "Propriétaire, Johnson Consulting",
        testimonial_2_quote: "Les fonctionnalités d'analyse en temps réel sont exactement ce dont nous avions besoin !",
        testimonial_2_name: "Dr. Michael Chen",
        testimonial_2_title: "Professeur de recherche, Université d'État",
        testimonial_3_quote: "Notre équipe adore les fonctionnalités de collaboration.",
        testimonial_3_name: "Emily Rodriguez",
        testimonial_3_title: "Chef d'équipe, Tech Innovations Inc.",
      },
    };

    render(
      <NextIntlClientProvider locale="fr" messages={frenchMessages}>
        <TestimonialsSection />
      </NextIntlClientProvider>
    );

    expect(screen.getByText("Apprécié par les équipes du monde entier")).toBeInTheDocument();
    expect(screen.getByText(/Cette plateforme a rendu la création de sondages/i)).toBeInTheDocument();
  });

  it("renders avatar images with correct sources", () => {
    renderComponent();

    const avatars = screen.getAllByRole("img") as HTMLImageElement[];

    // Check that avatars use UI Avatars API
    expect(avatars[0].src).toContain("ui-avatars.com");
    expect(avatars[1].src).toContain("ui-avatars.com");
    expect(avatars[2].src).toContain("ui-avatars.com");
  });
});
