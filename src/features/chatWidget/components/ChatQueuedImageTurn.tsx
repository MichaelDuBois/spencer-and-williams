import { ChatImageThumbnail } from '@/features/chatWidget/components/ChatImageThumbnail'

interface ChatQueuedImageTurnProps {
  text: string
  isImageOnly: boolean
  imageUrl: string
}

/** The pending user image turn plus a native-style loader for the reply. */
export const ChatQueuedImageTurn = ({
  text,
  isImageOnly,
  imageUrl,
}: ChatQueuedImageTurnProps) => (
  // Mirrors the library's user message markup so the turn looks the same once sent.
  <div className="sw-ChatWidget-queuedTurn" role="status">
    <article
      className="ais-ChatMessage ais-ChatMessage--right ais-ChatMessage--neutral"
      data-role="user"
      aria-label="Message">
      <div className="ais-ChatMessage-container">
        <div className="ais-ChatMessage-leading" />
        <div className="ais-ChatMessage-content">
          <div className="ais-ChatMessage-message">
            <ChatImageThumbnail src={imageUrl} />
            {!isImageOnly && (
              <p className="ais-ChatMessage-text sw-ChatWidget-userImageText">
                {text}
              </p>
            )}
          </div>
        </div>
      </div>
    </article>
    {/* Mirrors the library's ChatMessageLoader markup to reuse its satellite styles. */}
    <article
      className="ais-ChatMessageLoader ais-ChatMessage ais-ChatMessage--left ais-ChatMessage--subtle"
      aria-label="Analyzing image">
      <div className="ais-ChatMessage-container">
        <div className="ais-ChatMessage-leading">
          <div className="ais-ChatMessageLoader-spinner">
            <QueuedImageLoaderSpinner />
          </div>
        </div>
        <div className="ais-ChatMessage-content">
          <div className="ais-ChatMessage-message">
            <div className="ais-ChatMessageLoader-skeletonWrapper">
              <div className="ais-ChatMessageLoader-skeletonItem" />
              <div className="ais-ChatMessageLoader-skeletonItem" />
            </div>
          </div>
        </div>
      </div>
    </article>
  </div>
)

const QueuedImageLoaderSpinner = () => (
  <svg viewBox="12 12 24 24" aria-hidden="true">
    <circle cx="24" cy="24" r="11" fill="none" stroke="currentColor" />
  </svg>
)
