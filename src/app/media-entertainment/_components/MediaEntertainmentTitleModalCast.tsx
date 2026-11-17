'use client'

import Link from 'next/link'

import { useMediaTitleModal } from '@/app/media-entertainment/_hooks/useMediaTitleModal'
import { getTmdbImageUrl } from '@/app/media-entertainment/_utils/getTmdbImageUrl'
import { mediaEntertainmentConfig } from '@/app/media-entertainment/config'
import type { MediaEntertainmentCastMember } from '@/app/media-entertainment/hitValues.types'
import { Image } from '@/components/image/Image'

const MAX_CAST = 6

const { slug } = mediaEntertainmentConfig

/** `cast.name` is searchable, so a person's filmography is just a query. */
const getPersonHref = (name: string) =>
  `/${slug}/search?query=${encodeURIComponent(name)}`

interface MediaEntertainmentTitleModalCastProps {
  cast?: MediaEntertainmentCastMember[]
}

export const MediaEntertainmentTitleModalCast = ({
  cast,
}: MediaEntertainmentTitleModalCastProps) => {
  const { closeTitle } = useMediaTitleModal()
  const members = cast?.slice(0, MAX_CAST) ?? []

  if (!members.length) return null

  return (
    <section className="mt-6">
      <h3 className="text-foreground text-base font-semibold">Cast</h3>

      <ul className="-mx-1 mt-3 flex gap-3 overflow-x-auto px-1 pb-1">
        {members.map((member) => (
          <li key={member.name} className="w-20 shrink-0 text-center">
            <Link
              // The sheet lives in the layout, so it survives the navigation
              // unless the click closes it on the way out.
              onClick={closeTitle}
              href={getPersonHref(member.name)}
              className="group/person focus-visible:outline-ring block rounded-full outline-none focus-visible:outline-2 focus-visible:outline-offset-2">
              <div className="bg-muted relative aspect-square w-full overflow-hidden rounded-full">
                <Image
                  src={getTmdbImageUrl(member.profileImage, 'w185')}
                  // Decorative: the name is right underneath, and alt text here
                  // would make the link announce as "Ryan Gosling Ryan Gosling".
                  alt=""
                  fill
                  sizes="80px"
                  loading="lazy"
                  className="object-cover transition-transform duration-300 group-hover/person:scale-105"
                />
              </div>

              <span className="text-foreground mt-1.5 block truncate text-xs font-medium group-hover/person:underline">
                {member.name}
              </span>
            </Link>

            {member.character && (
              <span className="text-muted-foreground block truncate text-xs">
                {member.character}
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
