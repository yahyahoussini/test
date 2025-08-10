import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Product } from 'shared'

export const Route = createFileRoute('/products')({
  component: ProductsPage,
})

async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/products`)
  if (!res.ok) {
    throw new Error('Network response was not ok')
  }
  return res.json()
}

function ProductsPage() {
  const { t, i18n } = useTranslation()
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  })

  if (isLoading) return <div>{t('loading')}</div>
  if (error) return <div>Error: {error.message}</div>

  const currentLocale = i18n.language as 'ar-MA' | 'fr-MA';

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">{t('products')}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products?.map((product) => (
          <div key={product.id} className="border rounded-lg shadow-sm overflow-hidden">
            <img src={product.images[0]} alt={product.i18n[currentLocale]?.name} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h2 className="text-lg font-semibold">{product.i18n[currentLocale]?.name}</h2>
              <p className="text-gray-500">{product.i18n[currentLocale]?.subtitle}</p>
              <p className="text-xl font-bold mt-2">{product.priceMAD} MAD</p>
              <button className="mt-4 w-full bg-green-700 text-white py-2 rounded-lg hover:bg-green-800">
                {t('cta_buy_now')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
