import { QuizClient } from "@/components/quiz/quiz-client";

export const metadata = {
  title: "Quiz — najembezkary.pl",
  description: "Sprawdź, czy obowiązuje Cię rejestracja najmu krótkoterminowego.",
};

export default function QuizPage() {
  return (
    <div className="min-h-screen bg-white">
      <QuizClient />
    </div>
  );
}
