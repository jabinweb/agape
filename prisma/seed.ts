import { PrismaClient, UserRole } from '@prisma/client';
import { SeedUtils } from './seed-utils';

const prisma = new PrismaClient();
const utils = new SeedUtils(prisma);

async function main() {
  console.log('🌱 Starting seed process...');

  // Clean up existing data
  await cleanDatabase();

  // Seed data in order of dependencies
  await seedSystemSettings();
  const adminUser = await seedUsers();
  const categories = await seedCategories();
  const productCategories = await seedProductCategories();
  const products = await seedProducts(adminUser.id, productCategories);
  const addresses = await seedAddresses(adminUser.id);
  const orders = await seedOrders(adminUser.id, addresses[0].id);
  await seedOrderItems(orders, products);
  const blogPosts = await seedBlogPosts(adminUser.id, categories[0].id);
  await seedComments(adminUser.id, blogPosts[0].id);
  await seedFiles(adminUser.id);

  console.log('✅ Seed completed successfully!');
}

async function cleanDatabase() {
  await utils.cleanDatabase();
  console.log('🧹 Database cleaned!');
}

async function seedSystemSettings() {
  console.log('🏢 Seeding system settings...');
  
  await prisma.systemSettings.create({
    data: {
      storeName: 'ATELIER 7X',
      storeAddress: '123 Art Gallery Street, New York, NY 10001',
      storePhone: '+1 (212) 555-7890',
      storeEmail: 'contact@atelier7x.com',
      storeWebsite: 'https://atelier7x.com',
      currency: 'USD',
      logoUrl: '/images/logo/atelier7x-logo.png',
      primaryColor: '#3b82f6', // blue
      secondaryColor: '#8b5cf6', // purple
      accentColor: '#f59e0b', // amber/orange
      backgroundColor: '#f9fafb',
      textColor: '#111827',
      timezone: 'America/New_York',
      defaultLanguage: 'en-US',
      facebookUrl: 'https://facebook.com/atelier7x',
      twitterUrl: 'https://twitter.com/atelier7x',
      instagramUrl: 'https://instagram.com/atelier7x',
      supportPhone: '+1 (800) 555-7890',
      privacyPolicyUrl: '/privacy-policy',
      termsUrl: '/terms',
    },
  });

  console.log('✅ System settings seeded!');
}

