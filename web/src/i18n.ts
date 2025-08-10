import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { Locale } from 'shared';

export const locales: Record<Locale, { title: string; native: string }> = {
  'fr-MA': { title: 'French', native: 'Français' },
  'ar-MA': { title: 'Arabic', native: 'العربية' },
};

const resources = {
  'ar-MA': {
    translation: {
      "cta_buy_now": "اشترِ الآن",
      "badge_cod": "الدفع عند الاستلام",
      "form_name": "الاسم الكامل",
      "form_phone": "رقم الهاتف",
      "form_city": "المدينة",
      "form_address": "العنوان الكامل",
      "cod_disclaimer": "لن تدفع أي شيء الآن. الدفع يتم عند استلام طلبيتك.",
      "success_title": "تم استقبال طلبك بنجاح!",
      "otp_prompt": "المرجو إدخال الرمز الذي توصلت به للتحقق",
      "place_order": "تأكيد الطلب",
      "products": "المنتجات",
      "checkout": "إتمام الطلب",
      "home": "الرئيسية",
      "loading": "جاري التحميل...",
      "stock_zero": "نفذ المخزون",
      "privacy_policy_acceptance": "أوافق على سياسة الخصوصية",
    },
  },
  'fr-MA': {
    translation: {
      "cta_buy_now": "Acheter maintenant",
      "badge_cod": "Paiement à la livraison",
      "form_name": "Nom complet",
      "form_phone": "Téléphone",
      "form_city": "Ville",
      "form_address": "Adresse complète",
      "cod_disclaimer": "Vous ne payez rien maintenant. Le paiement se fait à la livraison.",
      "success_title": "Commande reçue avec succès !",
      "otp_prompt": "Veuillez saisir le code de vérification reçu",
      "place_order": "Confirmer la commande",
      "products": "Produits",
      "checkout": "Commander",
      "home": "Accueil",
      "loading": "Chargement...",
      "stock_zero": "Stock épuisé",
      "privacy_policy_acceptance": "J'accepte la politique de confidentialité",
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr-MA',
    supportedLngs: Object.keys(locales),

    detection: {
      order: ['path', 'cookie', 'localStorage', 'htmlTag'],
      lookupFromPathIndex: 0,
    },

    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
