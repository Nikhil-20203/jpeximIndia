// MVC MODEL: Trade Protocols Data Types & Specifications
export interface Incoterm {
  code: string;
  name: string;
  description: string;
}

export interface PaymentTerm {
  name: string;
  description: string;
  details: string[];
}

export interface ExportDocument {
  id: number;
  name: string;
  description: string;
  subItems?: string[];
}

export interface ValueBadge {
  name: string;
  icon: string;
}

// Concrete data model representations matching the corporate screenshots
export const INCOTERMS_DATA: Incoterm[] = [
  { code: 'EXW', name: 'Ex Works', description: 'Buyer arranges pickup directly from our Deesa / Gujarat storage facility.' },
  { code: 'FCA', name: 'Free Carrier', description: 'We deliver custom-cleared goods to your nominated shipping carrier.' },
  { code: 'FAS', name: 'Free Alongside Ship', description: 'Goods placed next to the buyer\'s vessel at loading port (e.g., Mundra).' },
  { code: 'FOB', name: 'Free On Board', description: 'We clear customs and load goods onto the vessel. Our most recommended term.' },
  { code: 'CFR', name: 'Cost and Freight', description: 'We pay freight costs to the destination port; buyer arranges marine insurance.' },
  { code: 'CIF', name: 'Cost, Insurance & Freight', description: 'Complete transit cover. We arrange freight & premium insurance to your port.' },
  { code: 'CPT', name: 'Carriage Paid To', description: 'We deliver to carrier and pay carriage costs to agreed destination.' },
  { code: 'CIP', name: 'Carriage and Insurance Paid To', description: 'We pay transport and full insurance coverage to destination.' },
  { code: 'DAP', name: 'Delivered at Place', description: 'We deliver to your specified country destination, ready for unloading.' },
  { code: 'DPU', name: 'Delivered at Place Unloaded', description: 'We deliver and unload goods at the designated destination point.' },
  { code: 'DDP', name: 'Delivered Duty Paid', description: 'We handle freight, insurance, and import duties to your facility.' }
];

export const PAYMENT_TERMS_DATA: PaymentTerm[] = [
  {
    name: 'Advance Payment (T/T)',
    description: 'Telegraphic Transfer through central banking channels.',
    details: [
      'Standard trade terms (e.g. 30% advance upon contract signature).',
      'Remaining 70% payable immediately against scanned copies of original Bill of Lading.',
      'Operates securely under RBI (Reserve Bank of India) guidelines.'
    ]
  },
  {
    name: 'Letter of Credit (L/C at Sight)',
    description: '100% Confirmed, Irrevocable Letter of Credit payable at sight.',
    details: [
      'Must be issued by a reputable Tier-1 international bank.',
      'Requires strict presentation of compliance documents matching L/C terms perfectly.',
      'Ensures risk-free trading for both global importers and export houses.'
    ]
  }
];

export const EXPORT_DOCUMENTS_DATA: ExportDocument[] = [
  { id: 1, name: 'Commercial Invoice', description: 'Detailed itemized invoice indicating HS Codes, weight, value, and grading.' },
  { id: 2, name: 'Packing List', description: 'Comprehensive container content breakdown, listing net and gross weight details.' },
  { id: 3, name: 'Certificate of Origin (COO)', description: 'Authenticated regional chamber verification proving rich Gujarat cultivation origin.' },
  {
    id: 4,
    name: 'Transport Document',
    description: 'Provided precisely in accordance with the specified mode of shipment:',
    subItems: [
      'B/L (Bill of Lading) - for Sea Freight',
      'AWB (Air Waybill) - for Air Cargo',
      'LR (Lorry Receipt) - for Road Transport',
      'RR (Railway Receipt) - for Rail Sourcing'
    ]
  },
  { id: 5, name: 'Inspection Certificate', description: 'Verified third-party weight, grading, and aflatoxin report (e.g., SGS, Geo-Chem).' },
  { id: 6, name: 'Insurance Certificate', description: 'Full marine coverage policy copy, applicable automatically for all CIF shipments.' },
  { id: 7, name: 'Additional Documents', description: 'Custom country certifications (Phytosanitary, health certificates) per buyer\'s requirement.' }
];

export const VALUE_BADGES_DATA: ValueBadge[] = [
  { name: 'Complete Documentation', icon: 'description' },
  { name: 'Secure Payment', icon: 'gpp_good' },
  { name: 'Global Trade', icon: 'language' },
  { name: 'Trusted Partner', icon: 'handshake' },
  { name: 'On Time Delivery', icon: 'schedule' }
];
