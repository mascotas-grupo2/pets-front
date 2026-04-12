"use client";

import { Provider } from "react-redux";
import store from "@/src/store";
import React from "react";
import { Toaster } from "sonner";
// import { TuContextoProvider } from "@/context/TuContexto"; // Donde iría un futuro Context

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      {/* 
        Si en el futuro agregas Context, simplemente envuelve los children aquí.
        Ejemplo:
        <TuContextoProvider>
          {children}
        </TuContextoProvider>
      */}
      {children}
      <Toaster richColors position="bottom-right" />
    </Provider>
  );
}
