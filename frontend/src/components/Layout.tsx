import type { ReactNode } from "react";

type LayoutProps = {
  children: ReactNode;
};

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-slate-50/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-5">
          <h1 className="text-base font-semibold tracking-tight text-slate-900">
            Enterprise Knowledge Assistant
          </h1>

          <span className="hidden text-sm text-slate-400 md:block">
            Retrieval-Augmented Generation
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-8 py-12">{children}</main>
    </div>
  );
}