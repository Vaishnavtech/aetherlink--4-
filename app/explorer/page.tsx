"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Boxes, RefreshCw, Package } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ParticleBackground } from "@/components/particle-background"

export default function ExplorerPage() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      <ParticleBackground />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <header className="flex justify-between items-center mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2"
          >
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </Link>
            {/* New Products Page Link */}
            <Link
              href="/products"
              className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors ml-4"
            >
              <Package className="h-5 w-5" />
              <span>Products</span>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-4"
          >
            <Button
              variant="outline"
              size="icon"
              className="border-primary/20 hover:border-primary/50 hover:bg-primary/5"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </motion.div>
        </header>

        {/* Rest of the code remains the same */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-br from-gray-900 to-black border-primary/20 overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Boxes className="h-5 w-5 text-primary" />
                Supply Chain Explorer
              </CardTitle>
              <CardDescription>
                Visualize and explore the entire supply chain network with real-time data and analytics.
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Rest of the existing code */}
      </div>
    </div>
  )
}

