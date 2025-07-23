"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/ui";

export function ThemeToggle() {
  const { isDarkMode, toggleDarkMode } = useUIStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    useUIStore.persist.rehydrate();
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="w-9 h-9 p-0"
        aria-label="Toggle theme"
        disabled
      >
        <Moon className="h-4 w-4" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleDarkMode}
      className="w-9 h-9 p-0"
      aria-label="Toggle theme"
    >
      {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
