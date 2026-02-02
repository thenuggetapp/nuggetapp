'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

export function MarketingHeader() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/blog', label: 'Blog' },
    { href: '/partner', label: 'Partner' },
    { href: '/faq', label: 'FAQ' },
  ];

  return (
    <header className="bg-white sticky top-0 z-50 border-b border-slate-200">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Mobile Menu Button - Left Side */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6 text-slate-900" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <div className="flex flex-col gap-6 mt-8">
              <a href="/" className="flex items-center mb-4">
                <img
                  src="https://cdn.prod.website-files.com/65c4e3031d72984c18dbb698/65e621c26e369137d198cadf_Black%20logo%20-%20no%20background-p-500.png"
                  alt="Nugget"
                  className="h-12"
                />
              </a>
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-lg font-medium text-slate-900 hover:text-slate-600 transition-colors py-2"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-slate-200">
                <a
                  href="/login"
                  className="text-lg font-medium text-slate-900 hover:text-slate-600 transition-colors py-2"
                  onClick={() => setIsOpen(false)}
                >
                  Sign In
                </a>
                <a
                  href="/signup"
                  className="bg-[#8dbf65] hover:bg-[#7aad52] text-white px-6 py-3 rounded-md font-medium text-center transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Sign Up
                </a>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Logo - Right on Mobile, Left on Desktop */}
        <a href="/" className="flex items-center space-x-2 ml-auto lg:ml-0 lg:order-first">
          <img
            src="https://cdn.prod.website-files.com/65c4e3031d72984c18dbb698/65e621c26e369137d198cadf_Black%20logo%20-%20no%20background-p-500.png"
            alt="Nugget"
            className="h-16"
          />
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          <a href="/" className="text-slate-900 hover:text-slate-600 font-medium">Home</a>
          <a href="/about" className="text-slate-900 hover:text-slate-600 font-medium">About</a>
          <a href="/blog" className="text-slate-900 hover:text-slate-600 font-medium">Blog</a>
          <a href="/partner" className="text-slate-900 hover:text-slate-600 font-medium">Partner</a>
          <a href="/faq" className="text-slate-900 hover:text-slate-600 font-medium">FAQ</a>
          <a href="/login" className="text-slate-900 hover:text-slate-600 font-medium">Sign In</a>
          <a href="/signup" className="bg-[#8dbf65] hover:bg-[#7aad52] text-white px-4 py-2 rounded-md font-medium">Sign Up</a>
        </nav>
      </div>
    </header>
  );
}
