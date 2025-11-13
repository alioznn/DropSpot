"use client";

import { ReactNode } from "react";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

type Props = {
  children: ReactNode;
};

export const AppShell = ({ children }: Props) => {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <Header />
      <main className="container mx-auto flex w-full flex-1 flex-col gap-8 px-6 py-12">
        {children}
      </main>
      <Footer />
    </div>
  );
};

