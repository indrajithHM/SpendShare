export interface UPIData {
  payeeAddress: string;
  payeeName?: string;
  amount?: string;
  currency?: string;
  transactionNote?: string;
}

export function parseUPIQR(qrData: string): UPIData | null {
  try {
    // Handle different QR formats
    let upiString = qrData;

    // If it's a full URL, extract the query part
    if (upiString.startsWith('upi://')) {
      const url = new URL(upiString);
      const params = new URLSearchParams(url.search);

      return {
        payeeAddress: params.get('pa') || '',
        payeeName: params.get('pn') || '',
        amount: params.get('am') || '',
        currency: params.get('cu') || 'INR',
        transactionNote: params.get('tn') || '',
      };
    }

    // If it's just the query string format
    if (upiString.includes('pa=')) {
      const params = new URLSearchParams(upiString);
      return {
        payeeAddress: params.get('pa') || '',
        payeeName: params.get('pn') || '',
        amount: params.get('am') || '',
        currency: params.get('cu') || 'INR',
        transactionNote: params.get('tn') || '',
      };
    }

    return null;
  } catch (error) {
    console.error('Error parsing UPI QR:', error);
    return null;
  }
}

export function generateUPILink(upiData: UPIData): string {
  const params = new URLSearchParams();
  params.set('pa', upiData.payeeAddress);
  if (upiData.payeeName) params.set('pn', upiData.payeeName);
  if (upiData.amount) params.set('am', upiData.amount);
  if (upiData.currency) params.set('cu', upiData.currency);
  if (upiData.transactionNote) params.set('tn', upiData.transactionNote);

  return `upi://pay?${params.toString()}`;
}

export const UPI_APPS = [
  {
    name: 'Google Pay',
    scheme: 'tez',
    package: 'com.google.android.apps.nbu.paisa.user',
    iconSrc: 'https://cdn.simpleicons.org/googlepay/4285f4',
    icon: '💰',
  },
  // {
  //   name: 'CRED',
  //   scheme: 'credpay',
  //   package: 'com.getcred',
  //   icon: '🧾',
  // },
  {
    name: 'Paytm',
    scheme: 'paytmmp',
    package: 'net.one97.paytm',
    iconSrc: 'https://cdn.simpleicons.org/paytm/0038ff',
    icon: '💳',
  },
  {
    name: 'PhonePe',
    scheme: 'phonepe',
    package: 'com.phonepe.app',
    iconSrc: 'https://cdn.simpleicons.org/phonepe/4f46e5',
    icon: '📱',
  },
  {
    name: 'BHIM UPI',
    scheme: 'bhim',
    package: 'in.org.npci.upiapp',
    icon: '🏦',
  },
  {
    name: 'Amazon Pay',
    scheme: 'amazonpay',
    package: 'in.amazon.mShop.android.shopping',
    icon: '📦',
  },
  {
    name: 'WhatsApp Pay',
    scheme: 'whatsapp',
    package: 'com.whatsapp',
    iconSrc: 'https://cdn.simpleicons.org/whatsapp/25d366',
    icon: '💬',
  },
];
export function generateAppSpecificUPILink(upiData: UPIData, appScheme: string): string {
  const params = new URLSearchParams();
  params.set('pa', upiData.payeeAddress);
  if (upiData.payeeName) params.set('pn', upiData.payeeName);
  if (upiData.amount) params.set('am', upiData.amount);
  if (upiData.currency) params.set('cu', upiData.currency || 'INR');
  if (upiData.transactionNote) params.set('tn', upiData.transactionNote);

  const app = UPI_APPS.find(a => a.scheme === appScheme);

  // Android Intent URL — works for GPay, PhonePe, Paytm, etc.
  if (app?.package) {
    return `intent://pay?${params.toString()}#Intent;scheme=upi;package=${app.package};S.browser_fallback_url=https://play.google.com/store/apps/details?id=${app.package};end`;
  }

  return `upi://pay?${params.toString()}`;
}

export function openUPIPayment(upiData: UPIData, appScheme?: string): void {
  const link = appScheme
    ? generateAppSpecificUPILink(upiData, appScheme)
    : generateUPILink(upiData);

  window.location.href = link; // Use location.href — better for intent:// URLs on Android
}