import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Admin user
  const adminHash = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      passwordHash: adminHash,
      name: 'Admin',
      role: 'ADMIN',
    },
  })

  // Demo user
  const userHash = await bcrypt.hash('user123', 12)
  await prisma.user.upsert({
    where: { email: 'user@test.com' },
    update: {},
    create: {
      email: 'user@test.com',
      passwordHash: userHash,
      name: 'Max Mustermann',
      role: 'USER',
    },
  })

  // Categories
  const elektronik = await prisma.category.upsert({
    where: { slug: 'elektronik' },
    update: {},
    create: { name: 'Elektronik', slug: 'elektronik' },
  })
  const kleidung = await prisma.category.upsert({
    where: { slug: 'kleidung' },
    update: {},
    create: { name: 'Kleidung', slug: 'kleidung' },
  })
  const haushalt = await prisma.category.upsert({
    where: { slug: 'haushalt' },
    update: {},
    create: { name: 'Haushalt', slug: 'haushalt' },
  })
  const sport = await prisma.category.upsert({
    where: { slug: 'sport' },
    update: {},
    create: { name: 'Sport & Freizeit', slug: 'sport' },
  })

  // Sub-categories
  const smartphones = await prisma.category.upsert({
    where: { slug: 'smartphones' },
    update: {},
    create: { name: 'Smartphones', slug: 'smartphones', parentId: elektronik.id },
  })
  const laptops = await prisma.category.upsert({
    where: { slug: 'laptops' },
    update: {},
    create: { name: 'Laptops', slug: 'laptops', parentId: elektronik.id },
  })

  // Products
  const products = [
    {
      name: 'Smartphone Pro X',
      slug: 'smartphone-pro-x',
      description: 'Das neueste Smartphone mit 6,7" AMOLED Display, 5G-Unterstützung und 48MP Triple-Kamera. Perfekt für alle, die immer verbunden bleiben wollen.',
      price: 699.99,
      stock: 25,
      categoryId: smartphones.id,
      images: ['https://placehold.co/600x600/2563eb/white?text=Smartphone+Pro+X'],
    },
    {
      name: 'Laptop UltraSlim 15',
      slug: 'laptop-ultraslim-15',
      description: 'Ultraleichter Business-Laptop mit Intel Core i7, 16GB RAM, 512GB SSD und 15,6" Full-HD Display. Akku hält bis zu 12 Stunden.',
      price: 1199.00,
      stock: 10,
      categoryId: laptops.id,
      images: ['https://placehold.co/600x600/1d4ed8/white?text=Laptop+UltraSlim'],
    },
    {
      name: 'Wireless Kopfhörer BT500',
      slug: 'wireless-kopfhoerer-bt500',
      description: 'Premium Over-Ear Kopfhörer mit Active Noise Cancelling, 30h Akkulaufzeit und Hi-Fi Sound. Kompatibel mit allen Geräten via Bluetooth 5.0.',
      price: 149.99,
      stock: 50,
      categoryId: elektronik.id,
      images: ['https://placehold.co/600x600/0f172a/white?text=Kopfh%C3%B6rer+BT500'],
    },
    {
      name: 'Bio-Baumwoll T-Shirt',
      slug: 'bio-baumwoll-t-shirt',
      description: 'Nachhaltiges T-Shirt aus 100% Bio-Baumwolle. Fair produziert, GOTS-zertifiziert. Erhältlich in vielen Farben und Größen S-XXL.',
      price: 24.99,
      stock: 200,
      categoryId: kleidung.id,
      images: ['https://placehold.co/600x600/16a34a/white?text=Bio+T-Shirt'],
    },
    {
      name: 'Winterjacke ThermoGuard',
      slug: 'winterjacke-thermoguard',
      description: 'Warme Winterjacke mit gefüttertem Innenraum, wasserdichtem Außenmaterial und abnehmbarer Kapuze. Ideal für kalte Tage.',
      price: 89.99,
      stock: 30,
      categoryId: kleidung.id,
      images: ['https://placehold.co/600x600/374151/white?text=Winterjacke'],
    },
    {
      name: 'Edelstahl Kochtopf-Set',
      slug: 'edelstahl-kochtopf-set',
      description: '5-teiliges Kochtopf-Set aus hochwertigem Edelstahl. Induktionsgeeignet, spülmaschinenfest, mit Glasdeckeln. Für alle Herdarten geeignet.',
      price: 79.99,
      stock: 40,
      categoryId: haushalt.id,
      images: ['https://placehold.co/600x600/9333ea/white?text=Kochtopf-Set'],
    },
    {
      name: 'Yoga-Matte Premium',
      slug: 'yoga-matte-premium',
      description: 'Rutschfeste Premium Yoga-Matte aus umweltfreundlichem TPE-Material. 183x61cm, 6mm dick. Mit Tragegurt und Reinigungsanleitung.',
      price: 39.99,
      stock: 75,
      categoryId: sport.id,
      images: ['https://placehold.co/600x600/ec4899/white?text=Yoga+Matte'],
    },
    {
      name: 'Fahrrad Helm CycleSafe',
      slug: 'fahrrad-helm-cyclesafe',
      description: 'Zertifizierter Fahrradhelm mit verstellbarem Verschlusssystem, guter Belüftung und integrierten LED-Rücklichtern. EN1078 zertifiziert.',
      price: 49.99,
      stock: 60,
      categoryId: sport.id,
      images: ['https://placehold.co/600x600/f97316/white?text=Fahrradhelm'],
    },
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        ...product,
        price: product.price,
      },
    })
  }

  console.log('Seed completed. Admin: admin@test.com / admin123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
