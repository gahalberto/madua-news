"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

const MainNavbar = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-blue-600 font-bold text-2xl">Madua - Notícias de Israel</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link 
              href="/" 
              className={`flex items-center text-gray-700 hover:text-blue-600 font-medium ${
                isActive('/') ? 'text-blue-600 border-b-2 border-blue-600' : ''
              }`}
            >
              Home
            </Link>
            <Link 
              href="/noticias" 
              className={`flex items-center text-gray-700 hover:text-blue-600 font-medium ${
                isActive('/noticias') ? 'text-blue-600 border-b-2 border-blue-600' : ''
              }`}
            >
              Notícias
            </Link>
            <Link 
              href="/sobre" 
              className={`flex items-center text-gray-700 hover:text-blue-600 font-medium ${
                isActive('/sobre') ? 'text-blue-600 border-b-2 border-blue-600' : ''
              }`}
            >
              Sobre
            </Link>
            <Link 
              href="/contato" 
              className={`flex items-center text-gray-700 hover:text-blue-600 font-medium ${
                isActive('/contato') ? 'text-blue-600 border-b-2 border-blue-600' : ''
              }`}
            >
              Contato
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={toggleMenu}
              className="text-gray-700 hover:text-blue-600 focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex flex-col space-y-3">
              <Link 
                href="/" 
                className={`py-2 text-gray-700 hover:text-blue-600 font-medium ${
                  isActive('/') ? 'text-blue-600 font-bold' : ''
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/noticias" 
                className={`py-2 text-gray-700 hover:text-blue-600 font-medium ${
                  isActive('/noticias') ? 'text-blue-600 font-bold' : ''
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Notícias
              </Link>
              <Link 
                href="/sobre" 
                className={`py-2 text-gray-700 hover:text-blue-600 font-medium ${
                  isActive('/sobre') ? 'text-blue-600 font-bold' : ''
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Sobre
              </Link>
              <Link 
                href="/contato" 
                className={`py-2 text-gray-700 hover:text-blue-600 font-medium ${
                  isActive('/contato') ? 'text-blue-600 font-bold' : ''
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Contato
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default MainNavbar; 