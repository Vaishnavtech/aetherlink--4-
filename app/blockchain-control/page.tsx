"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ethers } from "ethers"
import {
  Activity,
  ArrowLeft,
  ArrowUpDown,
  Box,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Code,
  Copy,
  Database,
  FileText,
  GaugeCircle,
  History,
  Layers,
  Network,
  RefreshCw,
  Search,
  Wallet,
  XCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ParticleBackground } from "@/components/particle-background"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { CONTRACT_ADDRESSES } from "@/lib/contracts"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

// Mock transaction data
const mockTransactions = [
  {
    hash: "0x1a2b3c4d5e6f...",
    from: "0xf39Fd6e51Ec89c3Af2c7B9196eC7FE87c494D7Ee",
    to: CONTRACT_ADDRESSES.productRegistration,
    value: "0",
    gasUsed: "75000",
    status: "success",
    timestamp: Date.now() - 1000 * 60 * 5, // 5 minutes ago
    method: "registerProduct",
  },
  {
    hash: "0x2b3c4d5e6f7g...",
    from: "0xf39Fd6e51Ec89c3Af2c7B9196eC7FE87c494D7Ee",
    to: CONTRACT_ADDRESSES.productRegistration,
    value: "0",
    gasUsed: "45000",
    status: "success",
    timestamp: Date.now() - 1000 * 60 * 15, // 15 minutes ago
    method: "updateProduct",
  },
  {
    hash: "0x3c4d5e6f7g8h...",
    from: "0xf39Fd6e51Ec89c3Af2c7B9196eC7FE87c494D7Ee",
    to: CONTRACT_ADDRESSES.productAuction,
    value: "0.5",
    gasUsed: "120000",
    status: "success",
    timestamp: Date.now() - 1000 * 60 * 60, // 1 hour ago
    method: "placeBid",
  },
  {
    hash: "0x4d5e6f7g8h9i...",
    from: "0xf39Fd6e51Ec89c3Af2c7B9196eC7FE87c494D7Ee",
    to: CONTRACT_ADDRESSES.productRegistration,
    value: "0",
    gasUsed: "35000",
    status: "failed",
    timestamp: Date.now() - 1000 * 60 * 120, // 2 hours ago
    method: "changeProductStatus",
  },
]

