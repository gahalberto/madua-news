import { Metadata } from "next";
import DataDeletionForm from "@/components/forms/DataDeletionForm";

export const metadata: Metadata = {
  title: "Exclusão de Dados",
  description: "Solicite a exclusão de seus dados pessoais conforme previsto nas leis de proteção de dados."
};

export default function DataDeletionPage() {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Exclusão de Dados</h1>
        <p className="text-gray-600 mb-8">
          De acordo com as leis de proteção de dados, você tem o direito de solicitar a exclusão de suas informações pessoais 
          de nossos sistemas. Preencha o formulário abaixo para fazer essa solicitação.
        </p>
        
        <DataDeletionForm />
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Se precisar de assistência adicional, entre em contato conosco pelo e-mail{' '}
            <a href="mailto:privacidade@clubedorabino.com" className="text-blue-600 hover:underline">
              privacidade@clubedorabino.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
} 