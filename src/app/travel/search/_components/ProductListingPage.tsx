'use client'

import { ArrowRight, FileText, Headphones } from 'lucide-react'
import Link from 'next/link'
import { Configure, Hits, Index } from 'react-instantsearch'

import { ArticleCard } from '@/app/travel/_components/ArticleCard'
import { getPodcastHitValues } from '@/app/travel/_utils/getTravelHitValues'
import { travelConfig } from '@/app/travel/config'
import { TravelActivityCard } from '@/app/travel/search/_components/TravelActivityCard'
import { TravelArticleHit } from '@/app/travel/search/_components/TravelArticleHit'
import { TravelPodcastEpisodeCard } from '@/app/travel/search/_components/TravelPodcastEpisodeCard'
import { MultifeedCarousels } from '@/components/composition/MultifeedCarousels'
import { AISuggestionsSection } from '@/components/results/AISuggestionsSection'
import { EmptyIndexState } from '@/components/results/EmptyIndexState'
import { SearchResultsHeader } from '@/components/results/SearchResultsHeader'
import { useHrefWithQueryString } from '@/hooks/useHrefWithQueryString'

interface SectionHeaderProps {
  icon: React.ReactNode
  title: string
  href?: string
}

const SectionHeader = ({ icon, title, href }: SectionHeaderProps) => (
  <div className="mb-6 flex justify-between">
    <div className="flex items-center gap-3">
      <div className="bg-accent/10 flex h-10 w-10 items-center justify-center rounded-full">
        {icon}
      </div>
      <h2 className="text-foreground text-xl font-semibold">{title}</h2>
    </div>
    {href && (
      <Link
        href={href}
        className="text-accent group flex items-center gap-1.5 text-sm font-medium">
        <span className="transition-transform group-hover:-translate-x-0.5">
          View all
        </span>
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    )}
  </div>
)

export const ProductListingPage = () => {
  const { primaryIndex, indices } = travelConfig.algolia
  const articleHitTemplate = primaryIndex.template
  const podcastHitTemplate = indices.podcasts.template
  const activityHitTemplate = indices.activities.template
  const buildHref = useHrefWithQueryString()

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Page Header */}
      <div className="mb-10">
        <SearchResultsHeader label="Explore" />
      </div>

      {/* AI Suggestions */}
      <AISuggestionsSection className="mb-10" />

      <MultifeedCarousels
        getItemClassName={(indexName) =>
          indexName === indices.podcasts.name ? 'w-96' : undefined
        }
        renderItem={(hit, indexName) => {
          if (indexName === indices.podcasts.name && podcastHitTemplate) {
            return (
              <TravelPodcastEpisodeCard
                episode={getPodcastHitValues(
                  hit,
                  podcastHitTemplate,
                  travelConfig.slug,
                )}
              />
            )
          }
          if (indexName === indices.activities.name && activityHitTemplate) {
            return (
              <TravelActivityCard hit={hit} template={activityHitTemplate} />
            )
          }
          return <ArticleCard hit={hit} />
        }}
        className="mb-10"
      />

      {/* Federated Search Results */}
      <div className="grid grid-cols-1 gap-12 xl:grid-cols-2">
        {/* Articles Section */}
        <section>
          <SectionHeader
            icon={<FileText className="text-accent h-5 w-5" />}
            title="Articles"
            href={buildHref('/travel/search/articles')}
          />
          <Index indexName={primaryIndex.name}>
            <Configure hitsPerPage={10} />
            <EmptyIndexState message="No articles found" />
            {articleHitTemplate && (
              <Hits
                bannerComponent={false}
                hitComponent={({ hit }) => (
                  <TravelArticleHit hit={hit} template={articleHitTemplate} />
                )}
                classNames={{
                  list: 'flex flex-col',
                  item: '',
                }}
              />
            )}
          </Index>
        </section>

        {/* Podcasts Section */}
        <section>
          <SectionHeader
            icon={<Headphones className="text-accent h-5 w-5" />}
            title="Podcasts"
            href={buildHref('/travel/search/podcasts')}
          />
          <Index indexName={indices.podcasts.name}>
            <Configure hitsPerPage={10} />
            <EmptyIndexState message="No podcasts found" />
            {podcastHitTemplate && (
              <Hits
                hitComponent={({ hit }) => (
                  <TravelPodcastEpisodeCard
                    episode={getPodcastHitValues(
                      hit,
                      podcastHitTemplate,
                      travelConfig.slug,
                    )}
                    hit={hit}
                    template={podcastHitTemplate}
                  />
                )}
                classNames={{
                  list: 'flex flex-col gap-3',
                  item: '',
                }}
              />
            )}
          </Index>
        </section>
      </div>
    </div>
  )
}
