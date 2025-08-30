"use client";

import { useState } from "react";
import Link from "next/link";

type QuizType = "BASIC" | "FEED";

export default function CreateQuizPage() {
  const [quizType, setQuizType] = useState<QuizType>("BASIC");

  return (
    <div className="max-w-screen-md mx-auto p-4">
      <main className="space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">새 문제 만들기</h1>
          <Link
            href="/"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            &larr; 홈으로 돌아가기
          </Link>
        </header>

        <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
          {/* 문제 타입 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              문제 타입
            </label>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setQuizType("BASIC")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  quizType === "BASIC"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                BASIC
              </button>
              <button
                type="button"
                onClick={() => setQuizType("FEED")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  quizType === "FEED"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                FEED
              </button>
            </div>
          </div>

          {/* 내용 입력 */}
          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700"
            >
              내용
            </label>
            <textarea
              id="content"
              rows={5}
              placeholder="퀴즈 내용을 상세히 입력하세요"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 상금 입력 */}
          <div>
            <label
              htmlFor="prize"
              className="block text-sm font-medium text-gray-700"
            >
              정답
            </label>
            <input
              type="number"
              id="prize"
              placeholder="0.1"
              step="answer"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 제출 버튼 */}
          <button
            type="button"
            className="w-full justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            퀴즈 올리기
          </button>
        </div>
      </main>
    </div>
  );
}
