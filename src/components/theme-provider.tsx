"use client";

import { useEffect } from "react";
import { useUIStore } from "@/store/ui";

interface ThemeProviderProps {
  children: React.ReactNode;
  attribute?: string;
  defaultTheme?: string;
  enableSystem?: boolean;
}

export function ThemeProvider({
  children,
  attribute = "class",
  defaultTheme = "light",
  enableSystem = false,
  ...props
}: ThemeProviderProps) {
  const { isDarkMode } = useUIStore();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  return <div>{children}</div>;
}
