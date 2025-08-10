import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Product, Locale } from 'shared'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'

// API fetching function
async function fetchProductBySlug(slug: string): Promise<Product> {
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/products/${slug}`)
  if (!res.ok) {
    throw new Error('Product not found')
  }
  return res.json()
}

// TanStack Router File Route
export const Route = createFileRoute('/products/$slug')({
  loader: ({ params, context: { queryClient } }) =>
    queryClient.ensureQueryData({
      queryKey: ['product', params.slug],
      queryFn: () => fetchProductBySlug(params.slug),
    }),
  component: ProductDetailPage,
})

// Main Page Component
function ProductDetailPage() {
  const { slug } = Route.useParams()
  const { t, i18n } = useTranslation()
  const { data: product } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => fetchProductBySlug(slug),
  })

  if (!product) {
    return <div>{t('loading')}</div> // Or a 404 component
  }

  const currentLocale = i18n.language as Locale
  const i18nData = product.i18n[currentLocale] || product.i18n['fr-MA']

  return (
    <div className="container mx-auto p-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div>
          <img
            src={product.images[0] || '/placeholder.svg'}
            alt={i18nData.name}
            className="w-full rounded-lg shadow-lg"
          />
        </div>

        {/* Product Info */}
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-rtl">{i18nData.name}</h1>
          <p className="text-lg text-muted-foreground text-rtl">{i18nData.subtitle}</p>
          <p className="text-3xl font-bold text-primary">{product.priceMAD.toFixed(2)} MAD</p>

          <div className="border-t pt-4">
            <Button size="lg" className="w-full" disabled={product.stock === 0}>
              {product.stock === 0 ? t('stock_zero') : t('cta_buy_now')}
            </Button>
          </div>

          <div className="pt-4 space-y-2">
            <h2 className="text-xl font-semibold text-rtl">{t('Description')}</h2>
            <div
              className="prose max-w-none text-muted-foreground text-rtl"
              dangerouslySetInnerHTML={{ __html: i18nData.descriptionHtml }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
