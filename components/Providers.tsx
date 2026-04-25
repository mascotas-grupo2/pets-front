"use client";

import { Provider } from "react-redux";
import store from "@/redux/store";
import React from "react";
import { Toaster } from "sonner";
import { UserProvider } from "@/context/UserContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <UserProvider>{children}</UserProvider>
      <Toaster richColors position="bottom-right" />
    </Provider>
  );
}
