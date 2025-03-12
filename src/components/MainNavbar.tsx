"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown, Search, User, BookOpen } from 'lucide-react';
import CartButton from '@/app/_components/cart/CartButton';

const MainNavbar = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
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
            <span className="text-blue-600 font-bold text-2xl">Luma</span>
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
            <div className="relative">
              <button 
                onClick={toggleDropdown}
                className={`flex items-center text-gray-700 hover:text-blue-600 font-medium ${
                  isActive('/cursos') ? 'text-blue-600 border-b-2 border-blue-600' : ''
                }`}
              >
                Cursos
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              {isDropdownOpen && (
                <div className="absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    <Link 
                      href="/cursos" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Todos os Cursos
                    </Link>
                    <Link 
                      href="/cursos/categoria/1" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Programação
                    </Link>
                    <Link 
                      href="/cursos/categoria/2" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Design
                    </Link>
                    <Link 
                      href="/cursos/categoria/3" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Marketing
                    </Link>
                  </div>
                </div>
              )}
            </div>
            <Link 
              href="/ebooks" 
              className={`flex items-center text-gray-700 hover:text-blue-600 font-medium ${
                isActive('/ebooks') ? 'text-blue-600 border-b-2 border-blue-600' : ''
              }`}
            >
              <BookOpen className="mr-1 h-4 w-4" /> E-books
            </Link>
            <Link 
              href="/blog" 
              className={`flex items-center text-gray-700 hover:text-blue-600 font-medium ${
                isActive('/blog') ? 'text-blue-600 border-b-2 border-blue-600' : ''
              }`}
            >
              Blog
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

          {/* Right Side Icons */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="text-gray-700 hover:text-blue-600">
              <Search className="h-5 w-5" />
            </button>
            <CartButton />
            <Link 
              href="/login" 
              className={`flex items-center text-gray-700 hover:text-blue-600 ${
                isActive('/login') || isActive('/dashboard') ? 'text-blue-600' : ''
              }`}
            >
              <User className="h-5 w-5" />
            </Link>
          </div>

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
                href="/cursos" 
                className={`py-2 text-gray-700 hover:text-blue-600 font-medium ${
                  isActive('/cursos') ? 'text-blue-600 font-bold' : ''
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Cursos
              </Link>
              <Link 
                href="/ebooks" 
                className={`py-2 text-gray-700 hover:text-blue-600 font-medium flex items-center ${
                  isActive('/ebooks') ? 'text-blue-600 font-bold' : ''
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <BookOpen className="mr-1 h-4 w-4" /> E-books
              </Link>
              <Link 
                href="/blog" 
                className={`py-2 text-gray-700 hover:text-blue-600 font-medium ${
                  isActive('/blog') ? 'text-blue-600 font-bold' : ''
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Blog
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
              <div className="flex items-center space-x-4 py-2">
                <CartButton />
                <Link 
                  href="/login" 
                  className={`text-gray-700 hover:text-blue-600 ${
                    isActive('/login') || isActive('/dashboard') ? 'text-blue-600' : ''
                  }`}
                >
                  <User className="h-5 w-5" />
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default MainNavbar; 