"use client";

import React from "react";

import ClientFooter from "./components/footer";
import ClientHeader from "./components/header";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-200">
      {/* Header */}
      <header className="z-50">
        <ClientHeader />
      </header>

      {/* Content */}
      <main className="flex-grow ">{children}</main>

      {/* Footer */}
      <ClientFooter />
    </div>
  );
}
