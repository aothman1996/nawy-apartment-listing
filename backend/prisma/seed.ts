import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleApartments = [
  // Marina Heights Project - Apartments
  {
    unitName: 'Sky Penthouse Apartment',
    unitNumber: 'AP-001',
    project: 'Marina Heights',
    price: 2500000,
    bedrooms: 4,
    bathrooms: 3,
    areaSqft: 3500,
    location: 'Dubai Marina',
    description: 'Stunning penthouse apartment with panoramic views of the Arabian Gulf. Features modern design, premium finishes, and private terrace.',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
      'https://images.unsplash.com/photo-1600566753190-17f63ba8013e?w=800'
    ],
    amenities: ['Swimming Pool', 'Gym', 'Concierge', 'Parking', 'Balcony', 'Sea View'],
    isAvailable: true
  },
  {
    unitName: 'Marina View Apartment',
    unitNumber: 'AP-002',
    project: 'Marina Heights',
    price: 1800000,
    bedrooms: 3,
    bathrooms: 2,
    areaSqft: 2200,
    location: 'Dubai Marina',
    description: 'Modern apartment with stunning marina views and contemporary finishes.',
    images: [
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800',
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800'
    ],
    amenities: ['Swimming Pool', 'Gym', 'Concierge', 'Parking', 'Balcony', 'Marina View'],
    isAvailable: true
  },
  {
    unitName: 'Executive Apartment',
    unitNumber: 'AP-003',
    project: 'Marina Heights',
    price: 1200000,
    bedrooms: 2,
    bathrooms: 2,
    areaSqft: 1500,
    location: 'Dubai Marina',
    description: 'Executive apartment with modern amenities and excellent connectivity.',
    images: [
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&h=600&fit=crop'
    ],
    amenities: ['Swimming Pool', 'Gym', 'Concierge', 'Parking', 'City View'],
    isAvailable: false
  },

  // Palm Jumeirah Villas Project - Villas
  {
    unitName: 'Ocean Villa',
    unitNumber: 'VILLA-001',
    project: 'Palm Jumeirah Villas',
    price: 5000000,
    bedrooms: 5,
    bathrooms: 4,
    areaSqft: 5000,
    location: 'Palm Jumeirah',
    description: 'Exclusive villa on the iconic Palm Jumeirah with private beach access and stunning ocean views.',
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
      'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800'
    ],
    amenities: ['Private Beach', 'Swimming Pool', 'Garden', 'Parking', 'Security', 'Beach Access'],
    isAvailable: true
  },
  {
    unitName: 'Beachfront Villa',
    unitNumber: 'VILLA-002',
    project: 'Palm Jumeirah Villas',
    price: 4500000,
    bedrooms: 4,
    bathrooms: 4,
    areaSqft: 4200,
    location: 'Palm Jumeirah',
    description: 'Luxurious beachfront villa with direct beach access and panoramic sea views.',
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
      'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800'
    ],
    amenities: ['Private Beach', 'Swimming Pool', 'Garden', 'Parking', 'Security', 'Beach Access', 'Rooftop Terrace'],
    isAvailable: true
  },
  {
    unitName: 'Garden Villa',
    unitNumber: 'VILLA-003',
    project: 'Palm Jumeirah Villas',
    price: 3800000,
    bedrooms: 4,
    bathrooms: 3,
    areaSqft: 3800,
    location: 'Palm Jumeirah',
    description: 'Spacious villa with private garden and modern amenities in a prime location.',
    images: [
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&h=600&fit=crop'
    ],
    amenities: ['Private Garden', 'Swimming Pool', 'Parking', 'Security', 'Gym'],
    isAvailable: false
  },

  // Dubai Hills Project - Mixed
  {
    unitName: 'Golf View Apartment',
    unitNumber: 'AP-101',
    project: 'Dubai Hills',
    price: 1800000,
    bedrooms: 3,
    bathrooms: 3,
    areaSqft: 1800,
    location: 'Dubai Hills Estate',
    description: 'Luxury apartment in Dubai Hills with golf course views and premium finishes throughout.',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
      'https://images.unsplash.com/photo-1600566753190-17f63ba8013e?w=800'
    ],
    amenities: ['Golf Course View', 'Swimming Pool', 'Gym', 'Concierge', 'Parking', 'Garden'],
    isAvailable: false
  },
  {
    unitName: 'Hillside Villa',
    unitNumber: 'VILLA-101',
    project: 'Dubai Hills',
    price: 2200000,
    bedrooms: 4,
    bathrooms: 3,
    areaSqft: 2500,
    location: 'Dubai Hills Estate',
    description: 'Beautiful hillside villa with golf course views and modern amenities.',
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
      'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800'
    ],
    amenities: ['Golf Course View', 'Swimming Pool', 'Garden', 'Parking', 'Security', 'Gym'],
    isAvailable: true
  },
  {
    unitName: 'Garden Apartment',
    unitNumber: 'AP-102',
    project: 'Dubai Hills',
    price: 1400000,
    bedrooms: 2,
    bathrooms: 2,
    areaSqft: 1200,
    location: 'Dubai Hills Estate',
    description: 'Cozy apartment with garden views and family-friendly amenities.',
    images: [
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&h=600&fit=crop'
    ],
    amenities: ['Garden View', 'Swimming Pool', 'Gym', 'Parking', 'Playground'],
    isAvailable: true
  },
  
  // Executive Properties
  {
    unitName: 'Executive Suite',
    unitNumber: 'EX-301',
    project: 'Business Bay Towers',
    price: 1200000,
    bedrooms: 2,
    bathrooms: 2,
    areaSqft: 1200,
    location: 'Business Bay',
    description: 'Executive apartment with modern amenities and excellent connectivity to business districts.',
    images: [
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800',
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800'
    ],
    amenities: ['Gym', 'Concierge', 'Parking', 'Business Center', 'City View'],
    isAvailable: true
  },
  {
    unitName: 'Corporate Apartment',
    unitNumber: 'CA-205',
    project: 'DIFC Towers',
    price: 950000,
    bedrooms: 2,
    bathrooms: 2,
    areaSqft: 1100,
    location: 'DIFC',
    description: 'Modern corporate apartment in the heart of Dubai International Financial Centre.',
    images: [
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800',
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800'
    ],
    amenities: ['Gym', 'Concierge', 'Parking', 'Business Center', 'City View', 'High-Speed Internet'],
    isAvailable: true
  },
  
  // Family Properties
  {
    unitName: 'Family Villa',
    unitNumber: 'FV-089',
    project: 'Arabian Ranches',
    price: 2200000,
    bedrooms: 4,
    bathrooms: 3,
    areaSqft: 2800,
    location: 'Arabian Ranches',
    description: 'Spacious family home in a gated community with excellent schools and recreational facilities.',
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
      'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800'
    ],
    amenities: ['Garden', 'Swimming Pool', 'Gym', 'Parking', 'Security', 'Playground'],
    isAvailable: true
  },
  {
    unitName: 'Cozy Family Home',
    unitNumber: 'CF-108',
    project: 'Jumeirah Village',
    price: 750000,
    bedrooms: 2,
    bathrooms: 2,
    areaSqft: 950,
    location: 'Jumeirah Village Circle',
    description: 'Cozy and comfortable apartment in a family-friendly community with excellent amenities.',
    images: [
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&h=600&fit=crop'
    ],
    amenities: ['Swimming Pool', 'Gym', 'Playground', 'Parking', 'Garden'],
    isAvailable: true
  },
  {
    unitName: 'Suburban Villa',
    unitNumber: 'SV-156',
    project: 'Dubai Hills',
    price: 1600000,
    bedrooms: 3,
    bathrooms: 3,
    areaSqft: 2000,
    location: 'Dubai Hills Estate',
    description: 'Beautiful suburban villa with modern design and family-friendly amenities.',
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
      'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800'
    ],
    amenities: ['Garden', 'Swimming Pool', 'Gym', 'Parking', 'Security', 'Playground'],
    isAvailable: true
  },
  
  // Studio & 1-Bedroom Properties
  {
    unitName: 'Modern Studio',
    unitNumber: 'ST-205',
    project: 'Downtown Living',
    price: 450000,
    bedrooms: 1,
    bathrooms: 1,
    areaSqft: 650,
    location: 'Downtown Dubai',
    description: 'Contemporary studio apartment in the heart of Downtown Dubai. Perfect for young professionals.',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800'
    ],
    amenities: ['Gym', 'Concierge', 'Parking', 'City View'],
    isAvailable: true
  },
  {
    unitName: 'Compact Studio',
    unitNumber: 'CS-156',
    project: 'City Center',
    price: 350000,
    bedrooms: 1,
    bathrooms: 1,
    areaSqft: 450,
    location: 'Deira',
    description: 'Compact and affordable studio apartment in the bustling Deira area.',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'
    ],
    amenities: ['Concierge', 'Parking', 'City View'],
    isAvailable: true
  },
  {
    unitName: 'Urban Studio',
    unitNumber: 'US-301',
    project: 'JBR Towers',
    price: 550000,
    bedrooms: 1,
    bathrooms: 1,
    areaSqft: 750,
    location: 'JBR',
    description: 'Stylish urban studio with beach access and modern amenities.',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800'
    ],
    amenities: ['Beach Access', 'Gym', 'Concierge', 'Parking', 'Sea View'],
    isAvailable: true
  },
  {
    unitName: 'Minimalist Studio',
    unitNumber: 'MS-408',
    project: 'Design District',
    price: 420000,
    bedrooms: 1,
    bathrooms: 1,
    areaSqft: 580,
    location: 'Dubai Design District',
    description: 'Minimalist studio with clean lines and modern design in the creative district.',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'
    ],
    amenities: ['Gym', 'Concierge', 'Parking', 'City View', 'High-Speed Internet'],
    isAvailable: false
  },
  
  // 2-Bedroom Properties
  {
    unitName: 'Comfort Apartment',
    unitNumber: 'CA-502',
    project: 'Jumeirah Village',
    price: 680000,
    bedrooms: 2,
    bathrooms: 2,
    areaSqft: 850,
    location: 'Jumeirah Village Circle',
    description: 'Comfortable 2-bedroom apartment in a well-connected community.',
    images: [
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&h=600&fit=crop'
    ],
    amenities: ['Swimming Pool', 'Gym', 'Parking', 'Garden'],
    isAvailable: true
  },
  {
    unitName: 'City View Apartment',
    unitNumber: 'CV-609',
    project: 'Downtown Living',
    price: 850000,
    bedrooms: 2,
    bathrooms: 2,
    areaSqft: 1050,
    location: 'Downtown Dubai',
    description: '2-bedroom apartment with stunning city views and modern amenities.',
    images: [
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800',
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800'
    ],
    amenities: ['Gym', 'Concierge', 'Parking', 'City View', 'Balcony'],
    isAvailable: true
  },
  
  // 3-Bedroom Properties
  {
    unitName: 'Spacious Apartment',
    unitNumber: 'SA-701',
    project: 'Marina Heights',
    price: 1400000,
    bedrooms: 3,
    bathrooms: 3,
    areaSqft: 1600,
    location: 'Dubai Marina',
    description: 'Spacious 3-bedroom apartment with marina views and premium amenities.',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800'
    ],
    amenities: ['Marina View', 'Swimming Pool', 'Gym', 'Concierge', 'Parking', 'Balcony'],
    isAvailable: true
  },
  {
    unitName: 'Family Apartment',
    unitNumber: 'FA-803',
    project: 'Dubai Hills',
    price: 1250000,
    bedrooms: 3,
    bathrooms: 2,
    areaSqft: 1400,
    location: 'Dubai Hills Estate',
    description: 'Perfect family apartment with excellent community amenities.',
    images: [
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&h=600&fit=crop'
    ],
    amenities: ['Garden', 'Swimming Pool', 'Gym', 'Parking', 'Playground'],
    isAvailable: true
  },
  
  // 4+ Bedroom Properties
  {
    unitName: 'Grand Villa',
    unitNumber: 'GV-101',
    project: 'Emirates Hills',
    price: 3500000,
    bedrooms: 4,
    bathrooms: 4,
    areaSqft: 3200,
    location: 'Emirates Hills',
    description: 'Grand villa in Emirates Hills with private garden and premium finishes.',
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
      'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800'
    ],
    amenities: ['Private Garden', 'Swimming Pool', 'Gym', 'Parking', 'Security', 'Maid Room'],
    isAvailable: true
  },
  {
    unitName: 'Mansion',
    unitNumber: 'MN-001',
    project: 'Palm Jumeirah',
    price: 8000000,
    bedrooms: 6,
    bathrooms: 5,
    areaSqft: 6000,
    location: 'Palm Jumeirah',
    description: 'Luxurious mansion on Palm Jumeirah with private beach and stunning ocean views.',
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
      'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800'
    ],
    amenities: ['Private Beach', 'Swimming Pool', 'Garden', 'Parking', 'Security', 'Beach Access', 'Maid Room', 'Driver Room'],
    isAvailable: false
  }
];

async function main() {
  console.log('🌱 Starting database seeding...');
  console.log(`📊 Preparing to seed ${sampleApartments.length} apartments`);

  // Clear existing data
  await prisma.apartment.deleteMany({});
  console.log('🗑️  Cleared existing apartments');

  // Create sample apartments
  let created = 0;
  for (const apartment of sampleApartments) {
    await prisma.apartment.create({
      data: apartment
    });
    created++;
    if (created % 5 === 0 || created === sampleApartments.length) {
      console.log(`📝 Created ${created}/${sampleApartments.length} apartments...`);
    }
  }

  // Get statistics
  const totalApartments = await prisma.apartment.count();
  const availableApartments = await prisma.apartment.count({ where: { isAvailable: true } });
  const luxuryApartments = await prisma.apartment.count({ where: { price: { gte: 2000000 } } });
  const studioApartments = await prisma.apartment.count({ where: { bedrooms: 1 } });
  
  console.log('\n📈 Database Statistics:');
  console.log(`   Total Apartments: ${totalApartments}`);
  console.log(`   Available: ${availableApartments}`);
  console.log(`   Luxury (2M+): ${luxuryApartments}`);
  console.log(`   Studios: ${studioApartments}`);
  console.log('\n🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

