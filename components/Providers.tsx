"use client";

import { Provider } from "react-redux";
import store from "@/redux/store";
import React from "react";
import { Toaster } from "sonner";
import { UserProvider } from "@/context/UserContext";
import { ThemeProvider } from "@/context/ThemeContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <UserProvider>{children}</UserProvider>
        <Toaster richColors position="bottom-right" />
      </ThemeProvider>
    </Provider>
  );
}
