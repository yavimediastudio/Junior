import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, XCircle, Trophy, RotateCcw, Award } from 'lucide-react';
import { QUIZ_QUESTIONS } from '../data/juniorData';
import { calculateQuizRank, playStadiumAudio } from '../utils/footballLogic';

interface QuizSectionProps {
  audioEnabled: boolean;
}

export const QuizSection: React.FC<QuizSectionProps> = ({ audioEnabled }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const currentQ = QUIZ_QUESTIONS[currentIndex];

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    const isCorrect = idx === currentQ.correctIndex;
    if (isCorrect) {
      setScore((prev) => prev + 1);
      if (audioEnabled) {
        playStadiumAudio('cheer');
      }
    } else {
      if (audioEnabled) {
        playStadiumAudio('whistle');
      }
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < QUIZ_QUESTIONS.length) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setQuizFinished(true);
    }
  };

  const resetQuiz = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setQuizFinished(false);
  };

  const rank = calculateQuizRank(score, QUIZ_QUESTIONS.length);

  return (
    <section id="trivia" className="py-16 bg-slate-900/60 border-b border-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-500 mb-2">
            <HelpCircle className="w-4 h-4" />
            <span>Desafío para Hinchas Fieles</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold uppercase text-white tracking-tight">
            Trivia & Desafío Tiburón
          </h2>
          <p className="text-xs text-slate-400 mt-2">
            Demuestra cuánto sabes de los 100 años del club, las 10 estrellas, los goles del Bombardero y las gestas en El Metro.
          </p>
        </div>

        {/* Quiz Container */}
        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-2xl">
          {!quizFinished ? (
            <div>
              {/* Progress Bar & Score */}
              <div className="flex items-center justify-between text-xs text-slate-400 pb-4 border-b border-slate-800 mb-6">
                <span className="font-mono font-bold text-red-400">
                  Pregunta {currentIndex + 1} de {QUIZ_QUESTIONS.length}
                </span>
                <span className="font-mono tabular-nums text-slate-300">
                  Aciertos: <strong className="text-white">{score}</strong>
                </span>
              </div>

              {/* Question Text */}
              <h3 className="font-display text-xl sm:text-2xl font-bold uppercase text-white leading-snug mb-6">
                {currentQ.question}
              </h3>

              {/* Options List */}
              <div className="space-y-3 mb-6">
                {currentQ.options.map((opt, idx) => {
                  let optionStyle =
                    'bg-slate-900 border-slate-800 text-slate-200 hover:border-slate-700';

                  if (isAnswered) {
                    if (idx === currentQ.correctIndex) {
                      optionStyle =
                        'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-semibold';
                    } else if (idx === selectedOption) {
                      optionStyle = 'bg-rose-950/60 border-rose-500 text-rose-200 font-semibold';
                    } else {
                      optionStyle = 'bg-slate-900/40 border-slate-900 text-slate-500 opacity-50';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswered}
                      className={`w-full p-4 rounded-xl border text-left text-sm transition-all flex items-center justify-between ${optionStyle}`}
                    >
                      <span>{opt}</span>
                      {isAnswered && idx === currentQ.correctIndex && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      )}
                      {isAnswered && idx === selectedOption && idx !== currentQ.correctIndex && (
                        <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation Box */}
              {isAnswered && (
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-2 mb-6">
                  <div className="font-bold text-amber-400 uppercase tracking-wider">
                    {selectedOption === currentQ.correctIndex ? '¡Correcto, mi llave!' : '¡Eche no!'}
                  </div>
                  <p className="leading-relaxed">{currentQ.explanation}</p>
                </div>
              )}

              {/* Next Button */}
              {isAnswered && (
                <div className="flex justify-end">
                  <button
                    onClick={handleNext}
                    className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                  >
                    {currentIndex + 1 < QUIZ_QUESTIONS.length ? 'Siguiente Pregunta →' : 'Ver Resultados Finales'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Result Screen */
            <div className="text-center py-8 space-y-6">
              <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 mx-auto flex items-center justify-center shadow-lg">
                <Trophy className="w-10 h-10 text-amber-400" />
              </div>

              <div>
                <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest block mb-1">
                  Certificado de Hinchada
                </span>
                <h3 className="font-display text-3xl sm:text-4xl font-black uppercase text-white tracking-tight">
                  {rank.title}
                </h3>
                <div className="text-sm font-semibold text-red-400 mt-1">{rank.badge}</div>
              </div>

              <div className="max-w-md mx-auto p-5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Tu Puntuación</div>
                <div className="font-display text-4xl font-black text-white tabular-nums">
                  {score} / {QUIZ_QUESTIONS.length}
                </div>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed font-normal">
                  {rank.description}
                </p>
              </div>

              <div>
                <button
                  onClick={resetQuiz}
                  className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-lg shadow-red-950/60 transition-colors inline-flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Repetir Trivia</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
