import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Serviço",
  description: "Nossos termos de serviço explicam as regras, diretrizes e acordos para utilizar nossos serviços."
};

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Termos de Serviço</h1>
        
        <p className="mb-6">
          Última atualização: {new Date().toLocaleDateString('pt-BR')}
        </p>
        
        <div className="prose max-w-none">
          <p className="mb-6">
            Bem-vindo ao Clube do Rabino. Estes Termos de Serviço ("Termos") regem seu acesso e uso do site, aplicativos 
            e serviços oferecidos pelo Clube do Rabino ("Serviços").
          </p>
          
          <p className="mb-6">
            Por favor, leia estes Termos cuidadosamente antes de acessar ou usar nossos Serviços. Ao acessar ou usar nossos 
            Serviços, você concorda em ficar vinculado a estes Termos e à nossa Política de Privacidade.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">1. Aceitação dos Termos</h2>
          <p>
            Ao acessar ou usar nossos Serviços, você concorda com estes Termos. Se você não concordar com qualquer parte 
            destes Termos, você não deve acessar ou usar nossos Serviços.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">2. Elegibilidade</h2>
          <p>
            Você deve ter pelo menos 18 anos de idade para usar nossos Serviços. Ao usar nossos Serviços, você declara e 
            garante que tem pelo menos 18 anos de idade e que possui capacidade legal para aceitar estes Termos.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">3. Conta de Usuário</h2>
          <p>
            Para acessar determinados recursos de nossos Serviços, você precisará criar uma conta. Você é responsável por manter 
            a confidencialidade de sua conta e senha e por restringir o acesso ao seu computador ou dispositivo. Você concorda 
            em aceitar a responsabilidade por todas as atividades que ocorram em sua conta.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">4. Conteúdo e Cursos</h2>
          <p>
            O conteúdo educacional, incluindo cursos, materiais, vídeos e outros recursos, disponibilizado através de nossos 
            Serviços, é protegido por direitos autorais e outras leis de propriedade intelectual. Você pode acessar e usar este 
            conteúdo apenas para seu uso pessoal e não comercial.
          </p>
          <p className="mt-2">
            Não é permitido copiar, reproduzir, distribuir, transmitir, exibir, vender, licenciar ou explorar de qualquer outra 
            forma qualquer conteúdo de nossos Serviços sem nossa autorização prévia por escrito.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">5. Compras e Pagamentos</h2>
          <p>
            Alguns de nossos Serviços são oferecidos mediante pagamento. Se você optar por adquirir um Serviço pago, concorda em 
            pagar todas as taxas aplicáveis conforme indicado no momento da compra.
          </p>
          <p className="mt-2">
            Todas as compras são finais e não reembolsáveis, exceto conforme exigido por lei ou conforme especificado em nossa 
            política de reembolso. Podemos oferecer reembolsos a nosso exclusivo critério.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">6. Conduta do Usuário</h2>
          <p>
            Você concorda em usar nossos Serviços apenas para fins legais e de acordo com estes Termos. Você concorda em não:
          </p>
          <ul className="list-disc pl-6 mt-2 mb-4">
            <li>Violar quaisquer leis ou regulamentos aplicáveis</li>
            <li>Publicar, transmitir ou compartilhar conteúdo ilegal, ofensivo, difamatório ou obsceno</li>
            <li>Assediar, intimidar ou ameaçar outros usuários</li>
            <li>Usar nossos Serviços para enviar spam ou mensagens não solicitadas</li>
            <li>Tentar acessar contas de outros usuários ou sistemas de segurança</li>
            <li>Interferir ou interromper nossos Serviços ou servidores</li>
            <li>Contornar medidas que usamos para restringir acesso aos nossos Serviços</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">7. Propriedade Intelectual</h2>
          <p>
            Todos os direitos, títulos e interesses em e para os Serviços, incluindo todos os conteúdos, recursos e funcionalidades, 
            são e permanecerão propriedade exclusiva do Clube do Rabino e seus licenciadores.
          </p>
          <p className="mt-2">
            Nossas marcas registradas, logotipos e nomes de serviço não podem ser usados sem nossa aprovação prévia por escrito.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">8. Isenção de Garantias</h2>
          <p>
            Nossos Serviços são fornecidos "como estão" e "conforme disponíveis", sem garantias de qualquer tipo, expressas ou implícitas. 
            Não garantimos que nossos Serviços serão ininterruptos, oportunos, seguros ou livres de erros.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">9. Limitação de Responsabilidade</h2>
          <p>
            Em nenhuma circunstância seremos responsáveis por quaisquer danos indiretos, incidentais, especiais, consequenciais ou punitivos, 
            ou quaisquer perdas de lucros ou receitas, relacionados ao uso ou incapacidade de usar nossos Serviços.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">10. Indenização</h2>
          <p>
            Você concorda em defender, indenizar e isentar o Clube do Rabino, seus diretores, funcionários e agentes de e contra todas 
            as reivindicações, danos, obrigações, perdas, responsabilidades, custos ou dívidas e despesas decorrentes de: (i) seu uso e 
            acesso aos Serviços; (ii) sua violação destes Termos; ou (iii) sua violação de quaisquer direitos de terceiros.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">11. Rescisão</h2>
          <p>
            Podemos encerrar ou suspender sua conta e acesso aos Serviços imediatamente, sem aviso prévio ou responsabilidade, por 
            qualquer motivo, incluindo, sem limitação, se você violar estes Termos.
          </p>
          <p className="mt-2">
            Você pode solicitar a exclusão de sua conta a qualquer momento através de nossa página de 
            <a href="/exclusao-de-dados" className="text-blue-600 hover:underline"> Exclusão de Dados</a>.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">12. Alterações nos Termos</h2>
          <p>
            Reservamo-nos o direito, a nosso exclusivo critério, de modificar ou substituir estes Termos a qualquer momento. Se uma 
            revisão for material, tentaremos fornecer um aviso com pelo menos 30 dias de antecedência antes que quaisquer novos termos 
            entrem em vigor.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">13. Legislação Aplicável</h2>
          <p>
            Estes Termos serão regidos e interpretados de acordo com as leis brasileiras, sem considerar suas disposições sobre conflitos 
            de leis. Qualquer disputa decorrente ou relacionada a estes Termos será sujeita à jurisdição exclusiva dos tribunais localizados 
            em São Paulo/SP.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">14. Contato</h2>
          <p>
            Se você tiver dúvidas sobre estes Termos, entre em contato conosco:
          </p>
          <ul className="list-disc pl-6 mt-2 mb-4">
            <li>E-mail: contato@clubedorabino.com</li>
            <li>Telefone: +55 (11) 99999-9999</li>
            <li>Endereço: Rua Exemplo, 123 - São Paulo/SP</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 