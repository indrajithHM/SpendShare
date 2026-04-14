"use client";
import { useRouter } from "next/navigation";
import { PlusCircle, BarChart2, Users } from "lucide-react";

interface Props {
  mode?: "dashboard" | "split";
  active?: string;
  setActive?: (tab: string) => void;
}

export default function BottomNav({ mode = "dashboard", active, setActive }: Props) {
  const router = useRouter();

  const go = (tab: string) => {
    if (mode === "dashboard") {
      if (tab === "SPLIT") router.push("/split");
      else setActive?.(tab);
    } else {
      if (tab === "SPLIT") router.push("/split");
      else router.push(`/?tab=${tab}`);
    }
  };

  const items = [
    { id: "ADD", label: "Add", Icon: PlusCircle },
    { id: "SUMMARY", label: "Summary", Icon: BarChart2 },
    { id: "SPLIT", label: "Split", Icon: Users },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 flex items-center justify-around safe-area-bottom">
      {items.map(({ id, label, Icon }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            onClick={() => go(id)}
            className={`flex flex-col items-center gap-0.5 py-2.5 px-6 transition-all ${
              isActive ? "text-indigo-600" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <Icon className={`w-5 h-5 transition-transform ${isActive ? "scale-110" : ""}`} />
            <span className={`text-[11px] font-medium ${isActive ? "font-semibold" : ""}`}>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
