interface WhatsAppLinkInput {
  items: { name: string; qty: number }[];
  totals: { grandTotal: number; currency: string };
  customer: { name: string; phone: string; city: string };
  number: string; // The business's WhatsApp number
}

/**
 * Composes a wa.me deep link with a pre-filled message containing order details.
 * @param input The order and customer details.
 * @returns A URL-encoded string for use in a wa.me link.
 */
export function composeWhatsAppLink({ items, totals, customer, number }: WhatsAppLinkInput): string {
  const header = "🎉 *Nouvelle Commande via WhatsApp* 🎉\n\n";

  const customerDetails = `*Client:*\n- Nom: ${customer.name}\n- Tél: ${customer.phone}\n- Ville: ${customer.city}\n\n`;

  const itemsDetails = "*Produits:*\n" + items.map(item => `- ${item.name} (x${item.qty})`).join('\n') + "\n\n";

  const totalDetails = `*Total à Payer: ${totals.grandTotal} ${totals.currency}*\n\n`;

  const footer = "Merci de confirmer la commande et l'adresse de livraison. 🙏";

  const text = [header, customerDetails, itemsDetails, totalDetails, footer].join('');

  const encodedText = encodeURIComponent(text);

  return `https://wa.me/${number}?text=${encodedText}`;
}
