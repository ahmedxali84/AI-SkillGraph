"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ModeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="relative h-10 w-10 flex items-center justify-center rounded-full border border-zinc-100 dark:border-zinc-900 bg-white dark:bg-black transition-all hover:border-black dark:hover:border-white group overflow-hidden"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 group-hover:italic" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 group-hover:italic" />
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}
