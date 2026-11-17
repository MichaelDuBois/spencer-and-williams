import { ChatImageMessage } from '@/features/aiAssistant/components/messages/ChatImageMessage'

interface ChatImageThumbnailProps {
  src: string
}

/** The custom assistant's image bubble, tagged so the widget CSS can lay out the turn around it. */
export const ChatImageThumbnail = ({ src }: ChatImageThumbnailProps) => (
  <ChatImageMessage imageUrl={src} className="sw-ChatWidget-userImage" />
)
