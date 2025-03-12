import { MercadoPagoConfig } from 'mercadopago';

// Verificar se a variável de ambiente está definida
if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
  console.warn('Atenção: MERCADO_PAGO_ACCESS_TOKEN não está definido no ambiente.');
}

// Criar e configurar o cliente do Mercado Pago
const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || 'TEST-0000000000000000-000000-00000000000000000000000000000000-000000000'
});

export default mpClient; 