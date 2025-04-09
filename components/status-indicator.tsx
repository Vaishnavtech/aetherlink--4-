"use client"

import type React from "react"

import { motion } from "framer-motion"

import { Card, CardContent } from "@/components/ui/card"

interface StatusIndicatorProps {
  title: string
  status: "active" | "inactive" | "warning"
  icon: React.ReactNode
  details: string
}

export function StatusIndicator({ title, status, icon, details }: StatusIndicatorProps) {
  const getStatusColor = () => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "inactive":
        return "bg-red-500"
      case "warning":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Card className="bg-gradient-to-br from-gray-900 to-black border-primary/20 overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">{icon}</div>
            <div>
              <h3 className="font-medium">{title}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="relative">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
                  <motion.div
                    className={`absolute inset-0 rounded-full ${getStatusColor()} opacity-60`}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.6, 0, 0.6],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                  />
                </div>
                <span>{details}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

