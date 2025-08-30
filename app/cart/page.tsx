"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus, Trash2, ShoppingBag, CreditCard, Shield, RefreshCw, ArrowRight, Info } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function CartPage() {
  const { state, updateQuantity, removeItem, clearCart } = useCart();
  const { currency, currencySymbol } = useSystemSettings();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuantityChange = (id: string, newQuantity: number) => {
    setIsUpdating(true);
    setTimeout(() => {
      if (newQuantity < 1) {
        removeItem(id);
        toast.info("Item removed from cart");
      } else {
        updateQuantity(id, newQuantity);
      }
      setIsUpdating(false);
    }, 300);
  };

  const handleCheckout = () => {
    setIsUpdating(true);
    toast.success('Proceeding to checkout', {
      description: 'You will be redirected to our secure payment processor.',
    });
    
    // Simulate a loading state before redirecting to checkout
    setTimeout(() => {
      setIsUpdating(false);
      // In a real app, this would integrate with Stripe or similar
      window.location.href = '/checkout';
    }, 1500);
  };
  
  const formatPrice = (price: number): string => {
    return price.toLocaleString(undefined, {
      style: 'currency',
      currency: currency || 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  };

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <div>
              <ShoppingBag className="mx-auto h-24 w-24 text-muted-foreground/50" />
              <h1 className="mt-6 font-display text-3xl font-bold">Your cart is empty</h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Discover beautiful artworks to add to your collection.
              </p>
            </div>
            <Button asChild size="lg">
              <Link href="/shop">
                Browse Collection
              </Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold">Shopping Cart</h1>
          <p className="text-muted-foreground">
            {state.itemCount} {state.itemCount === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Items</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (window.confirm("Are you sure you want to clear your cart?")) {
                      clearCart();
                      toast.info("Cart has been cleared");
                    }
                  }}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  disabled={isUpdating}
                >
                  Clear Cart
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {state.items.map((item) => (
                  <div key={item.id} className={`flex space-x-4 transition-all duration-200 ${isUpdating ? 'opacity-60' : 'opacity-100'}`}>
                    <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    </div>
                    
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <h3 className="font-medium">
                          <Link href={`/shop/${item.id}`} className="hover:text-primary">
                            {item.title}
                          </Link>
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {item.medium} • {item.size}
                        </p>
                        <div>
                          <p className="text-lg font-semibold text-primary">
                            {formatPrice(item.price)}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-xs text-muted-foreground">
                              {item.quantity} × {formatPrice(item.price / item.quantity)} each
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={isUpdating}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                            className="h-8 w-16 text-center"
                            disabled={isUpdating}
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            disabled={isUpdating}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            setIsUpdating(true);
                            setTimeout(() => {
                              removeItem(item.id);
                              toast.info("Item removed from cart");
                              setIsUpdating(false);
                            }, 300);
                          }}
                          disabled={isUpdating}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="mt-8 lg:mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(state.total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <Badge variant="secondary">Free</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span>Tax</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 ml-1 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Taxes will be calculated based on your shipping address during checkout.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <span>Calculated at checkout</span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-primary font-bold">{formatPrice(state.total)}</span>
                </div>
                
                <Button 
                  onClick={handleCheckout} 
                  className="w-full" 
                  size="lg"
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <CreditCard className="mr-2 h-5 w-5" />
                  )}
                  {isUpdating ? 'Processing...' : 'Proceed to Checkout'}
                </Button>
                
                <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Secure checkout with SSL encryption</span>
                </div>
                
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Free shipping on all artworks</p>
                  <p>• 30-day return policy</p>
                  <p>• Certificate of authenticity included</p>
                  <p>• Professional packaging and insured shipping</p>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations & Continue Shopping */}
            <Card className="mt-6">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Recommended For You</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="group rounded-md overflow-hidden border bg-background hover:bg-accent/50 transition-colors">
                    <Link href="/shop/featured" className="block p-2">
                      <div className="text-sm font-medium group-hover:text-primary">Featured Art</div>
                      <p className="text-xs text-muted-foreground">Explore our curated selection</p>
                    </Link>
                  </div>
                  <div className="group rounded-md overflow-hidden border bg-background hover:bg-accent/50 transition-colors">
                    <Link href="/shop?sort=newest" className="block p-2">
                      <div className="text-sm font-medium group-hover:text-primary">New Arrivals</div>
                      <p className="text-xs text-muted-foreground">Just added to our collection</p>
                    </Link>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button asChild variant="outline" className="w-full group">
                  <Link href="/shop">
                    Continue Shopping
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}