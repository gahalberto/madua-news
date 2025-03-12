"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { ShoppingBag, Menu, X, ChevronDown, LogOut, User, BookOpen, Home, Settings } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  // Verificar se a página está rolada para adicionar sombra ao menu
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Simular contagem de itens no carrinho (em um app real, isso viria de um contexto ou estado global)
  useEffect(() => {
    // Aqui você buscaria a contagem real de itens no carrinho
    setCartItemCount(Math.floor(Math.random() * 5));
  }, []);

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isProfileOpen) setIsProfileOpen(false);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
    if (isMenuOpen) setIsMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <header className={`sticky top-0 z-50 w-full bg-white transition-shadow duration-300 ${isScrolled ? 'shadow-md' : ''}`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-blue-600">Clube do Rabino</h1>
          </Link>

          {/* Menu de navegação para desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className={`text-gray-700 hover:text-blue-600 transition-colors ${isActive('/') ? 'font-medium text-blue-600' : ''}`}
            >
              Início
            </Link>
            <Link 
              href="/cursos" 
              className={`text-gray-700 hover:text-blue-600 transition-colors ${isActive('/cursos') ? 'font-medium text-blue-600' : ''}`}
            >
              Cursos
            </Link>
            <Link 
              href="/blog" 
              className={`text-gray-700 hover:text-blue-600 transition-colors ${isActive('/blog') ? 'font-medium text-blue-600' : ''}`}
            >
              Blog
            </Link>
            <Link 
              href="/produtos" 
              className={`text-gray-700 hover:text-blue-600 transition-colors ${isActive('/produtos') ? 'font-medium text-blue-600' : ''}`}
            >
              Loja
            </Link>
            <Link 
              href="/sobre" 
              className={`text-gray-700 hover:text-blue-600 transition-colors ${isActive('/sobre') ? 'font-medium text-blue-600' : ''}`}
            >
              Sobre
            </Link>
          </nav>

          {/* Ações do usuário para desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Sacola de compras */}
            <Link href="/carrinho" className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors">
              <ShoppingBag size={24} />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* Usuário não logado */}
            {!session ? (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  Entrar
                </Link>
                <Link
                  href="/registro"
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  Registrar
                </Link>
              </div>
            ) : (
              /* Usuário logado - Avatar e menu dropdown */
              <div className="relative">
                <button 
                  onClick={toggleProfile}
                  className="flex items-center space-x-2 focus:outline-none"
                  aria-expanded={isProfileOpen}
                  aria-haspopup="true"
                >
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200">
                    {session.user?.image ? (
                      <Image 
                        src={session.user.image} 
                        alt={session.user.name || "Usuário"} 
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white text-lg font-medium">
                        {session.user?.name?.charAt(0) || "U"}
                      </div>
                    )}
                  </div>
                  <ChevronDown size={16} className={`text-gray-600 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Menu dropdown do perfil */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">{session.user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
                    </div>
                    <Link 
                      href="/dashboard" 
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Home size={16} className="mr-2" />
                      Dashboard
                    </Link>
                    <Link 
                      href="/dashboard/cursos" 
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <BookOpen size={16} className="mr-2" />
                      Meus Cursos
                    </Link>
                    <Link 
                      href="/perfil" 
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <User size={16} className="mr-2" />
                      Perfil
                    </Link>
                    <Link 
                      href="/configuracoes" 
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Settings size={16} className="mr-2" />
                      Configurações
                    </Link>
                    <button 
                      onClick={handleSignOut}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 border-t border-gray-100"
                    >
                      <LogOut size={16} className="mr-2" />
                      Sair
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Botão do menu mobile */}
          <div className="md:hidden flex items-center space-x-4">
            {/* Sacola de compras para mobile */}
            <Link href="/carrinho" className="relative p-2 text-gray-700">
              <ShoppingBag size={22} />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {cartItemCount}
                </span>
              )}
            </Link>
            
            <button 
              onClick={toggleMenu}
              className="p-2 text-gray-700 focus:outline-none"
              aria-expanded={isMenuOpen}
              aria-label="Menu principal"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 py-4">
          <div className="container mx-auto px-4">
            <nav className="flex flex-col space-y-4">
              <Link 
                href="/" 
                className={`text-gray-700 py-2 ${isActive('/') ? 'font-medium text-blue-600' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Início
              </Link>
              <Link 
                href="/cursos" 
                className={`text-gray-700 py-2 ${isActive('/cursos') ? 'font-medium text-blue-600' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Cursos
              </Link>
              <Link 
                href="/blog" 
                className={`text-gray-700 py-2 ${isActive('/blog') ? 'font-medium text-blue-600' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Blog
              </Link>
              <Link 
                href="/produtos" 
                className={`text-gray-700 py-2 ${isActive('/produtos') ? 'font-medium text-blue-600' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Loja
              </Link>
              <Link 
                href="/sobre" 
                className={`text-gray-700 py-2 ${isActive('/sobre') ? 'font-medium text-blue-600' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Sobre
              </Link>

              {/* Ações do usuário para mobile */}
              {!session ? (
                <div className="flex flex-col space-y-2 pt-4 border-t border-gray-100">
                  <Link
                    href="/login"
                    className="w-full px-4 py-2 text-center rounded border border-blue-600 text-blue-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Entrar
                  </Link>
                  <Link
                    href="/registro"
                    className="w-full px-4 py-2 text-center rounded bg-blue-600 text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Registrar
                  </Link>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200">
                      {session.user?.image ? (
                        <Image 
                          src={session.user.image} 
                          alt={session.user.name || "Usuário"} 
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white text-lg font-medium">
                          {session.user?.name?.charAt(0) || "U"}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{session.user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <Link 
                      href="/dashboard" 
                      className="flex items-center px-2 py-2 text-sm text-gray-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Home size={16} className="mr-2" />
                      Dashboard
                    </Link>
                    <Link 
                      href="/dashboard/cursos" 
                      className="flex items-center px-2 py-2 text-sm text-gray-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <BookOpen size={16} className="mr-2" />
                      Meus Cursos
                    </Link>
                    <Link 
                      href="/perfil" 
                      className="flex items-center px-2 py-2 text-sm text-gray-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User size={16} className="mr-2" />
                      Perfil
                    </Link>
                    <Link 
                      href="/configuracoes" 
                      className="flex items-center px-2 py-2 text-sm text-gray-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Settings size={16} className="mr-2" />
                      Configurações
                    </Link>
                    <button 
                      onClick={handleSignOut}
                      className="flex items-center w-full text-left px-2 py-2 text-sm text-red-600 border-t border-gray-100 mt-2 pt-2"
                    >
                      <LogOut size={16} className="mr-2" />
                      Sair
                    </button>
                  </div>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
} 