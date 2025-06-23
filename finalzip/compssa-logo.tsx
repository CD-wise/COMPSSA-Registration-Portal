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
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16",
    xl: "w-20 h-20",
  }

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-lg",
    xl: "text-xl",
  }

  if (imageError) {
    return (
      <div className={`${sizeClasses[size]} rounded-full flex items-center justify-center ${className}`}>
        <span className={`text-gray-700 font-bold ${textSizes[size]}`}>{fallbackText}</span>
      </div>
    )
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full flex items-center justify-center overflow-hidden ${className}`}>
      <img
        src="/compssa-logo.png"
        alt="COMPSSA Logo"
        className="w-full h-full object-contain p-1"
        onError={() => setImageError(true)}
      />
    </div>
  )
}
