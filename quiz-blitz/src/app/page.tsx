"use client";
import Link from "next/link";
import ConnectWallet from "./ConnectWallet";

// 퀴즈 데이터와 상태에 대한 타입을 정의합니다.
type QuizStatus = "JOIN" | "REVEAL" | "ANSWER" | "ENDED";
interface Quiz {
  id: number;
  title: string;
  status: QuizStatus;
  prize: string;
}

// 명예의 전당 수상자 데이터 타입 정의
interface Winner {
  rank: number;
  address: string;
  correctAnswers: number;
}

// 퀴즈 목록 예시 데이터입니다.
const quizzes: Quiz[] = [
  { id: 1, title: "간단 산수 퀴즈", status: "JOIN", prize: "0.1 MON" },
  { id: 2, title: "수도 맞추기", status: "REVEAL", prize: "0.2 MON" },
  { id: 3, title: "O/X 퀴즈", status: "ANSWER", prize: "0.1 MON" },
  { id: 4, title: "동물 이름 맞추기", status: "ENDED", prize: "0.3 MON" },
];

// 수상자 목록 예시 데이터
const topWinners: Winner[] = [
  { rank: 1, address: "0x1A2b...c3D4", correctAnswers: 98 },
  { rank: 2, address: "0x5E6f...g7H8", correctAnswers: 95 },
  { rank: 3, address: "0x9I0j...k1L2", correctAnswers: 92 },
  { rank: 4, address: "0x3M4n...o5P6", correctAnswers: 89 },
  { rank: 5, address: "0x7Q8r...s9T0", correctAnswers: 85 },
  { rank: 6, address: "0x1U2v...w3X4", correctAnswers: 81 },
  { rank: 7, address: "0x5Y6z...a1B2", correctAnswers: 78 },
  { rank: 8, address: "0x3C4d...e5F6", correctAnswers: 77 },
  { rank: 9, address: "0x7G8h...i9J0", correctAnswers: 76 },
  { rank: 10, address: "0x1K2l...m3N4", correctAnswers: 75 },
];

// 상태에 따라 배지 스타일을 반환하는 헬퍼 함수입니다.
const getBadgeStyles = (status: QuizStatus) => {
  switch (status) {
    case "JOIN":
      return "bg-teal-100 text-teal-800 ring-1 ring-inset ring-teal-600/20";
    case "REVEAL":
      return "bg-sky-100 text-sky-800 ring-1 ring-inset ring-sky-600/20";
    case "ANSWER":
      return "bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-600/20";
    case "ENDED":
      return "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/20";
    default:
      return "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/20";
  }
};

export default function HomePage() {
  return (
    <div className="max-w-screen-md mx-auto p-4 min-h-screen">
      <main className="space-y-8">
        <header className="flex justify-between items-center py-4">
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-rose-400 to-sky-500 bg-clip-text text-transparent">
            Quiz Blitz
          </h1>
          <div className="flex items-center gap-4">
            <Link
              href="/create"
              className="flex items-center gap-2 bg-sky-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-sky-600 hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1-0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              새 문제 만들기
            </Link>
          </div>
        </header>
        <ConnectWallet />

        {/* 명예의 전당 섹션 */}
        <section className="bg-white/70 backdrop-blur-md p-4 rounded-xl shadow-lg border border-slate-200/80">
          <h2 className="text-xl font-bold text-slate-800 mb-3 border-b border-slate-200 pb-2">
            🏆 Winners
          </h2>
          <ol className="space-y-1">
            {topWinners.slice(0, 5).map((winner) => (
              <li
                key={winner.rank}
                className="flex items-center justify-between p-2 rounded-md hover:bg-rose-50/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-base font-bold text-amber-500 w-6 text-center">
                    {winner.rank}
                  </span>
                  <span className="font-mono text-xs text-slate-500">
                    {winner.address}
                  </span>
                </div>
                <span className="text-sm font-medium text-teal-600">
                  {winner.correctAnswers} corrects
                </span>
              </li>
            ))}
          </ol>
        </section>

        {/* 전체 상금 풀 섹션 */}
        <div className="bg-white/70 backdrop-blur-md p-4 rounded-xl shadow-lg border border-slate-200/80 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-800">총 상금 풀</h3>
          <p className="text-2xl font-bold bg-gradient-to-r from-rose-400 to-sky-500 bg-clip-text text-transparent">
            940.24 MON
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {quizzes.map((quiz) => (
            <Link
              href={`/quiz/${quiz.id}`}
              key={quiz.id}
              className="block group transition-transform duration-300 ease-out hover:!scale-105"
            >
              <div className="p-3 bg-white/60 backdrop-blur-md rounded-xl shadow-lg border border-slate-200/80 group-hover:shadow-xl group-hover:shadow-rose-200/50 transition-all duration-300 aspect-square">
                <div className="flex flex-col justify-between h-full">
                  <div>
                    {quiz.status === "JOIN" ? (
                      <div>
                        <p className="text-sm text-slate-500">상금</p>
                        <p className="text-2xl font-bold text-sky-500">
                          {quiz.prize}
                        </p>
                      </div>
                    ) : (
                      <h3 className="text-base font-semibold text-slate-700 leading-tight">
                        {quiz.title}
                      </h3>
                    )}
                  </div>
                  <div className="flex justify-end">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${getBadgeStyles(
                        quiz.status
                      )}`}
                    >
                      {quiz.status}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
