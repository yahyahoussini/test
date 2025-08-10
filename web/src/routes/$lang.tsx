import { createFileRoute, redirect } from '@tanstack/react-router'
import i18n from '@/i18n'
import { Locale } from 'shared'

export const Route = createFileRoute('/$lang')({
  beforeLoad: ({ params, location }) => {
    const lang = params.lang
    const targetLang = `${lang}-MA` as Locale

    if (i18n.supportedLngs.includes(targetLang)) {
      i18n.changeLanguage(targetLang)
    }

    // Redirect to the root of the new language path.
    // This allows navigating to /fr from /ar/products and landing on /fr.
    // A more advanced implementation could preserve the full path.
    throw redirect({
      to: '/',
      // Preserve search params if any
      search: location.search,
    })
  },
})
