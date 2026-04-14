"use client";
import dynamic from "next/dynamic";

// Disable SSR for the entire app shell — Firebase Auth requires browser APIs
const HomeClient = dynamic(() => import("@/components/HomeClient"), { ssr: false });

export default function Home() {
  return <HomeClient />;
}
