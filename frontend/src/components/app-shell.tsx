"use client";

import { ReactNode } from "react";

import { Header } from "@/components/header";

type Props = {
  children: ReactNode;
};

export const AppShell = ({ children }: Props) => {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <Header />
      <main className="container mx-auto flex w-full flex-1 flex-col gap-6 px-6 py-10">
        {children}
      </main>
    </div>
  );
};

