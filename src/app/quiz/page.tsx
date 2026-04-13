import { QuizClient } from "@/components/quiz/quiz-client";

export const metadata = {
  title: "Ankieta rejestracyjna – Sprawdź obowiązek | najembezkary.pl",
  description:
    "Wypełnij krótką ankietę i sprawdź, czy Twój lokal podlega obowiązkowi rejestracji najmu krótkoterminowego. Wynik w kilka sekund.",
};

export default function QuizPage() {
  return (
    <div className="min-h-screen bg-white">
      <QuizClient />
    </div>
  );
}
