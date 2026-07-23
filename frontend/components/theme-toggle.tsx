"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === "black" ? "white" : "black")}
      className="rounded-full bg-transparent border-gray-300"
      aria-label="Toggle theme"
    >
      <Sun
        className={`h-[1.2rem] w-[1.2rem] transition-all ${theme === "black" ? "opacity-0 scale-0" : "opacity-100 scale-100"}`}
      />
      <Moon
        className={`absolute h-[1.2rem] w-[1.2rem] transition-all ${theme === "white" ? "opacity-0 scale-0" : "opacity-100 scale-100"}`}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
