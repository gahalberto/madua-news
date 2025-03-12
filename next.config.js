/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração para lidar com módulos nativos no cliente
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Ignorar completamente os módulos problemáticos
      config.resolve.alias = {
        ...config.resolve.alias,
        bcrypt: false,
        '@mapbox/node-pre-gyp': false,
      };
      
      // Fallbacks para módulos nativos
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        path: false,
        os: false,
        assert: false,
        util: false,
        url: false,
        'node-gyp': false,
        'npm': false,
        child_process: false,
      };
    }
    return config;
  },
  // Configuração de imagens para permitir domínios externos
  images: {
    domains: ['via.placeholder.com'],
  },
  // Atualizado conforme recomendação do Next.js 15.2.1
  experimental: {
    serverExternalPackages: ['bcrypt', '@mapbox/node-pre-gyp'],
  },
};

module.exports = nextConfig; 