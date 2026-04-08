export const QUIZ_STORAGE_KEY = "najembezkary_quiz";

export type Q1Value = "platform" | "direct" | "long_term";
export type Q3Value = "up_to_4" | "5_to_10" | "above_10";
export type Q4Value = "owner" | "subtenant" | "manager";
export type Q5Value = "no_number" | "unknown" | "has_number";

export type RegistrationType = "pelna" | "uproszczona" | "brak";

export interface QuizAnswers {
  /** Liczba mieszkań / lokali (pierwsze pytanie) — zapis jako liczba całkowita w stringu */
  q0_apartments?: string;
  q1: Q1Value;
  q2_city: string;
  /** Kod TERYT wybranej gminy (z autocomplete), jeśli użytkownik wybrał z listy */
  q2_teryt_code?: string;
  q3: Q3Value;
  q4: Q4Value;
  q5: Q5Value;
}

/** Zapis zgodny z polami formularza zamówienia / Supabase */
export interface QuizSessionPayload {
  quiz_answers: Record<string, string>;
  requires_registration: boolean;
  registration_type: RegistrationType;
}

export function buildSessionPayload(
  answers: Partial<QuizAnswers>,
  requires_registration: boolean,
  registration_type: RegistrationType
): QuizSessionPayload {
  const quiz_answers: Record<string, string> = {};
  if (answers.q0_apartments) quiz_answers.q0_apartments = answers.q0_apartments;
  if (answers.q1) quiz_answers.q1 = answers.q1;
  if (answers.q2_city) quiz_answers.q2_city = answers.q2_city;
  if (answers.q2_teryt_code)
    quiz_answers.q2_teryt_code = answers.q2_teryt_code;
  if (answers.q3) quiz_answers.q3 = answers.q3;
  if (answers.q4) quiz_answers.q4 = answers.q4;
  if (answers.q5) quiz_answers.q5 = answers.q5;
  return {
    quiz_answers,
    requires_registration,
    registration_type,
  };
}
