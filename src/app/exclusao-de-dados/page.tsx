"use client";

import React, { useState } from 'react';
import { Metadata } from "next";
import { toast } from "sonner";

export const metadata: Metadata = {
  title: "Exclusão de Dados",
  description: "Solicite a exclusão de seus dados pessoais conforme previsto nas leis de proteção de dados."
};

export default function DataDeletionPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    reason: 'privacy',
    details: '',
    confirmation: false
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [referenceId, setReferenceId] = useState('');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkboxInput = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: checkboxInput.checked
      }));
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!formData.confirmation) {
      toast.error("Por favor, confirme que entende as implicações da exclusão de dados.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/delete-user-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao enviar solicitação');
      }
      
      setReferenceId(data.referenceId || '');
      toast.success("Solicitação de exclusão de dados enviada com sucesso!");
      setSubmitted(true);
      
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
      toast.error(error instanceof Error ? error.message : "Ocorreu um erro ao enviar sua solicitação. Por favor, tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Exclusão de Dados</h1>
        
        {submitted ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-green-800 mb-3">Solicitação Recebida</h2>
            <p className="text-green-700 mb-4">
              Sua solicitação de exclusão de dados foi recebida com sucesso. Processaremos sua solicitação em até 5 dias úteis.
            </p>
            <p className="text-green-700 mb-2">
              Você receberá um e-mail de confirmação assim que seus dados forem excluídos.
            </p>
            <p className="text-sm text-green-600 mt-4">
              Número de referência: {referenceId || Math.random().toString(36).substring(2, 10).toUpperCase()}
            </p>
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-8">
              De acordo com as leis de proteção de dados, você tem o direito de solicitar a exclusão de suas informações pessoais 
              de nossos sistemas. Preencha o formulário abaixo para fazer essa solicitação.
            </p>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
              <h2 className="text-lg font-semibold text-amber-800 mb-2">Importante</h2>
              <p className="text-amber-700">
                A exclusão de seus dados é permanente e irreversível. Isso resultará na perda de acesso a todos os cursos, 
                conteúdos e serviços que você adquiriu. Histórico de compras e dados relacionados a obrigações legais e fiscais 
                podem ser mantidos pelo período exigido por lei.
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Seu nome completo"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    E-mail Associado à Conta *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="exemplo@email.com"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Este deve ser o mesmo e-mail usado para criar sua conta.
                  </p>
                </div>
                
                <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                    Motivo da Exclusão *
                  </label>
                  <select
                    id="reason"
                    name="reason"
                    required
                    value={formData.reason}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="privacy">Preocupações com privacidade</option>
                    <option value="no-use">Não uso mais o serviço</option>
                    <option value="dissatisfied">Insatisfeito com o serviço</option>
                    <option value="gdpr">Exercício de direitos (LGPD/GDPR)</option>
                    <option value="other">Outro motivo</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="details" className="block text-sm font-medium text-gray-700 mb-1">
                    Detalhes Adicionais
                  </label>
                  <textarea
                    id="details"
                    name="details"
                    rows={4}
                    value={formData.details}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Forneça quaisquer informações adicionais relevantes para sua solicitação..."
                  />
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="confirmation"
                      name="confirmation"
                      checked={formData.confirmation}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                      required
                    />
                    <label htmlFor="confirmation" className="ml-2 text-sm text-gray-700">
                      Eu entendo que solicitar a exclusão de meus dados resultará na perda de acesso a todos os cursos, 
                      conteúdos e serviços adquiridos, e que esta ação é permanente e irreversível. *
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:bg-red-400"
                  >
                    {isSubmitting ? "Enviando..." : "Solicitar Exclusão de Dados"}
                  </button>
                </div>
              </div>
            </form>
            
            <div className="mt-8 text-sm text-gray-600">
              <h3 className="font-medium mb-2">O que acontece depois?</h3>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Analisaremos sua solicitação em até 5 dias úteis.</li>
                <li>Você receberá uma confirmação por e-mail quando sua solicitação for processada.</li>
                <li>Seus dados pessoais serão excluídos ou anonimizados conforme aplicável.</li>
                <li>Registros necessários para obrigações legais podem ser mantidos pelo período exigido por lei.</li>
              </ol>
            </div>
          </>
        )}
        
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