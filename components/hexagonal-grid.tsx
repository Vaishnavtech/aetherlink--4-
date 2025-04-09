"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"

import { Card, CardContent } from "@/components/ui/card"

export function HexagonalGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isClient, setIsClient] = useState(false)

  // Set isClient to true when component mounts
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    // Only run this effect on the client
    if (!isClient) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * (window.devicePixelRatio || 1)
      canvas.height = rect.height * (window.devicePixelRatio || 1)
      ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1)
    }

    setCanvasDimensions()
    window.addEventListener("resize", setCanvasDimensions)

    // Hexagon properties
    const hexRadius = 15
    const hexHeight = hexRadius * Math.sqrt(3)
    const hexWidth = hexRadius * 2
    const hexVerticalSpacing = hexHeight
    const hexHorizontalSpacing = hexWidth * 0.75

    // Calculate number of hexagons to fill the canvas
    const numCols = Math.ceil(canvas.width / hexHorizontalSpacing) + 1
    const numRows = Math.ceil(canvas.height / hexVerticalSpacing) + 1

    // Draw a hexagon
    const drawHexagon = (x: number, y: number, radius: number, color: string, lineWidth: number) => {
      ctx.beginPath()
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3
        const hx = x + radius * Math.cos(angle)
        const hy = y + radius * Math.sin(angle)
        if (i === 0) {
          ctx.moveTo(hx, hy)
        } else {
          ctx.lineTo(hx, hy)
        }
      }
      ctx.closePath()
      ctx.strokeStyle = color
      ctx.lineWidth = lineWidth
      ctx.stroke()
    }

    // Animation variables
    let animationFrame: number
    let time = 0

    // Animation function
    const animate = () => {
      time += 0.005

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw hexagon grid
      for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
          const offsetX = col % 2 === 0 ? 0 : hexHorizontalSpacing / 2
          const x = col * hexHorizontalSpacing
          const y = row * hexVerticalSpacing + offsetX

          // Calculate distance from center for glow effect
          const centerX = canvas.width / 2
          const centerY = canvas.height / 2
          const dx = x - centerX
          const dy = y - centerY
          const distance = Math.sqrt(dx * dx + dy * dy)
          const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY)
          const normalizedDistance = distance / maxDistance

          // Calculate color and size based on time and position
          const hue = (time * 20 + normalizedDistance * 180) % 360
          const alpha = 0.1 + Math.sin(time + normalizedDistance * 5) * 0.05
          const size = hexRadius * (0.8 + Math.sin(time + normalizedDistance * 3) * 0.2)
          const lineWidth = 0.5 + Math.sin(time + normalizedDistance * 2) * 0.5

          const color = `hsla(${hue}, 70%, 60%, ${alpha})`
          drawHexagon(x, y, size, color, lineWidth)
        }
      }

      animationFrame = requestAnimationFrame(animate)
    }

    // Start animation
    animate()

    // Cleanup
    return () => {
      window.removeEventListener("resize", setCanvasDimensions)
      cancelAnimationFrame(animationFrame)
    }
  }, [isClient]) // Only re-run if isClient changes

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
      <Card className="bg-black/30 border-primary/10 overflow-hidden backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="relative">
            <canvas ref={canvasRef} className="w-full h-[200px] block" style={{ display: "block" }} />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
              <h2 className="text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
                AetherLink Supply Chain
              </h2>
              <p className="text-muted-foreground max-w-md">
                Blockchain-powered supply chain management with transparent product tracking, secure bidding, and
                real-time custody transfers.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

