"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Menu, X, Sun, Moon, Palette, User, LogIn, LogOut, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from './ui/separator';
import { useTheme } from 'next-themes';
import { useCart } from '@/context/cart-context';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useSession, signOut } from 'next-auth/react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSystemSettings } from '@/hooks/useSystemSettings';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Shop', href: '/shop' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
];

export function Header() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { state } = useCart();
  const [isOpen, setIsOpen] = React.useState(false);
  const { data: session, status } = useSession();
  const { storeName } = useSystemSettings();
  
  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-white/60 dark:bg-gray-950/60 backdrop-blur-xl shadow-lg supports-[backdrop-filter]:bg-white/40">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <Palette className="h-8 w-8 text-primary drop-shadow-lg" />
            <span className="font-inter text-2xl font-extrabold gradient-text drop-shadow-lg group-hover:scale-105 transition-transform">
              {storeName || 'ATELIER 7X'}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`relative text-base font-semibold px-2 py-1 transition-colors duration-200
                  ${pathname === item.href ? 'text-primary' : 'text-gray-900 dark:text-gray-100'}
                  hover:text-primary focus:text-primary
                `}
              >
                <span className="relative z-10">{item.name}</span>
                <span
                  className={`absolute left-0 -bottom-1 w-full h-0.5 rounded bg-gradient-to-r from-blue-500 via-purple-500 to-orange-400 transition-all duration-300
                    ${pathname === item.href ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'}
                  `}
                />
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="hidden sm:inline-flex hover:bg-primary/10"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-yellow-400" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-400" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Cart */}
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative hover:bg-primary/10">
                <ShoppingBag className="h-5 w-5" />
                {state.itemCount > 0 && (
                  <span className="absolute -right-2 -top-2 h-5 w-5 rounded-full bg-gradient-to-tr from-pink-500 via-orange-400 to-yellow-300 text-white text-xs font-bold flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
                    {state.itemCount}
                  </span>
                )}
                <span className="sr-only">Shopping cart</span>
              </Button>
            </Link>

            {/* User Profile / Auth */}
            {status === 'loading' ? (
              <div className="h-9 w-9 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
            ) : session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 overflow-hidden border border-gray-200 dark:border-gray-800 hover:bg-primary/5 p-0">
                    <Avatar className="h-9 w-9">
                      <AvatarImage 
                        src={session.user.image && session.user.image.trim() !== '' ? session.user.image : undefined} 
                        alt={session.user.name || 'User'} 
                      />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 via-purple-500 to-orange-400 text-white">
                        {session.user.name?.charAt(0) || session.user.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 backdrop-blur-md bg-white/90 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-800">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{session.user.name}</p>
                      <p className="text-xs leading-none text-gray-500 dark:text-gray-400">{session.user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer flex items-center">
                      <UserCircle className="mr-2 h-4 w-4" /> My Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile" className="cursor-pointer flex items-center">
                      <User className="mr-2 h-4 w-4" /> My Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/orders" className="cursor-pointer flex items-center">
                      <ShoppingBag className="mr-2 h-4 w-4" /> My Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleSignOut}
                    className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-700 dark:focus:text-red-300 focus:bg-red-50 dark:focus:bg-red-900/20"
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild className="text-sm">
                  <Link href="/auth/signin">Sign in</Link>
                </Button>
                <Button size="sm" asChild className="text-sm bg-gradient-to-r from-blue-500 via-purple-500 to-orange-400 hover:from-blue-600 hover:via-purple-600 hover:to-orange-500 text-white">
                  <Link href="/auth/signup">Sign up</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] bg-white/90 dark:bg-gray-950/95 shadow-2xl rounded-l-2xl border-l-4 border-primary/30">
                <div className="flex flex-col space-y-6 mt-6">
                  {/* User Profile Section in Mobile Menu */}
                  {session?.user && (
                    <div className="mb-2">
                      <div className="flex items-center space-x-3 mb-4">
                        <Avatar className="h-12 w-12 border-2 border-white dark:border-gray-800 shadow-md">
                          <AvatarImage 
                            src={session.user.image && session.user.image.trim() !== '' ? session.user.image : undefined} 
                            alt={session.user.name || 'User'} 
                          />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 via-purple-500 to-orange-400 text-white text-lg">
                            {session.user.name?.charAt(0) || session.user.email?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{session.user.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{session.user.email}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3 mb-6">
                        <Link
                          href="/dashboard"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center text-base text-gray-900 dark:text-gray-100 hover:text-primary"
                        >
                          <UserCircle className="mr-2 h-5 w-5" /> 
                          My Dashboard
                        </Link>
                        
                        <Link
                          href="/dashboard/profile"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center text-base text-gray-900 dark:text-gray-100 hover:text-primary"
                        >
                          <User className="mr-2 h-5 w-5" /> 
                          My Profile
                        </Link>
                        
                        <Link
                          href="/dashboard/orders"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center text-base text-gray-900 dark:text-gray-100 hover:text-primary"
                        >
                          <ShoppingBag className="mr-2 h-5 w-5" /> 
                          My Orders
                        </Link>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          handleSignOut();
                          setIsOpen(false);
                        }}
                        className="w-full flex items-center justify-center text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border-red-200 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <LogOut className="mr-2 h-4 w-4" /> 
                        Sign Out
                      </Button>
                      
                      <Separator className="my-6" />
                    </div>
                  )}
                  
                  {/* Navigation */}
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`text-lg font-semibold transition-colors hover:text-primary ${
                        pathname === item.href
                          ? 'text-primary underline underline-offset-4'
                          : 'text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                  
                  {/* Theme Toggle */}
                  <Button
                    variant="ghost"
                    onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                    className="justify-start p-0 text-lg font-semibold text-gray-900 dark:text-gray-100 hover:text-primary"
                  >
                    {theme === 'light' ? (
                      <>
                        <Moon className="mr-2 h-5 w-5" />
                        Dark Mode
                      </>
                    ) : (
                      <>
                        <Sun className="mr-2 h-5 w-5" />
                        Light Mode
                      </>
                    )}
                  </Button>
                  
                  {/* Auth Actions for Mobile */}
                  {!session?.user && (
                    <div className="flex flex-col space-y-3 mt-4">
                      <Button variant="outline" asChild onClick={() => setIsOpen(false)}>
                        <Link href="/auth/signin" className="flex items-center">
                          <LogIn className="mr-2 h-5 w-5" />
                          Sign In
                        </Link>
                      </Button>
                      
                      <Button asChild className="bg-gradient-to-r from-blue-500 via-purple-500 to-orange-400 text-white" onClick={() => setIsOpen(false)}>
                        <Link href="/auth/signup" className="flex items-center">
                          <UserCircle className="mr-2 h-5 w-5" />
                          Sign Up
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  );
}