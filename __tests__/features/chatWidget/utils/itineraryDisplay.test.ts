import { describe, expect, it } from 'vitest'

import { sanitizeItineraryData } from '@/features/chatWidget/utils/itineraryDisplay'

const buildValidItinerary = () => {
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
            name: 'Gion walking tour',
            time: '14:00',
            description: 'Guided walk through the geisha district.',
          },
        ],
      },
    ],
    notes: 'Buy a transit card at the airport.',
  }
}

describe('sanitizeItineraryData', () => {
  it.each([-1, 2.5, Infinity, NaN])('drops invalid night count %s', (durationNights) => {
    expect(sanitizeItineraryData({ ...buildValidItinerary(), durationNights })?.durationNights).toBeUndefined()
  })

  it('accepts a zero night count', () => {
    expect(sanitizeItineraryData({ ...buildValidItinerary(), durationNights: 0 })?.durationNights).toBe(0)
  })
  it('accepts fully-formed itinerary data', () => {
    expect(sanitizeItineraryData(buildValidItinerary())).toEqual(
      buildValidItinerary(),
    )
  })

  it('keeps only the required fields when optionals are missing', () => {
    const output = sanitizeItineraryData({
      destination: 'Kyoto',
      days: [
        {
          day: 1,
          title: 'Arrival',
          activities: [{ name: 'Hotel check-in' }],
        },
      ],
    })

    expect(output).toEqual({
      destination: 'Kyoto',
      days: [
        {
          day: 1,
          title: 'Arrival',
          activities: [{ name: 'Hotel check-in' }],
        },
      ],
    })
  })

  it('trims stored strings', () => {
    const output = sanitizeItineraryData({
      destination: '  Kyoto  ',
      title: ' Five days in Kyoto ',
      notes: '  Buy a transit card.  ',
      days: [
        {
          day: 1,
          title: ' Arrival ',
          activities: [
            {
              objectID: ' activity-1 ',
              parentID: ' article-9 ',
              name: '  Gion walking tour  ',
              time: ' 14:00 ',
              description: ' Guided walk. ',
            },
          ],
        },
      ],
    })

    expect(output).toEqual({
      destination: 'Kyoto',
      title: 'Five days in Kyoto',
      notes: 'Buy a transit card.',
      days: [
        {
          day: 1,
          title: 'Arrival',
          activities: [
            {
              objectID: 'activity-1',
              parentID: 'article-9',
              name: 'Gion walking tour',
              time: '14:00',
              description: 'Guided walk.',
            },
          ],
        },
      ],
    })
  })

  it('rejects non-integer, negative, and zero day numbers', () => {
    const output = sanitizeItineraryData({
      destination: 'Kyoto',
      days: [
        { day: 1.5, title: 'Half day', activities: [{ name: 'X' }] },
        { day: -1, title: 'Time travel', activities: [{ name: 'X' }] },
        { day: 0, title: 'Zero day', activities: [{ name: 'X' }] },
        { day: 'two', title: 'String day', activities: [{ name: 'X' }] },
        { day: 2, title: 'Real day', activities: [{ name: 'Kinkaku-ji' }] },
      ],
    })

    expect(output?.days).toEqual([
      { day: 2, title: 'Real day', activities: [{ name: 'Kinkaku-ji' }] },
    ])
  })

  it('drops a day-0 frame but keeps valid sibling days', () => {
    // The Agent Studio schema numbers days from 1, so a 0 frame is malformed
    // (mid-stream placeholder), not a valid first day.
    const output = sanitizeItineraryData({
      destination: 'Kyoto',
      days: [
        { day: 0, title: 'Streaming placeholder', activities: [{ name: 'X' }] },
        { day: 1, title: 'Arrival', activities: [{ name: 'Kinkaku-ji' }] },
      ],
    })

    expect(output?.days).toEqual([
      { day: 1, title: 'Arrival', activities: [{ name: 'Kinkaku-ji' }] },
    ])
  })

  it('drops invalid optional fields but keeps the renderable ones', () => {
    const output = sanitizeItineraryData({
      destination: 'Kyoto',
      title: 42,
      durationNights: 'four',
      notes: null,
      days: [
        {
          day: 1,
          title: 'Arrival',
          activities: [
            {
              name: 'Gion walking tour',
              objectID: 42,
              time: true,
              description: [],
            },
          ],
        },
      ],
    })

    expect(output).toEqual({
      destination: 'Kyoto',
      days: [
        {
          day: 1,
          title: 'Arrival',
          activities: [{ name: 'Gion walking tour' }],
        },
      ],
    })
  })

  it('skips malformed activities and keeps valid siblings', () => {
    const output = sanitizeItineraryData({
      destination: 'Kyoto',
      days: [
        {
          day: 1,
          title: 'Arrival',
          activities: [null, 'Fushimi Inari', { time: '09:00' }, { name: '' }, { name: 'Tea ceremony' }],
        },
      ],
    })

    expect(output?.days[0]?.activities).toEqual([{ name: 'Tea ceremony' }])
  })

  it('skips days without valid activities and renders the remaining days', () => {
    const output = sanitizeItineraryData({
      destination: 'Kyoto',
      days: [
        { day: 1, title: 'Empty day', activities: [{ time: '09:00' }] },
        { day: 2, title: 'Temples', activities: [{ name: 'Kinkaku-ji' }] },
        { day: 'three', title: 'Bad day number', activities: [{ name: 'X' }] },
        { day: 3, activities: [{ name: 'No title' }] },
      ],
    })

    expect(output?.days).toEqual([
      {
        day: 2,
        title: 'Temples',
        activities: [{ name: 'Kinkaku-ji' }],
      },
    ])
  })

  it('keeps trimmed image and location values on activities', () => {
    const output = sanitizeItineraryData({
      destination: 'Kyoto',
      days: [
        {
          day: 1,
          title: 'Arrival',
          activities: [
            {
              name: 'Gion walking tour',
              image: ' https://example.com/gion.webp ',
              location: ' Gion, Kyoto ',
            },
          ],
        },
      ],
    })

    expect(output?.days[0]?.activities).toEqual([
      {
        name: 'Gion walking tour',
        image: 'https://example.com/gion.webp',
        location: 'Gion, Kyoto',
      },
    ])
  })

  it('drops images that are not parseable http(s) URLs or root-relative paths', () => {
    const output = sanitizeItineraryData({
      destination: 'Kyoto',
      days: [
        {
          day: 1,
          title: 'Arrival',
          activities: [
            { name: 'Safe', image: 'https://example.com/safe.webp' },
            { name: 'Relative', image: '/images/safe.webp' },
            { name: 'Script URI', image: 'javascript:alert(1)' },
            { name: 'Data URI', image: 'data:image/png;base64,AAAA' },
            { name: 'Not a URL', image: 'gion photo' },
            { name: 'Wrong type', image: 42 },
          ],
        },
      ],
    })

    expect(output?.days[0]?.activities).toEqual([
      { name: 'Safe', image: 'https://example.com/safe.webp' },
      { name: 'Relative', image: '/images/safe.webp' },
      { name: 'Script URI' },
      { name: 'Data URI' },
      { name: 'Not a URL' },
      { name: 'Wrong type' },
    ])
  })

  it('rejects image strings that match the URL shape but fail URL parsing', () => {
    const output = sanitizeItineraryData({
      destination: 'Kyoto',
      days: [
        {
          day: 1,
          title: 'Arrival',
          activities: [
            { name: 'Scheme only', image: 'https://' },
            { name: 'Scheme prefix', image: 'https://x' },
            { name: 'Partial scheme', image: 'ht' },
            { name: 'Bare scheme word', image: 'http' },
            { name: 'Protocol relative', image: '//cdn.example/x.webp' },
            { name: 'FTP', image: 'ftp://example.com/a.webp' },
          ],
        },
      ],
    })

    expect(output?.days[0]?.activities).toEqual([
      { name: 'Scheme only' },
      { name: 'Scheme prefix', image: 'https://x' },
      { name: 'Partial scheme' },
      { name: 'Bare scheme word' },
      { name: 'Protocol relative' },
      { name: 'FTP' },
    ])
  })

  it('rejects unparseable mid-delta partial image frames from streaming input', () => {
    // A frame that parses (e.g. a truncated-but-valid host) is kept and
    // degrades through the Image wrapper's error fallback; only strings that
    // fail URL construction are dropped outright.
    const output = sanitizeItineraryData({
      destination: 'Kyoto',
      days: [
        {
          day: 1,
          title: 'Arrival',
          activities: [
            { name: 'Scheme only frame', image: 'https://' },
            { name: 'Trailing slash frame', image: 'https://example.com/' },
          ],
        },
      ],
    })

    expect(output?.days[0]?.activities).toEqual([
      { name: 'Scheme only frame' },
      { name: 'Trailing slash frame', image: 'https://example.com/' },
    ])
  })

  it('strips legacy price and currency fields from activities', () => {
    // Agents updated before the field removal may still send price/currency
    // (always 0 for the prompt-forbidden travel assistant); the sanitizer
    // drops them instead of rendering visual noise.
    const output = sanitizeItineraryData({
      destination: 'Kyoto',
      days: [
        {
          day: 1,
          title: 'Arrival',
          activities: [
            { name: 'Gion walking tour', price: 45, currency: 'USD' },
            { name: 'Tea ceremony', price: 0, currency: 978 },
          ],
        },
      ],
    })

    expect(output?.days[0]?.activities).toEqual([
      { name: 'Gion walking tour' },
      { name: 'Tea ceremony' },
    ])
  })

  it('keeps only fully-valid days in a partial streaming frame', () => {
    const output = sanitizeItineraryData({
      destination: 'Kyoto',
      days: [
        { day: 1, activities: [{ name: 'Day still mid-delta' }] },
        { day: 2, title: 'Temples', activities: [{ name: 'Kinkaku-ji' }] },
      ],
    })

    expect(output?.days).toEqual([
      { day: 2, title: 'Temples', activities: [{ name: 'Kinkaku-ji' }] },
    ])
  })

  it('returns null for non-record input', () => {
    expect(sanitizeItineraryData(null)).toBeNull()
    expect(sanitizeItineraryData('Kyoto')).toBeNull()
    expect(sanitizeItineraryData(['Kyoto'])).toBeNull()
  })

  it('still sanitizes an itinerary whose destination is missing', () => {
    // A streamed output can end before the destination frame arrives; the
    // renderer falls back to a generic title, so the days still render.
    const withoutDestination = buildValidItinerary()
    delete (withoutDestination as Record<string, unknown>).destination

    const output = sanitizeItineraryData(withoutDestination)
    expect(output).not.toHaveProperty('destination')
    expect(output?.days).toEqual(buildValidItinerary().days)
  })

  it('drops a malformed destination but keeps the renderable days', () => {
    const output = sanitizeItineraryData({
      ...buildValidItinerary(),
      destination: 42,
    })

    expect(output).toEqual({
      title: 'Five days in Kyoto',
      durationNights: 4,
      days: buildValidItinerary().days,
      notes: 'Buy a transit card at the airport.',
    })
  })

  it('returns null when days is missing, empty, or not an array', () => {
    expect(sanitizeItineraryData({ destination: 'Kyoto' })).toBeNull()
    expect(sanitizeItineraryData({ destination: 'Kyoto', days: [] })).toBeNull()
    expect(
      sanitizeItineraryData({ destination: 'Kyoto', days: 'day one' }),
    ).toBeNull()
  })
})
