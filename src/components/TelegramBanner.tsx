import Link from 'next/link';

export default function TelegramBanner() {
  return (
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-sm mb-4 overflow-hidden">
      <div className="flex items-center p-2 sm:p-3">
        <div className="flex-shrink-0 mr-3">
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.25l-2.17 10.193c-.165.75-.596.937-1.218.584l-3.346-2.465-1.617 1.559c-.177.177-.33.33-.678.33l.24-3.375 6.152-5.558c.267-.24-.06-.375-.413-.135l-7.606 4.785-3.286-.998c-.72-.222-.735-.72.15-1.065l12.86-4.95c.6-.222 1.12.135.931.99z" />
          </svg>
        </div>
        <div className="flex-grow hidden sm:block">
          <p className="text-sm font-medium">
            Receba as últimas notícias em primeira mão no nosso canal do Telegram: @maduabrasil
          </p>
        </div>
        <div className="flex-grow sm:hidden">
          <p className="text-xs font-medium">
            Notícias em primeira mão no Telegram
          </p>
        </div>
        <div className="flex-shrink-0 ml-3">
          <a 
            href="https://t.me/maduabrasil" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center bg-white text-blue-600 font-medium text-xs sm:text-sm px-3 py-1 rounded-full hover:bg-blue-50 transition-colors"
          >
            Acessar Canal
          </a>
        </div>
      </div>
    </div>
  );
} 