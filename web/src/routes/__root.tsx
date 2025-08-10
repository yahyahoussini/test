import { createRootRoute, Outlet, Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
    const { i18n, t } = useTranslation();

    useEffect(() => {
        const lang = i18n.language.split('-')[0]; // get 'ar' from 'ar-MA'
        document.documentElement.lang = lang;
        document.documentElement.dir = i18n.dir(i18n.language);
    }, [i18n, i18n.language]);

    const otherLang = i18n.language === 'ar-MA' ? 'fr-MA' : 'ar-MA';
    const otherLangLabel = i18n.language === 'ar-MA' ? 'Français' : 'العربية';

    return (
        <>
            <header className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <Link to="/" className="text-2xl font-bold text-green-800">
                        Tussna Biocosmétique
                    </Link>
                    <nav className="flex items-center gap-4">
                        <Link to="/" className="text-gray-600 hover:text-green-700">{t('home')}</Link>
                        <Link to="/products" className="text-gray-600 hover:text-green-700">{t('products')}</Link>
                        <Link to="/checkout" className="text-gray-600 hover:text-green-700">{t('checkout')}</Link>
                        <a href={`/${otherLang}`} className="text-sm font-medium text-gray-500 hover:text-green-600">
                            {otherLangLabel}
                        </a>
                    </nav>
                </div>
            </header>

            <main className="min-h-screen">
                <Outlet />
            </main>

            <footer className="bg-gray-100 mt-12 py-8">
                <div className="container mx-auto px-4 text-center text-gray-600">
                    © {new Date().getFullYear()} Tussna Biocosmétique. All rights reserved.
                </div>
            </footer>
        </>
    )
}
