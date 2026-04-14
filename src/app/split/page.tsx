"use client";
import dynamic from "next/dynamic";
const SplitPageClient = dynamic(() => import("@/components/SplitPageClient"), { ssr: false });
export default function SplitPage() { return <SplitPageClient />; }