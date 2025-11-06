import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'Can I change my plan later?',
    answer: 'Yes! You can upgrade or downgrade your plan at any time from your billing dashboard.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, Apple Pay, and Google Pay through Stripe.',
  },
  {
    question: 'Is there a free trial?',
    answer: 'Yes, new users get a 14-day free trial of the Pro plan. No credit card required.',
  },
  {
    question: 'What happens if I exceed my survey limit?',
    answer: "You'll be prompted to upgrade to a higher tier. Your existing surveys will remain accessible.",
  },
  {
    question: 'Can I cancel anytime?',
    answer: "Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.",
  },
  {
    question: 'Do you offer refunds?',
    answer: 'We offer a 30-day money-back guarantee for annual subscriptions.',
  },
];

export function PricingFAQ() {
  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-8">
        Frequently Asked Questions
      </h2>
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent>{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
