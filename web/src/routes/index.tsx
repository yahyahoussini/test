import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/Button'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/')({
  component: HomeComponent,
})

function HomeComponent() {
  const { t } = useTranslation()

  return (
    <div className="space-y-12 md:space-y-20">
      {/* Hero Section */}
      <section className="bg-green-50">
        <div className="container mx-auto px-4 py-16 md:py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-primary tracking-tight">
            {t('La Nature, Votre Beauté.')} {/* Using a key that defaults to text */}
          </h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('Découvrez nos cosmétiques bio, inspirés des trésors du Maroc.')}
          </p>
          <Button size="lg" className="mt-8">
            {t('cta_buy_now')}
          </Button>
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">
          {t('Nos Meilleurs Ventes')}
        </h2>
        {/* Placeholder for product cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="border rounded-lg p-4 text-center">Product 1</div>
          <div className="border rounded-lg p-4 text-center">Product 2</div>
          <div className="border rounded-lg p-4 text-center">Product 3</div>
        </div>
      </section>

      {/* "Why Choose Us" Section */}
      <section className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">
          {t('Pourquoi Nous Choisir?')}
        </h2>
        {/* Placeholder for feature icons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>Icon + Feature</div>
          <div>Icon + Feature</div>
          <div>Icon + Feature</div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-gray-100">
          <div className="container mx-auto px-4 py-8 flex justify-around items-center">
              <div className="text-center">
                <span className="font-bold">{t('badge_cod')}</span>
              </div>
              <div className="text-center">
                <span className="font-bold">{t('Livraison Rapide')}</span>
              </div>
              <div className="text-center">
                <span className="font-bold">{t('Produits Bio Certifiés')}</span>
              </div>
          </div>
      </section>
    </div>
  )
}
