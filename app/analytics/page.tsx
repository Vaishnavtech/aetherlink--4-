"use client"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, BarChart, LineChart, PieChart, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ParticleBackground } from "@/components/particle-background"

export default function AnalyticsPage() {
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-br from-gray-900 to-black border-primary/20 overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5 text-primary" />
                Analytics Dashboard
              </CardTitle>
              <CardDescription>
                Access comprehensive analytics and insights on supply chain performance and blockchain metrics.
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="bg-black/50 border border-primary/20 mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="network">Network</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card className="bg-gradient-to-br from-gray-900 to-black border-primary/20 overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <LineChart className="h-4 w-4 text-primary" />
                      Activity Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px] flex items-center justify-center">
                      <p className="text-muted-foreground">Analytics data will appear here</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-gray-900 to-black border-primary/20 overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <PieChart className="h-4 w-4 text-primary" />
                      Product Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px] flex items-center justify-center">
                      <p className="text-muted-foreground">Product distribution data will appear here</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-black/30 border-primary/10 backdrop-blur-sm">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BarChart className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">Analytics Coming Soon</h3>
                  <p className="text-muted-foreground text-center max-w-md mb-6">
                    The analytics dashboard is currently under development. Check back soon for comprehensive insights
                    on your supply chain performance.
                  </p>
                  <Button>View Sample Reports</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="products" className="mt-0">
              <Card className="bg-black/30 border-primary/10 backdrop-blur-sm">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BarChart className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">Product Analytics Coming Soon</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    Product analytics will be available soon.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transactions" className="mt-0">
              <Card className="bg-black/30 border-primary/10 backdrop-blur-sm">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BarChart className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">Transaction Analytics Coming Soon</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    Transaction analytics will be available soon.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="network" className="mt-0">
              <Card className="bg-black/30 border-primary/10 backdrop-blur-sm">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BarChart className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">Network Analytics Coming Soon</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    Network analytics will be available soon.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}

