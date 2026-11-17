'use client'

import { Utensils } from 'lucide-react'
import Link from 'next/link'
import { useContext, useState } from 'react'
import { Highlight } from 'react-instantsearch'

import type {
  HitColorVariant,
  HitImageProps,
  HitProductValues,
  HitProps,
} from '@/components/hit/hit.types'
import { HitActionContext } from '@/components/hit/HitActionContext'
import { HitVariantRow } from '@/components/hit/HitVariantRow'
import { VARIANT_CLASSES } from '@/components/hit/hitVariants'
import { StoreAvailabilityBadge } from '@/components/hit/StoreAvailabilityBadge'
import { Image } from '@/components/image/Image'
import { useRecommendModel } from '@/components/recommend/RecommendModelContext'
import { AddToCartButton } from '@/components/ui/button/AddToCartButton'
import { StarRating } from '@/components/ui/StarRating'
import { useAddToCart } from '@/hooks/useAddToCart'
import { useInsightsEvents } from '@/hooks/useInsightsEvents'
import { useRankingBadges } from '@/hooks/useRankingBadges'
import { cn } from '@/lib/utils'
import type { HitTemplate } from '@/types/hitTemplate.types'
import { getByPath } from '@/utilities/getByPath'

const DEFAULT_IMAGE_SIZES =
  '(min-width: 1280px) 25vw, (min-width: 640px) 33vw, 50vw'

const HitImage = ({
  image,
  name,
  containerClassName,
  imageClassName,
  sizes = DEFAULT_IMAGE_SIZES,
}: HitImageProps) => (
  <div className={cn('relative', containerClassName)}>
    <Image
      src={image}
      alt={name}
      fill
      sizes={sizes}
      className={imageClassName}
    />
  </div>
)

export const Hit = <
  TValues extends HitProductValues,
  TTemplate extends HitTemplate<{ name: string }>,
