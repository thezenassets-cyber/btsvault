import Link from "next/link";
import { notFound } from "next/navigation";
import { Shield, Tag } from "lucide-react";
import { getProductBySlug, getRelatedProducts, getProductPrimaryMember } from "@/data/products";
import { getEra, getEraName } from "@/data/eras";
import { getMemberName, getShopMember, isShopMember } from "@/data/members";
import { getProductPrice } from "@/lib/catalog";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ProductActions } from "@/components/catalog/product-actions";
import { ProductGrid } from "@/components/catalog/product-grid";
import { ProductGallery } from "@/components/catalog/product-gallery";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const era = getEra(product.era);
  const related = getRelatedProducts(product);
  const price = getProductPrice(product);
  const primaryMember = getProductPrimaryMember(product);
  const shopMember = primaryMember ? getShopMember(primaryMember) : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-cream/50">
        <Link href="/explore" className="hover:text-purple-glow">
          Catalog
        </Link>
        {shopMember && isShopMember(primaryMember!) && (
          <>
            <span>/</span>
            <Link href="/members" className="hover:text-purple-glow">
              Members
            </Link>
            <span>/</span>
            <Link href={`/members/${primaryMember}`} className="hover:text-purple-glow">
              {shopMember.stageName}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-cream/80 line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid gap-12 lg:grid-cols-2">
        <ProductGallery product={product} eraStripClass={era?.stripClass} />

        <div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="purple">{getEraName(product.era)}</Badge>
            <Badge>{product.type}</Badge>
            {product.experienceFormat === "online" && <Badge variant="purple">ONLINE</Badge>}
            {product.experienceFormat === "in-person" && (
              <Badge variant="success">IN PERSON</Badge>
            )}
            {product.rarity !== "standard" && (
              <Badge variant="gold">{product.rarity.replace("-", " ")}</Badge>
            )}
            {product.sku && <Badge variant="muted">{product.sku}</Badge>}
          </div>

          <h1 className="mt-4 font-display text-3xl font-bold text-cream sm:text-4xl">
            {product.name}
          </h1>
          <p className="mt-4 leading-relaxed text-cream/60">{product.description}</p>

          {product.scentNotes && product.scentNotes.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-xs font-medium tracking-wider text-cream/50 uppercase">
                Scent notes
              </p>
              <div className="flex flex-wrap gap-2">
                {product.scentNotes.map((note) => (
                  <span
                    key={note}
                    className="rounded-full bg-gradient-to-r from-purple-deep/50 via-purple-main/40 to-purple-glow/30 px-3 py-1 text-xs text-cream"
                  >
                    {note}
                  </span>
                ))}
              </div>
            </div>
          )}

          {product.type === "experience" && (
            <div className="mt-6 rounded-xl border border-gold/30 bg-gold/5 p-4 text-sm text-cream/70">
              Experience ticket — after checkout you&apos;ll receive slot selection instructions
              by email (demo).
            </div>
          )}

          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-cream">{formatPrice(price)}</span>
            {product.listingPrice && product.listingPrice !== product.msrp && (
              <span className="text-sm text-cream/40 line-through">
                MSRP {formatPrice(product.msrp)}
              </span>
            )}
          </div>

          <div className="mt-2">
            {product.inStock ? (
              <span className="text-sm text-green-400">✓ Available now</span>
            ) : (
              <span className="text-sm text-cream/40">
                Currently unavailable — resale listings may apply
              </span>
            )}
          </div>

          <div className="mt-8">
            <ProductActions product={product} />
          </div>

          {shopMember && primaryMember && (
            <Link
              href={`/members/${primaryMember}`}
              className="mt-4 inline-flex text-sm font-medium text-purple-glow hover:text-purple-light"
            >
              More from {shopMember.stageName}&apos;s shop →
            </Link>
          )}

          {(product.includesPhotocard || product.inclusionCount) && (
            <div className="mt-6 flex flex-wrap gap-2">
              {product.includesPhotocard && <Badge variant="purple">Includes photocard</Badge>}
              {product.inclusionCount && (
                <Badge variant="default">{product.inclusionCount} inclusions</Badge>
              )}
            </div>
          )}

          <dl className="mt-10 space-y-4 rounded-2xl glass p-6">
            <DetailRow label="Release Date" value={product.releaseDate} />
            <DetailRow label="Members" value={product.members.map(getMemberName).join(", ")} />
            <DetailRow label="Condition" value={product.condition ?? "N/A"} />
            <DetailRow label="Tags" value={product.tags.join(", ")} />
          </dl>

          {product.authenticityNotes && (
            <div className="mt-6 flex gap-3 rounded-2xl border border-purple-main/20 bg-purple-main/5 p-5">
              <Shield className="mt-0.5 h-5 w-5 shrink-0 text-purple-glow" />
              <div>
                <p className="text-sm font-medium text-purple-glow">Authenticity Guide</p>
                <p className="mt-1 text-sm text-cream/60">{product.authenticityNotes}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <div className="mb-8 flex items-center gap-2">
            <Tag className="h-5 w-5 text-purple-glow" />
            <h2 className="text-2xl font-bold text-cream">Related Items</h2>
          </div>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <dt className="text-cream/40">{label}</dt>
      <dd className="text-right text-cream/80 capitalize">{value}</dd>
    </div>
  );
}
