export const QUIZ_STORAGE_KEY = "nbk.quiz.v1";
export const DATA_STORAGE_KEY = "nbk.data.v1";

export type QuizState = {
  q1: "platform" | "direct" | "long_term";
  q2City: string;
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
