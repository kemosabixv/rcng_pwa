import React, { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Menu,
  X,
  Phone,
  Mail,
  Globe,
  User,
  LogIn,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "./AuthContext";
import { LoginModal } from "./LoginModal";
import { RotaryLogo, RotaryLogoCompact } from "./RotaryLogo";
import Link from "next/link";

// Remove currentPage and onPageChange from LayoutProps
interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

// Update navigation links to use Next.js routing
export function Layout({ children }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { user, signOut, loading } = useAuth();

  const navigation = [
    { name: "HOME", href: "home" },
    {
      name: "ABOUT",
      href: "about",
      dropdown: [
        { name: "Who We Are", href: "about" },
        { name: "Past Presidents", href: "past-presidents" },
        { name: "Directors/Board", href: "board" },
        { name: "Resources", href: "resources" },
      ],
    },
    { name: "MEMBERS", href: "directory" },
    {
      name: "EVENTS",
      href: "events",
      dropdown: [
        { name: "Calendar", href: "calendar" },
        { name: "Projects", href: "projects" },
        { name: "Club Service", href: "club-service" },
      ],
    },
    { name: "BLOG", href: "blog" },
    { name: "BECOME A MEMBER", href: "membership" },
  ];

  const handleAuthClick = () => {
    if (user) {
      signOut();
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleNavClick = (href: string, requiresAuth?: boolean) => {
    if (requiresAuth && !user) {
      setIsLoginModalOpen(true);
      return;
    }
    // onPageChange(href);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="py-2 px-4" style={{ backgroundColor: "#254998" }}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-white" />
              <span className="text-sm text-white">
                info@rotarynairobigigiri.org
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-white" />
              <span className="text-sm text-white">+254 700 123 456</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              <Globe className="h-4 w-4 mr-2 text-white" />
              <span className="text-white">Translate</span>
            </Button>
            {!loading && (
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={handleAuthClick}
              >
                {user ? (
                  <>
                    <LogOut className="h-4 w-4 mr-2 text-white" />
                    <span className="text-white">Sign Out</span>
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-2 text-white" />
                    <span className="text-white">Login</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center">
              <div className="hidden sm:block">
                <RotaryLogo size="lg" />
              </div>
              <div className="sm:hidden">
                <RotaryLogoCompact size="md" />
              </div>
              <div className="ml-4 hidden sm:block">
                <p className="text-sm text-muted-foreground italic">
                  Service Above Self
                </p>
              </div>
            </div>

            {/* User Info */}
            {user && (
              <div className="hidden lg:flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium">Welcome, {user.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {user.profession}
                  </p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-[#0052CC]" />
                </div>
              </div>
            )}

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-8">
              {navigation.map((item) => (
                <div key={item.name} className="relative group">
                  {item.dropdown ? (
                    <div className="relative">
                      <button className="flex items-center space-x-1 py-2 px-3 rounded-md hover:bg-gray-100 transition-colors">
                        <span className="text-gray-700">{item.name}</span>
                        <ChevronDown className="h-4 w-4" />
                      </button>
                      <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        {item.dropdown.map((subItem) => (
                          <Link key={subItem.name} href={`/${subItem.href}`}>
                            <span className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                              {subItem.name}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link href={`/${item.href}`}>
                      <span className="py-2 px-3 rounded-md transition-colors flex items-center space-x-1 text-gray-700 hover:bg-gray-100 cursor-pointer">
                        {item.name}
                      </span>
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t py-4">
              {user && (
                <div className="mb-4 p-3 bg-gray-50 rounded-md">
                  <p className="font-medium">Welcome, {user.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {user.profession}
                  </p>
                </div>
              )}
              <nav className="space-y-2">
                {navigation.map((item) => (
                  <div key={item.name}>
                    <Link href={`/${item.href}`}>
                      <span className="block w-full text-left py-2 px-3 rounded-md transition-colors text-gray-700 hover:bg-gray-100 cursor-pointer">
                        {item.name}
                      </span>
                    </Link>
                    {item.dropdown && (
                      <div className="ml-4 space-y-1">
                        {item.dropdown.map((subItem) => (
                          <Link key={subItem.name} href={`/${subItem.href}`}>
                            <span className="block w-full text-left py-2 px-3 text-sm text-gray-600 hover:bg-gray-100 rounded-md cursor-pointer">
                              {subItem.name}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer
        className="py-12 mt-16"
        style={{
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundColor: "rgba(255, 255, 255, 0.5)",
          boxShadow: "1px 1px 3px 0px rgba(0, 0, 0, 1)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4">
                Rotary Club of Nairobi Gigiri
              </h3>
              <p className="text-sm text-primary-foreground/80">
                Service Above Self - Making a difference in our community and
                around the world.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/about" className="text-primary-foreground/80 hover:text-primary-foreground">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/events" className="text-primary-foreground/80 hover:text-primary-foreground">
                    Events
                  </Link>
                </li>
                <li>
                  <Link href="/projects" className="text-primary-foreground/80 hover:text-primary-foreground">
                    Projects
                  </Link>
                </li>
                <li>
                  <Link href="/membership" className="text-primary-foreground/80 hover:text-primary-foreground">
                    Join Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-primary-foreground/80 hover:text-primary-foreground">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-primary-foreground/80">
                <li>United Nations Avenue</li>
                <li>Gigiri, Nairobi, Kenya</li>
                <li>info@rotarynairobigigiri.org</li>
                <li>+254 700 123 456</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary-foreground hover:bg-primary/80"
                >
                  Facebook
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary-foreground hover:bg-primary/80"
                >
                  Twitter
                </Button>
              </div>
            </div>
          </div>
          <div
            className="border-t mt-8 pt-8 text-center text-sm"
            style={{
              backgroundColor: "#254998",
              color: "rgba(255, 255, 255, 1)",
              borderColor: "rgba(0, 0, 0, 0.1)",
            }}
          >
            <p>
              &copy; 2025 Rotary Club of Nairobi Gigiri. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
}
