"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Bell, Moon, Type, Download, Share, Lock, HelpCircle, LogOut, Palette, Sun } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { DesktopSidebar } from "@/components/desktop-sidebar"
import { useTheme } from "@/components/theme-provider"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const {
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
  } = useTheme()

  const router = useRouter()

  const fontOptions = [
    { value: "ibm-plex-mono", label: "IBM Plex Mono" },
    { value: "merriweather", label: "Merriweather" },
    { value: "inter", label: "Inter" },
    { value: "courier-new", label: "Courier New" },
  ]

  const colorThemeOptions = [
    { value: "default", label: "Default Green" },
    { value: "monochrome", label: "Black & White" },
    { value: "pink", label: "Pink Theme" },
    { value: "custom", label: "Custom Colors" },
  ]

  const settingSections = [
    {
      title: "Writing",
      items: [
        {
          icon: Type,
          label: "Font Family",
          description: "Choose your preferred font",
          component: (
            <Select value={fontFamily} onValueChange={setFontFamily}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fontOptions.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    {font.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ),
        },
        {
          icon: Type,
          label: "Font Size",
          description: "Adjust text size for comfortable reading",
          component: (
            <div className="w-24 flex items-center gap-2">
              <Slider
                value={[fontSize]}
                onValueChange={(value) => setFontSize(value[0])}
                max={24}
                min={12}
                step={1}
                className="w-full"
              />
              <span className="text-xs font-mono text-[var(--color-text-secondary)] w-8">{fontSize}px</span>
            </div>
          ),
        },
      ],
    },
    {
      title: "Appearance",
      items: [
        {
          icon: theme === "dark" ? Moon : Sun,
          label: "Theme",
          description: "Switch between light and dark mode",
          component: (
            <Switch checked={theme === "dark"} onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")} />
          ),
        },
        {
          icon: Palette,
          label: "Color Theme",
          description: "Choose your color scheme",
          component: (
            <Select value={colorTheme} onValueChange={setColorTheme}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {colorThemeOptions.map((theme) => (
                  <SelectItem key={theme.value} value={theme.value}>
                    {theme.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ),
        },
      ],
    },
  ]

  // Add custom color section if custom theme is selected
  if (colorTheme === "custom") {
    settingSections[1].items.push({
      icon: Palette,
      label: "Custom Colors",
      description: "Pick your primary and accent colors",
      component: (
        <div className="flex gap-2">
          <div className="flex flex-col gap-1">
            <Label className="text-xs">Primary</Label>
            <Input
              type="color"
              value={customColors.primary}
              onChange={(e) => setCustomColors({ ...customColors, primary: e.target.value })}
              className="w-12 h-8 p-1 border rounded"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs">Accent</Label>
            <Input
              type="color"
              value={customColors.accent}
              onChange={(e) => setCustomColors({ ...customColors, accent: e.target.value })}
              className="w-12 h-8 p-1 border rounded"
            />
          </div>
        </div>
      ),
    })
  }

  // Add remaining sections
  settingSections.push(
    {
      title: "Notifications",
      items: [
        {
          icon: Bell,
          label: "Daily Reminders",
          description: "Get gentle reminders to write",
          component: <Switch defaultChecked />,
        },
      ],
    },
    {
      title: "Data",
      items: [
        {
          icon: Download,
          label: "Export Journals",
          description: "Download your entries as PDF or text",
          component: (
            <Button variant="outline" size="sm">
              Export
            </Button>
          ),
        },
        {
          icon: Share,
          label: "Backup",
          description: "Sync your journals to cloud storage",
          component: (
            <Button variant="outline" size="sm">
              Setup
            </Button>
          ),
        },
      ],
    },
    {
      title: "Privacy & Security",
      items: [
        {
          icon: Lock,
          label: "App Lock",
          description: "Require authentication to open app",
          component: (
            <Button variant="outline" size="sm">
              Enable
            </Button>
          ),
        },
      ],
    },
    {
      title: "Support",
      items: [
        {
          icon: HelpCircle,
          label: "Help & FAQ",
          description: "Get help with using Adjourn",
          component: null,
        },
      ],
    },
  )

  return (
    <div className="flex min-h-[100dvh] bg-[var(--color-background)]">
      <DesktopSidebar currentPage="settings" />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="font-mono text-2xl text-[var(--color-text)]">Settings</h1>
        </header>

        {/* Settings Sections */}
        <main className="flex-1 p-4 space-y-6 pb-20 md:pb-4">
          {settingSections.map((section) => (
            <Card key={section.title} className="border-0 shadow-sm bg-[var(--color-card-background)]">
              <CardHeader className="pb-3">
                <CardTitle className="font-mono text-lg text-[var(--color-text)]">{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {section.items.map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <Icon className="w-5 h-5 text-[var(--color-primary)]" />
                        <div className="flex-1">
                          <p className="font-mono text-sm text-[var(--color-text)]">{item.label}</p>
                          <p className="font-mono text-xs text-[var(--color-text-secondary)]">{item.description}</p>
                        </div>
                      </div>
                      {item.component}
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          ))}

          {/* Sign Out */}
          <Card className="border-0 shadow-sm bg-[var(--color-card-background)]">
            <CardContent className="p-4">
              <Button
                variant="ghost"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={async () => {
                  const { error } = await supabase.auth.signOut()
                  if (error) {
                    toast({ description: "Failed to sign out" })
                  } else {
                    router.push("/")
                    router.refresh()
                  }
                }}
              >
                <LogOut className="w-5 h-5 mr-3" />
                <span className="font-mono">Sign Out</span>
              </Button>
            </CardContent>
          </Card>

          {/* App Info */}
          <div className="text-center space-y-1">
            <p className="font-mono text-xs text-[var(--color-text-secondary)]">Adjourn v1.0.0</p>
            <p className="font-mono text-xs text-[var(--color-text-secondary)]">Made with ♥ for mindful writing</p>
          </div>
        </main>

        {/* Bottom Navigation */}
        <BottomNavigation currentPage="settings" />
      </div>
    </div>
  )
}
