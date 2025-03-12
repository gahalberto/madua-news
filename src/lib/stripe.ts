import Stripe from 'stripe';

// Verificar se a variável de ambiente está definida
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('Atenção: STRIPE_SECRET_KEY não está definido no ambiente.');
}

// Criar e configurar o cliente do Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_default_key_for_development', {
  apiVersion: '2025-02-24.acacia', // Versão mais recente da API
  appInfo: {
    name: 'Plataforma de Cursos',
    version: '1.0.0',
  },
});

export default stripe; 