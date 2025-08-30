'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Package, 
  Search, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Plus,
  Minus,
  Edit,
  MoreVertical,
  Download,
  RefreshCw,
  PackageX,
  Loader2,
  CheckCircle,
  XCircle,
  Archive
} from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import Image from 'next/image'

interface InventoryItem {
  id: string
  name: string
  sku: string | null
  imageUrl: string | null
  stockQuantity: number
  lowStockThreshold: number
  price: number
  category: {
    id: string
    name: string
  } | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface InventoryStats {
  totalProducts: number
  lowStockItems: number
  outOfStockItems: number
  totalValue: number
  recentChanges: number
}

interface StockMovement {
  id: string
  productId: string
  type: 'IN' | 'OUT' | 'ADJUSTMENT'
  quantity: number
  reason: string
  notes?: string
  createdAt: string
  createdBy: {
    name: string
  }
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [stats, setStats] = useState<InventoryStats | null>(null)
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [stockFilter, setStockFilter] = useState('all')
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false)
  const [movementDialogOpen, setMovementDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null)
  const [adjustmentData, setAdjustmentData] = useState({
    type: 'IN' as 'IN' | 'OUT' | 'ADJUSTMENT',
    quantity: 0,
    reason: '',
    notes: ''
  })

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (searchTerm) params.append('search', searchTerm)
      if (categoryFilter !== 'all') params.append('category', categoryFilter)
      if (stockFilter !== 'all') params.append('stock', stockFilter)

