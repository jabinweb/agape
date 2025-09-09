"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Palette, Mail, Instagram, Facebook, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useSystemSettings } from '@/context/settings-context';

export function Footer() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { storeName, storeEmail, facebookUrl, twitterUrl, instagramUrl } = useSystemSettings();

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate newsletter signup
    setTimeout(() => {
      toast.success('Thank you for subscribing!', {
        description: `You'll receive updates about new artworks from ${storeName || 'My Store'}.`,
      });
      setEmail('');
      setIsLoading(false);
    }, 1000);
  };

  return (
    <footer className="relative bg-gradient-to-br from-blue-50/60 via-purple-50/40 to-orange-50/30 dark:from-gray-900/80 dark:via-purple-900/30 dark:to-gray-900/80 border-t backdrop-blur-xl">
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-3">
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-orange-400 shadow-lg">
                <Palette className="h-7 w-7 text-white drop-shadow" />
              </span>
              <span className="font-display text-2xl font-extrabold gradient-text tracking-wide">
                {storeName || 'My Store'}
              </span>
            </Link>
            <p className="text-base text-gray-700 dark:text-gray-200 max-w-xs">
              Discover contemporary paintings and artworks that speak to the soul.<br />
              Each piece tells a story of creativity and passion.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Quick Links</h3>
            <ul className="space-y-2 text-base">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/shop" className="text-muted-foreground hover:text-primary transition-colors">
                  Shop
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  About the Artist
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Customer Service</h3>
            <ul className="space-y-2 text-base">
              <li>
                <Link href="/cart" className="text-muted-foreground hover:text-primary transition-colors">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Returns
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Stay Connected</h3>
            <p className="text-base text-gray-700 dark:text-gray-200">
              Subscribe to get updates about new artworks and exhibitions.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="rounded-full px-5 py-2 bg-white/70 dark:bg-gray-900/60 border border-white/30 focus:ring-2 focus:ring-primary/40 transition"
              />
              <Button type="submit" className="rounded-full px-6 py-2 font-semibold shadow-md bg-gradient-to-r from-blue-400 via-purple-400 to-orange-400 text-white hover:scale-105 transition" disabled={isLoading}>
                {isLoading ? 'Subscribing...' : 'Subscribe'}
              </Button>
            </form>
            {/* Social Links */}
            <div className="flex space-x-4 pt-4">
              {instagramUrl && (
                <Button variant="ghost" size="icon" asChild className="transition-all group hover:scale-110">
                  <Link href={instagramUrl} aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 shadow-md group-hover:shadow-lg transition-all">
                      <Instagram className="h-5 w-5 text-white" />
                    </span>
                  </Link>
                </Button>
              )}
              {facebookUrl && (
                <Button variant="ghost" size="icon" asChild className="transition-all group hover:scale-110">
                  <Link href={facebookUrl} aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 via-blue-600 to-purple-400 shadow-md group-hover:shadow-lg transition-all">
                      <Facebook className="h-5 w-5 text-white" />
                    </span>
                  </Link>
                </Button>
              )}
              {twitterUrl && (
                <Button variant="ghost" size="icon" asChild className="transition-all group hover:scale-110">
                  <Link href={twitterUrl} aria-label="Twitter" target="_blank" rel="noopener noreferrer">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 via-cyan-400 to-purple-400 shadow-md group-hover:shadow-lg transition-all">
                      <Twitter className="h-5 w-5 text-white" />
                    </span>
                  </Link>
                </Button>
              )}
              {storeEmail && (
                <Button variant="ghost" size="icon" asChild className="transition-all group hover:scale-110">
                  <Link href={`mailto:${storeEmail}`} aria-label="Email">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 via-pink-400 to-purple-400 shadow-md group-hover:shadow-lg transition-all">
                      <Mail className="h-5 w-5 text-white" />
                    </span>
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-white/20 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              © 2024 {storeName || 'My Store'}. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <Link href="#" className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}