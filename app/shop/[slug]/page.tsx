'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ShoppingCart, Star, Truck, Shield, RefreshCw, ArrowLeft, Heart, Sun, Moon } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { useCart } from '@/context/cart-context'
import { useSystemSettings } from '@/hooks/useSystemSettings'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { cartManager } from '@/lib/cart'

interface RelatedProduct extends Product {}
interface RelatedProductsResponse {
  products: RelatedProduct[];
}

interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  discount?: number
  images?: string[]
  stock: number
  sku: string
  category?: {
    id: string
    name: string
  } | null
  stockQuantity?: number
  imageUrl?: string | null
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { currency, currencySymbol } = useSystemSettings()
  const { addItem } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [relatedLoading, setRelatedLoading] = useState(false)

  const fetchProduct = async (slug: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/shop/products/${slug}`)
      if (!response.ok) throw new Error('Product not found')
      const data = await response.json()
      
      // Ensure we have a proper images array and convert price to number
      const transformedProduct = {
        ...data,
        images: data.images || (data.imageUrl ? [data.imageUrl] : []),
        discount: data.discount || 0,
        stock: data.stockQuantity || data.stock || 0,
        price: Number(data.price) || 0 // Ensure price is a number
      }
      
      setProduct(transformedProduct)
    } catch (error) {
      console.error('Error fetching product:', error)
      toast.error('Failed to load product')
    } finally {
      setLoading(false)
    }
  }
  
  const fetchRelatedProducts = useCallback(async (slug: string) => {
    try {
      setRelatedLoading(true)
      console.log(`Fetching related products for slug: ${slug}`);
      const response = await fetch(`/api/shop/products/${slug}/related`)
      if (!response.ok) throw new Error('Failed to fetch related products')
      const data = await response.json()
      
      if (data.products && Array.isArray(data.products)) {
        // Filter out any products that might be the same as the current one (by id)

        const filteredProducts = (data as RelatedProductsResponse).products.filter((p: RelatedProduct) => p.id !== product?.id)
        setRelatedProducts(filteredProducts)
        console.log(`Found ${filteredProducts.length} related products from the same category`)
      }
    } catch (error) {
      console.error('Error fetching related products:', error)
      // Silently fail for related products
    } finally {
      setRelatedLoading(false)
    }
  }, [product?.id])

  useEffect(() => {
    if (params.slug) {
      fetchProduct(params.slug as string)
    }
  }, [params.slug])

  // Fetch related products after main product loads
  useEffect(() => {
    if (product?.slug) {
      fetchRelatedProducts(product.slug)
    }
  }, [product?.slug, fetchRelatedProducts])

  const getDiscountedPrice = (price: number, discount: number = 0) => {
    return price - (price * discount / 100)
  }
  
  const formatPrice = (price: number) => {
    return price.toLocaleString(undefined, {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    })
  }
  
  const toggleFavorite = () => {
    setIsFavorited(!isFavorited)
    toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites')
  }

  const handleAddToCart = async () => {
    if (!product) return
    
    setAddingToCart(true)
    try {
      // Map product fields to match cart manager expectations
      const cartProduct = {
        id: product.id,
        name: product.name,
        price: Number(product.price) || 0, // Ensure price is a number
        imageUrl: product.images?.[0] || product.imageUrl || null,
        stockQuantity: product.stock
      }
      const success = cartManager.addToCart(cartProduct, quantity)
      if (success) {
        toast.success(`${quantity} ${quantity === 1 ? 'item' : 'items'} added to cart!`)
      } else {
        toast.error('Not enough stock available')
      }
    } catch (error) {
      toast.error('Failed to add to cart')
    } finally {
      setAddingToCart(false)
    }
  }

  const handleBuyNow = async () => {
    if (!product) return
    
    setAddingToCart(true)
    try {
      // Map product fields to match cart manager expectations
      const cartProduct = {
        id: product.id,
        name: product.name,
        price: Number(product.price) || 0, // Ensure price is a number
        imageUrl: product.images?.[0] || product.imageUrl || null,
        stockQuantity: product.stock
      }
      const success = cartManager.addToCart(cartProduct, quantity)
      if (success) {
        toast.success('Item added to cart!')
        router.push('/checkout')
      } else {
        toast.error('Not enough stock available')
      }
    } catch (error) {
      toast.error('Failed to proceed to checkout')
    } finally {
      setAddingToCart(false)
    }
  }

  if (loading) {
    return (
      <>
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent"></div>
        </div>
      </>
    )
  }

  if (!product) {
    return (
      <>
        <div className="min-h-[80vh] flex flex-col items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4 text-foreground">Product not found</h1>
            <Button asChild>
              <Link href="/shop">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Shop
              </Link>
            </Button>
          </div>
        </div>
      </>
    )
  }

  // Get available images with fallback
  const availableImages = product.images && product.images.length > 0 
    ? product.images 
    : product.imageUrl 
    ? [product.imageUrl]
    : ['https://images.pexels.com/photos/3683107/pexels-photo-3683107.jpeg'] // Default fallback

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Mobile-friendly Breadcrumb */}
        <nav className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-muted-foreground mb-6 sm:mb-8 overflow-x-auto">
          <Link href="/shop" className="hover:text-primary whitespace-nowrap">Shop</Link>
          {product.category && (
            <>
              <span>/</span>
              <Link href={`/shop?category=${product.category.id}`} className="hover:text-primary whitespace-nowrap truncate max-w-20 sm:max-w-none">
                {product.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-foreground truncate max-w-24 sm:max-w-none">{product.name}</span>
        </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
        {/* Product Images - Mobile Optimized */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="space-y-2 sm:space-y-4">
            <div className="relative overflow-hidden rounded-lg bg-card border shadow-sm dark:shadow-none">
              <Image
                src={availableImages[selectedImage]}
                alt={product.name}
                width={600}
                height={600}
                className="w-full h-64 sm:h-80 lg:h-96 object-cover"
              />
              {product.discount && product.discount > 0 && (
                <Badge className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 text-white text-xs sm:text-sm">
                  {product.discount}% OFF
                </Badge>
              )}
              <Button 
                variant="outline" 
                size="icon" 
                className={`absolute top-2 sm:top-4 right-2 sm:right-4 rounded-full bg-background/80 backdrop-blur-sm ${
                  isFavorited ? 'text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300' : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={toggleFavorite}
              >
                <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
              </Button>
            </div>
            {availableImages.length > 1 && (
              <div className="flex space-x-1 sm:space-x-2 overflow-x-auto pb-2">
                {availableImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Product Details - Mobile Optimized */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-4 sm:space-y-6"
        >
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
              <Badge variant="outline" className="self-start">
                {product.category?.name || 'Uncategorized'}
              </Badge>
              <span className="text-xs sm:text-sm text-gray-500">SKU: {product.sku}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 leading-tight">{product.name}</h1>
            <div className="flex items-center space-x-2 mb-3 sm:mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 sm:h-5 sm:w-5 ${
                      i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs sm:text-sm text-gray-500">(4.5 out of 5)</span>
            </div>
            <p className="text-sm sm:text-base leading-relaxed">{product.description}</p>
          </div>

          <Separator />

          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              {product.discount && product.discount > 0 ? (
                <>
                  <span className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
                    {formatPrice(getDiscountedPrice(Number(product.price) || 0, product.discount))}
                  </span>
                  <span className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 line-through">
                    {formatPrice(Number(product.price) || 0)}
                  </span>
                  <Badge className="bg-red-500 hover:bg-red-600 text-white text-xs sm:text-sm">Save {product.discount}%</Badge>
                </>
              ) : (
                <span className="text-2xl sm:text-3xl font-bold text-foreground">
                  {formatPrice(Number(product.price) || 0)}
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Stock:</span>
              <Badge variant={product.stock > 10 ? 'default' : product.stock > 0 ? 'secondary' : 'destructive'} className="text-xs sm:text-sm">
                {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
              </Badge>
            </div>

            {product.stock > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <label className="text-sm font-medium text-foreground">Quantity:</label>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="h-9 w-9 p-0 rounded-md"
                  >
                    -
                  </Button>
                  <span className="w-12 text-center font-medium text-sm sm:text-base text-foreground">{quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    className="h-9 w-9 p-0 rounded-md"
                  >
                    +
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-3 sm:space-y-4">
              <Button
                className="w-full text-sm sm:text-base bg-primary hover:bg-primary/90 text-primary-foreground"
                size="lg"
                onClick={handleAddToCart}
                disabled={product.stock === 0 || addingToCart}
              >
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                {addingToCart ? 'Adding...' : 'Add to Cart'}
              </Button>
              <Button 
                variant="outline" 
                className="w-full text-sm sm:text-base border-primary text-primary hover:bg-primary/10" 
                size="lg"
                onClick={handleBuyNow}
                disabled={product.stock === 0 || addingToCart}
              >
                {addingToCart ? 'Processing...' : 'Buy Now'}
              </Button>
            </div>

            {product.stock <= 5 && product.stock > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <p className="text-xs sm:text-sm text-yellow-800 dark:text-yellow-300">
                  ⚠️ Only {product.stock} items left in stock!
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Features - Mobile Stacked */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="flex items-center space-x-3 bg-muted/50 p-3 rounded-lg">
              <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-2">
                <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-xs sm:text-sm font-medium">Free Shipping</span>
            </div>
            <div className="flex items-center space-x-3 bg-muted/50 p-3 rounded-lg">
              <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-2">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-xs sm:text-sm font-medium">Secure Payment</span>
            </div>
            <div className="flex items-center space-x-3 bg-muted/50 p-3 rounded-lg">
              <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-2">
                <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-xs sm:text-sm font-medium">Easy Returns</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Related Products Section */}
      <div className="mt-16 sm:mt-24">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">More From This Category</h2>
            {product.category && (
              <p className="text-sm text-muted-foreground mt-1">
                Other products in {product.category.name}
              </p>
            )}
          </div>
          {product.category && (
            <Button 
              variant="outline" 
              size="sm" 
              asChild 
              className="mt-2 sm:mt-0"
            >
              <Link href={`/shop?category=${product.category.id}`}>
                View All {product.category.name}
              </Link>
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {relatedLoading ? (
            // Loading skeleton
            Array(4).fill(null).map((_, index) => (
              <div key={index} className="rounded-lg bg-muted/50 animate-pulse h-64 sm:h-72"></div>
            ))
          ) : relatedProducts.length > 0 ? (
            // Related products list
            relatedProducts.map((relatedProduct) => (
              <Card key={relatedProduct.id} className="overflow-hidden hover:shadow-md transition-all group border border-border hover:border-primary/30">
                <Link href={`/shop/${relatedProduct.slug}`} className="block">
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={relatedProduct.imageUrl || relatedProduct.images?.[0] || 'https://via.placeholder.com/300'}
                      alt={relatedProduct.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {relatedProduct.discount && relatedProduct.discount > 0 && (
                      <Badge className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white text-xs">
                        {relatedProduct.discount}% OFF
                      </Badge>
                    )}
                    {relatedProduct.category && (
                      <Badge variant="outline" className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm text-xs border-none">
                        {relatedProduct.category.name}
                      </Badge>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium truncate group-hover:text-primary transition-colors">{relatedProduct.name}</h3>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="font-semibold text-foreground">
                        {formatPrice(
                          relatedProduct.discount 
                            ? getDiscountedPrice(relatedProduct.price, relatedProduct.discount) 
                            : relatedProduct.price
                        )}
                      </span>
                      {relatedProduct.discount && relatedProduct.discount > 0 && (
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(relatedProduct.price)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </Card>
            ))
          ) : (
            // No related products
            <div className="col-span-full text-center py-12 border border-dashed rounded-lg border-muted-foreground/30">
              <p className="text-muted-foreground">
                No other products found in {product.category?.name || 'this category'}.
              </p>
              <Button 
                variant="link" 
                asChild 
                className="mt-2"
              >
                <Link href="/shop">
                  Browse all products
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}