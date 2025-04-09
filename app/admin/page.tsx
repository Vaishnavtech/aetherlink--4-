"use client"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, CircuitBoard, RefreshCw, Settings, Shield, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ParticleBackground } from "@/components/particle-background"

export default function AdminPage() {
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
                <CircuitBoard className="h-5 w-5 text-primary" />
                Admin Console
              </CardTitle>
              <CardDescription>Manage system settings, user roles, and smart contract configurations.</CardDescription>
            </CardHeader>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="bg-black/50 border border-primary/20 mb-6">
              <TabsTrigger value="users">User Management</TabsTrigger>
              <TabsTrigger value="contracts">Smart Contracts</TabsTrigger>
              <TabsTrigger value="settings">System Settings</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="mt-0">
              <Card className="bg-gradient-to-br from-gray-900 to-black border-primary/20 overflow-hidden mb-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    User Roles
                  </CardTitle>
                  <CardDescription>Manage user roles and permissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[100px] flex items-center justify-center">
                    <p className="text-muted-foreground">User management features will appear here</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/30 border-primary/10 backdrop-blur-sm">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Shield className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">Admin Console Coming Soon</h3>
                  <p className="text-muted-foreground text-center max-w-md mb-6">
                    The admin console is currently under development. Check back soon for comprehensive system
                    management tools.
                  </p>
                  <Button>View Documentation</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contracts" className="mt-0">
              <Card className="bg-black/30 border-primary/10 backdrop-blur-sm">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Settings className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">Contract Management Coming Soon</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    Smart contract management features will be available soon.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="mt-0">
              <Card className="bg-black/30 border-primary/10 backdrop-blur-sm">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Settings className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">System Settings Coming Soon</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    System settings configuration will be available soon.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="mt-0">
              <Card className="bg-black/30 border-primary/10 backdrop-blur-sm">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Shield className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">Security Settings Coming Soon</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    Security configuration options will be available soon.
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

