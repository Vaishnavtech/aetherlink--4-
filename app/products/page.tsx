"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ethers } from "ethers"
import {
  ArrowLeft,
  Box,
  CirclePlus,
  Edit,
  Eye,
  Filter,
  LogOut,
  Package,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Truck,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ParticleBackground } from "@/components/particle-background"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { CONTRACT_ADDRESSES, isContract, productMarketplaceAbi } from "@/lib/contracts"
import { Badge } from "@/components/ui/badge"

// Product interface
interface Product {
  id: number
  name: string
  details: string
  quantity: number
  price: number
  producer: string
  status: number
  auctionId?: number
}

export default function ProductsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAuctionDialogOpen, setIsAuctionDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCreatingAuction, setIsCreatingAuction] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [account, setAccount] = useState<string | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [activeTab, setActiveTab] = useState("all")
  const [isMounted, setIsMounted] = useState(false)
  const [hasProducerRole, setHasProducerRole] = useState(false)
  const [contractError, setContractError] = useState<string | null>(null)
  const [isClearingCache, setIsClearingCache] = useState(false)

  // Set isMounted to true when component mounts
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Check if contract exists at the address
  useEffect(() => {
    if (!isMounted) return

    const checkContract = async () => {
      try {
        const exists = await isContract(CONTRACT_ADDRESSES.productRegistration)
        if (!exists) {
          setContractError(`No contract found at address: ${CONTRACT_ADDRESSES.productRegistration}`)
        } else {
          setContractError(null)
        }
      } catch (error) {
        console.error("Error checking contract:", error)
        setContractError("Error checking contract. Using mock data instead.")
      }
    }

    checkContract()
  }, [isMounted])

  // Check if MetaMask is connected
  useEffect(() => {
    // Only run this effect on the client
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

  // Fetch products when account changes
  useEffect(() => {
    if (!isMounted) return

    if (account) {
      fetchProducts()
    } else {
      setProducts([])
    }
  }, [account, isMounted])

  // Update the fetchProducts function to handle errors without mock data
  const fetchProducts = async () => {
    if (!account) return

    setIsFetching(true)
    try {
      if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        const contractAddress = CONTRACT_ADDRESSES.productRegistration
        const contract = new ethers.Contract(contractAddress, productMarketplaceAbi, signer)

        try {
          console.log("Fetching products for account:", account)

          // First, check if the user has the producer role
          const producerRole = await contract.PRODUCER_ROLE()
          const hasRole = await contract.hasRole(producerRole, account)
          setHasProducerRole(hasRole)

          if (!hasRole) {
            console.log("User doesn't have producer role")
            setProducts([])
            toast({
              title: "Permission Required",
              description: "You need the PRODUCER_ROLE to view products. Request it using the button below.",
              variant: "destructive",
            })
            setIsFetching(false)
            return
          }

          try {
            // Get products by producer
            const producerProducts = await contract.getProductsByProducer(account, 0, 100)
            console.log("Producer products:", producerProducts)

            if (!producerProducts || producerProducts.length === 0) {
              setProducts([])
              setIsFetching(false)
              return
            }

            // Convert the returned data to our Product interface
            const fetchedProducts: Product[] = []

            for (let i = 0; i < producerProducts.length; i++) {
              const product = producerProducts[i]
              fetchedProducts.push({
                id: Number(product.productId),
                name: product.name,
                details: product.details,
                quantity: Number(product.quantity),
                price: Number(ethers.formatEther(product.price)),
                producer: product.producer,
                status: Number(product.status),
                auctionId: Number(product.auctionId || 0),
              })
            }

            console.log("Fetched products:", fetchedProducts)
            setProducts(fetchedProducts)
          } catch (error) {
            console.error("Error fetching products from contract:", error)
            setProducts([])
            toast({
              title: "Error",
              description: "Failed to fetch products from the blockchain.",
              variant: "destructive",
            })
          }
        } catch (error) {
          console.error("Error checking producer role:", error)
          setProducts([])
          toast({
            title: "Contract Error",
            description: "Failed to interact with the contract. Please check your connection.",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error("Error fetching products:", error)
      setProducts([])
      toast({
        title: "Error",
        description: "Failed to fetch products from the blockchain.",
        variant: "destructive",
      })
    } finally {
      setIsFetching(false)
    }
  }

  // Add a function to check if user has producer role
  const checkProducerRole = async () => {
    if (!account) {
      return false
    }

    try {
      if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        const contractAddress = CONTRACT_ADDRESSES.productRegistration

        // Check if contract exists
        const exists = await isContract(contractAddress)
        if (!exists) {
          setContractError(`No contract found at address: ${contractAddress}`)
          return false
        }

        const contract = new ethers.Contract(contractAddress, productMarketplaceAbi, signer)

        try {
          // Check if the user has the producer role
          const producerRole = await contract.PRODUCER_ROLE()
          return await contract.hasRole(producerRole, account)
        } catch (error) {
          console.log("Error checking producer role:", error)
          return false
        }
      }
    } catch (error) {
      console.error("Error checking producer role:", error)
      return false
    }

    return false
  }

  // Add this useEffect to check producer role when account changes
  useEffect(() => {
    if (!isMounted || !account) return

    const checkRole = async () => {
      const hasRole = await checkProducerRole()
      setHasProducerRole(hasRole)
    }

    checkRole()
  }, [account, isMounted])

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== "undefined") {
        try {
          const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
          setAccount(accounts[0])
        } catch (error: any) {
          console.error("User rejected the connection request:", error)
          // Handle user rejection
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
    }
  }

  // Add disconnect wallet function
  const disconnectWallet = () => {
    setAccount(null)
    toast({
      title: "Disconnected",
      description: "Your wallet has been disconnected",
    })
  }

  // Update the requestProducerRole function to be more robust
  const requestProducerRole = async () => {
    if (!account) return

    try {
      if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        const contractAddress = CONTRACT_ADDRESSES.productRegistration

        // Check if contract exists
        const exists = await isContract(contractAddress)
        if (!exists) {
          setContractError(`No contract found at address: ${contractAddress}`)
          return
        }

        const contract = new ethers.Contract(contractAddress, productMarketplaceAbi, signer)

        try {
          console.log("Requesting producer role for account:", account)

          // Try to call grantProducerRole
          const tx = await contract.grantProducerRole(account)

          toast({
            title: "Transaction Submitted",
            description: "Your request for producer role has been submitted. Transaction hash: " + tx.hash,
          })

          // Wait for transaction to be mined
          console.log("Waiting for transaction to be mined...")
          await tx.wait()

          toast({
            title: "Producer Role Granted",
            description: "You now have permission to register products",
            variant: "default",
          })

          // Check if the role was actually granted
          const producerRole = await contract.PRODUCER_ROLE()
          const hasRole = await contract.hasRole(producerRole, account)
          setHasProducerRole(hasRole)

          if (hasRole) {
            console.log("Producer role confirmed")
          } else {
            console.log("Producer role not granted despite successful transaction")
            toast({
              title: "Role Not Granted",
              description:
                "The transaction was successful, but you still don't have the producer role. Please contact the admin.",
              variant: "destructive",
            })
          }
        } catch (error) {
          console.error("Error requesting producer role:", error)

          // If the user is not an admin, show a message explaining the situation
          toast({
            title: "Permission Required",
            description: "You need admin rights to grant the PRODUCER_ROLE. Please contact the contract admin.",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error("Error requesting producer role:", error)
      toast({
        title: "Error",
        description: "Failed to request producer role. Please try again later.",
        variant: "destructive",
      })
    }
  }

  // Add clear cache function
  const clearCache = () => {
    setIsClearingCache(true)
    try {
      // Clear products from state
      setProducts([])

      // Clear local storage if you're storing any data there
      localStorage.removeItem("products")

      toast({
        title: "Cache Cleared",
        description: "Product cache has been cleared. Refreshing data...",
      })

      // Refetch products
      setTimeout(() => {
        fetchProducts()
        setIsClearingCache(false)
      }, 1000)
    } catch (error) {
      console.error("Error clearing cache:", error)
      toast({
        title: "Error",
        description: "Failed to clear cache",
        variant: "destructive",
      })
      setIsClearingCache(false)
    }
  }

  // Update the handleRegisterProduct function to be more robust
  const handleRegisterProduct = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const name = formData.get("name") as string
    const details = formData.get("details") as string
    const quantity = formData.get("quantity") as string
    const price = formData.get("price") as string

    try {
      if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        const contractAddress = CONTRACT_ADDRESSES.productRegistration
        const contract = new ethers.Contract(contractAddress, productMarketplaceAbi, signer)

        try {
          console.log("Registering product with params:", {
            name,
            details,
            quantity: quantity.toString(),
            price: ethers.parseEther(price).toString(),
          })

          // Convert price to wei (ETH to smallest unit)
          const priceInWei = ethers.parseEther(price)

          // Register product on blockchain with the correct parameter order
          const tx = await contract.registerProduct(
            name,
            details,
            quantity.toString(), // Pass quantity as string
            priceInWei,
          )

          toast({
            title: "Transaction Submitted",
            description: "Your product registration transaction has been submitted. Transaction hash: " + tx.hash,
          })

          // Wait for transaction to be mined
          console.log("Waiting for transaction to be mined...")
          const receipt = await tx.wait()
          console.log("Transaction receipt:", receipt)

          toast({
            title: "Product Registered",
            description: "Your product has been successfully registered on the blockchain",
            variant: "default",
          })

          // Fetch updated products
          fetchProducts()
          setIsDialogOpen(false)
        } catch (error: any) {
          console.error("Registration error:", error)

          // Check if error message contains specific strings to provide better feedback
          if (error.message && error.message.includes("AccessControl")) {
            toast({
              title: "Permission Denied",
              description: "You don't have the PRODUCER_ROLE required to register products",
              variant: "destructive",
            })

            // Show a button to request producer role
            toast({
              title: "Request Permission",
              description: (
                <div className="flex flex-col gap-2">
                  <p>You need the PRODUCER_ROLE to register products.</p>
                  <Button onClick={requestProducerRole} size="sm">
                    Request Producer Role
                  </Button>
                </div>
              ),
              variant: "destructive",
            })
          } else {
            toast({
              title: "Transaction Failed",
              description: `Failed to register product: ${error.message.substring(0, 100)}...`,
              variant: "destructive",
            })
          }
        }
      }
    } catch (error: any) {
      console.error("Error registering product:", error)
      toast({
        title: "Transaction Failed",
        description: `Error: ${error.message.substring(0, 100)}...`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Update the function to create auction for a product with the correct function name
  const handleCreateAuction = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedProduct) return

    setIsCreatingAuction(true)

    const formData = new FormData(event.currentTarget)
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const originLocation = formData.get("originLocation") as string
    const destinationLocation = formData.get("destinationLocation") as string
    const specialRequirements = formData.get("specialRequirements") as string
    const weight = formData.get("weight") as string
    const startingPrice = formData.get("startingPrice") as string
    const endTimeHours = formData.get("endTimeHours") as string

    try {
      if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        const contractAddress = CONTRACT_ADDRESSES.productRegistration
        const contract = new ethers.Contract(contractAddress, productMarketplaceAbi, signer)

        try {
          console.log("Creating auction with params:", {
            productId: selectedProduct.id,
            title,
            description,
            duration: endTimeHours,
            originLocation,
            destinationLocation,
            startingPrice: ethers.parseEther(startingPrice).toString(),
            specialRequirements,
            weight,
          })

          // Calculate duration in seconds
          const duration = Number.parseInt(endTimeHours) * 3600

          // Convert price to wei
          const priceInWei = ethers.parseEther(startingPrice)

          // Create auction on blockchain using the correct function name
          const tx = await contract.createProductAuction(
            selectedProduct.id,
            title,
            description,
            duration,
            originLocation,
            destinationLocation,
            priceInWei,
            specialRequirements,
            Number.parseInt(weight),
          )

          toast({
            title: "Transaction Submitted",
            description: "Your auction creation transaction has been submitted. Transaction hash: " + tx.hash,
          })

          // Wait for transaction to be mined
          console.log("Waiting for transaction to be mined...")
          const receipt = await tx.wait()
          console.log("Transaction receipt:", receipt)

          toast({
            title: "Auction Created",
            description: "Your auction has been successfully created on the blockchain",
            variant: "default",
          })

          // Fetch updated products
          fetchProducts()
          setIsAuctionDialogOpen(false)
        } catch (error: any) {
          console.error("Error creating auction:", error)

          if (error.message && error.message.includes("product must be active")) {
            toast({
              title: "Product Not Active",
              description: "The product must be in an active state to create an auction.",
              variant: "destructive",
            })
          } else if (error.message && error.message.includes("product already has an auction")) {
            toast({
              title: "Auction Already Exists",
              description: "This product already has an active auction.",
              variant: "destructive",
            })
          } else if (error.message && error.message.includes("AccessControl")) {
            toast({
              title: "Permission Denied",
              description: "You don't have the PRODUCER_ROLE required to create auctions",
              variant: "destructive",
            })
          } else {
            toast({
              title: "Transaction Failed",
              description: `Failed to create auction: ${error.message.substring(0, 100)}...`,
              variant: "destructive",
            })
          }
        }
      }
    } catch (error: any) {
      console.error("Error creating auction:", error)
      toast({
        title: "Transaction Failed",
        description: `Error: ${error.message.substring(0, 100)}...`,
        variant: "destructive",
      })
    } finally {
      setIsCreatingAuction(false)
    }
  }

  const filteredProducts = products.filter((product) => {
    // Filter by search query
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }

    // Filter by tab
    if (activeTab === "active" && product.status !== 0) return false
    if (activeTab === "inactive" && product.status !== 1) return false

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
              onClick={fetchProducts}
              disabled={isFetching || !account}
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="border-primary/20 hover:border-primary/50 hover:bg-primary/5"
              onClick={clearCache}
              disabled={isClearingCache || !account}
              title="Clear Cache"
            >
              <Trash2 className={`h-4 w-4 ${isClearingCache ? "animate-spin" : ""}`} />
            </Button>

            {account ? (
              <div className="flex gap-2">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Register Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-black/90 backdrop-blur-md border-primary/30 text-white">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <CirclePlus className="h-5 w-5 text-primary" />
                        Register New Product
                      </DialogTitle>
                      <DialogDescription>
                        Register a new product on the blockchain. This will create an immutable record.
                      </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleRegisterProduct}>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="name">Product Name</Label>
                          <Input
                            id="name"
                            name="name"
                            placeholder="Enter product name"
                            className="bg-black/50 border-primary/20 focus:border-primary/50"
                            required
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="details">Product Details</Label>
                          <Textarea
                            id="details"
                            name="details"
                            placeholder="Enter product details"
                            className="bg-black/50 border-primary/20 focus:border-primary/50 min-h-[100px]"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="quantity">Quantity</Label>
                            <Input
                              id="quantity"
                              name="quantity"
                              type="number"
                              placeholder="0"
                              className="bg-black/50 border-primary/20 focus:border-primary/50"
                              min="1"
                              required
                            />
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor="price">Price (ETH)</Label>
                            <Input
                              id="price"
                              name="price"
                              type="number"
                              step="0.001"
                              placeholder="0.00"
                              className="bg-black/50 border-primary/20 focus:border-primary/50"
                              min="0"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              Registering...
                            </>
                          ) : (
                            "Register Product"
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>

                <Button variant="outline" onClick={disconnectWallet} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button onClick={connectWallet}>Connect Wallet</Button>
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
                <Package className="h-5 w-5 text-primary" />
                Product Registration
              </CardTitle>
              <CardDescription>
                Register and manage products on the blockchain with immutable records and real-time tracking.
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
                  <Box className="h-5 w-5" />
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
          <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
            <div className="flex justify-between items-center mb-4">
              <TabsList className="bg-black/50 border border-primary/20">
                <TabsTrigger value="all">All Products</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="inactive">Inactive</TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
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
                    <DropdownMenuItem>Sort by Name</DropdownMenuItem>
                    <DropdownMenuItem>Sort by Date</DropdownMenuItem>
                    <DropdownMenuItem>Sort by Price</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <TabsContent value="all" className="mt-0">
              {!account ? (
                <Card className="bg-black/30 border-primary/10 backdrop-blur-sm">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Box className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">Connect Your Wallet</h3>
                    <p className="text-muted-foreground text-center max-w-md mb-6">
                      You need to connect your MetaMask wallet to view and register products on the blockchain.
                    </p>
                    <Button onClick={connectWallet}>Connect MetaMask</Button>
                  </CardContent>
                </Card>
              ) : !hasProducerRole ? (
                <Card className="bg-black/30 border-primary/10 backdrop-blur-sm">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Box className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">Producer Role Required</h3>
                    <p className="text-muted-foreground text-center max-w-md mb-6">
                      You need the PRODUCER_ROLE to register and view products. Request it using the button below.
                    </p>
                    <Button onClick={requestProducerRole}>Request Producer Role</Button>
                  </CardContent>
                </Card>
              ) : isFetching ? (
                <Card className="bg-black/30 border-primary/10 backdrop-blur-sm">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <RefreshCw className="h-16 w-16 text-primary mb-4 animate-spin" />
                    <h3 className="text-xl font-medium mb-2">Loading Products</h3>
                    <p className="text-muted-foreground text-center max-w-md">
                      Fetching your products from the blockchain...
                    </p>
                  </CardContent>
                </Card>
              ) : filteredProducts.length === 0 ? (
                <Card className="bg-black/30 border-primary/10 backdrop-blur-sm">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Box className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">No Products Registered</h3>
                    <p className="text-muted-foreground text-center max-w-md mb-6">
                      You haven't registered any products yet. Click the button below to register your first product.
                    </p>
                    <Button onClick={() => setIsDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Register Product
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onCreateAuction={(product) => {
                        setSelectedProduct(product)
                        setIsAuctionDialogOpen(true)
                      }}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="active" className="mt-0">
              {!account ? (
                <Card className="bg-black/30 border-primary/10 backdrop-blur-sm">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Box className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">Connect Your Wallet</h3>
                    <p className="text-muted-foreground text-center max-w-md mb-6">
                      You need to connect your MetaMask wallet to view active products.
                    </p>
                    <Button onClick={connectWallet}>Connect MetaMask</Button>
                  </CardContent>
                </Card>
              ) : !hasProducerRole ? (
                <Card className="bg-black/30 border-primary/10 backdrop-blur-sm">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Box className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">Producer Role Required</h3>
                    <p className="text-muted-foreground text-center max-w-md mb-6">
                      You need the PRODUCER_ROLE to view active products. Request it using the button below.
                    </p>
                    <Button onClick={requestProducerRole}>Request Producer Role</Button>
                  </CardContent>
                </Card>
              ) : isFetching ? (
                <Card className="bg-black/30 border-primary/10 backdrop-blur-sm">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <RefreshCw className="h-16 w-16 text-primary mb-4 animate-spin" />
                    <h3 className="text-xl font-medium mb-2">Loading Products</h3>
                    <p className="text-muted-foreground text-center max-w-md">
                      Fetching your active products from the blockchain...
                    </p>
                  </CardContent>
                </Card>
              ) : filteredProducts.length === 0 ? (
                <Card className="bg-black/30 border-primary/10 backdrop-blur-sm">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Box className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">No Active Products</h3>
                    <p className="text-muted-foreground text-center max-w-md">
                      You don't have any active products. Register a product and set its status to active.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onCreateAuction={(product) => {
                        setSelectedProduct(product)
                        setIsAuctionDialogOpen(true)
                      }}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="inactive" className="mt-0">
              {!account ? (
                <Card className="bg-black/30 border-primary/10 backdrop-blur-sm">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Box className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">Connect Your Wallet</h3>
                    <p className="text-muted-foreground text-center max-w-md mb-6">
                      You need to connect your MetaMask wallet to view inactive products.
                    </p>
                    <Button onClick={connectWallet}>Connect MetaMask</Button>
                  </CardContent>
                </Card>
              ) : !hasProducerRole ? (
                <Card className="bg-black/30 border-primary/10 backdrop-blur-sm">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Box className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">Producer Role Required</h3>
                    <p className="text-muted-foreground text-center max-w-md mb-6">
                      You need the PRODUCER_ROLE to view inactive products. Request it using the button below.
                    </p>
                    <Button onClick={requestProducerRole}>Request Producer Role</Button>
                  </CardContent>
                </Card>
              ) : isFetching ? (
                <Card className="bg-black/30 border-primary/10 backdrop-blur-sm">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <RefreshCw className="h-16 w-16 text-primary mb-4 animate-spin" />
                    <h3 className="text-xl font-medium mb-2">Loading Products</h3>
                    <p className="text-muted-foreground text-center max-w-md">
                      Fetching your inactive products from the blockchain...
                    </p>
                  </CardContent>
                </Card>
              ) : filteredProducts.length === 0 ? (
                <Card className="bg-black/30 border-primary/10 backdrop-blur-sm">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Box className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">No Inactive Products</h3>
                    <p className="text-muted-foreground text-center max-w-md">You don't have any inactive products.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onCreateAuction={(product) => {
                        setSelectedProduct(product)
                        setIsAuctionDialogOpen(true)
                      }}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Create Auction Dialog */}
      <Dialog open={isAuctionDialogOpen} onOpenChange={setIsAuctionDialogOpen}>
        <DialogContent className="bg-black/90 backdrop-blur-md border-primary/30 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              Create Transport Auction
            </DialogTitle>
            <DialogDescription>
              {selectedProduct && (
                <>
                  Create a transportation auction for "{selectedProduct.name}". Carriers will be able to bid on this
                  auction.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateAuction}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Auction Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Enter auction title"
                  className="bg-black/50 border-primary/20 focus:border-primary/50"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Enter auction details"
                  className="bg-black/50 border-primary/20 focus:border-primary/50 min-h-[100px]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="originLocation">Origin Location</Label>
                  <Input
                    id="originLocation"
                    name="originLocation"
                    placeholder="e.g., Chicago, IL"
                    className="bg-black/50 border-primary/20 focus:border-primary/50"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="destinationLocation">Destination Location</Label>
                  <Input
                    id="destinationLocation"
                    name="destinationLocation"
                    placeholder="e.g., New York, NY"
                    className="bg-black/50 border-primary/20 focus:border-primary/50"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    name="weight"
                    type="number"
                    placeholder="0"
                    className="bg-black/50 border-primary/20 focus:border-primary/50"
                    min="1"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="startingPrice">Starting Price (ETH)</Label>
                  <Input
                    id="startingPrice"
                    name="startingPrice"
                    type="number"
                    step="0.001"
                    placeholder="0.00"
                    className="bg-black/50 border-primary/20 focus:border-primary/50"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="specialRequirements">Special Requirements</Label>
                <Textarea
                  id="specialRequirements"
                  name="specialRequirements"
                  placeholder="Enter any special requirements or conditions"
                  className="bg-black/50 border-primary/20 focus:border-primary/50"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="endTimeHours">Auction Duration (hours)</Label>
                <Input
                  id="endTimeHours"
                  name="endTimeHours"
                  type="number"
                  placeholder="24"
                  className="bg-black/50 border-primary/20 focus:border-primary/50"
                  min="1"
                  defaultValue="24"
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAuctionDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreatingAuction}>
                {isCreatingAuction ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Auction"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface ProductCardProps {
  product: Product
  onCreateAuction: (product: Product) => void
}

function ProductCard({ product, onCreateAuction }: ProductCardProps) {
  const getStatusLabel = (status: number) => {
    switch (status) {
      case 0:
        return { label: "Active", color: "bg-green-500" }
      case 1:
        return { label: "Inactive", color: "bg-red-500" }
      case 2:
        return { label: "Pending", color: "bg-yellow-500" }
      default:
        return { label: "Unknown", color: "bg-gray-500" }
    }
  }

  const status = getStatusLabel(product.status)
  const hasAuction = product.auctionId && product.auctionId > 0

  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Card className="bg-gradient-to-br from-gray-900 to-black border-primary/20 overflow-hidden h-full">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{product.name}</CardTitle>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${status.color}`} />
              <span className="text-xs text-muted-foreground">{status.label}</span>
            </div>
          </div>
          <CardDescription className="line-clamp-2">{product.details}</CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Quantity</p>
              <p className="font-medium">{product.quantity}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Price</p>
              <p className="font-medium">{product.price} ETH</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Producer</p>
            <p className="font-medium text-sm truncate">{product.producer}</p>
          </div>

          {hasAuction && (
            <div className="mt-4">
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                Has Active Auction (ID: {product.auctionId})
              </Badge>
            </div>
          )}
        </CardContent>
        <CardFooter className="pt-2">
          <div className="flex justify-between w-full">
            <Link href={`/products/${product.id}`}>
              <Button
                variant="outline"
                size="sm"
                className="border-primary/20 hover:border-primary/50 hover:bg-primary/5"
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
            </Link>

            {product.status === 0 && !hasAuction ? (
              <Button
                variant="outline"
                size="sm"
                className="border-primary/20 hover:border-primary/50 hover:bg-primary/5"
                onClick={() => onCreateAuction(product)}
              >
                <Truck className="h-4 w-4 mr-1" />
                Create Auction
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="border-primary/20 hover:border-primary/50 hover:bg-primary/5"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

