'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Key,
  Save,
  Eye,
  EyeOff
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'

interface UserProfile {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  joinedAt: string
  role: string
  isActive: boolean
}

interface PasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function ProfilePage() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (!response.ok) {
        throw new Error('Failed to fetch profile')
      }
      const data = await response.json()
      
      // Transform the data to match our interface
      const transformedProfile: UserProfile = {
        id: data.id,
        name: data.name || session?.user?.name || '',
        email: data.email || session?.user?.email || '',
        phone: data.phone || '',
        address: data.address || '',
        joinedAt: data.createdAt || new Date().toISOString(),
        role: session?.user?.role || 'CUSTOMER',
        isActive: data.isActive !== undefined ? data.isActive : true
      }
      
      setProfile(transformedProfile)
    } catch (error) {
      console.error('Error fetching profile:', error)
      
      // Fallback to session data if API fails
      if (session?.user) {
        const fallbackProfile: UserProfile = {
          id: session.user.id || '',
          name: session.user.name || '',
          email: session.user.email || '',
          phone: '',
          address: '',
          joinedAt: new Date().toISOString(),
          role: session.user.role || 'CUSTOMER',
          isActive: true
        }
        setProfile(fallbackProfile)
      } else {
        toast.error('Failed to load profile')
      }
    } finally {
      setLoading(false)
    }
  }, [session])

  useEffect(() => {
    if (session) {
      fetchProfile()
    } else {
      setLoading(false)
    }
  }, [fetchProfile, session])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    setSaving(true)
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
          address: profile.address
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update profile')
      }

      const updatedData = await response.json()
      setProfile(prev => prev ? { ...prev, ...updatedData } : null)
      toast.success('Profile updated successfully')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordData)
      })

      if (!response.ok) throw new Error('Failed to change password')

      toast.success('Password changed successfully')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      toast.error('Failed to change password')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 border-t-blue-500 dark:border-t-blue-400 rounded-full animate-spin shadow-md"></div>
      </div>
    )
  }

  if (!session || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-xl rounded-2xl border border-gray-200 dark:border-gray-800">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Profile not found</h1>
          <p className="text-gray-700 dark:text-gray-300">Please try refreshing the page or signing in again.</p>
          <Button className="mt-6" asChild>
            <Link href="/dashboard">Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/40 via-white to-purple-50/30 dark:from-gray-900 dark:via-gray-900/95 dark:to-gray-800/90 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <DashboardHeader
          title="My Profile"
          description="Manage your account settings and personal information"
          icon={<User className="h-6 w-6 text-white" />}
        />

        {/* Profile Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-white/20 dark:border-gray-800 shadow-xl rounded-xl overflow-hidden">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 via-purple-500 to-orange-400 rounded-xl flex items-center justify-center shadow-lg">
                  <User className="h-12 w-12 text-white drop-shadow" />
                </div>
                
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.name || 'User'}</h2>
                  <p className="text-gray-700 dark:text-gray-300">{profile.email}</p>
                  
                  <div className="flex flex-wrap items-center gap-3 mt-4">
                    <Badge variant={profile.isActive ? 'default' : 'secondary'} className="px-3 py-1 bg-white">
                      {profile.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="outline" className="px-3 py-1 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/30">
                      {profile.role}
                    </Badge>
                    <div className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                      Member since {profile.joinedAt ? new Date(profile.joinedAt).toLocaleDateString() : 'Invalid Date'}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Profile Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md border border-gray-200 dark:border-gray-800 p-1 rounded-xl shadow-md">
              <TabsTrigger value="personal" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-100 data-[state=active]:to-purple-100 data-[state=active]:text-blue-900 dark:data-[state=active]:from-blue-900/40 dark:data-[state=active]:to-purple-900/40 dark:data-[state=active]:text-blue-100 rounded-lg">Personal Information</TabsTrigger>
              <TabsTrigger value="security" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-100 data-[state=active]:to-purple-100 data-[state=active]:text-blue-900 dark:data-[state=active]:from-blue-900/40 dark:data-[state=active]:to-purple-900/40 dark:data-[state=active]:text-blue-100 rounded-lg">Security Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="personal">
              <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-white/20 dark:border-gray-800 shadow-xl rounded-xl overflow-hidden">
                <CardHeader className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                  <CardTitle className="flex items-center text-gray-900 dark:text-white">
                    <User className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-gray-800 dark:text-gray-200">Full Name</Label>
                        <div className="relative group">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-4 w-4 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
                          <Input
                            id="name"
                            value={profile?.name || ''}
                            onChange={(e) => setProfile(prev => prev ? {...prev, name: e.target.value} : null)}
                            className="pl-10 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-blue-300 dark:focus:border-blue-600"
                            placeholder="Enter your full name"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-800 dark:text-gray-200">Email Address</Label>
                        <div className="relative group">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-4 w-4" />
                          <Input
                            id="email"
                            value={profile?.email || ''}
                            disabled
                            className="pl-10 bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400"
                            placeholder="Email cannot be changed"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-gray-800 dark:text-gray-200">Phone Number</Label>
                        <div className="relative group">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-4 w-4 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
                          <Input
                            id="phone"
                            value={profile?.phone || ''}
                            onChange={(e) => setProfile(prev => prev ? {...prev, phone: e.target.value} : null)}
                            className="pl-10 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-blue-300 dark:focus:border-blue-600"
                            placeholder="Enter your phone number"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="joinedAt" className="text-gray-800 dark:text-gray-200">Member Since</Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-4 w-4" />
                          <Input
                            id="joinedAt"
                            value={new Date(profile?.joinedAt || '').toLocaleDateString()}
                            disabled
                            className="pl-10 bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-gray-800 dark:text-gray-200">Address</Label>
                      <div className="relative group">
                        <MapPin className="absolute left-3 top-3 text-gray-500 dark:text-gray-400 h-4 w-4 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
                        <Textarea
                          id="address"
                          value={profile?.address || ''}
                          onChange={(e) => setProfile(prev => prev ? {...prev, address: e.target.value} : null)}
                          className="pl-10 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-blue-300 dark:focus:border-blue-600"
                          placeholder="Enter your complete address"
                          rows={3}
                        />
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      disabled={saving} 
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-white/20 dark:border-gray-800 shadow-xl rounded-xl overflow-hidden">
                <CardHeader className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                  <CardTitle className="flex items-center text-gray-900 dark:text-white">
                    <Shield className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                    Security Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handlePasswordChange} className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword" className="text-gray-800 dark:text-gray-200">Current Password</Label>
                        <div className="relative group">
                          <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-4 w-4 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
                          <Input
                            id="currentPassword"
                            type={showPasswords.current ? 'text' : 'password'}
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData(prev => ({...prev, currentPassword: e.target.value}))}
                            className="pl-10 pr-10 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-blue-300 dark:focus:border-blue-600"
                            placeholder="Enter current password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                            onClick={() => setShowPasswords(prev => ({...prev, current: !prev.current}))}
                          >
                            {showPasswords.current ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newPassword" className="text-gray-800 dark:text-gray-200">New Password</Label>
                        <div className="relative group">
                          <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-4 w-4 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
                          <Input
                            id="newPassword"
                            type={showPasswords.new ? 'text' : 'password'}
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData(prev => ({...prev, newPassword: e.target.value}))}
                            className="pl-10 pr-10 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-blue-300 dark:focus:border-blue-600"
                            placeholder="Enter new password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                            onClick={() => setShowPasswords(prev => ({...prev, new: !prev.new}))}
                          >
                            {showPasswords.new ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-gray-800 dark:text-gray-200">Confirm New Password</Label>
                        <div className="relative group">
                          <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-4 w-4 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
                          <Input
                            id="confirmPassword"
                            type={showPasswords.confirm ? 'text' : 'password'}
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData(prev => ({...prev, confirmPassword: e.target.value}))}
                            className="pl-10 pr-10 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-blue-300 dark:focus:border-blue-600"
                            placeholder="Confirm new password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                            onClick={() => setShowPasswords(prev => ({...prev, confirm: !prev.confirm}))}
                          >
                            {showPasswords.confirm ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      disabled={saving} 
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      {saving ? 'Updating...' : 'Change Password'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
