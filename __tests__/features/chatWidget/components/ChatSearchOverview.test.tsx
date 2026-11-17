import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ChatSearchOverview } from '@/features/chatWidget/components/ChatSearchOverview'

const state = vi.hoisted(() => {return { active: true, agentId: 'agent' }})
vi.mock('@/features/chatWidget/hooks/useIsChatWidgetActive', () => {return {
  useIsChatWidgetActive: () => state.active,
}})
vi.mock('@/hooks/useActiveConfig', () => {return {
  useActiveConfig: () => {return {
    features: { agentStudio: { chatWidgetAgentID: state.agentId } },
  }},
}})
vi.mock('react-instantsearch', () => {return {
  ResultCard: ({ agentId }: { agentId: string }) => (
    <div>Overview {agentId}</div>
  ),
}})
beforeEach(() => {
  state.active = true
  state.agentId = 'agent'
})

describe('ChatSearchOverview', () => {
  it('mounts overview for active chat and agent', () => {
    const { rerender } = render(<ChatSearchOverview />)
    expect(screen.getByText('Overview agent')).toBeInTheDocument()
    state.active = false
    rerender(<ChatSearchOverview />)
    expect(screen.queryByText('Overview agent')).not.toBeInTheDocument()
  })
  it('hides overview when the agent is missing', () => {
    state.agentId = ''
    render(<ChatSearchOverview />)
    expect(screen.queryByText(/Overview/)).not.toBeInTheDocument()
  })
})
