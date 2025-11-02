type QuestionType = "multiple_choice" | "text_input" | "rating_scale" | "checkbox" | "dropdown" | "yes_no";

export type TemplateQuestion = {
  type: QuestionType;
  text: string;
  required: boolean;
  options: {
    choices?: string[];
    min?: number;
    max?: number;
    minLabel?: string;
    maxLabel?: string;
    placeholder?: string;
  };
};

export type SurveyTemplate = {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  questions: TemplateQuestion[];
};

export const SURVEY_TEMPLATES: SurveyTemplate[] = [
  {
    id: "customer-feedback",
    name: "Customer Feedback",
    description: "Gather feedback about your product or service from customers",
    category: "Business",
    icon: "MessageSquare",
    questions: [
      {
        type: "rating_scale",
        text: "How satisfied are you with our product/service?",
        required: true,
        options: {
          min: 1,
          max: 5,
          minLabel: "Very Dissatisfied",
          maxLabel: "Very Satisfied",
        },
      },
      {
        type: "rating_scale",
        text: "How likely are you to recommend us to a friend or colleague?",
        required: true,
        options: {
          min: 0,
          max: 10,
          minLabel: "Not at all likely",
          maxLabel: "Extremely likely",
        },
      },
      {
        type: "multiple_choice",
        text: "What is the primary reason for your score?",
        required: false,
        options: {
          choices: [
            "Quality of product/service",
            "Customer support",
            "Price/value",
            "Ease of use",
            "Other",
          ],
        },
      },
      {
        type: "text_input",
        text: "What could we do to improve your experience?",
        required: false,
        options: {
          placeholder: "Please share your suggestions...",
        },
      },
      {
        type: "yes_no",
        text: "Would you like us to follow up with you about your feedback?",
        required: false,
        options: {},
      },
    ],
  },
  {
    id: "employee-satisfaction",
    name: "Employee Satisfaction",
    description: "Measure employee engagement and workplace satisfaction",
    category: "HR",
    icon: "Users",
    questions: [
      {
        type: "rating_scale",
        text: "How satisfied are you with your current role?",
        required: true,
        options: {
          min: 1,
          max: 5,
          minLabel: "Very Dissatisfied",
          maxLabel: "Very Satisfied",
        },
      },
      {
        type: "rating_scale",
        text: "How would you rate your work-life balance?",
        required: true,
        options: {
          min: 1,
          max: 5,
          minLabel: "Poor",
          maxLabel: "Excellent",
        },
      },
      {
        type: "checkbox",
        text: "Which aspects of your job are you most satisfied with? (Select all that apply)",
        required: false,
        options: {
          choices: [
            "Compensation and benefits",
            "Career growth opportunities",
            "Work environment",
            "Team collaboration",
            "Management support",
            "Work-life balance",
          ],
        },
      },
      {
        type: "multiple_choice",
        text: "How would you describe the company culture?",
        required: false,
        options: {
          choices: [
            "Collaborative and supportive",
            "Competitive and driven",
            "Innovative and creative",
            "Traditional and structured",
            "Other",
          ],
        },
      },
      {
        type: "text_input",
        text: "What suggestions do you have for improving our workplace?",
        required: false,
        options: {
          placeholder: "Your ideas matter to us...",
        },
      },
      {
        type: "yes_no",
        text: "Would you recommend this company as a great place to work?",
        required: true,
        options: {},
      },
    ],
  },
  {
    id: "event-planning",
    name: "Event Planning",
    description: "Collect attendee preferences and information for event planning",
    category: "Events",
    icon: "Calendar",
    questions: [
      {
        type: "yes_no",
        text: "Will you be attending the event?",
        required: true,
        options: {},
      },
      {
        type: "dropdown",
        text: "How many guests will you bring?",
        required: true,
        options: {
          choices: ["Just me", "1 guest", "2 guests", "3 or more guests"],
        },
      },
      {
        type: "checkbox",
        text: "Which event activities are you interested in? (Select all that apply)",
        required: false,
        options: {
          choices: [
            "Keynote presentations",
            "Networking sessions",
            "Workshops",
            "Panel discussions",
            "Social mixer",
          ],
        },
      },
      {
        type: "multiple_choice",
        text: "Do you have any dietary restrictions?",
        required: true,
        options: {
          choices: [
            "No restrictions",
            "Vegetarian",
            "Vegan",
            "Gluten-free",
            "Other (please specify below)",
          ],
        },
      },
      {
        type: "text_input",
        text: "If you selected 'Other' for dietary restrictions, please specify:",
        required: false,
        options: {
          placeholder: "Please describe your dietary needs...",
        },
      },
      {
        type: "text_input",
        text: "Any special accommodations or requests?",
        required: false,
        options: {
          placeholder: "Let us know how we can make your experience better...",
        },
      },
    ],
  },
  {
    id: "product-survey",
    name: "Product Survey",
    description: "Gather insights about product usage and feature preferences",
    category: "Product",
    icon: "Package",
    questions: [
      {
        type: "multiple_choice",
        text: "How often do you use our product?",
        required: true,
        options: {
          choices: [
            "Daily",
            "Weekly",
            "Monthly",
            "Rarely",
            "First time user",
          ],
        },
      },
      {
        type: "checkbox",
        text: "Which features do you use most frequently? (Select all that apply)",
        required: false,
        options: {
          choices: [
            "Core functionality",
            "Reporting/Analytics",
            "Integrations",
            "Mobile app",
            "API access",
          ],
        },
      },
      {
        type: "rating_scale",
        text: "How easy is our product to use?",
        required: true,
        options: {
          min: 1,
          max: 5,
          minLabel: "Very Difficult",
          maxLabel: "Very Easy",
        },
      },
      {
        type: "text_input",
        text: "What features would you like to see added?",
        required: false,
        options: {
          placeholder: "Share your ideas...",
        },
      },
      {
        type: "yes_no",
        text: "Would you be interested in beta testing new features?",
        required: false,
        options: {},
      },
    ],
  },
  {
    id: "nps-survey",
    name: "Net Promoter Score (NPS)",
    description: "Measure customer loyalty with the industry-standard NPS metric",
    category: "Business",
    icon: "TrendingUp",
    questions: [
      {
        type: "rating_scale",
        text: "On a scale of 0-10, how likely are you to recommend our company to a friend or colleague?",
        required: true,
        options: {
          min: 0,
          max: 10,
          minLabel: "Not at all likely",
          maxLabel: "Extremely likely",
        },
      },
      {
        type: "text_input",
        text: "What is the primary reason for your score?",
        required: true,
        options: {
          placeholder: "Please explain your rating...",
        },
      },
      {
        type: "text_input",
        text: "What could we do to improve your experience?",
        required: false,
        options: {
          placeholder: "Your feedback helps us improve...",
        },
      },
    ],
  },
];

export function getTemplateById(id: string): SurveyTemplate | undefined {
  return SURVEY_TEMPLATES.find((template) => template.id === id);
}

export function getTemplatesByCategory(category: string): SurveyTemplate[] {
  return SURVEY_TEMPLATES.filter((template) => template.category === category);
}
