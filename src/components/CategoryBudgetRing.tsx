"use client";
import { CategoryIcon } from "./CategoryIcon";

interface Props {
  icon: string;
  name: string;
  spent: number;
  budget: number | null;
  percent: number;
  onClick?: () => void;
}

export default function CategoryBudgetRing({ icon, name, spent, budget, percent, onClick }: Props) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(percent, 100) / 100) * circumference;
  const isOver = budget !== null && budget !== undefined && spent > budget;

  return (
    <div className="col-span-1">
      <button
        onClick={onClick}
        className="w-full bg-white rounded-2xl border border-gray-100 p-3 flex flex-col items-center gap-1.5 hover:border-indigo-200 hover:shadow-sm transition-all active:scale-95"
      >
        <div className="relative">
          <svg width="72" height="72">
            <circle cx="36" cy="36" r={radius} stroke="#f0f0f0" strokeWidth="5" fill="none" />
            {budget && (
              <circle
                cx="36" cy="36" r={radius}
                stroke={isOver ? "#ef4444" : "#6366f1"}
                strokeWidth="5"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                transform="rotate(-90 36 36)"
                style={{ transition: "stroke-dashoffset 0.6s ease" }}
              />
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <CategoryIcon name={icon} className="w-5 h-5 text-gray-600" />
            {budget && (
              <span className="text-[9px] font-semibold text-gray-500 mt-0.5">
                {Math.round(percent)}%
              </span>
            )}
          </div>
        </div>
        <span className="text-xs font-semibold text-gray-700 truncate w-full text-center">{name}</span>
        <span className={`text-[11px] ${isOver ? "text-red-500 font-bold" : "text-gray-500"}`}>
          ₹{spent.toLocaleString("en-IN")}
          {budget && <span className="text-gray-400">/{budget.toLocaleString("en-IN")}</span>}
        </span>
      </button>
    </div>
  );
}
