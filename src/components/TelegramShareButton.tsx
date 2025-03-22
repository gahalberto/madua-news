'use client';

import { TelegramShareButton as ReactTelegramShareButton } from 'react-share';
import { FaTelegram } from 'react-icons/fa';

interface TelegramShareButtonProps {
  url: string;
  title: string;
  size?: number;
  round?: boolean;
}

export function TelegramShareButton({ url, title, size = 40, round = true }: TelegramShareButtonProps) {
  return (
    <ReactTelegramShareButton
      url={url}
      title={title}
      className="flex items-center justify-center bg-[#0088cc] text-white rounded-full hover:opacity-80 transition-opacity"
      style={{ width: size, height: size }}
    >
      <FaTelegram size={size * 0.6} />
    </ReactTelegramShareButton>
  );
} 