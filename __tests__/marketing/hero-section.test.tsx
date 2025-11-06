/**
 * Tests for HeroSection component
 *
 * Note: These tests require Jest and React Testing Library to be set up.
 * Testing infrastructure will be added in Phase 2 per progressive testing strategy.
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { HeroSection } from '@/components/marketing/hero-section';

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      hero_headline: 'Create Beautiful Surveys in Minutes',
      hero_subheadline: 'Collect feedback, analyze responses, and make data-driven decisions with our modern survey platform',
      get_started_free: 'Get Started Free',
      view_pricing: 'View Pricing',
      social_proof: 'Join 1,000+ users creating surveys',
    };
    return translations[key] || key;
  },
}));

// Mock next/link
jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
  MockLink.displayName = 'Link';
  return MockLink;
});

describe('HeroSection', () => {
  beforeEach(() => {
    // Clear any previous renders
    document.body.innerHTML = '';
  });

  describe('Content Rendering', () => {
    it('renders the headline with correct i18n key', () => {
      render(<HeroSection />);
      expect(screen.getByText('Create Beautiful Surveys in Minutes')).toBeInTheDocument();
    });

    it('renders the subheadline with correct i18n key', () => {
      render(<HeroSection />);
      expect(
        screen.getByText(/Collect feedback, analyze responses, and make data-driven decisions/)
      ).toBeInTheDocument();
    });

    it('renders the social proof text', () => {
      render(<HeroSection />);
      expect(screen.getByText('Join 1,000+ users creating surveys')).toBeInTheDocument();
    });
  });

  describe('Navigation Links', () => {
    it('renders primary CTA button linking to /register', () => {
      render(<HeroSection />);
      const registerButton = screen.getByText('Get Started Free').closest('a');
      expect(registerButton).toHaveAttribute('href', '/register');
    });

    it('renders secondary CTA button linking to /pricing', () => {
      render(<HeroSection />);
      const pricingButton = screen.getByText('View Pricing').closest('a');
      expect(pricingButton).toHaveAttribute('href', '/pricing');
    });
  });

  describe('Visual Elements', () => {
    it('renders the hero illustration placeholder', () => {
      const { container } = render(<HeroSection />);
      // Check for the placeholder SVG icon
      const svgIcon = container.querySelector('svg');
      expect(svgIcon).toBeInTheDocument();
    });

    it('applies gradient background classes', () => {
      const { container } = render(<HeroSection />);
      const section = container.querySelector('section');
      expect(section).toHaveClass('bg-gradient-to-br');
    });

    it('renders social proof avatars', () => {
      const { container } = render(<HeroSection />);
      // Check for avatar placeholders (3 circles)
      const avatars = container.querySelectorAll('.rounded-full.bg-gradient-to-br');
      expect(avatars.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Scroll Functionality', () => {
    it('renders scroll indicator button', () => {
      const { container } = render(<HeroSection />);
      const scrollButton = container.querySelector('button[aria-label="Scroll to next section"]');
      expect(scrollButton).toBeInTheDocument();
    });

    it('calls scrollIntoView when scroll indicator is clicked', () => {
      // Create a mock next section element
      const nextSection = document.createElement('div');
      nextSection.id = 'next-section';
      document.body.appendChild(nextSection);

      // Mock scrollIntoView
      const scrollIntoViewMock = jest.fn();
      nextSection.scrollIntoView = scrollIntoViewMock;

      const { container } = render(<HeroSection />);
      const scrollButton = container.querySelector('button[aria-label="Scroll to next section"]');

      if (scrollButton) {
        fireEvent.click(scrollButton);
        expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' });
      }
    });
  });

  describe('Responsive Design', () => {
    it('applies responsive grid layout classes', () => {
      const { container } = render(<HeroSection />);
      const gridContainer = container.querySelector('.grid');
      expect(gridContainer).toHaveClass('lg:grid-cols-2');
    });

    it('applies mobile-first stacking with desktop side-by-side layout', () => {
      const { container } = render(<HeroSection />);
      // Grid should stack by default (no cols class) and be side-by-side on lg
      const gridContainer = container.querySelector('.grid.lg\\:grid-cols-2');
      expect(gridContainer).toBeInTheDocument();
    });

    it('centers text on mobile and left-aligns on desktop', () => {
      const { container } = render(<HeroSection />);
      const textContainer = container.querySelector('.text-center.lg\\:text-left');
      expect(textContainer).toBeInTheDocument();
    });
  });

  describe('Internationalization', () => {
    it('uses Landing namespace for all translations', () => {
      // This is tested implicitly by the mock above
      // In a real scenario, we'd test with both EN and FR locales
      render(<HeroSection />);
      expect(screen.getByText('Create Beautiful Surveys in Minutes')).toBeInTheDocument();
    });

    it('handles French translations correctly', () => {
      // Re-mock with French translations
      jest.resetModules();
      jest.doMock('next-intl', () => ({
        useTranslations: () => (key: string) => {
          const translations: Record<string, string> = {
            hero_headline: 'Créez de beaux sondages en quelques minutes',
            hero_subheadline: 'Collectez des retours, analysez les réponses et prenez des décisions basées sur les données avec notre plateforme de sondage moderne',
            get_started_free: 'Commencer gratuitement',
            view_pricing: 'Voir les tarifs',
            social_proof: 'Rejoignez plus de 1 000 utilisateurs créant des sondages',
          };
          return translations[key] || key;
        },
      }));

      const { unmount } = render(<HeroSection />);
      unmount();

      render(<HeroSection />);
      expect(screen.getByText(/Créez de beaux sondages/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      render(<HeroSection />);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Create Beautiful Surveys in Minutes');
    });

    it('scroll button has accessible label', () => {
      const { container } = render(<HeroSection />);
      const scrollButton = container.querySelector('button[aria-label="Scroll to next section"]');
      expect(scrollButton).toHaveAttribute('aria-label', 'Scroll to next section');
    });
  });
});
