import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Product, Locale } from 'shared'
import { Button } from '@/components/ui/Button'

// API fetching function
async function fetchProducts(): Promise<{ data: Product[] }> {
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/products`)
  if (!res.ok) {
    throw new Error('Network response was not ok')
  }
  return res.json()
}

// TanStack Router File Route
export const Route = createFileRoute('/products')({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData({
      queryKey: ['products'],
      queryFn: fetchProducts,
    }),
  component: ProductsPageComponent,
})

// Product Card Component
function ProductCard({ product }: { product: Product }) {
  const { t, i18n } = useTranslation()
  const currentLocale = i18n.language as Locale
  const i18nData = product.i18n[currentLocale] || product.i18n['fr-MA'];

  return (
    <div className="border rounded-lg shadow-sm overflow-hidden flex flex-col">
      <Link to="/products/$slug" params={{ slug: product.slug }}>
        <img
          src={product.images[0] || '/placeholder.svg'}
          alt={i18nData.name}
          className="w-full h-48 object-cover hover:opacity-90 transition-opacity"
        />
      </Link>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-rtl">{i18nData.name}</h3>
        <p className="text-sm text-muted-foreground text-rtl">{i18nData.subtitle}</p>
        <div className="flex-grow" />
        <div className="mt-4 flex justify-between items-center">
          <p className="text-xl font-bold text-primary">{product.priceMAD.toFixed(2)} MAD</p>
          <Button size="sm" disabled={product.stock === 0}>
            {product.stock === 0 ? t('stock_zero') : t('cta_buy_now')}
          </Button>
        </div>
      </div>
    </div>
  )
}

// Main Page Component
function ProductsPageComponent() {
  const { t } = useTranslation()
  const { data } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  })

  return (
    <div className="container mx-auto p-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">{t('products')}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {data?.data.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
