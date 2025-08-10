import { createFileRoute, redirect } from '@tanstack/react-router'
import i18n from '../i18n';

export const Route = createFileRoute('/$lang')({
  beforeLoad: ({ params }) => {
    const lang = params.lang;
    if (i18n.supportedLngs.includes(`${lang}-MA`)) {
      i18n.changeLanguage(`${lang}-MA`);
    } else {
      // Redirect to default language if the path is not supported
      throw redirect({
        to: '/',
        // You can add more logic here, e.g., to preserve the rest of the path
      })
    }
  },
  component: () => null, // This component will not be rendered
});