export default function BlockchainControlPage() {
  const [account, setAccount] = useState<string | null>(null)
  const [balance, setBalance] = useState<string>("0")
  const [networkName, setNetworkName] = useState<string>("Unknown")
  const [chainId, setChainId] = useState<string>("Unknown")
  const [blockNumber, setBlockNumber] = useState<number>(0)
  const [gasPrice, setGasPrice] = useState<string>("0")
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const [transactions, setTransactions] = useState(mockTransactions)
  const [searchQuery, setSearchQuery] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Set isMounted to true when component mounts
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Initialize blockchain data
  useEffect(() => {
    if (!isMounted) return

    const initBlockchainData = async () => {
      setIsLoading(true)
      try {
        if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
          // Get provider
          const provider = new ethers.BrowserProvider(window.ethereum)

          // Get accounts
          const accounts = await provider.listAccounts()
          if (accounts.length > 0) {
            setAccount(accounts[0].address)

            // Get balance
            const balanceWei = await provider.getBalance(accounts[0].address)
            setBalance(ethers.formatEther(balanceWei))
          }

          // Get network information
          const network = await provider.getNetwork()
          setNetworkName(network.name === "unknown" ? "Local Hardhat" : network.name)
          setChainId(network.chainId.toString())

          // Get latest block number
          const blockNum = await provider.getBlockNumber()
          setBlockNumber(blockNum)

          // Get gas price
          const gasPriceWei = await provider.getFeeData()
          if (gasPriceWei.gasPrice) {
            setGasPrice(ethers.formatUnits(gasPriceWei.gasPrice, "gwei"))
          }
        }
      } catch (error) {
        console.error("Error initializing blockchain data:", error)
        toast({
          title: "Connection Error",
          description: "Failed to connect to blockchain. Using mock data.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    initBlockchainData()

    // Set up event listeners for MetaMask
    if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)
    }

    return () => {
      if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
        window.ethereum.removeListener("chainChanged", handleChainChanged)
      }
    }
  }, [isMounted])

  const handleAccountsChanged = async (accounts: string[]) => {
    if (accounts && accounts.length > 0) {
      setAccount(accounts[0])

      try {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const balanceWei = await provider.getBalance(accounts[0])
        setBalance(ethers.formatEther(balanceWei))
      } catch (error) {
        console.error("Error getting balance:", error)
      }
    } else {
      setAccount(null)
      setBalance("0")
    }
  }

  const handleChainChanged = () => {
    // Reload the page when the chain changes
    window.location.reload()
  }

  const connectWallet = async () => {
    try {
      if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
        setAccount(accounts[0])

        const provider = new ethers.BrowserProvider(window.ethereum)
        const balanceWei = await provider.getBalance(accounts[0])
        setBalance(ethers.formatEther(balanceWei))
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

  const refreshBlockchainData = async () => {
    setIsRefreshing(true)
    try {
      if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
        const provider = new ethers.BrowserProvider(window.ethereum)

        // Refresh block number
        const blockNum = await provider.getBlockNumber()
        setBlockNumber(blockNum)

        // Refresh gas price
        const gasPriceWei = await provider.getFeeData()
        if (gasPriceWei.gasPrice) {
          setGasPrice(ethers.formatUnits(gasPriceWei.gasPrice, "gwei"))
        }

        // Refresh balance if account is connected
        if (account) {
          const balanceWei = await provider.getBalance(account)
          setBalance(ethers.formatEther(balanceWei))
        }

        toast({
          title: "Data Refreshed",
          description: "Blockchain data has been updated",
        })
      }
    } catch (error) {
      console.error("Error refreshing blockchain data:", error)
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh blockchain data",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "Copied to clipboard",
    })
  }

  const formatAddress = (address: string) => {
    if (!address) return "Unknown"
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)

    if (seconds < 60) return `${seconds} seconds ago`

    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`

    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`

    const days = Math.floor(hours / 24)
    return `${days} day${days !== 1 ? "s" : ""} ago`
  }

  const filteredTransactions = transactions.filter(
    (tx) =>
      tx.hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.to.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.method.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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
              onClick={refreshBlockchainData}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>

            {!account ? (
              <Button onClick={connectWallet}>
                <Wallet className="mr-2 h-4 w-4" />
                Connect Wallet
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-primary/30 bg-black/50 backdrop-blur-sm">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
                    {formatAddress(account)}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-black/90 backdrop-blur-md border-primary/30 text-white">
                  <DropdownMenuLabel>Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => copyToClipboard(account)}
                  >
                    <Copy className="h-4 w-4" />
                    <span>Copy Address</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
                <Database className="h-5 w-5 text-primary" />
                Blockchain Control Center
              </CardTitle>
              <CardDescription>
                Monitor blockchain status, view transactions, and interact with smart contracts.
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="lg:col-span-2"
          >
            <Card className="bg-gradient-to-br from-gray-900 to-black border-primary/20 overflow-hidden h-full">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Network Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatusCard
                    title="Network"
                    value={networkName}
                    icon={<Network className="h-5 w-5 text-primary" />}
                    isLoading={isLoading}
                  />
                  <StatusCard
                    title="Chain ID"
                    value={chainId}
                    icon={<Layers className="h-5 w-5 text-primary" />}
                    isLoading={isLoading}
                  />
                  <StatusCard
                    title="Block Number"
                    value={blockNumber.toString()}
                    icon={<Box className="h-5 w-5 text-primary" />}
                    isLoading={isLoading}
                  />
                  <StatusCard
                    title="Gas Price"
                    value={`${Number.parseFloat(gasPrice).toFixed(2)} Gwei`}
                    icon={<GaugeCircle className="h-5 w-5 text-primary" />}
                    isLoading={isLoading}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Card className="bg-gradient-to-br from-gray-900 to-black border-primary/20 overflow-hidden h-full">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary" />
                  Wallet Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!account ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Wallet Not Connected</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      Connect your wallet to view account details and balance.
                    </p>
                    <Button onClick={connectWallet}>Connect Wallet</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Account Address</h3>
                      <div className="flex items-center gap-2 bg-black/30 p-2 rounded-md">
                        <p className="font-mono text-sm truncate">{account}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 hover:bg-primary/10"
                          onClick={() => copyToClipboard(account)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Balance</h3>
                      <div className="flex items-center gap-2">
                        <CircleDollarSign className="h-5 w-5 text-primary" />
                        <p className="text-xl font-medium">{Number.parseFloat(balance).toFixed(4)} ETH</p>
                      </div>
                    </div>

                    <Separator className="bg-primary/10" />

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Connected Contracts</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between bg-black/30 p-2 rounded-md">
                          <span className="text-sm">ProductRegistration</span>
                          <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                            Active
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between bg-black/30 p-2 rounded-md">
                          <span className="text-sm">ProductAuction</span>
                          <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                            Active
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mb-8"
        >
          <Tabs defaultValue="transactions" className="w-full">
            <TabsList className="bg-black/50 border border-primary/20 mb-4">
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="contracts">Smart Contracts</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
            </TabsList>

            <TabsContent value="transactions" className="mt-0">
              <Card className="bg-gradient-to-br from-gray-900 to-black border-primary/20 overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <CardTitle className="flex items-center gap-2">
                      <History className="h-5 w-5 text-primary" />
                      Transaction History
                    </CardTitle>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search transactions..."
                        className="pl-9 w-full md:w-[300px] bg-black/50 border-primary/20 focus:border-primary/50"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-primary/10">
                          <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Hash</th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Method</th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">From</th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">To</th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Value</th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Status</th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTransactions.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center py-8 text-muted-foreground">
                              No transactions found
                            </td>
                          </tr>
                        ) : (
                          filteredTransactions.map((tx, index) => (
                            <tr key={index} className="border-b border-primary/5 hover:bg-primary/5 transition-colors">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs">{tx.hash}</span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 hover:bg-primary/10"
                                    onClick={() => copyToClipboard(tx.hash)}
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <Badge variant="outline" className="bg-primary/10 border-primary/20">
                                  {tx.method}
                                </Badge>
                              </td>
                              <td className="py-3 px-4 font-mono text-xs">{formatAddress(tx.from)}</td>
                              <td className="py-3 px-4 font-mono text-xs">{formatAddress(tx.to)}</td>
                              <td className="py-3 px-4">{tx.value} ETH</td>
                              <td className="py-3 px-4">
                                {tx.status === "success" ? (
                                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Success
                                  </Badge>
                                ) : (
                                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Failed
                                  </Badge>
                                )}
                              </td>
                              <td className="py-3 px-4 text-xs text-muted-foreground">
                                <div className="flex flex-col">
                                  <span>{formatTimeAgo(tx.timestamp)}</span>
                                  <span>{formatTimestamp(tx.timestamp)}</span>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contracts" className="mt-0">
              <Card className="bg-gradient-to-br from-gray-900 to-black border-primary/20 overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5 text-primary" />
                    Smart Contract Interaction
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="product-registration" className="border-primary/10">
                      <AccordionTrigger className="hover:bg-primary/5 px-4 py-2 rounded-md">
                        <div className="flex items-center gap-2">
                          <Box className="h-5 w-5 text-primary" />
                          <span>ProductRegistration Contract</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium">Contract Address</h3>
                              <div className="flex items-center gap-2">
                                <p className="font-mono text-xs">{CONTRACT_ADDRESSES.productRegistration}</p>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 hover:bg-primary/10"
                                  onClick={() => copyToClipboard(CONTRACT_ADDRESSES.productRegistration)}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                              Deployed
                            </Badge>
                          </div>

                          <Separator className="bg-primary/10" />

                          <div>
                            <h3 className="font-medium mb-2">Contract Functions</h3>
                            <div className="space-y-2">
                              <ContractFunction
                                name="registerProduct"
                                description="Register a new product on the blockchain"
                                type="write"
                              />
                              <ContractFunction
                                name="updateProduct"
                                description="Update an existing product's details"
                                type="write"
                              />
                              <ContractFunction
                                name="changeProductStatus"
                                description="Change a product's status"
                                type="write"
                              />
                              <ContractFunction
                                name="getProduct"
                                description="Get details of a specific product"
                                type="read"
                              />
                              <ContractFunction
                                name="getProductsByProducer"
                                description="Get all products registered by a specific producer"
                                type="read"
                              />
                            </div>
                          </div>

                          <div className="mt-4 p-4 bg-black/30 border border-primary/10 rounded-lg">
                            <h3 className="font-medium mb-2">Execute Function</h3>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="function-select">Select Function</Label>
                                <select
                                  id="function-select"
                                  className="w-full mt-1 bg-black/50 border border-primary/20 rounded-md p-2 text-sm"
                                >
                                  <option value="getProduct">getProduct</option>
                                  <option value="getProductsByProducer">getProductsByProducer</option>
                                  <option value="registerProduct">registerProduct</option>
                                  <option value="updateProduct">updateProduct</option>
                                  <option value="changeProductStatus">changeProductStatus</option>
                                </select>
                              </div>

                              <div>
                                <Label htmlFor="function-params">Parameters (JSON format)</Label>
                                <Input
                                  id="function-params"
                                  placeholder='{"productId": 1}'
                                  className="mt-1 bg-black/50 border-primary/20 focus:border-primary/50"
                                />
                              </div>

                              <div className="flex justify-end">
                                <Button>Execute Function</Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="bidding" className="border-primary/10">
                      <AccordionTrigger className="hover:bg-primary/5 px-4 py-2 rounded-md">
                        <div className="flex items-center gap-2">
                          <ArrowUpDown className="h-5 w-5 text-primary" />
                          <span>ProductAuction Contract</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium">Contract Address</h3>
                              <div className="flex items-center gap-2">
                                <p className="font-mono text-xs">{CONTRACT_ADDRESSES.productAuction}</p>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 hover:bg-primary/10"
                                  onClick={() => copyToClipboard(CONTRACT_ADDRESSES.productAuction)}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                              Deployed
                            </Badge>
                          </div>

                          <Separator className="bg-primary/10" />

                          <div>
                            <h3 className="font-medium mb-2">Contract Functions</h3>
                            <div className="space-y-2">
                              <ContractFunction
                                name="createAuction"
                                description="Create a new auction for transportation"
                                type="write"
                              />
                              <ContractFunction
                                name="placeBid"
                                description="Place a bid on an existing auction"
                                type="write"
                              />
                              <ContractFunction
                                name="completeAuction"
                                description="End an auction and select the winner"
                                type="write"
                              />
                              <ContractFunction
                                name="getAuction"
                                description="Get details of a specific auction"
                                type="read"
                              />
                              <ContractFunction
                                name="getAuctionBids"
                                description="Get all bids for a specific auction"
                                type="read"
                              />
                            </div>
                          </div>

                          <div className="mt-4 p-4 bg-black/30 border border-primary/10 rounded-lg">
                            <h3 className="font-medium mb-2">Execute Function</h3>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="bidding-function-select">Select Function</Label>
                                <select
                                  id="bidding-function-select"
                                  className="w-full mt-1 bg-black/50 border border-primary/20 rounded-md p-2 text-sm"
                                >
                                  <option value="getAuction">getAuction</option>
                                  <option value="getAuctionBids">getAuctionBids</option>
                                  <option value="createAuction">createAuction</option>
                                  <option value="placeBid">placeBid</option>
                                  <option value="completeAuction">completeAuction</option>
                                </select>
                              </div>

                              <div>
                                <Label htmlFor="bidding-function-params">Parameters (JSON format)</Label>
                                <Input
                                  id="bidding-function-params"
                                  placeholder='{"auctionId": 1}'
                                  className="mt-1 bg-black/50 border-primary/20 focus:border-primary/50"
                                />
                              </div>

                              <div className="flex justify-end">
                                <Button>Execute Function</Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="events" className="mt-0">
              <Card className="bg-gradient-to-br from-gray-900 to-black border-primary/20 overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Contract Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="event-filter">Filter by Contract</Label>
                      <select id="event-filter" className="bg-black/50 border border-primary/20 rounded-md p-2 text-sm">
                        <option value="all">All Contracts</option>
                        <option value="product">ProductRegistration</option>
                        <option value="bidding">ProductAuction</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <EventItem
                        name="ProductRegistered"
                        contract="ProductRegistration"
                        data={{
                          productId: 1,
                          producer: "0xf39Fd6e51Ec89c3Af2c7B9196eC7FE87c494D7Ee",
                          name: "Organic Apples",
                          timestamp: Date.now() - 1000 * 60 * 5,
                        }}
                      />
                      <EventItem
                        name="ProductUpdated"
                        contract="ProductRegistration"
                        data={{
                          productId: 1,
                          producer: "0xf39Fd6e51Ec89c3Af2c7B9196eC7FE87c494D7Ee",
                          quantity: "1200",
                          price: "1.8",
                          timestamp: Date.now() - 1000 * 60 * 15,
                        }}
                      />
                      <EventItem
                        name="AuctionCreated"
                        contract="ProductAuction"
                        data={{
                          auctionId: 1,
                          creator: "0xf39Fd6e51Ec89c3Af2c7B9196eC7FE87c494D7Ee",
                          startPrice: "0.5",
                          endTime: "2025-04-15T18:00:00",
                          timestamp: Date.now() - 1000 * 60 * 60,
                        }}
                      />
                      <EventItem
                        name="BidPlaced"
                        contract="ProductAuction"
                        data={{
                          auctionId: 1,
                          bidder: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
                          amount: "0.6",
                          timestamp: Date.now() - 1000 * 60 * 120,
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}

interface StatusCardProps {
  title: string
  value: string
  icon: React.ReactNode
  isLoading: boolean
}

function StatusCard({ title, value, icon, isLoading }: StatusCardProps) {
  return (
    <div className="bg-black/30 border border-primary/10 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      </div>
      {isLoading ? (
        <div className="h-6 w-20 bg-primary/10 animate-pulse rounded"></div>
      ) : (
        <p className="text-lg font-medium">{value}</p>
      )}
    </div>
  )
}

interface ContractFunctionProps {
  name: string
  description: string
  type: "read" | "write"
}

function ContractFunction({ name, description, type }: ContractFunctionProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-black/30 border border-primary/10 rounded-md">
      <div>
        <h4 className="font-medium text-sm">{name}</h4>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Badge
        variant="outline"
        className={
          type === "read"
            ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
            : "bg-amber-500/20 text-amber-400 border-amber-500/30"
        }
      >
        {type === "read" ? "Read" : "Write"}
      </Badge>
    </div>
  )
}

interface EventItemProps {
  name: string
  contract: string
  data: Record<string, any>
}

function EventItem({ name, contract, data }: EventItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="bg-black/30 border border-primary/10 rounded-md overflow-hidden">
      <div
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-primary/5"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={
              contract === "ProductRegistration"
                ? "bg-green-500/20 text-green-400 border-green-500/30"
                : "bg-blue-500/20 text-blue-400 border-blue-500/30"
            }
          >
            {contract}
          </Badge>
          <h4 className="font-medium text-sm">{name}</h4>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{new Date(data.timestamp).toLocaleString()}</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? "transform rotate-180" : ""}`} />
        </div>
      </div>

      {isExpanded && (
        <div className="p-3 border-t border-primary/10 bg-black/20">
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(data).map(
              ([key, value]) =>
                key !== "timestamp" && (
                  <div key={key}>
                    <span className="text-xs text-muted-foreground">{key}:</span>
                    <p className="text-sm font-mono break-all">{String(value)}</p>
                  </div>
                ),
            )}
          </div>
        </div>
      )}
    </div>
  )
}

