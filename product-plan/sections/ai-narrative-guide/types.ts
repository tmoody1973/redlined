// =============================================================================
// Data Types
// =============================================================================

export type MessageRole = 'user' | 'assistant' | 'system-narration'

export type AudioState = 'idle' | 'playing' | 'paused' | 'finished' | null

export type PromptCategory = 'history' | 'holc' | 'data' | 'counterfactual'

export interface ZoneContext {
  holcGrade: string
  holcId: string
  name: string
  description: string
  medianIncome: number
  medianHomeValue: number
  populationDensity: number
  percentOwnerOccupied: number
}

export interface Message {
  id: string
  role: MessageRole
  content: string
  timestamp: string
  audioState: AudioState
  isAutoNarrated: boolean
}

export interface SuggestedPrompt {
  id: string
  text: string
  category: PromptCategory
}

export interface Conversation {
  id: string
  zoneId: string
  narrationMuted: boolean
  messages: Message[]
}

// =============================================================================
// Component Props
// =============================================================================

export interface NarrativeGuideProps {
  /** The current conversation with message history */
  conversation: Conversation
  /** The currently selected HOLC zone providing context to the AI */
  zoneContext: ZoneContext | null
  /** Pre-written questions displayed when conversation is empty or zone changes */
  suggestedPrompts: SuggestedPrompt[]
  /** Whether the AI is currently generating a streaming response */
  isStreaming?: boolean
  /** Called when the user submits a message via the chat input */
  onSendMessage?: (content: string) => void
  /** Called when the user clicks a suggested prompt button */
  onSelectPrompt?: (promptId: string) => void
  /** Called when the user clicks the Listen button on a message */
  onPlayAudio?: (messageId: string) => void
  /** Called when the user pauses audio playback */
  onPauseAudio?: (messageId: string) => void
  /** Called when the user toggles the narration mute state */
  onToggleMute?: () => void
}
