'use client'

import {
  WhatsappShareButton,
  WhatsappIcon,
  TelegramShareButton,
  TelegramIcon,
  TwitterShareButton,
  TwitterIcon,
  LinkedinShareButton,
  LinkedinIcon,
  FacebookShareButton,
  FacebookIcon,
} from 'react-share'

interface SocialShareProps {
  url: string
  title: string
  size?: number
  round?: boolean
}

export function SocialShare({ url, title, size = 32, round = true }: SocialShareProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm font-medium text-gray-600">Compartilhar</p>
      <div className="flex items-center gap-3">
        <WhatsappShareButton 
          url={url} 
          title={title}
          className="hover:opacity-80 transition-opacity"
        >
          <WhatsappIcon size={size} round={round} />
        </WhatsappShareButton>

        <TelegramShareButton 
          url={url} 
          title={title}
          className="hover:opacity-80 transition-opacity"
        >
          <TelegramIcon size={size} round={round} />
        </TelegramShareButton>

        <TwitterShareButton 
          url={url} 
          title={title}
          className="hover:opacity-80 transition-opacity"
        >
          <TwitterIcon size={size} round={round} />
        </TwitterShareButton>

        <LinkedinShareButton 
          url={url} 
          title={title}
          className="hover:opacity-80 transition-opacity"
        >
          <LinkedinIcon size={size} round={round} />
        </LinkedinShareButton>

        <FacebookShareButton 
          url={url} 
          title={title}
          className="hover:opacity-80 transition-opacity"
        >
          <FacebookIcon size={size} round={round} />
        </FacebookShareButton>
      </div>
    </div>
  )
} 