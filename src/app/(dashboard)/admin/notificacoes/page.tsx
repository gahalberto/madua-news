'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/layouts/AdminLayout';

export default function NotificationsPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [url, setUrl] = useState('');
  const [icon, setIcon] = useState('');
  const [segment, setSegment] = useState('Subscribed Users');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; error?: string; message?: string } | null>(null);

  // Lista de segmentos disponíveis
  const segments = [
    'Subscribed Users',
    'Active Users',
    'Engaged Users',
    'Inactive Users',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          message,
          url: url || undefined,
          icon: icon || undefined,
          segments: [segment],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao enviar notificação');
      }

      setResult({
        success: true,
        message: 'Notificação enviada com sucesso!',
      });

      // Limpar formulário após envio bem-sucedido
      setTitle('');
      setMessage('');
      setUrl('');
      setIcon('');
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout
      title="Enviar Notificações Push"
      description="Envie notificações push para os usuários do site"
    >
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Enviar Notificação Push</h2>

        {result && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {result.success ? result.message : `Erro: ${result.error}`}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Título da Notificação *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              placeholder="Ex: Nova Notícia Importante"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Mensagem *
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              rows={3}
              placeholder="Ex: Confira a nova notícia sobre Israel que acabamos de publicar!"
            />
          </div>

          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
              URL de Destino (opcional)
            </label>
            <input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://madua.com.br/noticias/exemplo"
            />
            <p className="text-xs text-gray-500 mt-1">
              URL para onde o usuário será direcionado ao clicar na notificação.
            </p>
          </div>

          <div>
            <label htmlFor="icon" className="block text-sm font-medium text-gray-700 mb-1">
              URL do Ícone (opcional)
            </label>
            <input
              id="icon"
              type="url"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://madua.com.br/icons/custom-icon.png"
            />
            <p className="text-xs text-gray-500 mt-1">
              URL do ícone personalizado para a notificação. Se não informado, será usado o ícone padrão.
            </p>
          </div>

          <div>
            <label htmlFor="segment" className="block text-sm font-medium text-gray-700 mb-1">
              Segmento de Usuários
            </label>
            <select
              id="segment"
              value={segment}
              onChange={(e) => setSegment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {segments.map((seg) => (
                <option key={seg} value={seg}>
                  {seg}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Escolha para qual grupo de usuários a notificação será enviada.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Enviando...' : 'Enviar Notificação'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
} 