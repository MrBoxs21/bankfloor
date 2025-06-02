"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "./ui/button"
import { ThemeToggle } from "./theme-toggle"
import UserNav from "@/components/auth/user-nav"
import { Menu, X, Home, BookOpen, PenTool, Users, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  {
    name: "Home",
    href: "/",
    icon: Home
  },
  {
    name: "Stories",
    href: "/blogs",
    icon: BookOpen
  },
  {
    name: "Create",
    href: "/create-blog",
    icon: PenTool
  },
  /*{
    name: "Community",
    href: "/community",
    icon: Users
  },
  {
    name: "Discussions",
    href: "/discussions",
    icon: MessageCircle
  }*/
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  return (    <nav className={cn(
      "fixed top-0 w-full z-50 transition-all duration-300 ease-in-out",
      isScrolled ? "bg-background/80 backdrop-blur-lg border-b shadow-sm" : "bg-transparent"
    )}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-pink-200 to-slate-700 flex items-center justify-center">
              <span className="text-white font-bold text-sm">BF</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold bg-gradient-to-r from-gray-500 to-slate-800 bg-clip-text text-transparent">
                Bank's Floor
              </h1>
              <p className="text-xs text-muted-foreground">Professional's United</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "transition-colors",
                    "text-muted-foreground hover:text-foreground",
                    "dark:text-muted-foreground dark:hover:text-white",
                    pathname === item.href && "text-foreground bg-muted dark:text-white dark:bg-muted/50"
                  )}
                >
                  {item.name}
                </Button>
              </Link>
            ))}
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <UserNav />
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start transition-colors",
                      "text-muted-foreground hover:text-foreground",
                      "dark:text-muted-foreground dark:hover:text-white",
                      pathname === item.href && "text-foreground bg-muted dark:text-white dark:bg-muted/50"
                    )}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
} 