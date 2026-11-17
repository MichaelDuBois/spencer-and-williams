import { CalendarDays, Clock3, Headphones, Mic2 } from 'lucide-react'

import {
  TravelStatsPanel,
  type TravelStatItem,
} from '@/app/travel/_components/TravelStatsPanel'
import { formatDate } from '@/app/travel/_utils/travelContentFormatters'
import type { PodcastHitValues } from '@/app/travel/hitValues.types'

export const TravelPodcastStatsPanel = ({
  podcast,
}: {
  podcast: PodcastHitValues
}) => {
  const hostLabel = podcast.hosts?.length
    ? podcast.hosts.join(', ')
    : 'Spencer & Williams'
  const guestLabel = podcast.guests?.length
    ? podcast.guests.join(', ')
    : 'Host-led conversation'
  const items: TravelStatItem[] = [
    {
      icon: Headphones,
      heading: 'Hosts',
      value: hostLabel,
    },
    {
      icon: Mic2,
      heading: 'Featuring',
      value: guestLabel,
    },
    {
      icon: Clock3,
      heading: 'Runtime',
      value:
        podcast.duration !== undefined
          ? `${podcast.duration} minutes`
          : 'Variable',
    },
    {
      icon: CalendarDays,
      heading: 'Released',
      value: podcast.publishedAt ? formatDate(podcast.publishedAt) : 'Unknown',
    },
  ]

  return <TravelStatsPanel items={items} />
}
