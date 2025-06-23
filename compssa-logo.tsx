"use client"

import { useState } from "react"

interface CompssaLogoProps {
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  fallbackText?: string
}

export default function CompssaLogo({ size = "md", className = "", fallbackText = "CPS" }: CompssaLogoProps) {
  const [imageError, setImageError] = useState(false)

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-20 h-20",
    xl: "w-24 h-24",
  }

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-lg",
    xl: "text-xl",
  }

  if (imageError) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center border border-gray-200 ${className}`}
      >
        <span className={`text-gray-700 font-bold ${textSizes[size]}`}>{fallbackText}</span>
      </div>
    )
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full flex items-center justify-center overflow-hidden ${className}`}>
      <img
        src="/compssa-logo.png"
        alt="COMPSSA Logo"
        className="w-full h-full object-contain"
        onError={() => setImageError(true)}
      />
    </div>
  )
}