async function seedUsers() {
  console.log('👥 Seeding users...');
  
  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@atelier7x.com',
      password: await utils.hashPassword('Admin123!'),
      role: UserRole.ADMIN,
      phone: '+1 (212) 555-1234',
      isActive: true,
    },
  });

  // Create regular users
  const regularUsers = await Promise.all([
    prisma.user.create({
      data: {
        name: 'John Doe',
        email: 'john@example.com',
        password: await utils.hashPassword('Password123!'),
        role: UserRole.CUSTOMER,
        phone: '+1 (212) 555-5678',
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: await utils.hashPassword('Password123!'),
        role: UserRole.CUSTOMER,
        phone: '+1 (212) 555-9012',
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Artist Staff',
        email: 'artist@atelier7x.com',
        password: await utils.hashPassword('Password123!'),
        role: UserRole.STAFF,
        phone: '+1 (212) 555-3456',
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ Created ${regularUsers.length + 1} users!`);
  
  return adminUser;
}

async function seedCategories() {
  console.log('📁 Seeding blog categories...');
  
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Art Techniques',
        description: 'Discover various art techniques and methods',
        imageUrl: '/images/categories/techniques.jpg',
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Artist Spotlights',
        description: 'Learn about featured artists and their work',
        imageUrl: '/images/categories/artists.jpg',
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Art History',
        description: 'Articles about important art movements and history',
        imageUrl: '/images/categories/history.jpg',
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Exhibitions',
        description: 'News about our latest exhibitions and events',
        imageUrl: '/images/categories/exhibitions.jpg',
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ Created ${categories.length} blog categories!`);
  
  return categories;
}

async function seedProductCategories() {
  console.log('🛍️ Seeding product categories...');
  
  const productCategories = await Promise.all([
    prisma.productCategory.create({
      data: {
        name: 'Oil Paintings',
        description: 'Traditional oil paintings on canvas',
        imageUrl: '/images/product-categories/oil.jpg',
        isActive: true,
      },
    }),
    prisma.productCategory.create({
      data: {
        name: 'Watercolor',
        description: 'Delicate watercolor artworks',
        imageUrl: '/images/product-categories/watercolor.jpg',
        isActive: true,
      },
    }),
    prisma.productCategory.create({
      data: {
        name: 'Mixed Media',
        description: 'Artworks combining multiple techniques',
        imageUrl: '/images/product-categories/mixed-media.jpg',
        isActive: true,
      },
    }),
    prisma.productCategory.create({
      data: {
        name: 'Prints',
        description: 'Limited edition art prints',
        imageUrl: '/images/product-categories/prints.jpg',
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ Created ${productCategories.length} product categories!`);
  
  return productCategories;
}

async function seedProducts(authorId: string, categories: any[]) {
  console.log('🖼️ Seeding products...');
  
  const products = await Promise.all([
    // Oil Paintings
    prisma.product.create({
      data: {
        name: 'Sunset Horizon',
        description: 'A vibrant oil painting capturing a dramatic sunset over the ocean horizon. Painted with rich, warm colors that bring the scene to life.',
        price: 1200.00,
        sku: 'OIL-001',
        slug: 'sunset-horizon',
        categoryId: categories[0].id,
        imageUrl: '/images/products/sunset-horizon.jpg',
        stockQuantity: 1,
        isActive: true,
        tags: ['landscape', 'sunset', 'ocean'],
        authorId,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Mountain Serenity',
        description: 'A peaceful mountain landscape showing the majesty of nature. This oil painting uses subtle blues and greens to create a sense of calm.',
        price: 1500.00,
        sku: 'OIL-002',
        slug: 'mountain-serenity',
        categoryId: categories[0].id,
        imageUrl: '/images/products/mountain-serenity.jpg',
        stockQuantity: 1,
        isActive: true,
        tags: ['landscape', 'mountains', 'nature'],
        authorId,
      },
    }),
    
    // Watercolor
    prisma.product.create({
      data: {
        name: 'Spring Blossoms',
        description: 'Delicate watercolor painting of cherry blossoms in spring. Light and airy brushwork captures the essence of these fleeting flowers.',
        price: 850.00,
        sku: 'WC-001',
        slug: 'spring-blossoms',
        categoryId: categories[1].id,
        imageUrl: '/images/products/spring-blossoms.jpg',
        stockQuantity: 1,
        isActive: true,
        tags: ['flowers', 'spring', 'nature'],
        authorId,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Coastal Village',
        description: 'A charming watercolor painting depicting a small coastal village with boats and cottages. The transparent quality of watercolor creates a dreamy atmosphere.',
        price: 950.00,
        sku: 'WC-002',
        slug: 'coastal-village',
        categoryId: categories[1].id,
        imageUrl: '/images/products/coastal-village.jpg',
        stockQuantity: 1,
        isActive: true,
        tags: ['seascape', 'village', 'coastal'],
        authorId,
      },
    }),
    
    // Mixed Media
    prisma.product.create({
      data: {
        name: 'Urban Textures',
        description: 'A dynamic mixed media artwork combining acrylic paint, collage elements, and ink to create an abstract representation of urban landscapes.',
        price: 1800.00,
        sku: 'MM-001',
        slug: 'urban-textures',
        categoryId: categories[2].id,
        imageUrl: '/images/products/urban-textures.jpg',
        stockQuantity: 1,
        isActive: true,
        tags: ['abstract', 'urban', 'contemporary'],
        authorId,
      },
    }),
    
    // Prints
    prisma.product.create({
      data: {
        name: 'Autumn Forest - Limited Edition Print',
        description: 'Limited edition print (25/100) of an autumn forest scene. Printed on archival paper with light-fast inks.',
        price: 250.00,
        sku: 'PRT-001',
        slug: 'autumn-forest-print',
        categoryId: categories[3].id,
        imageUrl: '/images/products/autumn-forest-print.jpg',
        stockQuantity: 25,
        isActive: true,
        tags: ['print', 'forest', 'autumn', 'limited edition'],
        authorId,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Abstract Composition - Open Edition Print',
        description: 'Open edition print of a vibrant abstract composition. High quality reproduction on premium paper.',
        price: 120.00,
        sku: 'PRT-002',
        slug: 'abstract-composition-print',
        categoryId: categories[3].id,
        imageUrl: '/images/products/abstract-composition-print.jpg',
        stockQuantity: 50,
        isActive: true,
        tags: ['print', 'abstract', 'colorful', 'open edition'],
        authorId,
      },
    }),
  ]);

  console.log(`✅ Created ${products.length} products!`);
  
  return products;
}

async function seedAddresses(userId: string) {
  console.log('📍 Seeding addresses...');
  
  const addresses = await Promise.all([
    prisma.address.create({
      data: {
        userId,
        firstName: 'Admin',
        lastName: 'User',
        address1: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'United States',
        phone: '+1 (212) 555-1234',
        isDefault: true,
        type: 'HOME',
      },
    }),
    prisma.address.create({
      data: {
        userId,
        firstName: 'Admin',
        lastName: 'User',
        company: 'Atelier 7X Gallery',
        address1: '456 Art Street',
        address2: 'Suite 789',
        city: 'New York',
        state: 'NY',
        zipCode: '10002',
        country: 'United States',
        phone: '+1 (212) 555-5678',
        isDefault: false,
        type: 'WORK',
      },
    }),
  ]);

  console.log(`✅ Created ${addresses.length} addresses!`);
  
  return addresses;
}

async function seedOrders(userId: string, addressId: string) {
  console.log('🛒 Seeding orders...');
  
  const orders = await Promise.all([
    prisma.order.create({
      data: {
        userId,
        addressId,
        customerName: 'Admin User',
        customerEmail: 'admin@atelier7x.com',
        customerPhone: '+1 (212) 555-1234',
        shippingAddress: '123 Main Street, New York, NY 10001',
        totalAmount: 1450.00,
        status: 'DELIVERED',
        notes: 'Handle with care, fragile artwork',
      },
    }),
    prisma.order.create({
      data: {
        userId,
        addressId,
        customerName: 'Admin User',
        customerEmail: 'admin@atelier7x.com',
        customerPhone: '+1 (212) 555-1234',
        shippingAddress: '123 Main Street, New York, NY 10001',
        totalAmount: 950.00,
        status: 'PROCESSING',
        notes: 'Gift wrap requested',
      },
    }),
  ]);

  console.log(`✅ Created ${orders.length} orders!`);
  
  return orders;
}

async function seedOrderItems(orders: any[], products: any[]) {
  console.log('📦 Seeding order items...');
  
  const orderItems = await Promise.all([
    // Items for first order
    prisma.orderItem.create({
      data: {
        orderId: orders[0].id,
        productId: products[0].id,
        quantity: 1,
        price: 1200.00,
      },
    }),
    prisma.orderItem.create({
      data: {
        orderId: orders[0].id,
        productId: products[5].id,
        quantity: 1,
        price: 250.00,
      },
    }),
    
    // Items for second order
    prisma.orderItem.create({
      data: {
        orderId: orders[1].id,
        productId: products[2].id,
        quantity: 1,
        price: 850.00,
      },
    }),
    prisma.orderItem.create({
      data: {
        orderId: orders[1].id,
        productId: products[6].id,
        quantity: 1,
        price: 120.00,
      },
    }),
  ]);

  console.log(`✅ Created ${orderItems.length} order items!`);
}

async function seedBlogPosts(authorId: string, categoryId: string) {
  console.log('📝 Seeding blog posts...');
  
  const blogPosts = await Promise.all([
    prisma.blogPost.create({
      data: {
        title: 'Mastering Oil Painting Techniques',
        content: `
# Mastering Oil Painting Techniques

Oil painting is one of the most versatile and rewarding art forms, with a rich history dating back to the Renaissance. In this comprehensive guide, we'll explore some fundamental techniques that can help both beginners and intermediate artists improve their oil painting skills.

## Essential Materials

Before diving into techniques, it's important to have the right materials:

- **Paints**: Start with a basic palette of colors including titanium white, cadmium yellow, cadmium red, alizarin crimson, ultramarine blue, pthalo blue, yellow ochre, and burnt umber.
- **Brushes**: A variety of sizes and shapes including filberts, rounds, flats, and a fan brush.
- **Canvas**: Primed canvas or panels provide the ideal surface.
- **Medium**: Linseed oil or an alkyd medium to mix with your paints.
- **Palette**: A wooden palette or glass surface for mixing colors.
- **Palette Knife**: For mixing and applying paint.

## Foundational Techniques

### 1. Fat Over Lean

One of the most important principles in oil painting is to apply "fat" layers over "lean" layers. This means:

- Start with thinner paint (mixed with solvent)
- Gradually use less solvent and more medium in successive layers
- Final layers should be the most oil-rich

This prevents cracking as the painting dries and ages.

### 2. Underpainting

A monochromatic underpainting establishes values and composition before adding color. Many masters used this technique to create a solid foundation for their paintings.

### 3. Glazing

Glazing involves applying thin, transparent layers of paint over dry layers beneath. This creates luminosity and depth that's difficult to achieve with opaque painting alone.

### 4. Impasto

This technique uses thick, textured applications of paint, often applied with a palette knife or stiff brush. It creates physical dimension and catches light in interesting ways.

## Advanced Techniques

As you progress, explore techniques like:

- **Alla Prima**: Wet-on-wet painting, completing a work in one session
- **Scumbling**: Applying a thin layer of opaque paint over a darker layer
- **Sgraffito**: Scratching through wet paint to reveal colors underneath

Remember that mastering oil painting is a lifelong journey. Even the greatest artists were constantly learning and evolving their techniques.

Join us next month for our workshop on landscape oil painting techniques!
`,
        excerpt: 'Learn the fundamental techniques that can transform your oil painting skills, from understanding materials to mastering advanced methods.',
        slug: 'mastering-oil-painting-techniques',
        authorId,
        isPublished: true,
        publishDate: new Date(),
        imageUrl: '/images/blog/oil-painting-techniques.jpg',
        tags: ['tutorial', 'oil painting', 'techniques', 'art education'],
        views: 342,
        categoryId,
      },
    }),
    prisma.blogPost.create({
      data: {
        title: 'Artist Spotlight: Emma Richardson',
        content: `
# Artist Spotlight: Emma Richardson

In this month's artist spotlight, we're thrilled to introduce Emma Richardson, a contemporary abstract artist whose bold use of color and dynamic compositions have earned critical acclaim in galleries across Europe and North America.

## Early Life and Influences

Born in Bristol, UK in 1983, Emma showed an early aptitude for art, filling sketchbooks with observations of the urban landscape around her. She studied Fine Art at Central Saint Martins in London, where she was heavily influenced by the abstract expressionists, particularly the work of Helen Frankenthaler and Joan Mitchell.

"Those women showed me that abstract art could be both powerful and deeply personal," Emma explains. "Their courage to express emotion through non-representational forms gave me permission to find my own visual language."

## Artistic Evolution

Emma's early work consisted primarily of small-scale mixed media pieces that explored texture and geometric forms. However, a residency in Barcelona in 2015 marked a significant shift in her practice.

"Something about the Mediterranean light and the architectural rhythms of Barcelona unlocked something in me," she reflects. "I started working much larger, with more gestural marks and a bolder color palette."

This period produced her breakthrough "Urban Symphony" series, which caught the attention of critics and collectors alike.

## Technique and Process

Emma's current work begins with extensive color studies and compositional sketches. She works primarily in acrylics and oils, often incorporating collage elements and occasionally metallic leaf.

"I build my paintings in layers," she explains. "Each layer is a response to what came before. It's a conversation between what I intend and what the painting wants to become."

This intuitive approach results in works that feel both carefully considered and spontaneous, with unexpected color relationships and compositional tensions that draw viewers in.

## Current Exhibition

We're honored to be hosting Emma's latest exhibition, "Chromatic Dialogues," at Atelier 7X from September 5-30, 2025. The show features fifteen new large-scale canvases that represent her most ambitious work to date.

"These paintings explore how colors interact in ways that parallel human relationships," Emma says. "There's harmony and conflict, dominance and submission, moments of surprise and moments of deep resonance."

The exhibition opening will be held on September 5th from 6-9pm, with an artist talk scheduled for September 12th at 2pm. We hope you'll join us for this exceptional opportunity to experience Emma Richardson's vibrant, thought-provoking work and meet the artist in person.
`,
        excerpt: 'Discover the bold, colorful world of abstract artist Emma Richardson, whose work explores the emotional power of color and composition.',
        slug: 'artist-spotlight-emma-richardson',
        authorId,
        isPublished: true,
        publishDate: new Date(),
        imageUrl: '/images/blog/emma-richardson.jpg',
        tags: ['artist spotlight', 'abstract art', 'contemporary', 'exhibition'],
        views: 185,
        categoryId,
      },
    }),
    prisma.blogPost.create({
      data: {
        title: 'The Enduring Influence of Impressionism',
        content: `
# The Enduring Influence of Impressionism

More than 150 years after its emergence, Impressionism continues to captivate audiences and influence contemporary artists. What is it about this revolutionary 19th-century movement that remains so relevant and beloved today?

## A Revolution in Art History

When a group of Paris-based artists including Claude Monet, Pierre-Auguste Renoir, Edgar Degas, and Camille Pissarro began exhibiting together in the 1870s, they were met with harsh criticism. Their loose brushwork, emphasis on light and its changing qualities, and everyday subject matter represented a radical departure from the polished, academic style that dominated French art at the time.

The name "Impressionism" itself began as a criticism. After seeing Monet's "Impression, Sunrise" (1872), art critic Louis Leroy mockingly coined the term to ridicule what he perceived as unfinished, sketchy work. Little did he know that he was naming a movement that would transform the course of Western art.

## Key Characteristics of Impressionism

What defined this groundbreaking approach to painting?

- **Visible brushstrokes**: Impressionists abandoned the smooth, invisible brushwork of academic painting in favor of distinct, visible strokes that captured the vitality of the scene.

- **Emphasis on light and color**: Rather than mixing colors on the palette, many Impressionists placed distinct colors side by side on the canvas, allowing the viewer's eye to blend them optically.

- **Plein air painting**: Working outdoors to capture changing light effects directly from nature was central to the Impressionist approach.

- **Contemporary subject matter**: Instead of historical or mythological scenes, Impressionists painted modern life—café scenes, landscapes with railways, and leisure activities of ordinary people.

- **Capturing moments**: As the name suggests, Impressionism sought to convey the impression of a moment, the fleeting effects of light and atmosphere rather than detailed, finished compositions.

## The Lasting Legacy

The influence of Impressionism extends far beyond the movement itself. Here are just a few ways its impact continues to be felt:

### 1. Liberation of Color

By freeing color from its purely descriptive function, Impressionism paved the way for the even more radical color experiments of Post-Impressionism, Fauvism, and eventually abstract art. Today's artists still explore these possibilities.

### 2. Focus on Personal Perception

The Impressionist emphasis on individual visual experience—painting what one sees rather than what one knows—reinforced the idea that art is about personal interpretation. This concept remains central to contemporary art.

### 3. Democratization of Subject Matter

By finding beauty in everyday scenes and ordinary people, Impressionists expanded what was considered worthy of artistic attention. This legacy continues in much of today's art, which often finds profound meaning in the commonplace.

### 4. Technical Freedom

The Impressionists' willingness to break established rules about finish and technique gave permission to later generations to experiment with new approaches to making art. Their technical innovations ripple through art history to the present day.

## Contemporary Artists Inspired by Impressionism

Many contemporary artists continue to draw inspiration from Impressionist approaches while adapting them to 21st-century concerns. From Richard Schmid's vibrant plein air paintings to Lois Griffel's colorist landscapes, the spirit of Impressionism lives on.

Even artists working in non-traditional media often cite Impressionist influences in their approach to light, color relationships, and capturing ephemeral moments.

## Experience Impressionism Today

At Atelier 7X, we regularly feature works by contemporary artists who engage with the Impressionist legacy in fresh, innovative ways. We invite you to visit our gallery to experience how this revolutionary 19th-century movement continues to inspire exciting new art in our time.

Our upcoming exhibition, "New Impressions," opening November 10, 2025, will showcase five contemporary artists whose work demonstrates the enduring relevance of Impressionist principles.
`,
        excerpt: 'Explore how the revolutionary Impressionist movement of the 1870s continues to influence and inspire artists and captivate audiences over 150 years later.',
        slug: 'enduring-influence-impressionism',
        authorId,
        isPublished: true,
        publishDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        imageUrl: '/images/blog/impressionism.jpg',
        tags: ['art history', 'impressionism', 'art movements', 'influence'],
        views: 276,
        categoryId,
      },
    }),
  ]);

  console.log(`✅ Created ${blogPosts.length} blog posts!`);
  
  return blogPosts;
}

async function seedComments(userId: string, blogPostId: string) {
  console.log('💬 Seeding comments...');
  
  const parentComment = await prisma.comment.create({
    data: {
      content: "This is such a helpful article! I've been struggling with the 'fat over lean' principle, and your explanation really clarified it for me. Looking forward to trying these techniques in my next painting.",
      authorId: userId,
      blogPostId,
      isApproved: true,
    },
  });
  
  const replyComment = await prisma.comment.create({
    data: {
      content: "Thank you for your kind words! Don't hesitate to share your results with us - we'd love to see how you apply these techniques.",
      authorId: userId,
      blogPostId,
      parentId: parentComment.id,
      isApproved: true,
    },
  });
  
  // Create likes for the comments
  await Promise.all([
    prisma.like.create({
      data: {
        userId,
        commentId: parentComment.id,
      },
    }),
    prisma.like.create({
      data: {
        userId,
        blogPostId,
      },
    }),
  ]);

  // Update comment count on blog post
  await prisma.blogPost.update({
    where: { id: blogPostId },
    data: {
      commentCount: 2,
      likeCount: 1,
    },
  });

  console.log(`✅ Created comments and likes!`);
}

async function seedFiles(userId: string) {
  console.log('📄 Seeding files...');
  
  const rootFolder = await prisma.file.create({
    data: {
      name: 'Gallery Images',
      originalName: 'Gallery Images',
      fileName: 'gallery-images',
      path: '/files/gallery-images',
      url: '/files/gallery-images',
      mimeType: 'folder',
      type: 'folder',
      uploadedById: userId,
      isPublic: true,
    },
  });
  
  const artworksFolder = await prisma.file.create({
    data: {
      name: 'Artworks',
      originalName: 'Artworks',
      fileName: 'artworks',
      path: '/files/gallery-images/artworks',
      url: '/files/gallery-images/artworks',
      mimeType: 'folder',
      type: 'folder',
      uploadedById: userId,
      parentId: rootFolder.id,
      isPublic: true,
    },
  });
  
  const files = await Promise.all([
    prisma.file.create({
      data: {
        name: 'Sunset Horizon',
        originalName: 'sunset-horizon.jpg',
        fileName: 'sunset-horizon',
        path: '/files/gallery-images/artworks/sunset-horizon.jpg',
        url: '/images/products/sunset-horizon.jpg',
        mimeType: 'image/jpeg',
        size: 2048576, // 2MB
        type: 'file',
        uploadedById: userId,
        parentId: artworksFolder.id,
        isPublic: true,
        tags: ['oil painting', 'landscape', 'featured'],
        description: 'A vibrant oil painting capturing a dramatic sunset over the ocean horizon.',
      },
    }),
    prisma.file.create({
      data: {
        name: 'Spring Blossoms',
        originalName: 'spring-blossoms.jpg',
        fileName: 'spring-blossoms',
        path: '/files/gallery-images/artworks/spring-blossoms.jpg',
        url: '/images/products/spring-blossoms.jpg',
        mimeType: 'image/jpeg',
        size: 1548576, // 1.5MB
        type: 'file',
        uploadedById: userId,
        parentId: artworksFolder.id,
        isPublic: true,
        tags: ['watercolor', 'flowers', 'spring'],
        description: 'Delicate watercolor painting of cherry blossoms in spring.',
      },
    }),
  ]);

  console.log(`✅ Created folder structure and ${files.length} files!`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
