"use client";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useState, useRef, useEffect } from "react";
import { User } from "firebase/auth";
import { LogOut, UserCircle, ChevronDown } from "lucide-react";
import Image from "next/image";

export default function Header({ user }: { user: User }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const logout = async () => {
    setOpen(false);
    await signOut(auth);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-100">
      <div className="max-w-2xl mx-auto px-4 py-2.5 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 group"
        >
          <Image src="/SpendShare.png" alt="SpendShare Logo" width={32} height={32} className="rounded-xl bg-transparent" />
          <span className="font-semibold text-gray-900">
            Spend<span className="text-indigo-600">Share</span>
          </span>
        </button>

        {/* Profile dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-gray-50 transition-colors border border-gray-200"
          >
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt="avatar"
                width={28}
                height={28}
                className="rounded-full"
              />
            ) : (
              <UserCircle className="w-7 h-7 text-gray-400" />
            )}
            <span className="text-sm font-medium text-gray-700 hidden sm:block">
              {user.displayName?.split(" ")[0]}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
              <button
                onClick={() => { setOpen(false); router.push("/profile"); }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <UserCircle className="w-4 h-4 text-gray-400" />
                Profile
              </button>
              <div className="h-px bg-gray-100 mx-2 my-1" />
              <button
                onClick={logout}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
