import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { authenticator } from 'otplib';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed process...');

  // --- 1. Clean up existing data ---
  console.log('🧹 Clearing old data...');
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.adminUser.deleteMany();
  await prisma.contentBlock.deleteMany();
  await prisma.setting.deleteMany();
  console.log('✅ Old data cleared.');

  // --- 2. Seed Admin User ---
  console.log('👤 Seeding admin user...');
  const passwordHash = await bcrypt.hash('Admin@12345', 10);
  const totpSecret = authenticator.generateSecret();
  const admin = await prisma.adminUser.create({
    data: {
      email: 'admin@example.com',
      passwordHash,
      roles: ['admin', 'operator'],
      active: true,
      totpSecret,
    },
  });
  console.log(`✅ Admin user created: ${admin.email}`);
  console.log(`🔑 Admin TOTP Secret (use this in your authenticator app): ${totpSecret}`);
  console.log(`(You can scan a QR code for this secret at https://www.google.com/chart?chs=200x200&chld=M|0&cht=qr&chl=otpauth://totp/TussnaAdmin:admin@example.com%3Fsecret%3D${totpSecret}%26issuer%3DTussnaAdmin)`);


  // --- 3. Seed Products ---
  console.log('🛍️ Seeding products...');
  const products = [
    {
      sku: 'ARG-SHMP-250', slug: 'argan-shampoo', priceMAD: 189.0, stock: 100, images: ['/products/argan-shampoo-1.webp', '/products/argan-shampoo-2.webp'], tags: ['hair', 'shampoo'],
      i18n: { 'fr-MA': { name: 'Shampooing à l\'Huile d\'Argan', subtitle: 'Nutrition et Brillance Intense', descriptionHtml: '<p>Notre shampooing revitalisant à l\'huile d\'argan bio nettoie en douceur tout en restaurant la force et la brillance de vos cheveux. Idéal pour tous les types de cheveux.</p>', ingredients: ['Huile d\'Argan Bio', 'Protéine de Blé Hydrolysée', 'Extrait d\'Aloe Vera'], howToUse: 'Appliquer sur cheveux mouillés, masser et rincer. Répéter si nécessaire.' }, 'ar-MA': { name: 'شامبو بزيت الأرغان', subtitle: 'تغذية ولمعان فائق', descriptionHtml: '<p>شامبو منشط بزيت الأرغان العضوي ينظف بلطف ويعيد القوة واللمعان لشعرك. مثالي لجميع أنواع الشعر.</p>', ingredients: ['زيت الأرغان العضوي', 'بروتين القمح المهدرج', 'خلاصة الصبار'], howToUse: 'يوضع على الشعر المبلل، يدلك ثم يشطف. تكرر العملية إذا لزم الأمر.' } }
    },
    {
      sku: 'VITC-SER-30', slug: 'vitamin-c-serum', priceMAD: 249.0, stock: 75, images: ['/products/vitc-serum-1.webp', '/products/vitc-serum-2.webp'], tags: ['face', 'serum'],
      i18n: { 'fr-MA': { name: 'Sérum Vitamine C', subtitle: 'Éclat et Anti-oxydant', descriptionHtml: '<p>Un sérum puissant pour illuminer le teint, réduire les taches et protéger contre les agressions environnementales.</p>' }, 'ar-MA': { name: 'سيروم فيتامين سي', subtitle: 'إشراقة ومضاد للأكسدة', descriptionHtml: '<p>سيروم قوي لتوحيد لون البشرة وتقليل البقع الداكنة والحماية من العوامل البيئية الضارة.</p>' } }
    },
    {
      sku: 'BODY-LOT-200', slug: 'body-lotion', priceMAD: 159.0, stock: 120, images: ['/products/body-lotion-1.webp'], tags: ['body', 'moisturizer'],
      i18n: { 'fr-MA': { name: 'Lotion Corporelle Hydratante', subtitle: 'Au Beurre de Karité' }, 'ar-MA': { name: 'لوشن مرطب للجسم', subtitle: 'بزبدة الشيا' } }
    },
    {
      sku: 'DEO-NAT-50', slug: 'natural-deodorant', priceMAD: 99.0, stock: 200, images: ['/products/deodorant-1.webp'], tags: ['body', 'deodorant'],
      i18n: { 'fr-MA': { name: 'Déodorant Naturel', subtitle: 'Fraîcheur Longue Durée' }, 'ar-MA': { name: 'مزيل عرق طبيعي', subtitle: 'انتعاش يدوم طويلاً' } }
    },
    {
      sku: 'LIP-BALM-15', slug: 'lip-balm', priceMAD: 49.0, stock: 0, images: ['/products/lip-balm-1.webp'], tags: ['face', 'lips'],
      i18n: { 'fr-MA': { name: 'Baume à Lèvres Réparateur (Stock Epuisé)', subtitle: 'À la cire d\'abeille' }, 'ar-MA': { name: 'مرطب شفاه مرمم (نفذ المخزون)', subtitle: 'بشمع العسل' } }
    },
    {
      sku: 'HAND-CRM-75', slug: 'hand-moisturizer', priceMAD: 79.0, stock: 150, images: ['/products/hand-cream-1.webp'], tags: ['body', 'moisturizer'],
      i18n: { 'fr-MA': { name: 'Crème Mains Nourrissante', subtitle: 'Absorption Rapide' }, 'ar-MA': { name: 'كريم مغذي لليدين', subtitle: 'امتصاص سريع' } }
    },
  ];
  for (const p of products) { await prisma.product.create({ data: p }); }
  console.log(`✅ Seeded ${products.length} products.`);

  // --- 4. Seed Content Blocks ---
  console.log('📄 Seeding content blocks...');
  const contentBlocks = [
    { key: 'homepage.hero', locale: 'fr-MA', content: { title: 'La Nature, Votre Beauté.', subtitle: 'Découvrez nos cosmétiques bio, inspirés des trésors du Maroc.', cta: 'Découvrir nos produits', imageUrl: '/heros/hero-fr.webp' } },
    { key: 'homepage.hero', locale: 'ar-MA', content: { title: 'الطبيعة، جمالك.', subtitle: 'اكتشفي مستحضرات التجميل العضوية، المستوحاة من كنوز المغرب.', cta: 'اكتشف منتجاتنا', imageUrl: '/heros/hero-ar.webp' } },
  ];
  for (const cb of contentBlocks) { await prisma.contentBlock.create({ data: cb }); }
  console.log(`✅ Seeded ${contentBlocks.length} content blocks.`);

  // --- 5. Seed Settings ---
  console.log('⚙️ Seeding settings...');
  const settings = [
    { key: 'shipping.rules', value: { default: { fee: 40, etaDays: { min: 2, max: 5 } }, cities: { Casablanca: { fee: 25, etaDays: { min: 1, max: 2 } }, Rabat: { fee: 25, etaDays: { min: 1, max: 2 } }, Marrakech: { fee: 35, etaDays: { min: 2, max: 3 } }, Agadir: { fee: 40, etaDays: { min: 2, max: 4 } }, Tangier: { fee: 35, etaDays: { min: 2, max: 3 } }, Fes: { fee: 35, etaDays: { min: 2, max: 3 } } } } },
    { key: 'payment.cod.fee', value: { fee: 0 } },
    { key: 'cities', value: { options: ["Casablanca", "Rabat", "Marrakech", "Agadir", "Fes", "Tangier", "Meknes", "Oujda", "Kenitra", "Tetouan", "Safi", "El Jadida", "Nador", "Beni Mellal", "Khouribga"] } }
  ];
  for (const s of settings) { await prisma.setting.create({ data: s }); }
  console.log(`✅ Seeded ${settings.length} settings.`);

  console.log('🎉 Seed process finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ An error occurred during the seed process:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
