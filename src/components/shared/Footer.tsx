import Link from "next/link";
import { Facebook, Instagram, Twitter, Linkedin, Mail, Phone } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Clube do Rabino</h3>
            <p className="text-gray-400">
              Transformando vidas através da educação de qualidade desde 2024.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Twitter">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="LinkedIn">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Links Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/cursos" className="text-gray-400 hover:text-white transition-colors">
                  Cursos
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/produtos" className="text-gray-400 hover:text-white transition-colors">
                  Loja
                </Link>
              </li>
              <li>
                <Link href="/sobre" className="text-gray-400 hover:text-white transition-colors">
                  Sobre Nós
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Suporte</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contato" className="text-gray-400 hover:text-white transition-colors">
                  Contato
                </Link>
              </li>
              <li>
                <Link href="/termos" className="text-gray-400 hover:text-white transition-colors">
                  Termos de Serviço
                </Link>
              </li>
              <li>
                <Link href="/privacidade" className="text-gray-400 hover:text-white transition-colors">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link href="/exclusao-de-dados" className="text-gray-400 hover:text-white transition-colors">
                  Exclusão de Dados
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Contato</h4>
            <div className="space-y-3">
              <div className="flex items-center">
                <Mail size={18} className="text-gray-400 mr-2" />
                <a href="mailto:contato@clubedorabino.com" className="text-gray-400 hover:text-white transition-colors">
                  contato@clubedorabino.com
                </a>
              </div>
              <div className="flex items-center">
                <Phone size={18} className="text-gray-400 mr-2" />
                <a href="tel:+5511999999999" className="text-gray-400 hover:text-white transition-colors">
                  +55 (11) 99999-9999
                </a>
              </div>
            </div>
            
            <div className="mt-6">
              <h5 className="text-sm font-medium mb-2">Inscreva-se na nossa newsletter</h5>
              <form className="flex">
                <input
                  type="email"
                  placeholder="Seu e-mail"
                  className="px-3 py-2 bg-gray-700 text-white rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
                  required
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-3 py-2 rounded-r-md hover:bg-blue-700 transition-colors"
                >
                  Enviar
                </button>
              </form>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-10 pt-6 text-center text-gray-400">
          <p className="mb-2">&copy; {currentYear} Clube do Rabino. Todos os direitos reservados.</p>
          <div className="flex justify-center space-x-4 text-sm">
            <Link href="/privacidade" className="hover:text-white transition-colors">
              Privacidade
            </Link>
            <span className="text-gray-600">|</span>
            <Link href="/termos" className="hover:text-white transition-colors">
              Termos
            </Link>
            <span className="text-gray-600">|</span>
            <Link href="/exclusao-de-dados" className="hover:text-white transition-colors">
              Solicitar Exclusão de Dados
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 