"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface StreakDisplayProps {
  currentStreak: number
  maxStreak?: number
}

export function StreakDisplay({ currentStreak, maxStreak = 30 }: StreakDisplayProps) {
  const router = useRouter()
  const [animatedStreak, setAnimatedStreak] = useState(currentStreak)
  const [showConfetti, setShowConfetti] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    // Check if animation has already played this session
    const hasAnimated = sessionStorage.getItem('streak-animated')
    const lastAnimatedStreak = sessionStorage.getItem('last-streak-value')
    
    if (!hasAnimated) {
      // First time this session - animate from 0
      setAnimatedStreak(0)
      const timer = setTimeout(() => {
        setAnimatedStreak(currentStreak)
        if (currentStreak > 0 && currentStreak % 7 === 0) {
          setShowConfetti(true)
          setTimeout(() => setShowConfetti(false), 2000)
        }
        // Mark as animated for this session
        sessionStorage.setItem('streak-animated', 'true')
        sessionStorage.setItem('last-streak-value', currentStreak.toString())
      }, 500)
      return () => clearTimeout(timer)
    } else if (lastAnimatedStreak && parseInt(lastAnimatedStreak) !== currentStreak) {
      // Streak value changed during session - do a subtle update
      setAnimatedStreak(currentStreak)
      if (currentStreak > 0 && currentStreak % 7 === 0) {
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 2000)
      }
      sessionStorage.setItem('last-streak-value', currentStreak.toString())
    } else {
      // Already animated this session and value hasn't changed - show final state immediately
      setAnimatedStreak(currentStreak)
    }
  }, [currentStreak])

  const circumference = 2 * Math.PI * 45
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (animatedStreak / maxStreak) * circumference

  const getMotivationalMessage = () => {
    if (currentStreak === 0) return "Start your journey"
    if (currentStreak === 1) return "Great start!"
    if (currentStreak < 7) return `${currentStreak} days strong!`
    if (currentStreak < 30) return `${currentStreak} days amazing!`
    return `${currentStreak} days incredible!`
  }

  const getTodaysDate = () => {
    const today = new Date()
    return today.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  const handleClick = () => {
    router.push("/today")
  }

  return (
    <div
      className="relative flex flex-col items-center p-6 cursor-pointer transition-transform duration-200 hover:scale-105"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 animate-bounce"
              style={{
                backgroundColor: "var(--color-accent)",
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Circular Progress */}
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="var(--color-text-secondary)"
            strokeWidth="4"
            fill="transparent"
            opacity="0.2"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="var(--color-accent)"
            strokeWidth="4"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
            strokeLinecap="round"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center transition-all duration-200">
          {isHovered ? (
            <>
              <span className="font-mono text-sm font-bold text-[var(--color-streak-text)] leading-tight">
                {getTodaysDate().split(", ")[0]}
              </span>
              <span className="font-mono text-sm font-bold text-[var(--color-streak-text)] leading-tight">
                {getTodaysDate().split(", ")[1].split(" ")[0]}
              </span>
              <span className="font-mono text-sm font-bold text-[var(--color-streak-text)] leading-tight">
                {getTodaysDate().split(", ")[1].split(" ")[1]}
              </span>
              <span className="font-mono text-xs text-[var(--color-text-secondary)] mt-1">today</span>
            </>
          ) : (
            <>
              <span className="font-mono text-2xl font-bold text-[var(--color-streak-text)]">{animatedStreak}</span>
              <span className="font-mono text-xs text-[var(--color-text-secondary)]">days</span>
            </>
          )}
        </div>
      </div>

      {/* Motivational message */}
      <p className="font-mono text-sm text-[var(--color-primary)] text-center mt-4">
        {isHovered ? "Open today's note" : getMotivationalMessage()}
      </p>
    </div>
  )
}
