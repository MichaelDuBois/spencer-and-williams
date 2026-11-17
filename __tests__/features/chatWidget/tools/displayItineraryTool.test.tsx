import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { ChatWidgetPanelContext } from '@/features/chatWidget/components/chatWidgetPanelContext'
import { displayItineraryTool } from '@/features/chatWidget/tools/displayItineraryTool'
import { activeConfigAtom } from '@/stores/activeConfig'

import { createTestStore } from '../../../helpers/jotai-wrapper'
import { buildProvidersWrapper, createMockConfig } from '../../../helpers/test-utils'

import type { ClientSideToolComponentProps } from 'instantsearch-ui-components'
import type { ComponentProps } from 'react'
import type { Tool } from 'react-instantsearch'

vi.mock('next/link', () => {return {
  default: ({ children, ...props }: ComponentProps<'a'>) => (
    <a {...props}>{children}</a>
  ),
}})

type ToolCallArgs = Parameters<NonNullable<Tool['onToolCall']>>[0]

const buildItineraryInput = () => {
  return {
    destination: 'Kyoto',
    title: 'Five days in Kyoto',
    durationNights: 4,
    days: [
      {
        day: 1,
        title: 'Arrival & Gion',
        activities: [
          {
            objectID: 'activity-1',
            parentID: 'article-9',
            name: 'Gion walking tour',
            time: '14:00',
            description: 'Guided walk through the geisha district.',
          },
        ],
      },
      {
        day: 2,
        title: 'Temples',
        activities: [
          { name: 'Sunrise at Fushimi Inari', time: '07:00' },
        ],
      },
    ],
    notes: 'Buy a transit card at the airport.',
  }
}

const executeTool = async (input: unknown) => {
  const onToolCall = displayItineraryTool.onToolCall
  if (!onToolCall) throw new Error('displayItinerary must handle client tool calls')

  let output: unknown
  const addToolResult: ToolCallArgs['addToolResult'] = async (result) => {
    if ('output' in result) output = result.output
  }
  const args = {
    toolCallId: 'tool-call-1',
    toolName: 'displayItinerary',
    input,
    signal: new AbortController().signal,
    addToolResult,
  } satisfies ToolCallArgs

  await onToolCall(args)
  return output
}

describe('displayItineraryTool onToolCall', () => {
  it('opts into argument streaming so the preview renders while input arrives', () => {
    expect(displayItineraryTool.streamInput).toBe(true)
  })

  it('echoes validated itinerary data as the tool output', async () => {
    await expect(executeTool(buildItineraryInput())).resolves.toEqual(
      buildItineraryInput(),
    )
  })

  it('returns null output for non-record input', async () => {
    await expect(executeTool('plan three days in Kyoto')).resolves.toBeNull()
  })

  it('returns null output for malformed days', async () => {
    await expect(
      executeTool({ destination: 'Kyoto', days: 'three' }),
    ).resolves.toBeNull()
  })
})

