import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sobre | Madua - Notícias de Israel",
  description: "Nossa missão é trazer a verdade sobre Israel, combatendo a desinformação e o antissemitismo através de jornalismo sério e comprometido.",
};

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">
            Nossa Missão
          </h1>
          <p className="text-xl text-center max-w-3xl mx-auto">
            Trazendo a verdade sobre Israel para o público brasileiro, combatendo a desinformação e o antissemitismo através de jornalismo sério e comprometido.
          </p>
        </div>
      </section>

      {/* Conteúdo Principal */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto prose prose-lg">
            <h2 className="text-3xl font-bold mb-6">Por que o Madua existe?</h2>
            
            <p>
              Em um mundo onde a desinformação e o antissemitismo crescem a cada dia, o Madua nasceu com uma missão clara: ser a voz da verdade sobre Israel no Brasil. Nosso nome, &quot;Madua&quot; (מדוע), significa &quot;por quê&quot; em hebraico - porque acreditamos que é fundamental questionar, investigar e trazer à luz a verdade sobre Israel e seu povo.
            </p>

            <p>
              Como sionistas orgulhosos, entendemos a importância vital de Israel não apenas como o lar nacional do povo judeu, mas como um farol de democracia, inovação e resiliência no Oriente Médio. Cada história que publicamos, cada análise que fazemos, é guiada pelo compromisso inabalável com a verdade e com a defesa do direito de Israel existir e prosperar.
            </p>

            <h2 className="text-3xl font-bold mt-12 mb-6">Nossa Responsabilidade</h2>
            
            <p>
              O antissemitismo moderno frequentemente se disfarça de &quot;crítica a Israel&quot;, mas nós conhecemos bem essa retórica antiga. Nossa responsabilidade é dupla: primeiro, trazer notícias precisas e análises aprofundadas sobre Israel; segundo, expor e combater narrativas distorcidas que demonizam o único Estado judeu do mundo.
            </p>

            <p>
              Trabalhamos incansavelmente para:
            </p>

            <ul>
              <li>Trazer cobertura em tempo real dos acontecimentos em Israel</li>
              <li>Oferecer análises aprofundadas do contexto geopolítico</li>
              <li>Destacar as conquistas israelenses em tecnologia, medicina e inovação</li>
              <li>Combater fake news e narrativas antissemitas</li>
              <li>Educar sobre a história e a importância de Israel</li>
            </ul>

            <h2 className="text-3xl font-bold mt-12 mb-6">Nosso Compromisso</h2>

            <p>
              Em um momento em que Israel enfrenta não apenas ameaças físicas, mas também uma guerra de narrativas, nosso compromisso com a verdade é mais importante do que nunca. Acreditamos que informação precisa e contextualizada é a melhor ferramenta contra o ódio e a desinformação.
            </p>

            <p>
              Como jornalistas e defensores de Israel, nos comprometemos a:
            </p>

            <ul>
              <li>Manter os mais altos padrões de jornalismo</li>
              <li>Verificar rigorosamente todas as informações antes da publicação</li>
              <li>Apresentar o contexto completo dos acontecimentos</li>
              <li>Dar voz a especialistas e analistas qualificados</li>
              <li>Defender incansavelmente a verdade sobre Israel</li>
            </ul>

            <div className="bg-blue-50 p-6 rounded-lg mt-12">
              <h3 className="text-2xl font-bold mb-4 text-blue-800">Nossa Visão</h3>
              <p className="text-blue-900">
                Sonhamos com um mundo onde Israel seja compreendido e respeitado por suas contribuições para a humanidade, onde o antissemitismo não encontre terreno fértil para se propagar, e onde a verdade prevaleça sobre o preconceito. Este é o propósito que nos move todos os dias no Madua.
              </p>
            </div>

            <p className="text-gray-600 mb-4">
              Nossa plataforma é um &quot;hub&quot; de conhecimento, onde você encontrará cursos em &quot;Desenvolvimento Web&quot;, &quot;Mobile&quot; e muito mais.
            </p>

            <p className="text-gray-600 mb-4">
              Nosso objetivo é criar um ambiente de &quot;aprendizado contínuo&quot;.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
} 