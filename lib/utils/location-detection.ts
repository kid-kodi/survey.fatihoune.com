/**
 * Location detection utility for suggesting payment methods
 */

type PaymentProvider = 'stripe' | 'wave' | 'orange_money';

// West African countries (XOF currency zone)
const WEST_AFRICAN_COUNTRIES = [
  'SN', // Senegal
  'CI', // Côte d'Ivoire
  'ML', // Mali
  'BF', // Burkina Faso
  'BJ', // Benin
  'TG', // Togo
  'NE', // Niger
];

// African countries where Wave/Orange Money is popular
const AFRICAN_COUNTRIES = [
  'SN', // Senegal
  'CI', // Côte d'Ivoire
  'ML', // Mali
  'BF', // Burkina Faso
  'BJ', // Benin
  'TG', // Togo
  'NE', // Niger
  'CM', // Cameroon
  'GN', // Guinea
  'CD', // Congo
  'MG', // Madagascar
  'GA', // Gabon
  'TN', // Tunisia
  'EG', // Egypt
  'MA', // Morocco
  'DZ', // Algeria
  'GH', // Ghana
  'NG', // Nigeria
  'KE', // Kenya
  'TZ', // Tanzania
  'UG', // Uganda
  'RW', // Rwanda
];

// European countries (EUR currency zone)
const EUROPEAN_COUNTRIES = [
  'AT', // Austria
  'BE', // Belgium
  'CY', // Cyprus
  'EE', // Estonia
  'FI', // Finland
  'FR', // France
  'DE', // Germany
  'GR', // Greece
  'IE', // Ireland
  'IT', // Italy
  'LV', // Latvia
  'LT', // Lithuania
  'LU', // Luxembourg
  'MT', // Malta
  'NL', // Netherlands
  'PT', // Portugal
  'SK', // Slovakia
  'SI', // Slovenia
  'ES', // Spain
];

/**
 * Get suggested payment provider based on user's location
 */
export async function getSuggestedPaymentProvider(): Promise<PaymentProvider> {
  try {
    // Try to detect location using browser geolocation API
    const location = await detectLocationFromBrowser();

    if (location && AFRICAN_COUNTRIES.includes(location)) {
      // Default to Wave for African countries
      return 'wave';
    }

    // Default to Stripe for other regions
    return 'stripe';
  } catch (error) {
    // If location detection fails, default to Stripe
    console.error('Location detection failed:', error);
    return 'stripe';
  }
}

/**
 * Detect location from browser using IP geolocation service
 */
async function detectLocationFromBrowser(): Promise<string | null> {
  try {
    // Use a free IP geolocation service
    const response = await fetch('https://ipapi.co/json/', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.country_code || null;
  } catch (error) {
    console.error('IP geolocation failed:', error);
    return null;
  }
}

/**
 * Get currency based on payment provider
 */
export function getCurrencyForProvider(provider: PaymentProvider): 'USD' | 'EUR' | 'XOF' {
  switch (provider) {
    case 'wave':
    case 'orange_money':
      return 'XOF';
    case 'stripe':
    default:
      return 'USD';
  }
}

/**
 * Detect currency based on user's location
 */
export async function detectCurrencyFromLocation(): Promise<'USD' | 'EUR' | 'XOF'> {
  try {
    const location = await detectLocationFromBrowser();

    if (location && WEST_AFRICAN_COUNTRIES.includes(location)) {
      return 'XOF';
    } else if (location && EUROPEAN_COUNTRIES.includes(location)) {
      return 'EUR';
    }

    return 'USD';
  } catch (error) {
    console.error('Currency detection failed:', error);
    return 'USD';
  }
}
