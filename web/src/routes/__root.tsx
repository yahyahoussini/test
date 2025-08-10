import { createRootRouteWithContext, Outlet, Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'
import { QueryClient } from '@tanstack/react-query'
import { locales } from '@/i18n'
import { Locale } from 'shared'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootComponent,
})

function RootComponent() {
  const { i18n, t } = useTranslation()

  useEffect(() => {
    const lang = i18n.language as Locale
    const dir = i18n.dir(lang)
    document.documentElement.lang = lang
    document.documentElement.dir = dir
  }, [i18n, i18n.language])

  const currentLang = i18n.language as Locale
  const otherLang = currentLang === 'ar-MA' ? 'fr-MA' : 'ar-MA'

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-primary">
            Tussna Bio
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-600 hover:text-primary font-medium">
              {t('home')}
            </Link>
            <Link to="/products" className="text-gray-600 hover:text-primary font-medium">
              {t('products')}
            </Link>
            {/* Link to other language */}
            <a href={`/${otherLang.split('-')[0]}`} className="text-sm font-semibold text-gray-500 hover:text-primary">
              {locales[otherLang].native}
            </a>
          </nav>
        </div>
      </header>

      <main className="min-h-screen bg-gray-50/50">
        <Outlet />
      </main>

      <footer className="bg-gray-100 border-t mt-12 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} Tussna Biocosmétique. All rights reserved.</p>
        </div>
      </footer>
    </>
  )
}