      const response = await fetch(`/api/admin/shop/inventory?${params}`)
      if (response.ok) {
        const data = await response.json()
        setInventory(data.inventory || [])
        setStats(data.stats || null)
      } else {
        toast.error('Failed to load inventory')
      }
    } catch (error) {
      console.error('Error fetching inventory:', error)
      toast.error('Failed to load inventory')
    } finally {
      setLoading(false)
    }
  }, [searchTerm, categoryFilter, stockFilter])

  const fetchMovements = useCallback(async (productId?: string) => {
    try {
      const params = new URLSearchParams()
      if (productId) params.append('productId', productId)
      
      const response = await fetch(`/api/admin/shop/inventory/movements?${params}`)
      if (response.ok) {
        const data = await response.json()
        setMovements(data.movements || [])
      }
    } catch (error) {
      console.error('Error fetching movements:', error)
    }
  }, [])

  useEffect(() => {
    fetchInventory()
  }, [fetchInventory])

  const handleStockAdjustment = async () => {
    if (!selectedProduct || adjustmentData.quantity <= 0) {
      toast.error('Please enter a valid quantity')
      return
    }

    try {
      const response = await fetch(`/api/admin/shop/inventory/${selectedProduct.id}/adjust`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adjustmentData)
      })

      if (response.ok) {
        toast.success('Stock adjusted successfully')
        setAdjustDialogOpen(false)
        setSelectedProduct(null)
        setAdjustmentData({ type: 'IN', quantity: 0, reason: '', notes: '' })
        fetchInventory()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to adjust stock')
      }
    } catch (error) {
      console.error('Error adjusting stock:', error)
      toast.error('Failed to adjust stock')
    }
  }

  const openAdjustDialog = (product: InventoryItem) => {
    setSelectedProduct(product)
    setAdjustDialogOpen(true)
  }

  const openMovementDialog = (product: InventoryItem) => {
    setSelectedProduct(product)
    fetchMovements(product.id)
    setMovementDialogOpen(true)
  }

  const getStockStatus = (item: InventoryItem) => {
    if (item.stockQuantity === 0) {
      return { status: 'out-of-stock', label: 'Out of Stock', color: 'bg-red-500' }
    }
    if (item.stockQuantity <= item.lowStockThreshold) {
      return { status: 'low-stock', label: 'Low Stock', color: 'bg-yellow-500' }
    }
    return { status: 'in-stock', label: 'In Stock', color: 'bg-green-500' }
  }

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = categoryFilter === 'all' || item.category?.name === categoryFilter
    
    let matchesStock = true
    if (stockFilter === 'low-stock') {
      matchesStock = item.stockQuantity <= item.lowStockThreshold && item.stockQuantity > 0
    } else if (stockFilter === 'out-of-stock') {
      matchesStock = item.stockQuantity === 0
    } else if (stockFilter === 'in-stock') {
      matchesStock = item.stockQuantity > item.lowStockThreshold
    }
    
    return matchesSearch && matchesCategory && matchesStock
  })

  const categories = Array.from(new Set(inventory.map(item => item.category?.name).filter(Boolean)))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-600 to-blue-600 dark:from-slate-300 dark:to-blue-400 bg-clip-text text-transparent">
                Inventory Management
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">Track and manage your product stock levels</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={fetchInventory} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8"
          >
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-400 to-indigo-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Products</p>
                    <p className="text-3xl font-bold">{stats.totalProducts}</p>
                  </div>
                  <Package className="h-8 w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-400 to-emerald-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Total Value</p>
                    <p className="text-3xl font-bold">₹{stats.totalValue.toFixed(2)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-400 to-orange-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm font-medium">Low Stock</p>
                    <p className="text-3xl font-bold">{stats.lowStockItems}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-yellow-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-red-400 to-pink-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm font-medium">Out of Stock</p>
                    <p className="text-3xl font-bold">{stats.outOfStockItems}</p>
                  </div>
                  <PackageX className="h-8 w-8 text-red-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-400 to-indigo-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Recent Changes</p>
                    <p className="text-3xl font-bold">{stats.recentChanges}</p>
                  </div>
                  <Archive className="h-8 w-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <Card className="border-0 dark:border dark:border-gray-700 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <SelectItem value="all" className="text-gray-800 dark:text-gray-200 focus:bg-gray-100 dark:focus:bg-gray-700">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category!} className="text-gray-800 dark:text-gray-200 focus:bg-gray-100 dark:focus:bg-gray-700">
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={stockFilter} onValueChange={setStockFilter}>
                  <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200">
                    <SelectValue placeholder="Stock Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <SelectItem value="all" className="text-gray-800 dark:text-gray-200 focus:bg-gray-100 dark:focus:bg-gray-700">All Stock</SelectItem>
                    <SelectItem value="in-stock" className="text-gray-800 dark:text-gray-200 focus:bg-gray-100 dark:focus:bg-gray-700">In Stock</SelectItem>
                    <SelectItem value="low-stock" className="text-gray-800 dark:text-gray-200 focus:bg-gray-100 dark:focus:bg-gray-700">Low Stock</SelectItem>
                    <SelectItem value="out-of-stock" className="text-gray-800 dark:text-gray-200 focus:bg-gray-100 dark:focus:bg-gray-700">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {filteredInventory.length} items
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Inventory Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500 dark:text-blue-400" />
            </div>
          ) : filteredInventory.length === 0 ? (
            <Card className="border-0 dark:border dark:border-gray-700 shadow-lg bg-white dark:bg-gray-800">
              <CardContent className="p-12 text-center">
                <Package className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No inventory items found</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchTerm ? 'Try adjusting your search criteria' : 'No products available in inventory'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 dark:border dark:border-gray-700 shadow-lg bg-white dark:bg-gray-800">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-gray-50 dark:bg-gray-800/80">
                      <TableRow className="border-gray-200 dark:border-gray-700">
                        <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Product</TableHead>
                        <TableHead className="font-semibold text-gray-700 dark:text-gray-300">SKU</TableHead>
                        <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Category</TableHead>
                        <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Stock</TableHead>
                        <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Status</TableHead>
                        <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Price</TableHead>
                        <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Value</TableHead>
                        <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Last Updated</TableHead>
                        <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="bg-white dark:bg-gray-800">
                      {filteredInventory.map((item, index) => {
                        const stockStatus = getStockStatus(item)
                        return (
                          <motion.tr
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-gray-200 dark:border-gray-700"
                          >
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                {item.imageUrl ? (
                                  <Image
                                    src={item.imageUrl}
                                    alt={item.name}
                                    width={40}
                                    height={40}
                                    className="rounded-lg object-cover"
                                  />
                                ) : (
                                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                    <Package className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                  </div>
                                )}
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                                  {!item.isActive && (
                                    <Badge variant="secondary" className="mt-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">Inactive</Badge>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-2 py-1 rounded">
                                {item.sku || 'N/A'}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="text-gray-600 dark:text-gray-400">
                                {item.category?.name || 'Uncategorized'}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-lg text-gray-900 dark:text-white">{item.stockQuantity}</span>
                                {item.stockQuantity <= item.lowStockThreshold && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    (Min: {item.lowStockThreshold})
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={`${stockStatus.color} text-white`}>
                                {stockStatus.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="font-semibold text-gray-900 dark:text-white">₹{item.price.toFixed(2)}</span>
                            </TableCell>
                            <TableCell>
                              <span className="font-semibold text-green-700 dark:text-green-500">
                                ₹{(item.stockQuantity * Number(item.price)).toFixed(2)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {format(new Date(item.updatedAt), 'MMM dd, yyyy')}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openAdjustDialog(item)}
                                  className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button size="sm" variant="ghost" className="hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                                    <DropdownMenuItem onClick={() => openMovementDialog(item)} className="text-gray-700 dark:text-gray-300 focus:bg-gray-100 dark:focus:bg-gray-700">
                                      <Archive className="h-4 w-4 mr-2" />
                                      View History
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-gray-700 dark:text-gray-300 focus:bg-gray-100 dark:focus:bg-gray-700">
                                      <Plus className="h-4 w-4 mr-2" />
                                      Quick Add Stock
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-gray-700 dark:text-gray-300 focus:bg-gray-100 dark:focus:bg-gray-700">
                                      <Minus className="h-4 w-4 mr-2" />
                                      Quick Remove Stock
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </motion.tr>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Stock Adjustment Dialog */}
        <Dialog open={adjustDialogOpen} onOpenChange={setAdjustDialogOpen}>
          <DialogContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-white">Adjust Stock - {selectedProduct?.name}</DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400">
                Current stock: {selectedProduct?.stockQuantity} units
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="type" className="text-gray-700 dark:text-gray-300">Adjustment Type</Label>
                <Select 
                  value={adjustmentData.type} 
                  onValueChange={(value: 'IN' | 'OUT' | 'ADJUSTMENT') => 
                    setAdjustmentData({ ...adjustmentData, type: value })
                  }
                >
                  <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <SelectItem value="IN" className="text-gray-800 dark:text-gray-200 focus:bg-gray-100 dark:focus:bg-gray-700">Stock In (Add)</SelectItem>
                    <SelectItem value="OUT" className="text-gray-800 dark:text-gray-200 focus:bg-gray-100 dark:focus:bg-gray-700">Stock Out (Remove)</SelectItem>
                    <SelectItem value="ADJUSTMENT" className="text-gray-800 dark:text-gray-200 focus:bg-gray-100 dark:focus:bg-gray-700">Adjustment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="quantity" className="text-gray-700 dark:text-gray-300">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={adjustmentData.quantity}
                  onChange={(e) => setAdjustmentData({ 
                    ...adjustmentData, 
                    quantity: parseInt(e.target.value) || 0 
                  })}
                  placeholder="Enter quantity"
                  className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <Label htmlFor="reason" className="text-gray-700 dark:text-gray-300">Reason</Label>
                <Select 
                  value={adjustmentData.reason} 
                  onValueChange={(value) => 
                    setAdjustmentData({ ...adjustmentData, reason: value })
                  }
                >
                  <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200">
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <SelectItem value="received" className="text-gray-800 dark:text-gray-200 focus:bg-gray-100 dark:focus:bg-gray-700">Stock Received</SelectItem>
                    <SelectItem value="sold" className="text-gray-800 dark:text-gray-200 focus:bg-gray-100 dark:focus:bg-gray-700">Stock Sold</SelectItem>
                    <SelectItem value="damaged" className="text-gray-800 dark:text-gray-200 focus:bg-gray-100 dark:focus:bg-gray-700">Damaged/Lost</SelectItem>
                    <SelectItem value="returned" className="text-gray-800 dark:text-gray-200 focus:bg-gray-100 dark:focus:bg-gray-700">Customer Return</SelectItem>
                    <SelectItem value="adjustment" className="text-gray-800 dark:text-gray-200 focus:bg-gray-100 dark:focus:bg-gray-700">Stock Count Adjustment</SelectItem>
                    <SelectItem value="other" className="text-gray-800 dark:text-gray-200 focus:bg-gray-100 dark:focus:bg-gray-700">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes" className="text-gray-700 dark:text-gray-300">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={adjustmentData.notes}
                  onChange={(e) => setAdjustmentData({ 
                    ...adjustmentData, 
                    notes: e.target.value 
                  })}
                  placeholder="Additional notes..."
                  className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setAdjustDialogOpen(false)}
                  className="border-gray-200 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleStockAdjustment}
                  disabled={!adjustmentData.reason || adjustmentData.quantity <= 0}
                  className="dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white"
                >
                  Apply Adjustment
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Movement History Dialog */}
        <Dialog open={movementDialogOpen} onOpenChange={setMovementDialogOpen}>
          <DialogContent className="max-w-2xl dark:bg-gray-900 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle className="dark:text-white">Stock Movement History - {selectedProduct?.name}</DialogTitle>
              <DialogDescription className="dark:text-gray-300">
                Recent stock movements for this product
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-96 overflow-y-auto">
              {movements.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">No movements found</p>
              ) : (
                <div className="space-y-2">
                  {movements.map((movement) => (
                    <div key={movement.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          movement.type === 'IN' ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' :
                          movement.type === 'OUT' ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300' :
                          'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                        }`}>
                          {movement.type === 'IN' ? <Plus className="h-4 w-4" /> :
                           movement.type === 'OUT' ? <Minus className="h-4 w-4" /> :
                           <Edit className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="font-medium dark:text-white">
                            {movement.type === 'IN' ? '+' : movement.type === 'OUT' ? '-' : '±'}
                            {movement.quantity} units
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{movement.reason}</p>
                          {movement.notes && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">{movement.notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {format(new Date(movement.createdAt), 'MMM dd, HH:mm')}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          by {movement.createdBy.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
