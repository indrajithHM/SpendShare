"use client";
import { TrendingDown, TrendingUp, ArrowLeftRight } from "lucide-react";

interface Props {
  debit: number;
  credit: number;
  banks: Record<string, { debit: number; credit: number }>;
  period: { month: number | null; year: number | null };
  showDetails?: boolean;
}

export default function SummaryCards({ debit, credit, banks, period, showDetails }: Props) {
  const net = credit - debit;

  const uniqueBanks = Object.entries(banks).reduce<Record<string, { debit: number; credit: number; displayName: string }>>(
    (acc, [bank, values]) => {
      const key = bank.trim().toLowerCase();
      if (!acc[key]) acc[key] = { debit: 0, credit: 0, displayName: bank.trim() };
      acc[key].debit += values.debit || 0;
      acc[key].credit += values.credit || 0;
      return acc;
    }, {}
  );

  return (
    <div className="mb-4">
      <div className="grid grid-cols-3 gap-2.5">
        {/* Debit */}
        <div className="bg-red-50 rounded-2xl p-3 flex flex-col items-center gap-1">
          <TrendingDown className="w-4 h-4 text-red-400" />
          <span className="text-[11px] text-red-400 font-medium">Debit</span>
          <span className="font-bold text-red-600 text-sm">₹{debit.toLocaleString("en-IN")}</span>
        </div>

        {/* Credit */}
        <div className="bg-green-50 rounded-2xl p-3 flex flex-col items-center gap-1">
          <TrendingUp className="w-4 h-4 text-green-400" />
          <span className="text-[11px] text-green-400 font-medium">Credit</span>
          <span className="font-bold text-green-600 text-sm">₹{credit.toLocaleString("en-IN")}</span>
        </div>

        {/* Net */}
        <div className={`${net >= 0 ? "bg-indigo-50" : "bg-orange-50"} rounded-2xl p-3 flex flex-col items-center gap-1`}>
          <ArrowLeftRight className={`w-4 h-4 ${net >= 0 ? "text-indigo-400" : "text-orange-400"}`} />
          <span className={`text-[11px] font-medium ${net >= 0 ? "text-indigo-400" : "text-orange-400"}`}>Net</span>
          <span className={`font-bold text-sm ${net >= 0 ? "text-indigo-600" : "text-orange-600"}`}>
            ₹{Math.abs(net).toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {showDetails && Object.keys(uniqueBanks).length > 0 && (
        <div className="mt-3 bg-white rounded-2xl border border-gray-100 p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Bank / Card Summary</h3>
          <div className="space-y-2">
            {Object.entries(uniqueBanks).map(([key, val]) => {
              const bankNet = val.credit - val.debit;
              return (
                <div key={key} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                  <span className="font-medium text-sm text-gray-700">{val.displayName}</span>
                  <span className={`font-semibold text-sm ${bankNet >= 0 ? "text-green-600" : "text-red-500"}`}>
                    {bankNet >= 0 ? "+" : ""}₹{bankNet.toLocaleString("en-IN")}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
