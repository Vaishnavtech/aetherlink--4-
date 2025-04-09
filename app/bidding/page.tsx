"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ethers } from "ethers"
import {
  ArrowLeft,
  Clock,
  Filter,
  Gavel,
  Plus,
  RefreshCw,
  Search,
  Truck,
  Users,
  MapPin,
  Package,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ParticleBackground } from "@/components/particle-background"
import { MetaMaskConnect } from "@/components/metamask-connect"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { CONTRACT_ADDRESSES, productMarketplaceAbi } from "@/lib/contracts"
import { Badge } from "@/components/ui/badge"

// Auction interface
interface Auction {
  id: number
  productId: number
  title: string
  description: string
  producer: string
  startTime: number
  endTime: number
  originLocation: string
  destinationLocation: string
  startingPrice: bigint
  currentLowestBid: bigint
  lowestBidder: string
  bidCount: number
  status: number // 0: Active, 1: Completed, 2: Cancelled
  specialRequirements: string
  weight: number
  lastUpdated: number
}

// Bid interface
interface Bid {
  carrier: string
  amount: bigint
  timestamp: number
  notes: string
}

export default function BiddingPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [account, setAccount] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [activeTab, setActiveTab] = useState("active")
  const [auctions, setAuctions] = useState<Auction[]>([])
  const [myBids, setMyBids] = useState<number[]>([])
  const [completedAuctions, setCompletedAuctions] = useState<Auction[]>([])
  const [isFetching, setIsFetching] = useState(false)
  const [isBidDialogOpen, setIsBidDialogOpen] = useState(false)
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null)
  const [isProducer, setIsProducer] = useState(false)
  const [isCarrier, setIsCarrier] = useState(false)
  const [isPlacingBid, setIsPlacingBid] = useState(false)
  const [sortOption, setSortOption] = useState("endDate")
  const [contractError, setContractError] = useState<string | null>(null)

  // Set isMounted to true when component mounts
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Check if MetaMask is connected
  useEffect(() => {
    if (!isMounted) return

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

    // Listen for account changes
    if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0])
        } else {
          setAccount(null)
        }
      })
    }

    return () => {
      if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
        window.ethereum.removeListener("accountsChanged", () => {})
      }
    }
  }, [isMounted])

  // Check user roles when account changes
  useEffect(() => {
    if (!isMounted || !account) return

    const checkRoles = async () => {
      try {
        if (typeof window.ethereum !== "undefined") {
          const provider = new ethers.BrowserProvider(window.ethereum)
          const signer = await provider.getSigner()
          const contract = new ethers.Contract(CONTRACT_ADDRESSES.productRegistration, productMarketplaceAbi, signer)

          try {
            // Check if user has PRODUCER_ROLE
            const producerRole = await contract.PRODUCER_ROLE()
            const hasProducerRole = await contract.hasRole(producerRole, account)
            setIsProducer(hasProducerRole)

            // Check if user has CARRIER_ROLE
            const carrierRole = await contract.CARRIER_ROLE()
            const hasCarrierRole = await contract.hasRole(carrierRole, account)
            setIsCarrier(hasCarrierRole)

            setContractError(null)
          } catch (error) {
            console.error("Error checking roles:", error)
            setContractError("Failed to check user roles. Contract may not be deployed correctly.")
          }
        }
      } catch (error) {
        console.error("Error checking roles:", error)
        setContractError("Failed to connect to blockchain. Please check your connection.")
      }
    }

    checkRoles()
  }, [account, isMounted])

  // Fetch auctions when account changes or tab changes
  useEffect(() => {
    if (!isMounted || !account) return

    fetchAuctions()
  }, [account, isMounted, activeTab])

  const connectWallet = async () => {
    setIsConnecting(true)
    try {
      if (typeof window.ethereum !== "undefined") {
        try {
          const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
          setAccount(accounts[0])
        } catch (error: any) {
          console.error("User rejected the connection request:", error)
          if (error.code === 4001) {
            toast({
              title: "Connection Rejected",
              description: "Please connect to MetaMask to use this application",
              variant: "destructive",
            })
          } else {
            toast({
              title: "Connection Error",
              description: "Error connecting to MetaMask. Please try again.",
              variant: "destructive",
            })
          }
        }
      } else {
        toast({
          title: "MetaMask Not Found",
          description: "Please install MetaMask to use this application",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error connecting to MetaMask:", error)
    } finally {
      setIsConnecting(false)
    }
  }

  const fetchAuctions = async () => {
    if (!account) return

    setIsFetching(true)
    try {
      if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        const contract = new ethers.Contract(CONTRACT_ADDRESSES.productRegistration, productMarketplaceAbi, signer)

        if (activeTab === "active") {
          try {
            // Fetch active auctions - This returns an array of full auction data structs
            const activeAuctionsData = await contract.getActiveAuctions(0, 100); // Adjust count as needed
            console.log("Raw active auctions data from contract:", activeAuctionsData);

            // --- CORRECTED LOGIC ---
            // Directly map the returned array of auction structs
            // No need to call getAuction again
            const fetchedAuctions: Auction[] = activeAuctionsData.map((auctionData: any) => ({
                id: Number(auctionData.auctionId), // Extract the ID from the struct
                productId: Number(auctionData.productId),
                title: auctionData.title,
                description: auctionData.description,
                producer: auctionData.producer,
                startTime: Number(auctionData.startTime),
                endTime: Number(auctionData.endTime),
                originLocation: auctionData.originLocation,
                destinationLocation: auctionData.destinationLocation,
                startingPrice: auctionData.startingPrice, // Keep as BigInt
                currentLowestBid: auctionData.currentLowestBid, // Keep as BigInt
                lowestBidder: auctionData.lowestBidder,
                bidCount: Number(auctionData.bidCount),
                status: Number(auctionData.status),
                specialRequirements: auctionData.specialRequirements,
                weight: Number(auctionData.weight),
                lastUpdated: Number(auctionData.lastUpdated),
            }));
            // --- END CORRECTED LOGIC ---

            console.log("Mapped active auctions for state:", fetchedAuctions);
            setAuctions(fetchedAuctions);
            setContractError(null); // Clear any previous error

          } catch (error) {
            console.error("Error processing active auctions:", error); // More specific error log
            setAuctions([]);
            setContractError("Failed to fetch or process active auctions. Check contract/ABI/network.");
          }
        } else if (activeTab === "my-bids") {
            // ... existing correct logic for my-bids (fetch IDs, then loop getAuction) ...
            // Make sure you handle BigInt IDs correctly here too if needed:
            const myBidAuctionIds = await contract.getMyBids();
            console.log("My bid auction IDs:", myBidAuctionIds);
            // Ensure myBids state stores numbers if needed elsewhere, or handle BigInts
            setMyBids(myBidAuctionIds.map((id: bigint) => Number(id)));

            const fetchedAuctions: Auction[] = [];
            for (const auctionIdBigInt of myBidAuctionIds) { // Iterate over BigInts
              const auctionId = Number(auctionIdBigInt); // Convert ID for getAuction if it expects number, or pass BigInt if it accepts that
              try {
                // Pass the ID (as number or BigInt based on what getAuction expects after ethers processing)
                const auctionData = await contract.getAuction(auctionId);
                // ... map auctionData to Auction interface ...
                 fetchedAuctions.push({
                  id: Number(auctionData.auctionId),
                  // ... rest of the mapping ...
                  productId: Number(auctionData.productId),
                  title: auctionData.title,
                  description: auctionData.description,
                  producer: auctionData.producer,
                  startTime: Number(auctionData.startTime),
                  endTime: Number(auctionData.endTime),
                  originLocation: auctionData.originLocation,
                  destinationLocation: auctionData.destinationLocation,
                  startingPrice: auctionData.startingPrice,
                  currentLowestBid: auctionData.currentLowestBid,
                  lowestBidder: auctionData.lowestBidder,
                  bidCount: Number(auctionData.bidCount),
                  status: Number(auctionData.status),
                  specialRequirements: auctionData.specialRequirements,
                  weight: Number(auctionData.weight),
                  lastUpdated: Number(auctionData.lastUpdated),
                });
              } catch (error) {
                console.error(`Error fetching auction ${auctionId} for my bids:`, error);
              }
            }
            console.log("Mapped 'My Bids' auctions for state:", fetchedAuctions);
            setAuctions(fetchedAuctions); // Update auctions state for the 'my-bids' tab

        } else if (activeTab === "completed") {
            // ... existing correct logic for completed (fetch IDs, then loop getAuction) ...
            // Similar handling for BigInt IDs as in 'my-bids'
             const completedAuctionIds = await contract.getCompletedAuctions(0, 100);
             console.log("Completed auction IDs:", completedAuctionIds);

            const fetchedCompletedAuctions: Auction[] = [];
             for (const auctionIdBigInt of completedAuctionIds) {
              const auctionId = Number(auctionIdBigInt);
              try {
                const auctionData = await contract.getAuction(auctionId);
                 fetchedCompletedAuctions.push({
                   id: Number(auctionData.auctionId),
                  // ... rest of the mapping ...
                   productId: Number(auctionData.productId),
                   title: auctionData.title,
                   description: auctionData.description,
                   producer: auctionData.producer,
                   startTime: Number(auctionData.startTime),
                   endTime: Number(auctionData.endTime),
                   originLocation: auctionData.originLocation,
                   destinationLocation: auctionData.destinationLocation,
                   startingPrice: auctionData.startingPrice,
                   currentLowestBid: auctionData.currentLowestBid,
                   lowestBidder: auctionData.lowestBidder,
                   bidCount: Number(auctionData.bidCount),
                   status: Number(auctionData.status),
                   specialRequirements: auctionData.specialRequirements,
                   weight: Number(auctionData.weight),
                   lastUpdated: Number(auctionData.lastUpdated),
                 });
              } catch (error) {
                console.error(`Error fetching completed auction ${auctionId}:`, error);
              }
            }
             console.log("Mapped completed auctions for state:", fetchedCompletedAuctions);
            setCompletedAuctions(fetchedCompletedAuctions); // Set the correct state
        }
        // ... rest of fetchAuctions ...
      }
    } catch (error) {
      console.error("Error fetching auctions:", error)
      toast({
        title: "Error",
        description: "Failed to fetch auctions from the blockchain.",
        variant: "destructive",
      })
      setAuctions([])
    } finally {
      setIsFetching(false)
    }
  }

  const handlePlaceBid = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedAuction) return

    setIsPlacingBid(true)

    const formData = new FormData(event.currentTarget)
    const bidAmount = formData.get("bidAmount") as string
    const notes = formData.get("notes") as string

    try {
      if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        const contract = new ethers.Contract(CONTRACT_ADDRESSES.productRegistration, productMarketplaceAbi, signer)

        // Convert bid amount to wei
        const bidAmountWei = ethers.parseEther(bidAmount)

        console.log("Placing bid with params:", {
          auctionId: selectedAuction.id,
          bidAmount: bidAmountWei.toString(),
          notes,
        })

        // Place bid on blockchain
        const tx = await contract.placeBid(selectedAuction.id, bidAmountWei, notes)

        toast({
          title: "Transaction Submitted",
          description: "Your bid has been submitted to the blockchain. Transaction hash: " + tx.hash,
        })

        // Wait for transaction to be mined
        console.log("Waiting for transaction to be mined...")
        const receipt = await tx.wait()
        console.log("Transaction receipt:", receipt)

        toast({
          title: "Bid Placed",
          description: "Your bid has been successfully placed",
          variant: "default",
        })

        // Fetch updated auctions
        fetchAuctions()
        setIsBidDialogOpen(false)
      }
    } catch (error: any) {
      console.error("Error placing bid:", error)

      // Check for specific error messages
      if (error.message && error.message.includes("bid must be lower than current lowest bid")) {
        toast({
          title: "Bid Too High",
          description: "Your bid must be lower than the current lowest bid.",
          variant: "destructive",
        })
      } else if (error.message && error.message.includes("auction has ended")) {
        toast({
          title: "Auction Ended",
          description: "This auction has already ended.",
          variant: "destructive",
        })
      } else if (error.message && error.message.includes("AccessControl")) {
        toast({
          title: "Permission Denied",
          description: "You need the CARRIER_ROLE to place bids.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Transaction Failed",
          description: `Failed to place bid: ${error.message.substring(0, 100)}...`,
          variant: "destructive",
        })
      }
    } finally {
      setIsPlacingBid(false)
    }
  }

  const handleCompleteAuction = async (auctionId: number) => {
    try {
      if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        const contract = new ethers.Contract(CONTRACT_ADDRESSES.productRegistration, productMarketplaceAbi, signer)

        console.log("Completing auction:", auctionId)

        // Complete auction on blockchain
        const tx = await contract.completeAuction(auctionId)

        toast({
          title: "Transaction Submitted",
          description: "Your auction completion transaction has been submitted. Transaction hash: " + tx.hash,
        })

        // Wait for transaction to be mined
        console.log("Waiting for transaction to be mined...")
        const receipt = await tx.wait()
        console.log("Transaction receipt:", receipt)

        toast({
          title: "Auction Completed",
          description: "The auction has been successfully completed",
          variant: "default",
        })

        // Fetch updated auctions
        fetchAuctions()
      }
    } catch (error: any) {
      console.error("Error completing auction:", error)

      if (error.message && error.message.includes("auction is not active")) {
        toast({
          title: "Auction Not Active",
          description: "This auction is not in an active state.",
          variant: "destructive",
        })
      } else if (error.message && error.message.includes("not authorized")) {
        toast({
          title: "Not Authorized",
          description: "You are not authorized to complete this auction.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Transaction Failed",
          description: `Failed to complete auction: ${error.message.substring(0, 100)}...`,
          variant: "destructive",
        })
      }
    }
  }

  const handleCancelAuction = async (auctionId: number) => {
    try {
      if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        const contract = new ethers.Contract(CONTRACT_ADDRESSES.productRegistration, productMarketplaceAbi, signer)

        console.log("Cancelling auction:", auctionId)

        // Cancel auction on blockchain
        const tx = await contract.cancelAuction(auctionId)

        toast({
          title: "Transaction Submitted",
          description: "Your auction cancellation transaction has been submitted. Transaction hash: " + tx.hash,
        })

        // Wait for transaction to be mined
        console.log("Waiting for transaction to be mined...")
        const receipt = await tx.wait()
        console.log("Transaction receipt:", receipt)

        toast({
          title: "Auction Cancelled",
          description: "The auction has been successfully cancelled",
          variant: "default",
        })

        // Fetch updated auctions
        fetchAuctions()
      }
    } catch (error: any) {
      console.error("Error cancelling auction:", error)

      if (error.message && error.message.includes("auction is not active")) {
        toast({
          title: "Auction Not Active",
          description: "This auction is not in an active state.",
          variant: "destructive",
        })
      } else if (error.message && error.message.includes("not authorized")) {
        toast({
          title: "Not Authorized",
          description: "You are not authorized to cancel this auction.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Transaction Failed",
          description: `Failed to cancel auction: ${error.message.substring(0, 100)}...`,
          variant: "destructive",
        })
      }
    }
  }

  const requestCarrierRole = async () => {
    try {
      if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        const contract = new ethers.Contract(CONTRACT_ADDRESSES.productRegistration, productMarketplaceAbi, signer)

        console.log("Requesting carrier role for account:", account)

        // Request carrier role
        const tx = await contract.grantCarrierRole(account)

        toast({
          title: "Transaction Submitted",
          description: "Your request for carrier role has been submitted. Transaction hash: " + tx.hash,
        })

        // Wait for transaction to be mined
        console.log("Waiting for transaction to be mined...")
        await tx.wait()

        toast({
          title: "Carrier Role Granted",
          description: "You now have permission to place bids",
          variant: "default",
        })

        // Check if the role was actually granted
        const carrierRole = await contract.CARRIER_ROLE()
        const hasRole = await contract.hasRole(carrierRole, account)
        setIsCarrier(hasRole)

        if (hasRole) {
          console.log("Carrier role confirmed")
        } else {
          console.log("Carrier role not granted despite successful transaction")
          toast({
            title: "Role Not Granted",
            description:
              "The transaction was successful, but you still don't have the carrier role. Please contact the admin.",
            variant: "destructive",
          })
        }
      }
    } catch (error: any) {
      console.error("Error requesting carrier role:", error)

      if (error.message && error.message.includes("AccessControl")) {
        toast({
          title: "Permission Required",
          description: "You need admin rights to grant the CARRIER_ROLE. Please contact the contract admin.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Transaction Failed",
          description: `Failed to request carrier role: ${error.message.substring(0, 100)}...`,
          variant: "destructive",
        })
      }
    }
  }

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  const formatTimeRemaining = (endTime: number) => {
    const now = Math.floor(Date.now() / 1000)
    const timeRemaining = endTime - now

    if (timeRemaining <= 0) {
      return "Ended"
    }

    const days = Math.floor(timeRemaining / 86400)
    const hours = Math.floor((timeRemaining % 86400) / 3600)
    const minutes = Math.floor((timeRemaining % 3600) / 60)

    return `${days}d ${hours}h ${minutes}m`
  }

  const formatEther = (wei: bigint) => {
    return Number.parseFloat(ethers.formatEther(wei)).toFixed(3)
  }

  const sortAuctions = (auctions: Auction[]) => {
    const sortedAuctions = [...auctions]

    switch (sortOption) {
      case "endDate":
        return sortedAuctions.sort((a, b) => a.endTime - b.endTime)
      case "startPrice":
        return sortedAuctions.sort((a, b) => Number(a.startingPrice - b.startingPrice))
      case "bidCount":
        return sortedAuctions.sort((a, b) => b.bidCount - a.bidCount)
      default:
        return sortedAuctions
    }
  }

  const filteredAuctions = sortAuctions(auctions).filter((auction) => {
    // Filter by search query
    if (searchQuery && !auction.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    return true
  })

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      <ParticleBackground />
      <Toaster />

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
              onClick={fetchAuctions}
              disabled={isFetching || !account}
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            </Button>

            {account ? (
              !isCarrier ? (
                <Button onClick={requestCarrierRole} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Request Carrier Role
                </Button>
              ) : null
            ) : (
              <MetaMaskConnect account={account} onConnect={connectWallet} isConnecting={isConnecting} />
            )}
          </motion.div>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-br from-gray-900 to-black border-primary/20 overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gavel className="h-5 w-5 text-primary" />
                Bidding Platform
              </CardTitle>
              <CardDescription>
                Create and participate in transportation contract bids with secure, transparent auction processes.
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>

        {contractError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-8"
          >
            <Card className="bg-red-900/30 border-red-500/20 overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-400">
                  <XCircle className="h-5 w-5" />
                  Contract Error
                </CardTitle>
                <CardDescription className="text-red-300">{contractError}</CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Tabs defaultValue="active" className="w-full" onValueChange={setActiveTab}>
            <div className="flex justify-between items-center mb-4">
              <TabsList className="bg-black/50 border border-primary/20">
                <TabsTrigger value="active">Active Auctions</TabsTrigger>
                <TabsTrigger value="my-bids">My Bids</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search auctions..."
                    className="pl-9 w-[250px] bg-black/50 border-primary/20 focus:border-primary/50"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-primary/20 hover:border-primary/50 hover:bg-primary/5"
                    >
                      <Filter className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-black/90 backdrop-blur-md border-primary/30 text-white">
                    <DropdownMenuItem onClick={() => setSortOption("endDate")}>Sort by End Date</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOption("startPrice")}>Sort by Start Price</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOption("bidCount")}>Sort by Bid Count</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <TabsContent value="active" className="mt-0">
              {!account ? (
                <Card className="bg-black/30 border-primary/10 backdrop-blur-sm">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Gavel className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">Connect Your Wallet</h3>
                    <p className="text-muted-foreground text-center max-w-md mb-6">
                      You need to connect your MetaMask wallet to view and participate in auctions.
                    </p>
                    <MetaMaskConnect account={account} onConnect={connectWallet} isConnecting={isConnecting} />
                  </CardContent>
                </Card>
              ) : isFetching ? (
                <Card className="bg-black/30 border-primary/10 backdrop-blur-sm">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <RefreshCw className="h-16 w-16 text-primary mb-4 animate-spin" />
                    <h3 className="text-xl font-medium mb-2">Loading Auctions</h3>
                    <p className="text-muted-foreground text-center max-w-md">
                      Fetching active auctions from the blockchain...
                    </p>
                  </CardContent>
                </Card>
              ) : filteredAuctions.length === 0 ? (
                <Card className="bg-black/30 border-primary/10 backdrop-blur-sm">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Gavel className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">No Active Auctions</h3>
                    <p className="text-muted-foreground text-center max-w-md mb-6">
                      There are no active auctions at the moment. Create auctions from the Products page.
                    </p>
                    <Link href="/products">
                      <Button>
                        <Package className="mr-2 h-4 w-4" />
                        Go to Products
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAuctions.map((auction) => (
                    <AuctionCard
                      key={auction.id}
                      auction={auction}
                      account={account}
                      isCarrier={isCarrier}
                      isProducer={isProducer}
                      onPlaceBid={() => {
                        setSelectedAuction(auction)
                        setIsBidDialogOpen(true)
                      }}
                      onComplete={() => handleCompleteAuction(auction.id)}
                      onCancel={() => handleCancelAuction(auction.id)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="my-bids" className="mt-0">
              {!account ? (
                <Card className="bg-black/30 border-primary/10 backdrop-blur-sm">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Gavel className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">Connect Your Wallet</h3>
                    <p className="text-muted-foreground text-center max-w-md mb-6">
                      You need to connect your MetaMask wallet to view your bids.
                    </p>
                    <MetaMaskConnect account={account} onConnect={connectWallet} isConnecting={isConnecting} />
                  </CardContent>
                </Card>
              ) : !isCarrier ? (
                <Card className="bg-black/30 border-primary/10 backdrop-blur-sm">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Gavel className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">Carrier Role Required</h3>
                    <p className="text-muted-foreground text-center max-w-md mb-6">
                      You need the CARRIER_ROLE to place bids and view your bid history.
                    </p>
                    <Button onClick={requestCarrierRole}>Request Carrier Role</Button>
                  </CardContent>
                </Card>
              ) : isFetching ? (
                <Card className="bg-black/30 border-primary/10 backdrop-blur-sm">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <RefreshCw className="h-16 w-16 text-primary mb-4 animate-spin" />
                    <h3 className="text-xl font-medium mb-2">Loading Your Bids</h3>
                    <p className="text-muted-foreground text-center max-w-md">
                      Fetching your bids from the blockchain...
                    </p>
                  </CardContent>
                </Card>
              ) : filteredAuctions.length === 0 ? (
                <Card className="bg-black/30 border-primary/10 backdrop-blur-sm">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Gavel className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">No Active Bids</h3>
                    <p className="text-muted-foreground text-center max-w-md mb-6">
                      You haven't placed any bids yet. Browse active auctions to start bidding.
                    </p>
                    <Button onClick={() => setActiveTab("active")}>Browse Active Auctions</Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAuctions.map((auction) => (
                    <AuctionCard
                      key={auction.id}
                      auction={auction}
                      account={account}
                      isCarrier={isCarrier}
                      isProducer={isProducer}
                      onPlaceBid={() => {
                        setSelectedAuction(auction)
                        setIsBidDialogOpen(true)
                      }}
                      onComplete={() => handleCompleteAuction(auction.id)}
                      onCancel={() => handleCancelAuction(auction.id)}
                      showBidStatus
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed" className="mt-0">
              {!account ? (
                <Card className="bg-black/30 border-primary/10 backdrop-blur-sm">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Clock className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">Connect Your Wallet</h3>
                    <p className="text-muted-foreground text-center max-w-md mb-6">
                      You need to connect your MetaMask wallet to view completed auctions.
                    </p>
                    <MetaMaskConnect account={account} onConnect={connectWallet} isConnecting={isConnecting} />
                  </CardContent>
                </Card>
              ) : isFetching ? (
                <Card className="bg-black/30 border-primary/10 backdrop-blur-sm">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <RefreshCw className="h-16 w-16 text-primary mb-4 animate-spin" />
                    <h3 className="text-xl font-medium mb-2">Loading Completed Auctions</h3>
                    <p className="text-muted-foreground text-center max-w-md">
                      Fetching completed auctions from the blockchain...
                    </p>
                  </CardContent>
                </Card>
              ) : completedAuctions.length === 0 ? (
                <Card className="bg-black/30 border-primary/10 backdrop-blur-sm">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Clock className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">No Completed Auctions</h3>
                    <p className="text-muted-foreground text-center max-w-md">
                      There are no completed auctions to display.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedAuctions.map((auction) => (
                    <AuctionCard
                      key={auction.id}
                      auction={auction}
                      account={account}
                      isCarrier={isCarrier}
                      isProducer={isProducer}
                      onPlaceBid={() => {}}
                      onComplete={() => {}}
                      onCancel={() => {}}
                      isCompleted
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Bid Dialog */}
      <Dialog open={isBidDialogOpen} onOpenChange={setIsBidDialogOpen}>
        <DialogContent className="bg-black/90 backdrop-blur-md border-primary/30 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gavel className="h-5 w-5 text-primary" />
              Place a Bid
            </DialogTitle>
            <DialogDescription>
              {selectedAuction && (
                <>Place a bid on "{selectedAuction.title}". Your bid must be lower than the current lowest bid.</>
              )}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handlePlaceBid}>
            <div className="grid gap-4 py-4">
              {selectedAuction && (
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Starting Price</p>
                    <p className="font-medium">{formatEther(selectedAuction.startingPrice)} ETH</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Current Lowest Bid</p>
                    <p className="font-medium">
                      {selectedAuction.bidCount > 0
                        ? `${formatEther(selectedAuction.currentLowestBid)} ETH`
                        : "No bids yet"}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="bidAmount">Your Bid (ETH)</Label>
                <Input
                  id="bidAmount"
                  name="bidAmount"
                  type="number"
                  step="0.001"
                  placeholder="0.00"
                  className="bg-black/50 border-primary/20 focus:border-primary/50"
                  min="0"
                  required
                />
                <p className="text-xs text-muted-foreground">Enter a bid amount lower than the current lowest bid.</p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Add any notes about your bid"
                  className="bg-black/50 border-primary/20 focus:border-primary/50"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsBidDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPlacingBid}>
                {isPlacingBid ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Placing Bid...
                  </>
                ) : (
                  "Place Bid"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface AuctionCardProps {
  auction: Auction
  account: string | null
  isCarrier: boolean
  isProducer: boolean
  onPlaceBid: () => void
  onComplete: () => void
  onCancel: () => void
  showBidStatus?: boolean
  isCompleted?: boolean
}

function AuctionCard({
  auction,
  account,
  isCarrier,
  isProducer,
  onPlaceBid,
  onComplete,
  onCancel,
  showBidStatus = false,
  isCompleted = false,
}: AuctionCardProps) {
  const isAuctionProducer = auction.producer.toLowerCase() === account?.toLowerCase()
  const isWinningBidder = auction.lowestBidder.toLowerCase() === account?.toLowerCase()
  const timeRemaining = formatTimeRemaining(auction.endTime)
  const isEnded = timeRemaining === "Ended"

  function formatTimeRemaining(endTime: number) {
    const now = Math.floor(Date.now() / 1000)
    const timeRemaining = endTime - now

    if (timeRemaining <= 0) {
      return "Ended"
    }

    const days = Math.floor(timeRemaining / 86400)
    const hours = Math.floor((timeRemaining % 86400) / 3600)
    const minutes = Math.floor((timeRemaining % 3600) / 60)

    return `${days}d ${hours}h ${minutes}m`
  }

  function formatEther(wei: bigint) {
    return Number.parseFloat(ethers.formatEther(wei)).toFixed(3)
  }

  function formatAddress(address: string) {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Card className="bg-gradient-to-br from-gray-900 to-black border-primary/20 overflow-hidden h-full">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{auction.title}</CardTitle>
            {isCompleted ? (
              <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/50">
                Completed
              </Badge>
            ) : isEnded ? (
              <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
                Ended
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                Active
              </Badge>
            )}
          </div>
          <CardDescription className="line-clamp-2">{auction.description}</CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Starting Price</p>
              <p className="font-medium">{formatEther(auction.startingPrice)} ETH</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Bids</p>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">{auction.bidCount}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">From</p>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium text-sm">{auction.originLocation}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">To</p>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium text-sm">{auction.destinationLocation}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Time Remaining</p>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium text-sm">{timeRemaining}</p>
              </div>
            </div>
          </div>

          {auction.bidCount > 0 && (
            <div className="mb-4">
              <p className="text-xs text-muted-foreground mb-1">Current Lowest Bid</p>
              <p className="font-medium">
                {formatEther(auction.currentLowestBid)} ETH by {formatAddress(auction.lowestBidder)}
              </p>
              {showBidStatus && isWinningBidder && (
                <Badge className="mt-1 bg-green-500/20 text-green-400 border-green-500/50">
                  You are the lowest bidder
                </Badge>
              )}
            </div>
          )}

          {auction.specialRequirements && (
            <div className="mb-4">
              <p className="text-xs text-muted-foreground mb-1">Special Requirements</p>
              <p className="text-sm">{auction.specialRequirements}</p>
            </div>
          )}

          <div>
            <p className="text-xs text-muted-foreground mb-1">Weight</p>
            <div className="flex items-center gap-1">
              <Package className="h-4 w-4 text-muted-foreground" />
              <p className="font-medium text-sm">{auction.weight} kg</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          <div className="flex justify-between w-full">
            {isCompleted ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-primary/20 hover:border-primary/50 hover:bg-primary/5"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-green-500/20 text-green-400 hover:border-green-500/50 hover:bg-green-500/5"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Completed
                </Button>
              </>
            ) : isEnded ? (
              isAuctionProducer ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-primary/20 hover:border-primary/50 hover:bg-primary/5"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                  <Button size="sm" onClick={onComplete} className="bg-green-600 hover:bg-green-700">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Complete
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-primary/20 hover:border-primary/50 hover:bg-primary/5"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                  <Button variant="outline" size="sm" disabled className="border-yellow-500/20 text-yellow-400">
                    <Clock className="h-4 w-4 mr-1" />
                    Ended
                  </Button>
                </>
              )
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-primary/20 hover:border-primary/50 hover:bg-primary/5"
                >
                  <Truck className="h-4 w-4 mr-1" />
                  View Details
                </Button>
                {isAuctionProducer ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onCancel}
                    className="border-red-500/20 text-red-400 hover:border-red-500/50 hover:bg-red-500/5"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                ) : isCarrier ? (
                  <Button size="sm" onClick={onPlaceBid}>
                    Place Bid
                  </Button>
                ) : (
                  <Button size="sm" disabled>
                    Need Carrier Role
                  </Button>
                )}
              </>
            )}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

