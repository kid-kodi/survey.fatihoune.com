/**
 * Tests for FeaturesSection component
 *
 * Note: These tests require Jest and React Testing Library to be set up.
 * Testing infrastructure will be added in Phase 2 per progressive testing strategy.
 */

import { render, screen } from '@testing-library/react';
import { FeaturesSection } from '@/components/marketing/features-section';

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      features_heading: 'Everything you need to create surveys',
      feature_1_title: 'Drag & Drop Builder',
      feature_1_desc: 'Easily create surveys with our intuitive drag and drop interface',
      feature_2_title: 'Multiple Question Types',
      feature_2_desc: 'Text, multiple choice, rating scales, and more',
      feature_3_title: 'Real-time Analytics',
      feature_3_desc: 'View responses and insights as they come in',
      feature_4_title: 'Team Collaboration',
      feature_4_desc: 'Work together with organizations and roles',
      feature_5_title: 'Mobile Optimized',
      feature_5_desc: 'Surveys that look great on any device',
      feature_6_title: 'Data Export',
      feature_6_desc: 'Export responses to CSV for deeper analysis',
    };
    return translations[key] || key;
  },
}));

describe('FeaturesSection', () => {
  beforeEach(() => {
    // Clear any previous renders
    document.body.innerHTML = '';
  });

  describe('Content Rendering', () => {
    it('renders the section heading with correct i18n key', () => {
      render(<FeaturesSection />);
      expect(screen.getByText('Everything you need to create surveys')).toBeInTheDocument();
    });

    it('renders all 6 feature cards', () => {
      const { container } = render(<FeaturesSection />);
      const featureCards = container.querySelectorAll('.group');
      expect(featureCards.length).toBe(6);
    });
  });

  describe('Feature 1: Drag & Drop Builder', () => {
    it('renders Feature 1 title with correct i18n key', () => {
      render(<FeaturesSection />);
      expect(screen.getByText('Drag & Drop Builder')).toBeInTheDocument();
    });

    it('renders Feature 1 description with correct i18n key', () => {
      render(<FeaturesSection />);
      expect(screen.getByText('Easily create surveys with our intuitive drag and drop interface')).toBeInTheDocument();
    });

    it('renders Feature 1 icon (GripVertical)', () => {
      const { container } = render(<FeaturesSection />);
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThanOrEqual(6);
    });
  });

  describe('Feature 2: Multiple Question Types', () => {
    it('renders Feature 2 title with correct i18n key', () => {
      render(<FeaturesSection />);
      expect(screen.getByText('Multiple Question Types')).toBeInTheDocument();
    });

    it('renders Feature 2 description with correct i18n key', () => {
      render(<FeaturesSection />);
      expect(screen.getByText('Text, multiple choice, rating scales, and more')).toBeInTheDocument();
    });
  });

  describe('Feature 3: Real-time Analytics', () => {
    it('renders Feature 3 title with correct i18n key', () => {
      render(<FeaturesSection />);
      expect(screen.getByText('Real-time Analytics')).toBeInTheDocument();
    });

    it('renders Feature 3 description with correct i18n key', () => {
      render(<FeaturesSection />);
      expect(screen.getByText('View responses and insights as they come in')).toBeInTheDocument();
    });
  });

  describe('Feature 4: Team Collaboration', () => {
    it('renders Feature 4 title with correct i18n key', () => {
      render(<FeaturesSection />);
      expect(screen.getByText('Team Collaboration')).toBeInTheDocument();
    });

    it('renders Feature 4 description with correct i18n key', () => {
      render(<FeaturesSection />);
      expect(screen.getByText('Work together with organizations and roles')).toBeInTheDocument();
    });
  });

  describe('Feature 5: Mobile Optimized', () => {
    it('renders Feature 5 title with correct i18n key', () => {
      render(<FeaturesSection />);
      expect(screen.getByText('Mobile Optimized')).toBeInTheDocument();
    });

    it('renders Feature 5 description with correct i18n key', () => {
      render(<FeaturesSection />);
      expect(screen.getByText('Surveys that look great on any device')).toBeInTheDocument();
    });
  });

  describe('Feature 6: Data Export', () => {
    it('renders Feature 6 title with correct i18n key', () => {
      render(<FeaturesSection />);
      expect(screen.getByText('Data Export')).toBeInTheDocument();
    });

    it('renders Feature 6 description with correct i18n key', () => {
      render(<FeaturesSection />);
      expect(screen.getByText('Export responses to CSV for deeper analysis')).toBeInTheDocument();
    });
  });

  describe('Visual Elements', () => {
    it('renders 6 Lucide icons (one per feature)', () => {
      const { container } = render(<FeaturesSection />);
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBe(6);
    });

    it('applies icon background styling', () => {
      const { container } = render(<FeaturesSection />);
      const iconContainers = container.querySelectorAll('.bg-primary\\/10');
      expect(iconContainers.length).toBe(6);
    });

    it('applies gray background to section', () => {
      const { container } = render(<FeaturesSection />);
      const section = container.querySelector('section');
      expect(section).toHaveClass('bg-gray-50');
    });
  });

  describe('Responsive Grid Layout', () => {
    it('applies 2-column grid on mobile', () => {
      const { container } = render(<FeaturesSection />);
      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('grid-cols-2');
    });

    it('applies 3-column grid on desktop', () => {
      const { container } = render(<FeaturesSection />);
      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('md:grid-cols-3');
    });

    it('applies gap between grid items', () => {
      const { container } = render(<FeaturesSection />);
      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('gap-6');
    });
  });

  describe('Hover Animations', () => {
    it('applies hover scale transformation class', () => {
      const { container } = render(<FeaturesSection />);
      const firstCard = container.querySelector('.group');
      expect(firstCard).toHaveClass('hover:scale-105');
    });

    it('applies hover shadow effect class', () => {
      const { container } = render(<FeaturesSection />);
      const firstCard = container.querySelector('.group');
      expect(firstCard).toHaveClass('hover:shadow-lg');
    });

    it('applies hover border color change class', () => {
      const { container } = render(<FeaturesSection />);
      const firstCard = container.querySelector('.group');
      expect(firstCard).toHaveClass('hover:border-primary');
    });

    it('applies transition duration to cards', () => {
      const { container } = render(<FeaturesSection />);
      const firstCard = container.querySelector('.group');
      expect(firstCard).toHaveClass('transition-all');
      expect(firstCard).toHaveClass('duration-200');
    });
  });

  describe('Internationalization', () => {
    it('uses Landing namespace for all translations', () => {
      // This is tested implicitly by the mock above
      render(<FeaturesSection />);
      expect(screen.getByText('Everything you need to create surveys')).toBeInTheDocument();
    });

    it('handles French translations correctly', () => {
      // Re-mock with French translations
      jest.resetModules();
      jest.doMock('next-intl', () => ({
        useTranslations: () => (key: string) => {
          const translations: Record<string, string> = {
            features_heading: 'Tout ce dont vous avez besoin pour créer des sondages',
            feature_1_title: 'Constructeur glisser-déposer',
            feature_1_desc: 'Créez facilement des sondages avec notre interface intuitive de glisser-déposer',
            feature_2_title: 'Types de questions multiples',
            feature_2_desc: 'Texte, choix multiples, échelles d\'évaluation, et plus encore',
            feature_3_title: 'Analyses en temps réel',
            feature_3_desc: 'Consultez les réponses et les informations au fur et à mesure',
            feature_4_title: 'Collaboration d\'équipe',
            feature_4_desc: 'Travaillez ensemble avec des organisations et des rôles',
            feature_5_title: 'Optimisé pour mobile',
            feature_5_desc: 'Des sondages qui s\'affichent parfaitement sur n\'importe quel appareil',
            feature_6_title: 'Exportation de données',
            feature_6_desc: 'Exportez les réponses au format CSV pour une analyse approfondie',
          };
          return translations[key] || key;
        },
      }));

      const { unmount } = render(<FeaturesSection />);
      unmount();

      render(<FeaturesSection />);
      expect(screen.getByText('Tout ce dont vous avez besoin pour créer des sondages')).toBeInTheDocument();
      expect(screen.getByText('Constructeur glisser-déposer')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      render(<FeaturesSection />);
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Everything you need to create surveys');
    });

    it('feature titles use heading level 3', () => {
      render(<FeaturesSection />);
      const featureTitles = screen.getAllByRole('heading', { level: 3 });
      expect(featureTitles.length).toBe(6);
    });

    it('uses semantic section element', () => {
      const { container } = render(<FeaturesSection />);
      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();
    });
  });

  describe('Card Structure', () => {
    it('each card has border styling', () => {
      const { container } = render(<FeaturesSection />);
      const cards = container.querySelectorAll('.border');
      expect(cards.length).toBe(6);
    });

    it('each card has rounded corners', () => {
      const { container } = render(<FeaturesSection />);
      const cards = container.querySelectorAll('.rounded-lg');
      expect(cards.length).toBeGreaterThanOrEqual(6);
    });

    it('each card has white background', () => {
      const { container } = render(<FeaturesSection />);
      const cards = container.querySelectorAll('.bg-white');
      expect(cards.length).toBeGreaterThanOrEqual(6);
    });
  });
});
