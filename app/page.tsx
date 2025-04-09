"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Box,
  Boxes,
  CircuitBoard,
  CuboidIcon as Cube,
  Database,
  Layers,
  LayoutGrid,
  Package,
  Truck,
  Wallet,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { HexagonalGrid } from "@/components/hexagonal-grid"
import { MetaMaskConnect } from "@/components/metamask-connect"
import { ParticleBackground } from "@/components/particle-background"
import { StatusIndicator } from "@/components/status-indicator"
import { CuboidIcon as CubeIcon } from "lucide-react"

export default function Home() {
  const [account, setAccount] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Set isMounted to true when component mounts
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    // Only run this effect on the client
    if (!isMounted) return

    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    // Check if MetaMask is already connected
    const checkConnection = async () => {
      if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" })
          if (accounts.length > 0) {
            setAccount(accounts[0])
          }
        } catch (error) {
          console.error("Error checking connection:", error)
        }
      }
    }

    checkConnection()
    return () => clearTimeout(timer)
  }, [isMounted])

  const connectWallet = async () => {
    setIsConnecting(true)
    try {
      if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
        try {
          const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
          setAccount(accounts[0])
        } catch (error: any) {
          console.error("User rejected the connection request:", error)
          // Handle user rejection
          if (error.code === 4001) {
            alert("Please connect to MetaMask to use this application")
          } else {
            alert("Error connecting to MetaMask. Please try again.")
          }
        }
      } else {
        alert("Please install MetaMask to use this application")
      }
    } catch (error) {
      console.error("Error connecting to MetaMask:", error)
    } finally {
      setIsConnecting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-black">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <CubeIcon className="h-16 w-16 text-primary animate-pulse" />
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-primary/30"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [1, 0.5, 1],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-8 text-2xl font-bold text-primary"
        >
          AetherLink
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-muted-foreground"
        >
          Initializing blockchain connection...
        </motion.p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      <ParticleBackground />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <header className="flex justify-between items-center mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2"
          >
            <Cube className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
              AetherLink
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-4"
          >
            <Link href="/blockchain-control">
              <Button variant="outline" className="gap-2 border-primary/20 hover:border-primary/50 hover:bg-primary/5">
                <Database className="h-4 w-4" />
                Blockchain Control
              </Button>
            </Link>
            <MetaMaskConnect account={account} onConnect={connectWallet} isConnecting={isConnecting} />
          </motion.div>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-12"
        >
          <HexagonalGrid />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <CircuitBoard className="h-5 w-5 text-primary" />
            <span>System Status</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatusIndicator
              title="Blockchain Network"
              status="active"
              icon={<Database className="h-5 w-5" />}
              details="Connected to Ethereum (Chain ID: 1337)"
            />
            <StatusIndicator
              title="Smart Contracts"
              status="active"
              icon={<Layers className="h-5 w-5" />}
              details="All contracts deployed and operational"
            />
            <StatusIndicator
              title="Wallet Connection"
              status={account ? "active" : "inactive"}
              icon={<Wallet className="h-5 w-5" />}
              details={account ? "MetaMask connected" : "MetaMask not connected"}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-primary" />
            <span>Core Modules</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ModuleCard title="Product Registration" icon={<Package />} href="/products" disabled={!account}>
              Register and manage products on the blockchain with immutable records and real-time tracking.
            </ModuleCard>

            <ModuleCard title="Bidding Platform" icon={<Truck />} href="/bidding" disabled={!account}>
              Create and participate in transportation contract bids with secure, transparent auction processes.
            </ModuleCard>

            <ModuleCard title="Supply Chain Explorer" icon={<Boxes />} href="/explorer" disabled={!account}>
              Visualize and explore the entire supply chain network with real-time data and analytics.
            </ModuleCard>

            <ModuleCard title="Custody Transfer" icon={<Box />} href="/custody">
              Securely transfer product custody between supply chain participants with blockchain verification.
            </ModuleCard>

            <ModuleCard title="Analytics Dashboard" icon={<LayoutGrid />} href="/analytics" disabled={!account}>
              Access comprehensive analytics and insights on supply chain performance and blockchain metrics.
            </ModuleCard>

            <ModuleCard title="Admin Console" icon={<CircuitBoard />} href="/admin" disabled={!account}>
              Manage system settings, user roles, and smart contract configurations.
            </ModuleCard>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

interface ModuleCardProps {
  title: string
  icon: React.ReactNode
  href: string
  disabled?: boolean
  children: React.ReactNode
}

function ModuleCard({ title, icon, href, disabled = false, children }: ModuleCardProps) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="relative">
      <Card className="h-full bg-gradient-to-br from-gray-900 to-black border-primary/20 overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <CardContent className="p-6 h-full flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">{icon}</div>
            <h3 className="font-bold text-lg">{title}</h3>
          </div>

          <p className="text-muted-foreground mb-6 flex-grow">{children}</p>

          {disabled ? (
            <Button
              variant="outline"
              className="w-full border-primary/20 hover:border-primary/50 hover:bg-primary/5 mt-auto"
              disabled={true}
            >
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet to Access
            </Button>
          ) : (
            <Link href={href} passHref>
              <Button
                variant="outline"
                className="w-full border-primary/20 hover:border-primary/50 hover:bg-primary/5 mt-auto"
              >
                Access Module
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

