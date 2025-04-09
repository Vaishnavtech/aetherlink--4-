"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Code,
  CreditCard,
  Database,
  FileKey,
  Key,
  Lock,
  RefreshCw,
  Shield,
  Wallet,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ParticleBackground } from "@/components/particle-background"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function BlockchainGuidePage() {
  const [activeTab, setActiveTab] = useState("overview")

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
              <CardTitle className="flex items-center gap-2 text-2xl">
                <BookOpen className="h-6 w-6 text-primary" />
                Blockchain & MetaMask Guide
              </CardTitle>
              <CardDescription className="text-base">
                Learn how blockchain transactions work with MetaMask and how AetherLink interacts with the Ethereum
                blockchain.
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Tabs defaultValue="overview" className="w-full" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-black/50 border border-primary/20 mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="metamask">MetaMask</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="smart-contracts">Smart Contracts</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-0 space-y-6">
              <Card className="bg-gradient-to-br from-gray-900 to-black border-primary/20 overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-primary" />
                    What is Blockchain?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    Blockchain is a distributed, decentralized ledger that records transactions across many computers.
                    Each block contains a cryptographic hash of the previous block, a timestamp, and transaction data,
                    making it resistant to modification.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <FeatureCard
                      icon={<Database className="h-5 w-5 text-primary" />}
                      title="Decentralized"
                      description="No single entity controls the network, making it resistant to censorship and central points of failure."
                    />
                    <FeatureCard
                      icon={<Lock className="h-5 w-5 text-primary" />}
                      title="Immutable"
                      description="Once data is recorded, it cannot be altered without consensus, ensuring data integrity."
                    />
                    <FeatureCard
                      icon={<Shield className="h-5 w-5 text-primary" />}
                      title="Transparent"
                      description="All transactions are publicly visible and can be verified by anyone on the network."
                    />
                  </div>

                  <Separator className="my-6 bg-primary/10" />

                  <h3 className="text-lg font-medium mb-2">How AetherLink Uses Blockchain</h3>
                  <p>
                    AetherLink leverages blockchain technology to create a transparent, secure supply chain management
                    system. Every product registration, status update, and custody transfer is recorded on the
                    blockchain, creating an immutable audit trail that can be verified by all participants.
                  </p>

                  <div className="mt-4 flex justify-end">
                    <Button onClick={() => setActiveTab("metamask")} className="gap-2">
                      Learn About MetaMask
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/30 border-primary/10 backdrop-blur-sm overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5 text-primary" />
                    Blockchain Flow in AetherLink
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <div className="flex flex-col md:flex-row items-start gap-6 py-4">
                      <BlockchainFlowStep
                        number="1"
                        title="Connect Wallet"
                        description="User connects their MetaMask wallet to AetherLink"
                        icon={<Wallet className="h-8 w-8 text-primary" />}
                      />
                      <BlockchainFlowStep
                        number="2"
                        title="Interact with UI"
                        description="User performs actions like registering a product"
                        icon={<CreditCard className="h-8 w-8 text-primary" />}
                      />
                      <BlockchainFlowStep
                        number="3"
                        title="Sign Transaction"
                        description="MetaMask prompts user to sign the transaction"
                        icon={<FileKey className="h-8 w-8 text-primary" />}
                      />
                      <BlockchainFlowStep
                        number="4"
                        title="Blockchain Confirmation"
                        description="Transaction is confirmed and recorded on the blockchain"
                        icon={<CheckCircle2 className="h-8 w-8 text-primary" />}
                      />
                    </div>

                    {/* Connection lines */}
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-primary/20 -z-10 hidden md:block"></div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="metamask" className="mt-0 space-y-6">
              <Card className="bg-gradient-to-br from-gray-900 to-black border-primary/20 overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-primary" />
                    What is MetaMask?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    MetaMask is a cryptocurrency wallet and gateway to blockchain applications. It allows you to store
                    Ethereum and other tokens, as well as interact with decentralized applications (dApps) like
                    AetherLink.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Key Features</h3>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span>Secure key storage for your Ethereum accounts</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span>Transaction signing for blockchain interactions</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span>Connection to Ethereum networks (mainnet, testnets, or local networks)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span>Token management for ERC-20 and ERC-721 tokens</span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-black/30 border border-primary/10 rounded-lg p-6">
                      <h3 className="text-lg font-medium mb-4">How MetaMask Works with AetherLink</h3>
                      <p className="text-muted-foreground mb-4">
                        When you interact with AetherLink, the following process occurs:
                      </p>
                      <ol className="space-y-3">
                        <li className="flex items-start gap-2">
                          <div className="bg-primary/20 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                            1
                          </div>
                          <span>AetherLink prepares a transaction to interact with the smart contract</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="bg-primary/20 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                            2
                          </div>
                          <span>MetaMask pops up, showing transaction details and gas fees</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="bg-primary/20 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                            3
                          </div>
                          <span>You review and confirm the transaction</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="bg-primary/20 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                            4
                          </div>
                          <span>
                            MetaMask signs the transaction with your private key and sends it to the blockchain
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="bg-primary/20 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                            5
                          </div>
                          <span>AetherLink updates the UI once the transaction is confirmed</span>
                        </li>
                      </ol>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <Button onClick={() => setActiveTab("transactions")} className="gap-2">
                      Learn About Transactions
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transactions" className="mt-0 space-y-6">
              <Card className="bg-gradient-to-br from-gray-900 to-black border-primary/20 overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5 text-primary" />
                    Blockchain Transactions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    Blockchain transactions are operations that change the state of the blockchain. In AetherLink, these
                    include registering products, updating product details, changing product status, and transferring
                    custody.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Transaction Components</h3>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-2">
                          <div className="bg-primary/20 text-primary rounded-lg p-2 flex-shrink-0">
                            <Key className="h-5 w-5" />
                          </div>
                          <div>
                            <span className="font-medium">From Address</span>
                            <p className="text-sm text-muted-foreground">Your Ethereum address (public key)</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="bg-primary/20 text-primary rounded-lg p-2 flex-shrink-0">
                            <Database className="h-5 w-5" />
                          </div>
                          <div>
                            <span className="font-medium">To Address</span>
                            <p className="text-sm text-muted-foreground">The smart contract address</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="bg-primary/20 text-primary rounded-lg p-2 flex-shrink-0">
                            <Code className="h-5 w-5" />
                          </div>
                          <div>
                            <span className="font-medium">Data</span>
                            <p className="text-sm text-muted-foreground">Function call and parameters</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="bg-primary/20 text-primary rounded-lg p-2 flex-shrink-0">
                            <CreditCard className="h-5 w-5" />
                          </div>
                          <div>
                            <span className="font-medium">Gas Fee</span>
                            <p className="text-sm text-muted-foreground">Payment for transaction processing</p>
                          </div>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-black/30 border border-primary/10 rounded-lg p-6">
                      <h3 className="text-lg font-medium mb-4">Gas Fees Explained</h3>
                      <p className="text-muted-foreground mb-4">
                        Gas fees are payments made to compensate for the computing energy required to process and
                        validate transactions.
                      </p>

                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <div className="bg-primary/20 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                            1
                          </div>
                          <div>
                            <span className="font-medium">Gas Limit</span>
                            <p className="text-sm text-muted-foreground">Maximum amount of gas you're willing to use</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="bg-primary/20 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                            2
                          </div>
                          <div>
                            <span className="font-medium">Gas Price</span>
                            <p className="text-sm text-muted-foreground">
                              Amount you're willing to pay per unit of gas
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="bg-primary/20 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                            3
                          </div>
                          <div>
                            <span className="font-medium">Total Fee</span>
                            <p className="text-sm text-muted-foreground">Gas Limit × Gas Price = Maximum Fee</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 p-3 bg-primary/5 border border-primary/10 rounded-lg">
                        <p className="text-sm">
                          <span className="font-medium text-primary">Note:</span> In AetherLink's local development
                          environment, gas fees are simulated and don't require real ETH. In production, real ETH would
                          be needed.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <Button onClick={() => setActiveTab("smart-contracts")} className="gap-2">
                      Learn About Smart Contracts
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="smart-contracts" className="mt-0 space-y-6">
              <Card className="bg-gradient-to-br from-gray-900 to-black border-primary/20 overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5 text-primary" />
                    Smart Contracts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    Smart contracts are self-executing contracts with the terms directly written into code. They
                    automatically enforce and execute agreements when predefined conditions are met, without the need
                    for intermediaries.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">AetherLink Smart Contracts</h3>
                      <p className="text-muted-foreground mb-4">
                        AetherLink uses several smart contracts to manage the supply chain:
                      </p>

                      <div className="space-y-3">
                        <div className="bg-black/30 border border-primary/10 rounded-lg p-4">
                          <h4 className="font-medium text-primary mb-1">ProductRegistration Contract</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            Manages product registration, updates, and status changes.
                          </p>
                          <div className="text-xs font-mono bg-black/50 p-2 rounded border border-primary/10 overflow-x-auto">
                            {`contract ProductRegistration {
  function registerProduct(...) { ... }
  function updateProduct(...) { ... }
  function changeProductStatus(...) { ... }
}`}
                          </div>
                        </div>

                        <div className="bg-black/30 border border-primary/10 rounded-lg p-4">
                          <h4 className="font-medium text-primary mb-1">Bidding Contract</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            Handles transportation contract bids and auctions.
                          </p>
                          <div className="text-xs font-mono bg-black/50 p-2 rounded border border-primary/10 overflow-x-auto">
                            {`contract Bidding {
  function createAuction(...) { ... }
  function placeBid(...) { ... }
  function endAuction(...) { ... }
}`}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-black/30 border border-primary/10 rounded-lg p-6">
                      <h3 className="text-lg font-medium mb-4">How Smart Contracts Work</h3>

                      <div className="space-y-4">
                        <p className="text-muted-foreground">
                          When you interact with AetherLink, here's what happens behind the scenes:
                        </p>

                        <ol className="space-y-3">
                          <li className="flex items-start gap-2">
                            <div className="bg-primary/20 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                              1
                            </div>
                            <span>Your action in the UI triggers a function call to a smart contract</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="bg-primary/20 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                              2
                            </div>
                            <span>MetaMask creates a transaction that includes the function call and parameters</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="bg-primary/20 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                              3
                            </div>
                            <span>After you confirm, the transaction is sent to the blockchain</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="bg-primary/20 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                              4
                            </div>
                            <span>Miners/validators process the transaction and execute the smart contract code</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="bg-primary/20 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                              5
                            </div>
                            <span>The contract's state is updated on the blockchain</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="bg-primary/20 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                              6
                            </div>
                            <span>Events emitted by the contract are captured by AetherLink to update the UI</span>
                          </li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <Button onClick={() => setActiveTab("security")} className="gap-2">
                      Learn About Security
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="mt-0 space-y-6">
              <Card className="bg-gradient-to-br from-gray-900 to-black border-primary/20 overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Security Best Practices
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    Security is paramount when working with blockchain applications. Here are some best practices to
                    keep your assets and data safe when using AetherLink and MetaMask.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">MetaMask Security</h3>

                      <ul className="space-y-3">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">Never share your seed phrase</span>
                            <p className="text-sm text-muted-foreground">
                              Your seed phrase can be used to access all your accounts. Keep it offline and secure.
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">Use a strong password</span>
                            <p className="text-sm text-muted-foreground">
                              Protect your MetaMask with a unique, complex password.
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">Check transaction details</span>
                            <p className="text-sm text-muted-foreground">
                              Always verify the contract address and function being called before confirming.
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">Consider hardware wallets</span>
                            <p className="text-sm text-muted-foreground">
                              For enhanced security, use a hardware wallet with MetaMask.
                            </p>
                          </div>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-black/30 border border-primary/10 rounded-lg p-6">
                      <h3 className="text-lg font-medium mb-4">AetherLink Security Features</h3>

                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <div className="bg-primary/20 text-primary rounded-lg p-2 flex-shrink-0">
                            <Lock className="h-5 w-5" />
                          </div>
                          <div>
                            <span className="font-medium">Role-Based Access Control</span>
                            <p className="text-sm text-muted-foreground">
                              Only authorized addresses can perform certain actions.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <div className="bg-primary/20 text-primary rounded-lg p-2 flex-shrink-0">
                            <Shield className="h-5 w-5" />
                          </div>
                          <div>
                            <span className="font-medium">Secure Smart Contracts</span>
                            <p className="text-sm text-muted-foreground">
                              Contracts are designed with security best practices.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <div className="bg-primary/20 text-primary rounded-lg p-2 flex-shrink-0">
                            <RefreshCw className="h-5 w-5" />
                          </div>
                          <div>
                            <span className="font-medium">Transaction Verification</span>
                            <p className="text-sm text-muted-foreground">
                              Clear transaction details are shown before signing.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <div className="bg-primary/20 text-primary rounded-lg p-2 flex-shrink-0">
                            <Database className="h-5 w-5" />
                          </div>
                          <div>
                            <span className="font-medium">Immutable Audit Trail</span>
                            <p className="text-sm text-muted-foreground">
                              All actions are recorded on the blockchain for transparency.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 p-3 bg-primary/5 border border-primary/10 rounded-lg">
                        <p className="text-sm">
                          <span className="font-medium text-primary">Remember:</span> In blockchain, security is a
                          shared responsibility. AetherLink provides secure infrastructure, but users must also follow
                          best practices.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-center">
                    <Link href="/">
                      <Button variant="outline" className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Return to Dashboard
                      </Button>
                    </Link>
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

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-black/30 border border-primary/10 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h3 className="font-medium">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

interface BlockchainFlowStepProps {
  number: string
  title: string
  description: string
  icon: React.ReactNode
}

function BlockchainFlowStep({ number, title, description, icon }: BlockchainFlowStepProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative mb-4">
        <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center">{icon}</div>
        <div className="absolute -top-2 -right-2 bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
          {number}
        </div>
      </div>
      <h3 className="font-medium mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-[200px]">{description}</p>
    </div>
  )
}

