import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Madua - Notícias de Israel em Português | Cobertura Completa e Imparcial",
  description: "Acompanhe as últimas notícias de Israel em português. Cobertura completa, análises aprofundadas e informações exclusivas sobre política, economia e sociedade israelense.",
  alternates: {
    canonical: "https://madua.com.br",
  },
};

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Notícias de Israel em Português
            </h1>
            <p className="text-xl mb-8">
              Sua fonte confiável de informações sobre Israel. Cobertura completa, análises aprofundadas e notícias atualizadas 24 horas por dia.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                href="/noticias"
                className="px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-100 text-center"
                title="Acesse as últimas notícias de Israel"
              >
                Últimas Notícias
              </Link>
              <Link
                href="/sobre"
                className="px-6 py-3 border border-white text-white font-medium rounded-lg hover:bg-white hover:text-blue-600 text-center"
                title="Conheça mais sobre o Madua"
              >
                Sobre Nós
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-full max-w-lg h-80">
              <Image
                src="/images/israel-news.jpg"
                alt="Notícias de Israel em tempo real"
                fill
                className="object-cover rounded-2xl"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl font-bold mb-2">24/7</div>
                  <div className="text-xl">Cobertura Completa</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Por que escolher o Madua?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <article className="bg-white p-8 rounded-xl shadow-sm">
              <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Notícias em Tempo Real</h3>
              <p className="text-gray-600">
                Acompanhe os acontecimentos em Israel em tempo real. Notícias atualizadas 24 horas por dia, 7 dias por semana.
              </p>
            </article>
            <article className="bg-white p-8 rounded-xl shadow-sm">
              <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Análises Aprofundadas</h3>
              <p className="text-gray-600">
                Entenda o contexto completo dos acontecimentos com nossas análises detalhadas sobre política, economia e sociedade israelense.
              </p>
            </article>
            <article className="bg-white p-8 rounded-xl shadow-sm">
              <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Correspondentes Locais</h3>
              <p className="text-gray-600">
                Informações direto de Israel através de nossa rede de correspondentes especializados em cobrir o Oriente Médio.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Receba as Últimas Notícias de Israel</h2>
            <p className="text-lg text-gray-600 mb-8">
              Inscreva-se em nossa newsletter para receber as principais notícias e análises sobre Israel diretamente no seu e-mail.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 justify-center">
              <input
                type="email"
                placeholder="Seu melhor e-mail"
                className="px-6 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 flex-grow max-w-md"
                aria-label="Endereço de e-mail para newsletter"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Inscrever-se
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
} 