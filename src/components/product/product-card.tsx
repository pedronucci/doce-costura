import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/catalog/types";
import { ProductPrice } from "./product-price";
import { FavoriteButton } from "./favorite-button";
import { PhotoPending } from "./photo-pending";
import { cn } from "@/lib/format";

export function ProductCard({
  product,
  sizes = "(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 80vw",
  priority = false,
  className,
}: {
  product: Product;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  const image = product.images[0];
  const href = `/produto/${product.slug}`;
  return (
    <article className={cn("group relative flex flex-col", className)}>
      <div className="relative overflow-hidden rounded-[1.4rem] bg-linho">
        <Link href={href} tabIndex={-1} aria-hidden="true" className="block aspect-[4/5]">
          {image ? (
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes={sizes}
              priority={priority}
              className="object-cover transition-transform duration-[1.2s] ease-suave group-hover:scale-[1.04]"
            />
          ) : (
            <PhotoPending />
          )}
        </Link>
        <FavoriteButton slug={product.slug} name={product.name} className="absolute top-3 right-3" />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 px-1 pt-4">
        <h3 className="font-serif text-[1.28rem] leading-snug">
          <Link href={href} className="transition-colors hover:text-rosa-profundo">
            {product.name}
          </Link>
        </h3>
        <p className="line-clamp-2 text-[0.86rem] leading-relaxed text-tinta-suave">{product.summary}</p>
        <div className="mt-auto pt-1.5">
          <ProductPrice product={product} />
        </div>
      </div>
    </article>
  );
}
