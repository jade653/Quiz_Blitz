"use client"; // 상태에 따라 UI가 바뀌므로 클라이언트 컴포넌트로 변경합니다.
import Link from "next/link";

// 퀴즈 데이터와 상태에 대한 타입을 정의합니다. (Home 페이지와 동일)
type QuizStatus = "JOIN" | "REVEAL" | "ANSWER" | "ENDED";

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

// 상세 페이지를 위한 예시 퀴즈 데이터
const mockQuizzes: {
  id: number;
  title: string;
  status: QuizStatus;
  prize: string;
  content: string;
  finalAnswer: string;
}[] = [
  {
    id: 1,
    title: "간단 산수 퀴즈",
    status: "JOIN" as QuizStatus,
    prize: "0.1 MON",
    content: "1 + 1 = ?",
    finalAnswer: "2",
  },
  {
    id: 2,
    title: "수도 맞추기",
    status: "REVEAL" as QuizStatus,
    prize: "0.2 MON",
    content: "대한민국의 수도는 어디일까요?",
    finalAnswer: "서울",
  },
  {
    id: 3,
    title: "O/X 퀴즈",
    status: "ANSWER" as QuizStatus,
    prize: "0.1 MON",
    content: "지구는 둥글다. (O/X)",
    finalAnswer: "O",
  },
  {
    id: 4,
    title: "동물 이름 맞추기",
    status: "ENDED" as QuizStatus,
    prize: "0.3 MON",
    content: "세상에서 가장 큰 육상 동물은?",
    finalAnswer: "코끼리",
  },
];

// 퀴즈 상태에 따라 다른 UI를 렌더링하는 컴포넌트
const QuizActionArea = ({ quiz }: { quiz: (typeof mockQuizzes)[0] }) => {
  switch (quiz.status) {
    case "JOIN":
      return (
        <div className="border-t border-slate-200 pt-6 space-y-3 text-center">
          <p className="text-slate-600">퀴즈에 참여하여 상금에 도전하세요!</p>
          <button
            type="button"
            className="w-full justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-500 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          >
            참여하기 (0.1 MON)
          </button>
        </div>
      );
    case "ANSWER":
      return (
        <div className="border-t border-slate-200 pt-6 space-y-3">
          <label
            htmlFor="answer"
            className="block text-sm font-medium text-slate-700"
          >
            정답 제출
          </label>
          <input
            type="text"
            id="answer"
            placeholder="정답을 입력하세요..."
            className="mt-1 block w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <button
            type="button"
            className="w-full justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
          >
            제출하기
          </button>
        </div>
      );
    case "ENDED":
      return (
        <div className="border-t border-slate-200 pt-6 text-center space-y-4">
          <p className="text-lg font-semibold text-slate-500">
            종료된 퀴즈입니다.
          </p>
          <div className="bg-slate-100 p-4 rounded-md text-left">
            <p className="text-sm text-slate-600 font-medium">최종 정답</p>
            <p className="text-base font-bold text-slate-800 mt-1">
              {quiz.finalAnswer}
            </p>
          </div>
        </div>
      );
    default: // REVEAL 및 기타 상태
      return (
        <div className="border-t border-slate-200 pt-6 text-center">
          <p className="text-lg text-slate-500">결과를 기다리는 중입니다...</p>
        </div>
      );
  }
};

export default function QuizDetailPage({
  params,
}: {
  params: { quiz_id: string };
}) {
  // params.quiz_id를 사용하여 실제 데이터를 가져올 수 있습니다.
  const quizId = parseInt(params.quiz_id, 10);
  const quiz = mockQuizzes.find((q) => q.id === quizId);

  if (!quiz) {
    return (
      <div className="max-w-screen-md mx-auto p-4">
        <div className="flex items-center justify-center h-80 bg-white rounded-lg shadow-md">
          <p className="text-lg text-slate-500">
            퀴즈를 찾을 수 없습니다.
            <Link href="/" className="text-sky-600 hover:underline ml-2">
              홈으로
            </Link>
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-screen-md mx-auto p-4">
      <main className="space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">퀴즈 상세</h1>
          <Link
            href="/"
            className="text-sm font-medium text-sky-600 hover:underline"
          >
            &larr; 홈으로 돌아가기
          </Link>
        </header>

        <div className="bg-white/70 backdrop-blur-md p-6 rounded-xl shadow-lg border border-slate-200/80 space-y-6">
          {/* 퀴즈 헤더: 상태, 제목, 상금 */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getBadgeStyles(
                  quiz.status
                )}`}
              >
                {quiz.status}
              </span>
              <h2 className="mt-2 text-2xl font-bold text-slate-800">
                {quiz.title}
              </h2>
            </div>
            <div className="text-left sm:text-right flex-shrink-0">
              <p className="text-sm text-slate-500">상금</p>
              <p className="text-2xl font-bold text-sky-600">{quiz.prize}</p>
            </div>
          </div>

          {/* 퀴즈 내용 */}
          {quiz.status !== "JOIN" ? (
            <div className="border-t border-slate-200 pt-6">
              <p className="text-slate-600 leading-relaxed">{quiz.content}</p>
            </div>
          ) : (
            <div className="border-t border-slate-200 pt-6 text-center flex items-center justify-center h-24 bg-slate-50 rounded-lg">
              <p className="text-slate-500 font-medium">
                🔒 퀴즈에 참여하면 내용을 확인할 수 있습니다.
              </p>
            </div>
          )}

          <QuizActionArea quiz={quiz} />
        </div>
      </main>
    </div>
  );
}
