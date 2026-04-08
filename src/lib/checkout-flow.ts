export const QUIZ_STORAGE_KEY = "nbk.quiz.v1";
export const DATA_STORAGE_KEY = "nbk.data.v1";

export type MunicipalityLite = {
  teryt_code: string;
  name: string;
  full_name: string;
  type: string;
  voivodeship: string;
  office_name: string;
  office_address: string | null;
  office_phone: string | null;
  office_bip_url: string | null;
  accepts_epuap: boolean;
  accepts_mail: boolean;
  accepts_in_person: boolean;
};

export type QuizState = {
  propertyCount?: number;
  managementAuthorizationFileName?: string;
  q1: "platform" | "direct" | "long_term";
  q2City: string;
  q2TerytCode?: string;
  municipality?: MunicipalityLite;
  q3: "up_to_4" | "5_to_10" | "above_10";
  q4: "owner" | "subtenant" | "manager";
  q5: "no_number" | "unknown" | "has_number";
  requiresRegistration: boolean;
};

export type OwnerDataState = {
  fullName: string;
  pesel?: string;
  address: string;
  city: string;
  zip: string;
  phone: string;
  email: string;
  propertyAddress: string;
  propertyCity: string;
  propertyZip: string;
  propertyType: "mieszkanie" | "dom" | "apartament" | "pokoj";
  platforms: string[];
  rentalSince?: string;
  listingName?: string;
};
