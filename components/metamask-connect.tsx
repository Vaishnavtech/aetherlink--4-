"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Loader2, Wallet, LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface MetaMaskConnectProps {
  account: string | null
  onConnect: () => Promise<void>
  isConnecting: boolean
}

export function MetaMaskConnect({ account, onConnect, isConnecting }: MetaMaskConnectProps) {
  const [isHovered, setIsHovered] = useState(false)

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  const handleDisconnect = () => {
    // Clear the local state
    window.localStorage.removeItem("walletconnect")
    window.localStorage.removeItem("WALLETCONNECT_DEEPLINK_CHOICE")

    // Reload the page to reset the connection state
    window.location.reload()

    // Show a message
    alert("To fully disconnect, please also disconnect in your MetaMask extension")
  }

  if (!account) {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <Button onClick={() => onConnect()} disabled={isConnecting} className="relative overflow-hidden group">
          {isConnecting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Wallet className="mr-2 h-4 w-4" />
              Connect MetaMask
              <motion.div
                className="absolute inset-0 bg-primary/20"
                initial={{ x: "-100%" }}
                animate={{ x: isHovered ? "0%" : "-100%" }}
                transition={{ duration: 0.3 }}
              />
            </>
          )}
        </Button>
      </motion.div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="border-primary/30 bg-black/50 backdrop-blur-sm">
          <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
          {formatAddress(account)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-black/90 backdrop-blur-md border-primary/30">
        <DropdownMenuLabel>Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer" onClick={handleDisconnect}>
          <LogOut className="h-4 w-4" />
          <span>Disconnect</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

