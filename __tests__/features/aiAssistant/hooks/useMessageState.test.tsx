import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useMessageState } from '@/features/aiAssistant/hooks/useMessageState'
import type {
  DisplayResultsData,
  OrderContextData,
  OrderHistoryDisplayData,
  SuggestAction,
} from '@/features/aiAssistant/types'

import { buildJotaiWrapper } from '../../../helpers/jotai-wrapper'

const setup = () =>
  renderHook(() => useMessageState(), { wrapper: buildJotaiWrapper() })

const displayData = (objectIDs: string[]): DisplayResultsData => {return {
  intro: '',
  groups: [
    {
      title: 'Group',
      why: '',
      products: objectIDs.map((objectID) => {return { objectID, why: '' }}),
    },
  ],
}}

const orderHistoryData = (orderIds: string[]): OrderHistoryDisplayData => {return {
  orders: orderIds.map((id) => {return { id, createdAt: 0, total: 0, items: [] }}),
}}

describe('useMessageState', () => {
  it('starts with empty messages, suggestions, and collected IDs', () => {
    const { result } = setup()

    expect(result.current.messages).toEqual([])
    expect(result.current.suggestions).toEqual([])
    expect(result.current.collectedObjectIDs).toEqual([])
  })

  it('addUserMessage appends a user message with a single text part', () => {
    const { result } = setup()

    act(() => {
      result.current.addUserMessage('hello')
    })

    expect(result.current.messages).toHaveLength(1)
    const [message] = result.current.messages
    expect(message.role).toBe('user')
    expect(message.parts).toEqual([{ type: 'text', text: 'hello' }])
  })

  it('addUserMessage prepends an order_context part when order context is given', () => {
    const { result } = setup()
    const orderContext: OrderContextData = { orderId: 'o1', items: [] }

    act(() => {
      result.current.addUserMessage('hello', orderContext)
    })

    expect(result.current.messages[0].parts).toEqual([
      { type: 'order_context', orderContext },
      { type: 'text', text: 'hello' },
    ])
  })

  it('createAssistantPlaceholder appends an empty assistant message and returns its id', () => {
    const { result } = setup()

    let id = ''
    act(() => {
      id = result.current.createAssistantPlaceholder()
    })

    const [message] = result.current.messages
    expect(message.id).toBe(id)
    expect(message.role).toBe('assistant')
    expect(message.parts).toEqual([{ type: 'text', text: '' }])
  })

  it('updateAssistantText replaces the targeted message text', () => {
    const { result } = setup()

    let id = ''
    act(() => {
      id = result.current.createAssistantPlaceholder()
    })
    act(() => {
      result.current.updateAssistantText(id, 'streamed text')
    })

    expect(result.current.messages[0].parts).toEqual([
      { type: 'text', text: 'streamed text' },
    ])
  })

  it('appendDisplayResults inserts display results and collects object IDs', () => {
    const { result } = setup()

    let id = ''
    act(() => {
      id = result.current.createAssistantPlaceholder()
      result.current.updateAssistantText(id, 'here you go')
    })
    const data = displayData(['p1', 'p2'])
    act(() => {
      result.current.appendDisplayResults(id, data)
    })

    expect(result.current.messages[0].parts).toEqual([
      { type: 'text', text: 'here you go' },
      { type: 'display_results', displayData: data },
    ])
    expect(result.current.collectedObjectIDs).toEqual(['p1', 'p2'])
  })

  it('appendDisplayResults keeps suggest_actions parts after the display results', () => {
    const { result } = setup()

    let id = ''
    const actions: SuggestAction[] = [{ label: 'Go', url: '/x' }]
    act(() => {
      id = result.current.createAssistantPlaceholder()
      result.current.updateAssistantText(id, 'text')
      result.current.appendSuggestActions(id, actions)
    })
    const data = displayData(['p1'])
    act(() => {
      result.current.appendDisplayResults(id, data)
    })

    expect(result.current.messages[0].parts).toEqual([
      { type: 'text', text: 'text' },
      { type: 'display_results', displayData: data },
      { type: 'suggest_actions', suggestActionsData: actions },
    ])
  })

  it('appendDisplayResults keeps results from multiple searches in one turn', () => {
    const { result } = setup()

    let id = ''
    const drills = displayData(['drill-1', 'drill-2'])
    const safetyEquipment = displayData(['glasses-1', 'gloves-1'])
    act(() => {
      id = result.current.createAssistantPlaceholder()
      result.current.appendDisplayResults(id, drills)
      result.current.appendDisplayResults(id, safetyEquipment)
    })

    expect(result.current.messages[0].parts).toEqual([
      { type: 'display_results', displayData: drills },
      { type: 'display_results', displayData: safetyEquipment },
    ])
    expect(result.current.collectedObjectIDs).toEqual([
      'drill-1',
      'drill-2',
      'glasses-1',
      'gloves-1',
    ])
  })

  it('keeps earlier results when a later search has no results', () => {
    const { result } = setup()

    let id = ''
    const drills = displayData(['drill-1'])
    act(() => {
      id = result.current.createAssistantPlaceholder()
      result.current.appendDisplayResults(id, drills)
      result.current.appendNoResultsMessage(id)
    })

    expect(result.current.messages[0].parts).toEqual([
      { type: 'display_results', displayData: drills },
    ])
  })

  it('removes the no-results fallback when a later search succeeds', () => {
    const { result } = setup()

    let id = ''
    const drills = displayData(['drill-1'])
    act(() => {
      id = result.current.createAssistantPlaceholder()
      result.current.appendNoResultsMessage(id)
      result.current.appendDisplayResults(id, drills)
    })

    expect(result.current.messages[0].parts).toEqual([
      { type: 'display_results', displayData: drills },
    ])
  })

  it('appendOrderHistory inserts an order_history part after the text', () => {
    const { result } = setup()

    let id = ''
    act(() => {
      id = result.current.createAssistantPlaceholder()
      result.current.updateAssistantText(id, 'your last order')
    })
    const data = orderHistoryData(['o1'])
    act(() => {
      result.current.appendOrderHistory(id, data)
    })

    expect(result.current.messages[0].parts).toEqual([
      { type: 'text', text: 'your last order' },
      { type: 'order_history', orderHistoryData: data },
    ])
  })

  it('keeps order_history when display results are appended in the same turn', () => {
    const { result } = setup()

    let id = ''
    const orders = orderHistoryData(['o1'])
    const products = displayData(['p1'])
    act(() => {
      id = result.current.createAssistantPlaceholder()
      result.current.updateAssistantText(id, 'here you go')
      result.current.appendOrderHistory(id, orders)
      result.current.appendDisplayResults(id, products)
    })

    expect(result.current.messages[0].parts).toEqual([
      { type: 'text', text: 'here you go' },
      { type: 'order_history', orderHistoryData: orders },
      { type: 'display_results', displayData: products },
    ])
  })

  it('keeps display results when order_history is appended in the same turn', () => {
    const { result } = setup()

    let id = ''
    const orders = orderHistoryData(['o1'])
    const products = displayData(['p1'])
    act(() => {
      id = result.current.createAssistantPlaceholder()
      result.current.updateAssistantText(id, 'here you go')
      result.current.appendDisplayResults(id, products)
      result.current.appendOrderHistory(id, orders)
    })

    expect(result.current.messages[0].parts).toEqual([
      { type: 'text', text: 'here you go' },
      { type: 'display_results', displayData: products },
      { type: 'order_history', orderHistoryData: orders },
    ])
  })

  it('appendSuggestActions appends a suggest_actions part to the message', () => {
    const { result } = setup()
    const actions: SuggestAction[] = [{ label: 'Buy', url: '/buy' }]

    let id = ''
    act(() => {
      id = result.current.createAssistantPlaceholder()
      result.current.appendSuggestActions(id, actions)
    })

    expect(result.current.messages[0].parts).toContainEqual({
      type: 'suggest_actions',
      suggestActionsData: actions,
    })
  })

  it('appendNoResultsMessage replaces parts with the fallback text', () => {
    const { result } = setup()

    let id = ''
    act(() => {
      id = result.current.createAssistantPlaceholder()
      result.current.updateAssistantText(id, 'searching')
      result.current.appendNoResultsMessage(id)
    })

    const parts = result.current.messages[0].parts
    expect(parts).toHaveLength(2)
    expect(parts[1]).toEqual({
      type: 'text',
      text: "Sorry, I couldn't find any matching results. Please try a different search.",
    })
  })

  it('setSuggestions stores the provided suggestions', () => {
    const { result } = setup()

    act(() => {
      result.current.setSuggestions(['a', 'b'])
    })

    expect(result.current.suggestions).toEqual(['a', 'b'])
  })

  it('reset clears messages, suggestions, and collected IDs', () => {
    const { result } = setup()

    act(() => {
      const id = result.current.createAssistantPlaceholder()
      result.current.appendDisplayResults(id, displayData(['p1']))
      result.current.setSuggestions(['a'])
    })
    act(() => {
      result.current.reset()
    })

    expect(result.current.messages).toEqual([])
    expect(result.current.suggestions).toEqual([])
    expect(result.current.collectedObjectIDs).toEqual([])
  })
})
