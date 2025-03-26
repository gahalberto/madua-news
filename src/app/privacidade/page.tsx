import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: "Nossa política de privacidade explica como coletamos, usamos e protegemos seus dados pessoais."
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Política de Privacidade</h1>
        
        <p className="mb-6">
          Última atualização: {new Date().toLocaleDateString('pt-BR')}
        </p>
        
        <div className="prose max-w-none">
          <h2 className="text-xl font-semibold mt-8 mb-4">1. Introdução</h2>
          <p>
            Esta Política de Privacidade descreve como coletamos, usamos, processamos e protegemos suas informações pessoais quando você utiliza nosso site e serviços.
            Respeitamos sua privacidade e estamos comprometidos em proteger seus dados pessoais.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">2. Informações que Coletamos</h2>
          <p>Podemos coletar os seguintes tipos de informações:</p>
          <ul className="list-disc pl-6 mt-2 mb-4">
            <li><strong>Informações pessoais:</strong> Nome, endereço de e-mail, número de telefone, endereço.</li>
            <li><strong>Informações de conta:</strong> Nome de usuário, senha, preferências de conta.</li>
            <li><strong>Informações de pagamento:</strong> Dados de cartão de crédito, informações bancárias (processados por gateways de pagamento seguros).</li>
            <li><strong>Informações de uso:</strong> Como você utiliza nosso site, páginas visitadas, tempo gasto.</li>
            <li><strong>Informações técnicas:</strong> Endereço IP, tipo de navegador, dispositivo, sistema operacional.</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">3. Como Usamos Suas Informações</h2>
          <p>Utilizamos suas informações para:</p>
          <ul className="list-disc pl-6 mt-2 mb-4">
            <li>Fornecer e melhorar nossos serviços</li>
            <li>Processar transações e pagamentos</li>
            <li>Enviar comunicações sobre sua conta ou transações</li>
            <li>Enviar materiais de marketing (com seu consentimento)</li>
            <li>Personalizar sua experiência</li>
            <li>Cumprir obrigações legais</li>
            <li>Detectar e prevenir fraudes</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">4. Cookies e Tecnologias Semelhantes</h2>
          <p>
            Utilizamos cookies e tecnologias semelhantes para melhorar sua experiência, analisar o tráfego e personalizar o conteúdo. 
            Você pode controlar o uso de cookies através das configurações do seu navegador.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">5. Compartilhamento de Informações</h2>
          <p>Podemos compartilhar suas informações com:</p>
          <ul className="list-disc pl-6 mt-2 mb-4">
            <li>Prestadores de serviços que nos ajudam a operar o site</li>
            <li>Parceiros de negócios (com seu consentimento)</li>
            <li>Autoridades legais quando exigido por lei</li>
            <li>Em caso de fusão, aquisição ou venda de ativos</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">6. Segurança de Dados</h2>
          <p>
            Implementamos medidas de segurança técnicas e organizacionais apropriadas para proteger seus dados pessoais contra acesso não autorizado, 
            alteração, divulgação ou destruição acidental. Entretanto, nenhum método de transmissão pela Internet ou método de armazenamento eletrônico 
            é 100% seguro, e não podemos garantir segurança absoluta.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">7. Seus Direitos</h2>
          <p>Dependendo da legislação aplicável, você pode ter os seguintes direitos:</p>
          <ul className="list-disc pl-6 mt-2 mb-4">
            <li>Acessar seus dados pessoais</li>
            <li>Corrigir dados imprecisos</li>
            <li>Solicitar a exclusão de seus dados</li>
            <li>Restringir ou opor-se ao processamento de seus dados</li>
            <li>Solicitar a portabilidade de seus dados</li>
            <li>Retirar o consentimento a qualquer momento</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">8. Exclusão de Dados</h2>
          <p>
            Você pode solicitar a exclusão de seus dados pessoais a qualquer momento. Para fazer isso, acesse nossa 
            página de <a href="/exclusao-de-dados" className="text-blue-600 hover:underline">Exclusão de Dados</a> ou 
            entre em contato conosco pelo e-mail contato@clubedorabino.com.
          </p>
          <p className="mt-2">
            Após recebermos sua solicitação, excluiremos seus dados pessoais em um prazo razoável, exceto quando houver 
            obrigação legal de mantê-los por um período específico.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">9. Retenção de Dados</h2>
          <p>
            Mantemos seus dados pessoais apenas pelo tempo necessário para os fins descritos nesta Política de Privacidade, 
            ou conforme exigido por lei. Quando não precisarmos mais de suas informações pessoais, as excluiremos ou anonimizaremos.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">10. Menores de Idade</h2>
          <p>
            Nossos serviços não se destinam a menores de 18 anos. Não coletamos intencionalmente informações pessoais de crianças. 
            Se você é pai ou responsável e acredita que seu filho nos forneceu informações pessoais, entre em contato conosco para 
            que possamos tomar as medidas apropriadas.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">11. Alterações nesta Política</h2>
          <p>
            Podemos atualizar nossa Política de Privacidade periodicamente. Notificaremos sobre quaisquer alterações materiais 
            publicando a nova Política de Privacidade nesta página e, quando apropriado, enviando uma notificação por e-mail.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">12. Contato</h2>
          <p>
            Se você tiver dúvidas sobre esta Política de Privacidade ou sobre nossas práticas de privacidade, entre em contato conosco:
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