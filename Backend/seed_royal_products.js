import mongoose from 'mongoose';
import { config } from './src/config/config.js';
import { uploadFile } from './src/services/storage.service.js';
import productModel from './src/models/product.model.js';
import userModel from './src/models/user.model.js';

// Helper to download an image from a URL and upload directly to ImageKit
async function uploadToImageKitFromUrl(imageUrl, fileName) {
  console.log(`  Downloading: ${fileName}...`);
  const resp = await fetch(imageUrl);
  if (!resp.ok) {
    throw new Error(`Failed to fetch ${imageUrl} (${resp.status})`);
  }
  const arrayBuffer = await resp.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  console.log(`  Uploading to ImageKit: ${fileName}...`);
  const uploaded = await uploadFile({
    buffer,
    fileName,
    folder: 'VASTRA_LOOM'
  });
  
  console.log(`  ✔ ImageKit URL: ${uploaded.url}`);
  return { url: uploaded.url };
}

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(config.MONGO_URL);
  console.log('Connected to MongoDB.');

  // Find the two sellers
  const seller1 = await userModel.findOne({ email: 'rishabhjagtap581@gmail.com' });
  const seller2 = await userModel.findOne({ email: 'seller@test.com' });

  if (!seller1 || !seller2) {
    console.error('Could not find both sellers!');
    process.exit(1);
  }

  console.log(`Seller 1: ${seller1.fullname} (${seller1.email}) [${seller1._id}]`);
  console.log(`Seller 2: ${seller2.fullname} (${seller2.email}) [${seller2._id}]`);

  // Clean up the dummy test products with unrealistic prices (amount 45645641561516 and 1)
  const deletedTest = await productModel.deleteMany({
    _id: { $in: ['6aa917a2553c7747ddc6a32f', '6ab7bc95f61c96f9da016782'] }
  });
  console.log(`Cleaned up ${deletedTest.deletedCount} dummy test products.`);

  // ════════════════════════════════════════════════════════════════════════════
  // PRODUCT 1: Imperial Royal Velvet Blazer (Seller 1)
  // ════════════════════════════════════════════════════════════════════════════
  console.log('\n--- Processing Product 1: Imperial Royal Velvet Blazer ---');
  const blazerImages = await Promise.all([
    uploadToImageKitFromUrl(
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=1200&q=85',
      'imperial_velvet_blazer_front.jpg'
    ),
    uploadToImageKitFromUrl(
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&q=85',
      'imperial_velvet_blazer_tailored_cut.jpg'
    ),
    uploadToImageKitFromUrl(
      'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=1200&q=85',
      'imperial_velvet_blazer_lapel_detail.jpg'
    ),
    uploadToImageKitFromUrl(
      'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=1200&q=85',
      'imperial_velvet_blazer_brass_buttons.jpg'
    ),
  ]);

  const blazerEmeraldVariantImg = await uploadToImageKitFromUrl(
    'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?w=1200&q=85',
    'imperial_blazer_emerald_edition.jpg'
  );

  const blazerWineVariantImg = await uploadToImageKitFromUrl(
    'https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6?w=1200&q=85',
    'imperial_blazer_wine_crimson_edition.jpg'
  );

  const product1 = await productModel.create({
    title: 'Imperial Royal Velvet Blazer',
    description: 'Meticulously tailored from plush micro-velvet with hand-embroidered gold bullion crest on the notch lapel. Features embossed antique brass buttons, double-vented imperial silhouette, and an obsidian silk brocade lining for gala evenings.',
    price: { amount: 24500, currency: 'INR' },
    discount: 18,
    originalPrice: 29999,
    stock: 24,
    images: blazerImages,
    seller: seller1._id,
    variants: [
      {
        attributes: { Color: 'Royal Navy Velvet', Size: '40', Silhouette: 'Double Vent' },
        price: { amount: 24500, currency: 'INR' },
        discount: 18,
        originalPrice: 29999,
        stock: 10,
        images: blazerImages.slice(0, 2),
      },
      {
        attributes: { Color: 'Emerald Green Velvet', Size: '42', Silhouette: 'Double Vent' },
        price: { amount: 26500, currency: 'INR' },
        discount: 15,
        originalPrice: 31000,
        stock: 8,
        images: [blazerEmeraldVariantImg],
      },
      {
        attributes: { Color: 'Wine Crimson Velvet', Size: '44', Silhouette: 'Double Vent' },
        price: { amount: 26500, currency: 'INR' },
        discount: 15,
        originalPrice: 31000,
        stock: 6,
        images: [blazerWineVariantImg],
      },
    ],
  });
  console.log(`✔ Created Product 1: ${product1.title} (${product1._id})`);

  // ════════════════════════════════════════════════════════════════════════════
  // PRODUCT 2: Maharaja Zardozi Heritage Sherwani (Seller 1)
  // ════════════════════════════════════════════════════════════════════════════
  console.log('\n--- Processing Product 2: Maharaja Zardozi Heritage Sherwani ---');
  const sherwaniImages = await Promise.all([
    uploadToImageKitFromUrl(
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1200&q=85',
      'maharaja_zardozi_sherwani_front.jpg'
    ),
    uploadToImageKitFromUrl(
      'https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?w=1200&q=85',
      'maharaja_zardozi_sherwani_chest_embroidery.jpg'
    ),
    uploadToImageKitFromUrl(
      'https://images.unsplash.com/photo-1621609764095-b32bbe35cf3a?w=1200&q=85',
      'maharaja_zardozi_sherwani_collar_cuff.jpg'
    ),
    uploadToImageKitFromUrl(
      'https://images.unsplash.com/photo-1544441893-675973e31985?w=1200&q=85',
      'maharaja_zardozi_sherwani_tissue_stole.jpg'
    ),
  ]);

  const sherwaniGoldVariantImg = await uploadToImageKitFromUrl(
    'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=1200&q=85',
    'maharaja_sherwani_champagne_gold.jpg'
  );

  const sherwaniIvoryVariantImg = await uploadToImageKitFromUrl(
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&q=85',
    'maharaja_sherwani_antique_ivory.jpg'
  );

  const product2 = await productModel.create({
    title: 'Maharaja Zardozi Heritage Sherwani',
    description: 'An imperial heirloom woven from pure Varanasi katan silk. Adorned with delicate antique dabka wirework, micro seed pearls, and intricate zardozi floral vines along the chest, collar, and cuffs. Accompanied by a handwoven tissue silk stole.',
    price: { amount: 48500, currency: 'INR' },
    discount: 20,
    originalPrice: 60500,
    stock: 14,
    images: sherwaniImages,
    seller: seller1._id,
    variants: [
      {
        attributes: { Color: 'Antique Ivory', Size: '40', Craft: 'Katan Silk' },
        price: { amount: 48500, currency: 'INR' },
        discount: 20,
        originalPrice: 60500,
        stock: 6,
        images: [sherwaniIvoryVariantImg],
      },
      {
        attributes: { Color: 'Champagne Gold', Size: '42', Craft: 'Zardozi Weave' },
        price: { amount: 52000, currency: 'INR' },
        discount: 16,
        originalPrice: 62000,
        stock: 5,
        images: [sherwaniGoldVariantImg],
      },
      {
        attributes: { Color: 'Royal Cream & Rose', Size: '44', Craft: 'Brocade Inlay' },
        price: { amount: 54500, currency: 'INR' },
        discount: 15,
        originalPrice: 64000,
        stock: 3,
        images: sherwaniImages.slice(0, 2),
      },
    ],
  });
  console.log(`✔ Created Product 2: ${product2.title} (${product2._id})`);

  // ════════════════════════════════════════════════════════════════════════════
  // PRODUCT 3: Regal Obsidian Tuxedo Bandhgala (Seller 2)
  // ════════════════════════════════════════════════════════════════════════════
  console.log('\n--- Processing Product 3: Regal Obsidian Tuxedo Bandhgala ---');
  const bandhgalaImages = await Promise.all([
    uploadToImageKitFromUrl(
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1200&q=85',
      'regal_obsidian_bandhgala_front.jpg'
    ),
    uploadToImageKitFromUrl(
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=1200&q=85',
      'regal_obsidian_bandhgala_satin_collar.jpg'
    ),
    uploadToImageKitFromUrl(
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=1200&q=85',
      'regal_obsidian_bandhgala_suiting_wool.jpg'
    ),
    uploadToImageKitFromUrl(
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1200&q=85',
      'regal_obsidian_bandhgala_cuff_profile.jpg'
    ),
  ]);

  const product3 = await productModel.create({
    title: 'Regal Obsidian Tuxedo Bandhgala',
    description: 'Impeccable evening formal wear bridging regal Indian heritage with contemporary couture. Crafted from Super 140s Italian merino wool with duchess silk satin facing on the mandarin collar and besom pockets. Finished with hand-carved horn buttons.',
    price: { amount: 32000, currency: 'INR' },
    discount: 15,
    originalPrice: 37600,
    stock: 22,
    images: bandhgalaImages,
    seller: seller2._id,
    variants: [
      {
        attributes: { Size: '38', Fit: 'Bespoke Slim', Lining: 'Charcoal Satin' },
        price: { amount: 32000, currency: 'INR' },
        discount: 15,
        originalPrice: 37600,
        stock: 7,
        images: bandhgalaImages.slice(0, 2),
      },
      {
        attributes: { Size: '40', Fit: 'Classic Imperial', Lining: 'Charcoal Satin' },
        price: { amount: 32000, currency: 'INR' },
        discount: 15,
        originalPrice: 37600,
        stock: 9,
        images: bandhgalaImages.slice(0, 2),
      },
      {
        attributes: { Size: '42', Fit: 'Classic Imperial', Lining: 'Charcoal Satin' },
        price: { amount: 33500, currency: 'INR' },
        discount: 12,
        originalPrice: 38000,
        stock: 6,
        images: bandhgalaImages.slice(0, 2),
      },
    ],
  });
  console.log(`✔ Created Product 3: ${product3.title} (${product3._id})`);

  // ════════════════════════════════════════════════════════════════════════════
  // PRODUCT 4: Jodhpur Royal Silk Achkan (Seller 2)
  // ════════════════════════════════════════════════════════════════════════════
  console.log('\n--- Processing Product 4: Jodhpur Royal Silk Achkan ---');
  const achkanImages = await Promise.all([
    uploadToImageKitFromUrl(
      'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=1200&q=85',
      'jodhpur_royal_achkan_front.jpg'
    ),
    uploadToImageKitFromUrl(
      'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=1200&q=85',
      'jodhpur_royal_achkan_silver_buttons.jpg'
    ),
    uploadToImageKitFromUrl(
      'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&q=85',
      'jodhpur_royal_achkan_side_embroidery.jpg'
    ),
    uploadToImageKitFromUrl(
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=1200&q=85',
      'jodhpur_royal_achkan_hem_drape.jpg'
    ),
  ]);

  const achkanCobaltVariantImg = await uploadToImageKitFromUrl(
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=1200&q=85',
    'jodhpur_achkan_cobalt_edition.jpg'
  );

  const achkanIvoryVariantImg = await uploadToImageKitFromUrl(
    'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=1200&q=85',
    'jodhpur_achkan_ivory_edition.jpg'
  );

  const product4 = await productModel.create({
    title: 'Jodhpur Royal Silk Achkan',
    description: 'Inspired by the courts of Rajputana, this asymmetrical knee-length achkan is cut from pure handloom mulberry silk. Features a curved front overlap, delicate tone-on-tone aari hand-embroidery, and custom filigree silver buttons.',
    price: { amount: 38500, currency: 'INR' },
    discount: 16,
    originalPrice: 45900,
    stock: 16,
    images: achkanImages,
    seller: seller2._id,
    variants: [
      {
        attributes: { Color: 'Deep Cobalt Silk', Size: '40' },
        price: { amount: 38500, currency: 'INR' },
        discount: 16,
        originalPrice: 45900,
        stock: 8,
        images: [achkanCobaltVariantImg],
      },
      {
        attributes: { Color: 'Pristine Royal Ivory', Size: '42' },
        price: { amount: 41000, currency: 'INR' },
        discount: 15,
        originalPrice: 48000,
        stock: 8,
        images: [achkanIvoryVariantImg],
      },
    ],
  });
  console.log(`✔ Created Product 4: ${product4.title} (${product4._id})`);

  // ════════════════════════════════════════════════════════════════════════════
  // PRODUCT 5: Nawabi Hand-Embroidered Kurta & Bundi Set (Seller 2)
  // ════════════════════════════════════════════════════════════════════════════
  console.log('\n--- Processing Product 5: Nawabi Hand-Embroidered Kurta & Bundi Set ---');
  const kurtaImages = await Promise.all([
    uploadToImageKitFromUrl(
      'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=1200&q=85',
      'nawabi_kurta_bundi_full_look.jpg'
    ),
    uploadToImageKitFromUrl(
      'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=1200&q=85',
      'nawabi_bundi_jacket_brocade_detail.jpg'
    ),
    uploadToImageKitFromUrl(
      'https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=1200&q=85',
      'nawabi_kurta_bundi_chanderi_weave.jpg'
    ),
    uploadToImageKitFromUrl(
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1200&q=85',
      'nawabi_kurta_bundi_fabric_flow.jpg'
    ),
  ]);

  const product5 = await productModel.create({
    title: 'Nawabi Hand-Embroidered Kurta & Bundi Set',
    description: 'A regal two-piece festive ensemble featuring a textured Chanderi silk kurta paired with an opulent woven brocade bundi waistcoat. Detailed with hand-sewn fabric potli buttons, Mandarin collar, and comfortable tailored side slits.',
    price: { amount: 19500, currency: 'INR' },
    discount: 19,
    originalPrice: 24000,
    stock: 28,
    images: kurtaImages,
    seller: seller2._id,
    variants: [
      {
        attributes: { Size: '38', Color: 'Mustard Gold & Ivory' },
        price: { amount: 19500, currency: 'INR' },
        discount: 19,
        originalPrice: 24000,
        stock: 9,
        images: kurtaImages.slice(0, 2),
      },
      {
        attributes: { Size: '40', Color: 'Mustard Gold & Ivory' },
        price: { amount: 19500, currency: 'INR' },
        discount: 19,
        originalPrice: 24000,
        stock: 11,
        images: kurtaImages.slice(0, 2),
      },
      {
        attributes: { Size: '42', Color: 'Mustard Gold & Ivory' },
        price: { amount: 20500, currency: 'INR' },
        discount: 16,
        originalPrice: 24500,
        stock: 8,
        images: kurtaImages.slice(0, 2),
      },
    ],
  });
  console.log(`✔ Created Product 5: ${product5.title} (${product5._id})`);

  console.log('\n=============================================');
  console.log('ALL ROYAL ATELIER PRODUCTS SUCCESSFULLY SEEDED!');
  console.log('=============================================');

  // Verify total products in database
  const total = await productModel.find().populate('seller', 'fullname email');
  console.log(`Total Products in Catalog now: ${total.length}`);
  total.forEach((p, idx) => {
    console.log(
      `${idx + 1}. [${p.seller?.fullname}] ${p.title} - INR ${p.price?.amount} (Images: ${p.images?.length}, Variants: ${p.variants?.length})`
    );
  });

  await mongoose.disconnect();
  console.log('Disconnected from DB. Done.');
}

seed().catch((err) => {
  console.error('Fatal error during seeding:', err);
  process.exit(1);
});
