"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark"
type ColorTheme = "default" | "monochrome" | "pink" | "custom"
type FontFamily = "ibm-plex-mono" | "merriweather" | "inter" | "courier-new"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  colorTheme: ColorTheme
  setColorTheme: (theme: ColorTheme) => void
  customColors: {
    primary: string
    accent: string
  }
  setCustomColors: (colors: { primary: string; accent: string }) => void
  fontSize: number
  setFontSize: (size: number) => void
  fontFamily: FontFamily
  setFontFamily: (font: FontFamily) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light")
  const [colorTheme, setColorTheme] = useState<ColorTheme>("default")
  const [customColors, setCustomColors] = useState({
    primary: "#5D6D4E",
    accent: "#7FA66D",
  })
  const [fontSize, setFontSize] = useState(16)
  const [fontFamily, setFontFamily] = useState<FontFamily>("ibm-plex-mono")

  useEffect(() => {
    // Load saved preferences
    const savedTheme = localStorage.getItem("adjourn-theme") as Theme
    const savedColorTheme = localStorage.getItem("adjourn-color-theme") as ColorTheme
    const savedCustomColors = localStorage.getItem("adjourn-custom-colors")
    const savedFontSize = localStorage.getItem("adjourn-font-size")
    const savedFontFamily = localStorage.getItem("adjourn-font-family") as FontFamily

    if (savedTheme) setTheme(savedTheme)
    if (savedColorTheme) setColorTheme(savedColorTheme)
    if (savedCustomColors) setCustomColors(JSON.parse(savedCustomColors))
    if (savedFontSize) setFontSize(Number.parseInt(savedFontSize))
    if (savedFontFamily) setFontFamily(savedFontFamily)
  }, [])

  useEffect(() => {
    // Apply theme
    const root = window.document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(theme)
    localStorage.setItem("adjourn-theme", theme)
  }, [theme])

  useEffect(() => {
    // Apply color theme
    const root = window.document.documentElement

    // Remove existing color theme classes
    root.classList.remove("theme-default", "theme-monochrome", "theme-pink", "theme-custom")
    root.classList.add(`theme-${colorTheme}`)

    // Apply color variables based on theme
    const colorMap = {
      default: {
        primary: theme === "light" ? "#5D6D4E" : "#7FA66D", // Brighter green in dark mode
        accent: theme === "light" ? "#7FA66D" : "#9BC47A", // Even brighter accent in dark mode
        background: theme === "light" ? "#FAFAF8" : "#1a1a1a",
        surface: theme === "light" ? "#ffffff" : "#2a2a2a",
        cardBackground: theme === "light" ? "#f8f9fa" : "#333333", // Custom card color
        text: theme === "light" ? "#2A2A2A" : "#ffffff",
        textSecondary: theme === "light" ? "#8B8680" : "#a0a0a0",
        streakText: theme === "light" ? "#2A2A2A" : "#ffffff", // Ensure streak text is visible
        buttonText: "#ffffff", // Always white for buttons
      },
      monochrome: {
        primary: theme === "light" ? "#000000" : "#ffffff",
        accent: theme === "light" ? "#333333" : "#cccccc",
        background: theme === "light" ? "#ffffff" : "#000000",
        surface: theme === "light" ? "#f8f8f8" : "#1a1a1a",
        cardBackground: theme === "light" ? "#f5f5f5" : "#2a2a2a",
        text: theme === "light" ? "#000000" : "#ffffff",
        textSecondary: theme === "light" ? "#666666" : "#999999",
        streakText: theme === "light" ? "#000000" : "#ffffff",
        buttonText: theme === "light" ? "#ffffff" : "#000000", // Black text on white buttons in dark mode
      },
      pink: {
        primary: theme === "light" ? "#d946ef" : "#f472b6",
        accent: theme === "light" ? "#f472b6" : "#ec4899",
        background: theme === "light" ? "#fdf2f8" : "#1a0a1a",
        surface: theme === "light" ? "#ffffff" : "#2a1a2a",
        cardBackground: theme === "light" ? "#fce7f3" : "#3a1a2a",
        text: theme === "light" ? "#2A2A2A" : "#ffffff",
        textSecondary: theme === "light" ? "#8B8680" : "#d1a3d1",
        streakText: theme === "light" ? "#2A2A2A" : "#ffffff",
        buttonText: "#ffffff", // Always white for buttons
      },
      custom: {
        primary: customColors.primary,
        accent: customColors.accent,
        background: theme === "light" ? "#FAFAF8" : "#1a1a1a",
        surface: theme === "light" ? "#ffffff" : "#2a2a2a",
        cardBackground: theme === "light" ? "#f8f9fa" : "#333333",
        text: theme === "light" ? "#2A2A2A" : "#ffffff",
        textSecondary: theme === "light" ? "#8B8680" : "#a0a0a0",
        streakText: theme === "light" ? "#2A2A2A" : "#ffffff",
        buttonText: "#ffffff", // Always white for buttons
      },
    }

    const colors = colorMap[colorTheme]
    root.style.setProperty("--color-primary", colors.primary)
    root.style.setProperty("--color-accent", colors.accent)
    root.style.setProperty("--color-background", colors.background)
    root.style.setProperty("--color-surface", colors.surface)
    root.style.setProperty("--color-card-background", colors.cardBackground)
    root.style.setProperty("--color-text", colors.text)
    root.style.setProperty("--color-text-secondary", colors.textSecondary)
    root.style.setProperty("--color-streak-text", colors.streakText)
    root.style.setProperty("--color-button-text", colors.buttonText)

    localStorage.setItem("adjourn-color-theme", colorTheme)
    localStorage.setItem("adjourn-custom-colors", JSON.stringify(customColors))
  }, [theme, colorTheme, customColors])

  useEffect(() => {
    // Apply font size
    const root = window.document.documentElement
    root.style.setProperty("--font-size-base", `${fontSize}px`)
    localStorage.setItem("adjourn-font-size", fontSize.toString())
  }, [fontSize])

  useEffect(() => {
    // Apply font family
    const root = window.document.documentElement
    const fontMap = {
      "ibm-plex-mono": '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", "Source Code Pro", monospace',
      merriweather: '"Merriweather", serif',
      inter: '"Inter", sans-serif',
      "courier-new": '"Courier New", monospace',
    }
    root.style.setProperty("--font-family-base", fontMap[fontFamily])
    localStorage.setItem("adjourn-font-family", fontFamily)
  }, [fontFamily])

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        colorTheme,
        setColorTheme,
        customColors,
        setCustomColors,
        fontSize,
        setFontSize,
        fontFamily,
        setFontFamily,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
