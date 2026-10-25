import type { Picture } from '../../data/media'

interface PictureFrameProps {
  picture: Picture
  alt: string
  sizes: string
  className?: string
  imgClassName?: string
  priority?: boolean
}

export function PictureFrame({
  picture,
  alt,
  sizes,
  className = '',
  imgClassName = '',
  priority = false,
}: PictureFrameProps) {
  return (
    <picture className={className}>
      {picture.sources.avif ? (
        <source type="image/avif" srcSet={picture.sources.avif} sizes={sizes} />
      ) : null}
      {picture.sources.webp ? (
        <source type="image/webp" srcSet={picture.sources.webp} sizes={sizes} />
      ) : null}
      <img
        src={picture.img.src}
        width={picture.img.w}
        height={picture.img.h}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
        className={`size-full object-cover ${imgClassName}`}
      />
    </picture>
  )
}