describe('displayItineraryTool layoutComponent', () => {
  const renderToolMessage = (
    output: unknown,
    state: 'input-available' | 'output-available' = 'output-available',
    collapsePanel: () => void = vi.fn(),
  ) => {
    const store = createTestStore((s) => {
      s.set(activeConfigAtom, createMockConfig({ slug: 'travel' }))
    })
    const { Wrapper } = buildProvidersWrapper({ store })
    const LayoutComponent = displayItineraryTool.layoutComponent
    if (!LayoutComponent) {
      throw new Error('displayItinerary must define a layoutComponent')
    }

    const context = { message: { state, output } }
    const props = { context } as unknown as ClientSideToolComponentProps

    return render(
      <ChatWidgetPanelContext.Provider value={collapsePanel}>
        <LayoutComponent {...props} />
      </ChatWidgetPanelContext.Provider>,
      { wrapper: Wrapper },
    )
  }

  it('renders nothing before the tool output is available', () => {
    const { container } = renderToolMessage(
      buildItineraryInput(),
      'input-available',
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('renders the header, every day, and the notes footer', () => {
    renderToolMessage(buildItineraryInput())

    expect(screen.getByText('Five days in Kyoto')).toBeInTheDocument()
    expect(screen.getByText(/4 nights in Kyoto/)).toBeInTheDocument()
    expect(screen.getByText('Day 1 · Arrival & Gion')).toBeInTheDocument()
    expect(screen.getByText('Day 2 · Temples')).toBeInTheDocument()
    expect(
      screen.getByText('Buy a transit card at the airport.'),
    ).toBeInTheDocument()
  })

  it('renders activities with time badges and descriptions', () => {
    renderToolMessage(buildItineraryInput())

    expect(screen.getByText('Gion walking tour')).toBeInTheDocument()
    expect(screen.getByText('14:00')).toBeInTheDocument()
    expect(
      screen.getByText('Guided walk through the geisha district.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Sunrise at Fushimi Inari')).toBeInTheDocument()
  })

  it('does not render price or currency from legacy agent args carrying them', () => {
    renderToolMessage({
      destination: 'Kyoto',
      days: [
        {
          day: 1,
          title: 'Arrival',
          activities: [
            { name: 'Gion walking tour', price: 45, currency: 'USD' },
          ],
        },
      ],
    })

    expect(screen.getByText('Gion walking tour')).toBeInTheDocument()
    expect(screen.queryByText('$45.00')).not.toBeInTheDocument()
    expect(screen.queryByText('45')).not.toBeInTheDocument()
    expect(screen.queryByText('USD')).not.toBeInTheDocument()
  })

  it('links activities with a parentID to the parent article route and collapses the panel on click', () => {
    const collapsePanel = vi.fn()
    renderToolMessage(buildItineraryInput(), 'output-available', collapsePanel)

    const link = screen.getByRole('link', { name: 'Gion walking tour' })
    expect(link).toHaveAttribute('href', '/travel/article/article-9')

    link.click()
    expect(collapsePanel).toHaveBeenCalledOnce()
  })

  it('renders activities with an objectID but no parentID as plain text', () => {
    renderToolMessage({
      destination: 'Kyoto',
      days: [
        {
          day: 1,
          title: 'Temples',
          activities: [{ objectID: 'activity-1', name: 'Kinkaku-ji' }],
        },
      ],
    })

    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.getByText('Kinkaku-ji')).toBeInTheDocument()
  })

  it('renders freeform activities without an objectID as plain text', () => {
    renderToolMessage(buildItineraryInput())

    expect(
      screen.queryByRole('link', { name: 'Sunrise at Fushimi Inari' }),
    ).not.toBeInTheDocument()
    expect(screen.getByText('Sunrise at Fushimi Inari')).toBeInTheDocument()
  })

  it('renders gracefully when optional fields are missing', () => {
    renderToolMessage({
      destination: 'Kyoto',
      days: [
        {
          day: 1,
          title: 'Arrival',
          activities: [{ name: 'Hotel check-in' }],
        },
      ],
    })

    expect(screen.getByText('Kyoto itinerary')).toBeInTheDocument()
    expect(screen.getByText('Day 1 · Arrival')).toBeInTheDocument()
    expect(screen.getByText('Hotel check-in')).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('renders nothing for malformed output', () => {
    const { container } = renderToolMessage({ days: 'three' })

    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing when output is missing entirely', () => {
    const { container } = renderToolMessage(undefined)

    expect(container).toBeEmptyDOMElement()
  })

  it('renders an activity thumbnail when the activity carries an image', () => {
    const { container } = renderToolMessage({
      destination: 'Kyoto',
      days: [
        {
          day: 1,
          title: 'Arrival',
          activities: [
            {
              name: 'Gion walking tour',
              image: 'https://example.com/gion.webp',
            },
          ],
        },
      ],
    })

    const img = container.querySelector('img')
    expect(img).not.toBeNull()
    expect(img).toHaveAttribute('src', 'https://example.com/gion.webp')
  })

  it('renders no thumbnail when the image value fails validation', () => {
    const { container } = renderToolMessage({
      destination: 'Kyoto',
      days: [
        {
          day: 1,
          title: 'Arrival',
          activities: [
            { name: 'Gion walking tour', image: 'javascript:alert(1)' },
          ],
        },
      ],
    })

    expect(container.querySelector('img')).toBeNull()
    expect(screen.getByText('Gion walking tour')).toBeInTheDocument()
  })

  it('renders no thumbnail for activities without an image', () => {
    const { container } = renderToolMessage({
      destination: 'Kyoto',
      days: [
        {
          day: 1,
          title: 'Arrival',
          activities: [{ name: 'Hotel check-in' }],
        },
      ],
    })

    expect(container.querySelector('img')).toBeNull()
  })

  it('renders a muted location line for activities with a location', () => {
    renderToolMessage({
      destination: 'Kyoto',
      days: [
        {
          day: 1,
          title: 'Arrival',
          activities: [
            { name: 'Gion walking tour', location: 'Gion, Kyoto' },
          ],
        },
      ],
    })

    expect(screen.getByText('Gion, Kyoto')).toBeInTheDocument()
  })

  it('keeps the linked activity accessible name on the activity text', () => {
    renderToolMessage(buildItineraryInput())

    const link = screen.getByRole('link', { name: 'Gion walking tour' })
    expect(link).toHaveAttribute('href', '/travel/article/article-9')
  })
})

describe('displayItineraryTool layoutComponent streaming preview', () => {
  const renderStreamingToolMessage = (input: unknown) => {
    const store = createTestStore((s) => {
      s.set(activeConfigAtom, createMockConfig({ slug: 'travel' }))
    })
    const { Wrapper } = buildProvidersWrapper({ store })
    const LayoutComponent = displayItineraryTool.layoutComponent
    if (!LayoutComponent) {
      throw new Error('displayItinerary must define a layoutComponent')
    }

    const context = { message: { state: 'input-streaming', input } }
    const props = { context } as unknown as ClientSideToolComponentProps

    return render(<LayoutComponent {...props} />, { wrapper: Wrapper })
  }

  it('renders the header and fully-valid days from partial streaming input', () => {
    renderStreamingToolMessage({
      destination: 'Kyoto',
      title: 'Five days in Kyoto',
      days: [
        {
          day: 1,
          title: 'Arrival & Gion',
          activities: [{ name: 'Gion walking tour', parentID: 'article-9' }],
        },
        { day: 2 },
      ],
    })

    expect(screen.getByText('Five days in Kyoto')).toBeInTheDocument()
    expect(screen.getByText('Day 1 · Arrival & Gion')).toBeInTheDocument()
    expect(screen.getByText('Gion walking tour')).toBeInTheDocument()
    expect(screen.queryByText(/Day 2/)).not.toBeInTheDocument()
  })

  it('does not make streamed activity links interactive', () => {
    renderStreamingToolMessage(buildItineraryInput())
    expect(screen.getByText('Gion walking tour')).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('marks the streaming preview as busy instead of a completed card', () => {
    const { container } = renderStreamingToolMessage({
      destination: 'Kyoto',
      days: [
        { day: 1, title: 'Arrival', activities: [{ name: 'Hotel check-in' }] },
      ],
    })

    const busyWrapper = container.querySelector('[aria-busy="true"]')
    expect(busyWrapper).not.toBeNull()
    expect(busyWrapper).toHaveTextContent('Day 1 · Arrival')
  })

  it('renders a skeleton for streaming input with nothing renderable yet', () => {
    const { container } = renderStreamingToolMessage({
      destination: 'Kyoto',
    })

    expect(container).not.toBeEmptyDOMElement()
    expect(screen.queryByText(/Kyoto/)).not.toBeInTheDocument()
  })

  it('renders a skeleton without crashing when the streaming input is undefined', () => {
    const { container } = renderStreamingToolMessage(undefined)

    expect(container).not.toBeEmptyDOMElement()
  })

  it('does not throw when a streaming frame carries an unparseable image URL', () => {
    expect(() =>
      renderStreamingToolMessage({
        destination: 'Kyoto',
        days: [
          {
            day: 1,
            title: 'Arrival',
            activities: [{ name: 'Gion walking tour', image: 'https://' }],
          },
        ],
      }),
    ).not.toThrow()

    expect(screen.getByText('Gion walking tour')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })
})