>({
  variant,
  item,
  template,
  slug,
  extractor,
  priceComponent: PriceComponent,
  prepareCartProduct,
  disableHighlight,
  imageSizes,
  renderDetails,
}: HitProps<TValues, TTemplate>) => {
  const classes = VARIANT_CLASSES[variant]
  const hitAction = useContext(HitActionContext)
  const { sendProductClickEvent } = useInsightsEvents()
  const recommendModel = useRecommendModel()
  const attribution = {
    surface: recommendModel ? 'recommend' : 'product_card',
    model: recommendModel,
  } as const
  const { addToCart } = useAddToCart({
    ...attribution,
    prepareProduct: prepareCartProduct,
  })
  const { isComposed, isPersonalized, isSponsored, composedLabel } =
    useRankingBadges(item as Record<string, unknown>)
  const [hoveredVariant, setHoveredVariant] = useState<HitColorVariant | null>(
    null,
  )

  if (!template) return null

  const recordData = extractor(item, template, slug)
  const queryID = item.__queryID as string | undefined
  const position = item.__position as number | undefined

  // Hovering a swatch retargets the whole card — image, link and price — so the
  // card previews that colourway before it is clicked.
  const activeObjectID = hoveredVariant?.objectID ?? recordData.objectID
  const activeImage = hoveredVariant?.image ?? recordData.image
  const activePrice = hoveredVariant?.price ?? recordData.price
  const colorVariants = recordData.colorVariants ?? []

  const isRecordActive = activeObjectID === recordData.objectID

  const handleClick = () => {
    sendProductClickEvent(
      {
        objectID: recordData.objectID,
        __queryID: queryID,
        __position: position,
      },
      attribution,
    )
  }

  const handleVariantClick = (variant: HitColorVariant) => {
    const isRecord = variant.objectID === recordData.objectID
    sendProductClickEvent(
      {
        objectID: variant.objectID,
        __queryID: isRecord ? queryID : undefined,
        __position: isRecord ? position : undefined,
      },
      attribution,
    )
  }

  const handleAddToCart = () =>
    addToCart(
      {
        ...recordData,
        objectID: activeObjectID,
        image: activeImage,
        price: activePrice,
      },
      { queryID: isRecordActive ? queryID : undefined },
    )

  const hasVariantRow = Boolean(classes.variantRow && colorVariants.length > 0)
  const composedArticleClasses = isSponsored
    ? (classes.sponsoredArticle ?? classes.composedArticle)
    : classes.composedArticle

  const linkProps = {
    href: hoveredVariant?.href ?? recordData.productUrl,
    onClick: handleClick,
  }

  const renderHighlight = (attribute: string) => {
    if (disableHighlight) {
      const value = getByPath(item, attribute)
      if (Array.isArray(value)) {
        return value
          .filter(
            (entry): entry is string | number =>
              typeof entry === 'string' || typeof entry === 'number',
          )
          .join(', ')
      }
      return typeof value === 'string' || typeof value === 'number'
        ? value
        : null
    }

    return (
      <Highlight
        attribute={attribute}
        hit={item as Parameters<typeof Highlight>[0]['hit']}
      />
    )
  }

  const badges = (
    <>
      {isComposed && (
        <span className="text-accent text-micro pointer-events-none absolute top-2 right-2 z-10">
          • {composedLabel}
        </span>
      )}
      {isPersonalized && classes.forYouBadge && (
        <span className={cn('pointer-events-none', classes.forYouBadge)}>
          For You
        </span>
      )}
    </>
  )

  const imageBlock = (
    <div
      className={cn(
        classes.imageContainer,
        'relative',
        isComposed && classes.composedImageContainer,
      )}>
      <StoreAvailabilityBadge item={item} />
      <HitImage
        image={activeImage}
        name={recordData.name}
        containerClassName="h-full w-full"
        imageClassName={classes.image}
        sizes={imageSizes}
      />
      {variant === 'editorial' && (
        <>
          <div
            aria-hidden
            className="bg-foreground pointer-events-none absolute inset-0 opacity-0 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-15"
          />
          <div className="pointer-events-none absolute right-3 bottom-3 z-20 opacity-0 transition-opacity duration-300 group-hover:pointer-events-auto group-hover:opacity-100">
            <AddToCartButton
              onAdd={handleAddToCart}
              compact
              className="bg-foreground/90 text-background hover:bg-foreground border-background/20 h-9 w-9 border shadow-sm backdrop-blur-sm"
            />
          </div>
        </>
      )}
    </div>
  )

  const contentBlock = (
    <div className={classes.contentContainer}>
      <p className={classes.brand}>
        {!recordData.brand && <span className="invisible">Brand</span>}
        {recordData.brand && disableHighlight && recordData.brand}
        {recordData.brand && !disableHighlight && (
          <Highlight
            attribute="brand"
            hit={item as Parameters<typeof Highlight>[0]['hit']}
          />
        )}
      </p>

      <h3 className={classes.name}>
        {disableHighlight ? (
          recordData.name
        ) : (
          <Highlight
            attribute={template.attributes.name}
            hit={item as Parameters<typeof Highlight>[0]['hit']}
          />
        )}
      </h3>

      {renderDetails?.(recordData, renderHighlight)}

      {recordData.category && classes.category && (
        <p className={classes.category}>
          {disableHighlight ? (
            recordData.category
          ) : (
            <Highlight
              attribute="category"
              hit={item as Parameters<typeof Highlight>[0]['hit']}
            />
          )}
        </p>
      )}

      {classes.rating && (
        <div className={classes.rating}>
          <StarRating compact />
        </div>
      )}

      {recordData.nutrition?.servingSize && classes.servingSize && (
        <div className={`flex items-start gap-2 ${classes.servingSize}`}>
          <Utensils className="mt-0.5 h-3 w-3 shrink-0" />
          <p>{recordData.nutrition.servingSize}</p>
        </div>
      )}

      {classes.footer ? (
        <div className={classes.footer}>
          {activePrice !== undefined &&
            (PriceComponent ? (
              <PriceComponent price={activePrice} className={classes.price} />
            ) : (
              <p className={classes.price}>${activePrice.toFixed(2)}</p>
            ))}
          <AddToCartButton
            onAdd={handleAddToCart}
            {...classes.addToCartConfig}
            className={cn(
              'relative z-20 ml-auto',
              classes.addToCartConfig?.className,
            )}
          />
        </div>
      ) : (
        activePrice !== undefined &&
        (PriceComponent ? (
          <PriceComponent price={activePrice} className={classes.price} />
        ) : (
          <p className={classes.price}>${activePrice}</p>
        ))
      )}
    </div>
  )

  const article = (
    <article
      className={cn(
        classes.article,
        'relative',
        !hasVariantRow && 'flex h-full w-full flex-col',
        !hasVariantRow && isComposed && composedArticleClasses,
      )}>
      {badges}
      {hasVariantRow ? (
        <>
          <Link {...linkProps} className="block">
            {imageBlock}
          </Link>
          <HitVariantRow
            className={classes.variantRow}
            colorVariants={colorVariants}
            activeObjectID={activeObjectID}
            onVariantHover={setHoveredVariant}
            onVariantClick={handleVariantClick}
          />
          <Link {...linkProps} className="block">
            {contentBlock}
          </Link>
        </>
      ) : (
        // Stretch the link over the card; actions sit above it and stay separate.
        <Link
          {...linkProps}
          className="flex flex-1 flex-col after:absolute after:inset-0">
          {imageBlock}
          {contentBlock}
        </Link>
      )}
      {hitAction && (
        <div
          className={cn(
            'pointer-events-none relative z-20 [&>*]:pointer-events-auto',
            classes.actionContainer,
          )}>
          {hitAction}
        </div>
      )}
    </article>
  )

  if (!hasVariantRow) return article

  return (
    <div
      className={cn(
        'flex h-full w-full flex-col',
        isComposed && composedArticleClasses,
      )}
      onMouseLeave={() => setHoveredVariant(null)}>
      {article}
    </div>
  )
}
