import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

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
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr-MA',
    supportedLngs: ['fr-MA', 'ar-MA'],

    detection: {
      // order and from where user language should be detected
      order: ['path', 'cookie', 'htmlTag', 'localStorage', 'subdomain'],
      // keys or params to lookup language from
      lookupFromPathIndex: 0,
    },

    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
