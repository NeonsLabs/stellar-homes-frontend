/**
 * Countries and identity documents accepted for KYC.
 *
 * Covers the property markets StellarHomes operates in (Nigeria, Ghana, Kenya,
 * South Africa) plus the main diaspora residences, since a borrower is
 * routinely verified against a document issued where they live rather than
 * where they are building.
 *
 * The number patterns are deliberately shape-checks, not authority lookups —
 * they catch typos before a submission is sent for manual review.
 */

import type { IdDocumentType, SupportedCountry } from "@/types/kyc";

const PASSPORT_GENERIC: IdDocumentType = {
  id: "passport",
  label: "International passport",
  pattern: "^[A-Z0-9]{6,9}$",
  placeholder: "A01234567",
  hint: "The passport number printed on the bio-data page.",
  requiresBackImage: false,
};

export const SUPPORTED_COUNTRIES: SupportedCountry[] = [
  {
    code: "NG",
    name: "Nigeria",
    dialCode: "+234",
    documentTypes: [
      {
        id: "nin",
        label: "National Identification Number (NIN)",
        pattern: "^\\d{11}$",
        placeholder: "12345678901",
        hint: "11 digits, shown on your NIN slip or National ID card.",
        requiresBackImage: true,
      },
      {
        id: "bvn",
        label: "Bank Verification Number (BVN)",
        pattern: "^\\d{11}$",
        placeholder: "22123456789",
        hint: "11 digits — dial *565*0# from your registered phone number.",
        requiresBackImage: false,
      },
      {
        id: "drivers-licence",
        label: "Driver's licence",
        pattern: "^[A-Z]{3}\\d{5}[A-Z0-9]{4}$",
        placeholder: "ABC12345AB12",
        hint: "12 characters, printed on the front of the licence.",
        requiresBackImage: true,
      },
      PASSPORT_GENERIC,
    ],
  },
  {
    code: "GH",
    name: "Ghana",
    dialCode: "+233",
    documentTypes: [
      {
        id: "ghana-card",
        label: "Ghana Card",
        pattern: "^GHA-\\d{9}-\\d$",
        placeholder: "GHA-123456789-0",
        hint: "Personal ID number in the format GHA-000000000-0.",
        requiresBackImage: true,
      },
      PASSPORT_GENERIC,
    ],
  },
  {
    code: "KE",
    name: "Kenya",
    dialCode: "+254",
    documentTypes: [
      {
        id: "national-id",
        label: "National ID card",
        pattern: "^\\d{7,8}$",
        placeholder: "12345678",
        hint: "7 or 8 digits, printed on the front of the card.",
        requiresBackImage: true,
      },
      PASSPORT_GENERIC,
    ],
  },
  {
    code: "ZA",
    name: "South Africa",
    dialCode: "+27",
    documentTypes: [
      {
        id: "sa-id",
        label: "Smart ID card",
        pattern: "^\\d{13}$",
        placeholder: "8001015009087",
        hint: "13 digits, beginning with your date of birth.",
        requiresBackImage: true,
      },
      PASSPORT_GENERIC,
    ],
  },
  {
    code: "GB",
    name: "United Kingdom",
    dialCode: "+44",
    documentTypes: [
      {
        id: "uk-passport",
        label: "UK passport",
        pattern: "^\\d{9}$",
        placeholder: "123456789",
        hint: "9 digits from the bio-data page.",
        requiresBackImage: false,
      },
      {
        id: "uk-driving-licence",
        label: "Driving licence",
        pattern: "^[A-Z9]{5}\\d{6}[A-Z9]{2}[A-Z0-9]{3}$",
        placeholder: "MORGA753116SM9IJ",
        hint: "16 characters, shown in section 5 of the licence.",
        requiresBackImage: true,
      },
    ],
  },
  {
    code: "US",
    name: "United States",
    dialCode: "+1",
    documentTypes: [
      {
        id: "us-passport",
        label: "US passport",
        pattern: "^[A-Z0-9]{6,9}$",
        placeholder: "512345678",
        hint: "6-9 characters from the bio-data page.",
        requiresBackImage: false,
      },
      {
        id: "state-id",
        label: "State ID / driver's licence",
        pattern: "^[A-Z0-9]{5,20}$",
        placeholder: "D1234567",
        hint: "The licence number issued by your state DMV.",
        requiresBackImage: true,
      },
    ],
  },
  {
    code: "CA",
    name: "Canada",
    dialCode: "+1",
    documentTypes: [
      {
        id: "ca-passport",
        label: "Canadian passport",
        pattern: "^[A-Z]{2}\\d{6}$",
        placeholder: "AB123456",
        hint: "Two letters followed by six digits.",
        requiresBackImage: false,
      },
      {
        id: "ca-provincial-id",
        label: "Provincial ID / driver's licence",
        pattern: "^[A-Z0-9-]{5,20}$",
        placeholder: "A1234-56789-01234",
        hint: "The licence number issued by your province.",
        requiresBackImage: true,
      },
    ],
  },
];

/** Looks up a supported country by ISO code. */
export function getCountry(code: string): SupportedCountry | undefined {
  return SUPPORTED_COUNTRIES.find((country) => country.code === code);
}

/** Looks up a document type within a country. */
export function getDocumentType(
  countryCode: string,
  documentTypeId: string,
): IdDocumentType | undefined {
  return getCountry(countryCode)?.documentTypes.find(
    (document) => document.id === documentTypeId,
  );
}
