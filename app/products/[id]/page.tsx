"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ethers } from "ethers"
import {
  ArrowLeft,
  Box,
  Check,
  Clock,
  Edit,
  ExternalLink,
  Package,
  RefreshCw,
  ShieldCheck,
  Truck,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ParticleBackground } from "@/components/particle-background"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { CONTRACT_ADDRESSES, productRegistrationAbi } from "@/lib/contracts"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface Product {
  id: number
  name: string
  details: string
  quantity: number
  price: number
  producer: string
  status: number
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [account, setAccount] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isChangingStatus, setIsChangingStatus] = useState(false)

  // Form state
  const [editedDetails, setEditedDetails] = useState("")
  const [editedQuantity, setEditedQuantity] = useState("")
  const [editedPrice, setEditedPrice] = useState("")
  const [newStatus, setNewStatus] = useState<string>("")

  // Set isMounted to true when component mounts
  useEffect(() => {
    setIsMounted(true)
  }, [])

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
  }, [isMounted])

  // Fetch product details
  useEffect(() => {
    // Only run this effect on the client
    if (!isMounted || !params.id) return

    const fetchProduct = async () => {
      setIsLoading(true)
      try {
        if (typeof window.ethereum !== "undefined") {
          const provider = new ethers.BrowserProvider(window.ethereum)
          const signer = await provider.getSigner()
          const contractAddress = CONTRACT_ADDRESSES.productRegistration
          const contract = new ethers.Contract(contractAddress, productRegistrationAbi, signer)

          try {
            const productData = await contract.getProduct(params.id)
            console.log("Product data:", productData)

            // Adjust indexes based on the actual contract return structure
            const fetchedProduct = {
              id: Number(productData[0]),
              name: productData[2],
              details: productData[4],
              quantity: Number(productData[3]),
              price: Number(ethers.formatEther(productData[5])),
              producer: productData[1],
              status: Number(productData[6]),
            }

            setProduct(fetchedProduct)

            // Initialize form state with current values
            setEditedDetails(fetchedProduct.details)
            setEditedQuantity(fetchedProduct.quantity.toString())
            setEditedPrice(fetchedProduct.price.toString())
            setNewStatus(fetchedProduct.status.toString())
          } catch (error) {
            console.error("Error fetching product:", error)
            toast({
              title: "Error",
              description: "Failed to fetch product details from the blockchain",
              variant: "destructive",
            })
            router.push("/products")
          }
        }
      } catch (error) {
        console.error("Error fetching product:", error)
        toast({
          title: "Error",
          description: "Failed to fetch product details from the blockchain",
          variant: "destructive",
        })
        router.push("/products")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProduct()
  }, [params.id, router, isMounted])

  const getStatusLabel = (status: number) => {
    switch (status) {
      case 0:
        return { label: "Active", color: "bg-green-500", icon: <Check className="h-4 w-4" /> }
      case 1:
        return { label: "Inactive", color: "bg-red-500", icon: <X className="h-4 w-4" /> }
      case 2:
        return { label: "Recalled", color: "bg-yellow-500", icon: <Clock className="h-4 w-4" /> }
      default:
        return { label: "Unknown", color: "bg-gray-500", icon: <Box className="h-4 w-4" /> }
    }
  }

  const status = product
    ? getStatusLabel(product.status)
    : { label: "Loading", color: "bg-gray-500", icon: <RefreshCw className="h-4 w-4" /> }

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== "undefined") {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
        setAccount(accounts[0])
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

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!product || !account) return

    setIsUpdating(true)

    try {
      if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        const contractAddress = CONTRACT_ADDRESSES.productRegistration
        const contract = new ethers.Contract(contractAddress, productRegistrationAbi, signer)

        try {
          console.log("Updating product with params:", {
            productId: product.id,
            quantity: editedQuantity,
            price: ethers.parseEther(editedPrice).toString(),
            details: editedDetails,
          })

          // Convert price to wei
          const priceInWei = ethers.parseEther(editedPrice)

          // Call the updateProduct function
          const tx = await contract.updateProduct(product.id, editedQuantity, priceInWei, editedDetails)

          toast({
            title: "Transaction Submitted",
            description: "Your product update transaction has been submitted to the blockchain",
          })

          // Wait for transaction to be mined
          await tx.wait()

          toast({
            title: "Product Updated",
            description: "Your product has been successfully updated on the blockchain",
            variant: "default",
          })

          // Update the local product state
          setProduct({
            ...product,
            details: editedDetails,
            quantity: Number(editedQuantity),
            price: Number(editedPrice),
          })

          setIsEditDialogOpen(false)
        } catch (error: any) {
          console.error("Update error:", error)
          toast({
            title: "Transaction Failed",
            description: `Failed to update product: ${error.message.substring(0, 100)}...`,
            variant: "destructive",
          })
        }
      }
    } catch (error: any) {
      console.error("Error updating product:", error)
      toast({
        title: "Error",
        description: `Error: ${error.message.substring(0, 100)}...`,
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleChangeStatus = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!product || !account || newStatus === undefined) return

    setIsChangingStatus(true)

    try {
      if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        const contractAddress = CONTRACT_ADDRESSES.productRegistration
        const contract = new ethers.Contract(contractAddress, productRegistrationAbi, signer)

        try {
          console.log("Changing product status:", {
            productId: product.id,
            newStatus: Number.parseInt(newStatus),
          })

          // Call the changeProductStatus function
          const tx = await contract.changeProductStatus(product.id, Number.parseInt(newStatus))

          toast({
            title: "Transaction Submitted",
            description: "Your status change transaction has been submitted to the blockchain",
          })

          // Wait for transaction to be mined
          await tx.wait()

          toast({
            title: "Status Changed",
            description: "Product status has been successfully updated on the blockchain",
            variant: "default",
          })

          // Update the local product state
          setProduct({
            ...product,
            status: Number.parseInt(newStatus),
          })

          setIsStatusDialogOpen(false)
        } catch (error: any) {
          console.error("Status change error:", error)
          toast({
            title: "Transaction Failed",
            description: `Failed to change status: ${error.message.substring(0, 100)}...`,
            variant: "destructive",
          })
        }
      }
    } catch (error: any) {
      console.error("Error changing status:", error)
      toast({
        title: "Error",
        description: `Error: ${error.message.substring(0, 100)}...`,
        variant: "destructive",
      })
    } finally {
      setIsChangingStatus(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white overflow-hidden relative">
        <ParticleBackground />

        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="flex justify-center items-center h-[70vh]">
            <div className="flex flex-col items-center">
              <RefreshCw className="h-16 w-16 text-primary mb-4 animate-spin" />
              <h3 className="text-xl font-medium mb-2">Loading Product</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Fetching product details from the blockchain...
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-black text-white overflow-hidden relative">
        <ParticleBackground />

        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="flex justify-center items-center h-[70vh]">
            <div className="flex flex-col items-center">
              <Box className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">Product Not Found</h3>
              <p className="text-muted-foreground text-center max-w-md mb-6">
                The product you're looking for doesn't exist or you don't have permission to view it.
              </p>
              <Link href="/products">
                <Button>Back to Products</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

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
            <Link
              href="/products"
              className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Products</span>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-4"
          >
            {!account ? (
              <Button onClick={connectWallet}>Connect Wallet</Button>
            ) : (
              <div className="flex gap-2">
                <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="gap-2 border-primary/20 hover:border-primary/50 hover:bg-primary/5"
                    >
                      <Clock className="h-4 w-4" />
                      Change Status
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-black/90 backdrop-blur-md border-primary/30 text-white">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        Change Product Status
                      </DialogTitle>
                      <DialogDescription>Update the status of your product on the blockchain.</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleChangeStatus}>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="status">Product Status</Label>
                          <Select value={newStatus} onValueChange={setNewStatus}>
                            <SelectTrigger className="bg-black/50 border-primary/20 focus:border-primary/50">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent className="bg-black/90 backdrop-blur-md border-primary/30 text-white">
                              <SelectItem value="0">Active</SelectItem>
                              <SelectItem value="1">Inactive</SelectItem>
                              <SelectItem value="2">Recalled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isChangingStatus}>
                          {isChangingStatus ? (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            "Update Status"
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>

                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="gap-2 border-primary/20 hover:border-primary/50 hover:bg-primary/5"
                    >
                      <Edit className="h-4 w-4" />
                      Edit Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-black/90 backdrop-blur-md border-primary/30 text-white">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Edit className="h-5 w-5 text-primary" />
                        Edit Product
                      </DialogTitle>
                      <DialogDescription>Update your product details on the blockchain.</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleUpdateProduct}>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="details">Product Details</Label>
                          <Textarea
                            id="details"
                            value={editedDetails}
                            onChange={(e) => setEditedDetails(e.target.value)}
                            className="bg-black/50 border-primary/20 focus:border-primary/50 min-h-[100px]"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="quantity">Quantity</Label>
                            <Input
                              id="quantity"
                              type="text"
                              value={editedQuantity}
                              onChange={(e) => setEditedQuantity(e.target.value)}
                              className="bg-black/50 border-primary/20 focus:border-primary/50"
                              required
                            />
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor="price">Price (ETH)</Label>
                            <Input
                              id="price"
                              type="number"
                              step="0.001"
                              value={editedPrice}
                              onChange={(e) => setEditedPrice(e.target.value)}
                              className="bg-black/50 border-primary/20 focus:border-primary/50"
                              min="0"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isUpdating}>
                          {isUpdating ? (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            "Save Changes"
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </motion.div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="lg:col-span-2"
          >
            <Card className="bg-gradient-to-br from-gray-900 to-black border-primary/20 overflow-hidden">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Package className="h-5 w-5 text-primary" />
                      {product.name}
                    </CardTitle>
                    <CardDescription className="mt-2">Product ID: {product.id}</CardDescription>
                  </div>
                  <Badge
                    variant="outline"
                    className={`${status.color} bg-opacity-20 border-none px-3 py-1 flex items-center gap-1`}
                  >
                    {status.icon}
                    {status.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Product Details</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{product.details}</p>
                </div>

                <Separator className="bg-primary/10" />

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Quantity</h3>
                    <p className="text-xl font-medium">{product.quantity}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Price</h3>
                    <p className="text-xl font-medium">{product.price} ETH</p>
                  </div>
                </div>

                <Separator className="bg-primary/10" />

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Producer</h3>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm">{product.producer}</p>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="space-y-6"
          >
            <Card className="bg-gradient-to-br from-gray-900 to-black border-primary/20 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  Blockchain Verification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Contract Address</p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm truncate">{CONTRACT_ADDRESSES.productRegistration}</p>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Blockchain</p>
                  <p>Ethereum (Hardhat Local)</p>
                </div>

                <Button
                  variant="outline"
                  className="w-full border-primary/20 hover:border-primary/50 hover:bg-primary/5"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on Blockchain Explorer
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-900 to-black border-primary/20 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Truck className="h-5 w-5 text-primary" />
                  Logistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full">Create Transport Bid</Button>

                <Button
                  variant="outline"
                  className="w-full border-primary/20 hover:border-primary/50 hover:bg-primary/5"
                >
                  View Supply Chain
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

