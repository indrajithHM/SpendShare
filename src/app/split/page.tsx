"use client";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import SplitHome from "@/components/SplitHome";
import Header from "@/components/Header";

const SplitClient = dynamic(() => import("@/components/SplitClient"), { ssr: false });

function SplitRouter() {
  const searchParams = useSearchParams();
  const splitId = searchParams.get("id");

  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      {user && <Header user={user} />}   {/* ✅ header always here */}

      {splitId ? (
        <SplitClient splitId={splitId} />
      ) : (
        <SplitHome />
      )}
    </>
  );
}

export default function SplitPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SplitRouter />
    </Suspense>
  );
}