// Import browse cards images
import card1 from '../assets/images/Browse-Marketplace/card-1.png';
import card2 from '../assets/images/Browse-Marketplace/card-2.png';
import card3 from '../assets/images/Browse-Marketplace/card-3.png';
import card4 from '../assets/images/Browse-Marketplace/card-4.png';
import card5 from '../assets/images/Browse-Marketplace/card-5.png';
import card6 from '../assets/images/Browse-Marketplace/card-6.png';
import card7 from '../assets/images/Browse-Marketplace/card-7.png';
import card8 from '../assets/images/Browse-Marketplace/card-8.png';

// Import similar items images (previous images uploaded in Saved-Images)
import similarImg1 from '../assets/images/Saved-Images/saved-image3.png'; // bag
import similarImg2 from '../assets/images/Saved-Images/saved-image2.png'; // loafers/shoes
import similarImg3 from '../assets/images/Saved-Images/saved-image4.png'; // knitwear
import similarImg4 from '../assets/images/Saved-Images/saved-image6.png'; // earrings/jewelry

// Import storefront images
import storefront1 from '../assets/images/Seller-storefront/image1.png';
import storefront2 from '../assets/images/Seller-storefront/image2.png';
import storefront3 from '../assets/images/Seller-storefront/image3.png';
import storefront4 from '../assets/images/Seller-storefront/image4.png';
import storefront5 from '../assets/images/Seller-storefront/image5.png';
import storefront6 from '../assets/images/Seller-storefront/image6.png';
import storefront7 from '../assets/images/Seller-storefront/image7.png';
import storefront8 from '../assets/images/Seller-storefront/image8.png';

export const browseProducts = [
  {
    id: 1,
    title: '90s Oversized Denim Jacket',
    price: '$85.00',
    size: 'Size M',
    image: card1,
    wishlisted: false,
    category: 'Vintage',
    condition: 'Very Good',
    sustainability: 'High',
    description: 'An authentic 90s oversized denim jacket with light wash and vintage fading. Features durable metal buttons and classic chest pockets. Perfect for layering over sweaters or hoodies for a casual retro look.',
    seller: {
      name: 'RetroVibe Co.',
      rating: '4.8 (92)',
      location: 'Brooklyn, NY',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'
    },
    thumbnails: [
      { id: 1, name: 'Full View', transform: 'scale(1)', transformOrigin: 'center center' },
      { id: 2, name: 'Collar Detail', transform: 'scale(1.8)', transformOrigin: 'center 15%' },
      { id: 3, name: 'Embroidery Detail', transform: 'scale(2.2)', transformOrigin: 'center 50%' },
      { id: 4, name: 'Hem Detail', transform: 'scale(1.6)', transformOrigin: 'center 85%' }
    ]
  },
  {
    id: 2,
    title: 'Hand-Painted Italian Silk Scarf',
    price: '$120.00',
    size: 'One Size',
    image: card2,
    wishlisted: true,
    category: 'Luxury',
    condition: 'Excellent',
    sustainability: 'High',
    description: 'Exquisite hand-painted Italian silk scarf featuring vibrant colors and artistic patterns. Lightweight, luxurious feel. A perfect accessory to elevate any outfit, whether worn around the neck or styled on a handbag.',
    seller: {
      name: 'Luxury Curator',
      rating: '5.0 (48)',
      location: 'Los Angeles, CA',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150'
    },
    thumbnails: [
      { id: 1, name: 'Full View', transform: 'scale(1)', transformOrigin: 'center center' },
      { id: 2, name: 'Top Corner Pattern', transform: 'scale(1.8)', transformOrigin: '20% 20%' },
      { id: 3, name: 'Center Print', transform: 'scale(2.3)', transformOrigin: 'center center' },
      { id: 4, name: 'Bottom Corner Pattern', transform: 'scale(1.8)', transformOrigin: '80% 80%' }
    ]
  },
  {
    id: 3,
    title: 'Classic Mahogany Loafers',
    price: '$145.00',
    size: 'Size 9',
    image: card3,
    wishlisted: false,
    category: 'Shoes',
    condition: 'Excellent',
    sustainability: 'Medium',
    description: 'Timeless mahogany leather loafers. Handcrafted with fine stitching, classic strap overlay, and a polished finish. Fits comfortably and matches formal or smart-casual wear.',
    seller: {
      name: 'Dapper Finds',
      rating: '4.7 (15)',
      location: 'Chicago, IL',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150'
    },
    thumbnails: [
      { id: 1, name: 'Full View', transform: 'scale(1)', transformOrigin: 'center center' },
      { id: 2, name: 'Heel Structure', transform: 'scale(1.8)', transformOrigin: '25% 50%' },
      { id: 3, name: 'Strap Detail', transform: 'scale(2.2)', transformOrigin: '55% 45%' },
      { id: 4, name: 'Toe Polish', transform: 'scale(1.8)', transformOrigin: '80% 55%' }
    ]
  },
  {
    id: 4,
    title: 'Archival Camel Wool Overcoat',
    price: '$450.00',
    size: 'M / EU 48',
    image: card4,
    wishlisted: false,
    category: 'Outerwear',
    condition: 'Excellent',
    sustainability: 'High',
    description: 'A timeless piece from the early 90s. Hand-crafted wool from northern Italy. This coat has been professionally cleaned and maintained in a temperature-controlled archive. Features original horn buttons and a silk-blend lining. Perfect for a clean, minimalist silhouette.',
    seller: {
      name: "Elena's Archive",
      rating: '4.9 (124)',
      location: 'Milan, Italy',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150'
    },
    thumbnails: [
      { id: 1, name: 'Full View', transform: 'scale(1)', transformOrigin: 'center center' },
      { id: 2, name: 'Collar & Lapel', transform: 'scale(1.8)', transformOrigin: 'center 15%' },
      { id: 3, name: 'Button & Belt Detail', transform: 'scale(2.0)', transformOrigin: 'center 50%' },
      { id: 4, name: 'Bottom Hem Detail', transform: 'scale(1.6)', transformOrigin: 'center 85%' }
    ]
  },
  {
    id: 5,
    title: 'Retro Canvas Camera Bag',
    price: '$55.00',
    size: 'Accessory',
    image: card5,
    wishlisted: false,
    category: 'Accessories',
    condition: 'Good',
    sustainability: 'Medium',
    description: 'Vintage canvas camera bag with leather straps and multiple compartments. Durable and water-resistant. Holds a DSLR camera, lenses, and extra accessories.',
    seller: {
      name: 'Analog Gear',
      rating: '4.6 (38)',
      location: 'Portland, OR',
      avatar: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&q=80&w=150'
    },
    thumbnails: [
      { id: 1, name: 'Full View', transform: 'scale(1)', transformOrigin: 'center center' },
      { id: 2, name: 'Leather Clasp', transform: 'scale(2.0)', transformOrigin: 'center 45%' },
      { id: 3, name: 'Strap Buckle', transform: 'scale(1.8)', transformOrigin: '20% 40%' },
      { id: 4, name: 'Side Pocket', transform: 'scale(1.7)', transformOrigin: '85% 65%' }
    ]
  },
  {
    id: 6,
    title: 'Gold Rim Aviator Sunglasses',
    price: '$40.00',
    size: 'One Size',
    image: card6,
    wishlisted: false,
    category: 'Accessories',
    condition: 'Very Good',
    sustainability: 'Medium',
    description: 'Classic gold rim aviator sunglasses with polarized green lenses. UV protection. Sturdy metal frame with comfortable nose pads.',
    seller: {
      name: 'Shade Shop',
      rating: '4.9 (53)',
      location: 'Miami, FL',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150'
    },
    thumbnails: [
      { id: 1, name: 'Full View', transform: 'scale(1)', transformOrigin: 'center center' },
      { id: 2, name: 'Left Frame Hinge', transform: 'scale(2.0)', transformOrigin: '30% 50%' },
      { id: 3, name: 'Nose Bridge Detail', transform: 'scale(2.4)', transformOrigin: 'center center' },
      { id: 4, name: 'Temple Tip Detail', transform: 'scale(1.8)', transformOrigin: '75% 50%' }
    ]
  },
  {
    id: 7,
    title: 'Checked Mohair Knit Sweater',
    price: '$95.00',
    size: 'Size S',
    image: card7,
    wishlisted: false,
    category: 'Knitwear',
    condition: 'Excellent',
    sustainability: 'High',
    description: 'Soft mohair knit sweater in a green and cream checked pattern. Cozy, lightweight yet warm. Features a relaxed fit with ribbed neck, cuffs, and hem.',
    seller: {
      name: 'Cozy Knits',
      rating: '4.8 (81)',
      location: 'Seattle, WA',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150'
    },
    thumbnails: [
      { id: 1, name: 'Full View', transform: 'scale(1)', transformOrigin: 'center center' },
      { id: 2, name: 'Ribbed Neckline', transform: 'scale(1.8)', transformOrigin: 'center 15%' },
      { id: 3, name: 'Knit Pattern Detail', transform: 'scale(2.2)', transformOrigin: 'center 50%' },
      { id: 4, name: 'Cuff & Hem Ribbing', transform: 'scale(1.7)', transformOrigin: 'center 85%' }
    ]
  },
  {
    id: 8,
    title: 'Vintage Heirloom Watch',
    price: '$320.00',
    size: 'Excellent',
    image: card8,
    wishlisted: false,
    category: 'Accessories',
    condition: 'Excellent',
    sustainability: 'High',
    description: 'Classic gold-plated heirloom watch with a black leather band. Mechanical movement, hand-winding. Keeps time perfectly. A true collector\'s piece.',
    seller: {
      name: 'Time Keepers',
      rating: '5.0 (29)',
      location: 'Boston, MA',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150'
    },
    thumbnails: [
      { id: 1, name: 'Full View', transform: 'scale(1)', transformOrigin: 'center center' },
      { id: 2, name: 'Watch Dial Detail', transform: 'scale(2.2)', transformOrigin: 'center 42%' },
      { id: 3, name: 'Golden Bezel Profile', transform: 'scale(1.9)', transformOrigin: 'center 55%' },
      { id: 4, name: 'Leather Band Stitching', transform: 'scale(1.7)', transformOrigin: 'center 85%' }
    ]
  }
];

export const similarProducts = [
  {
    id: 101,
    title: 'Pebbled Leather Bag',
    price: '$320',
    size: 'One Size',
    image: similarImg1,
    wishlisted: false,
    category: 'Lemaire',
    thumbnails: [
      { id: 1, name: 'Full View', transform: 'scale(1)', transformOrigin: 'center center' },
      { id: 2, name: 'Stitch Detail', transform: 'scale(1.8)', transformOrigin: '50% 30%' },
      { id: 3, name: 'Texture Detail', transform: 'scale(2.2)', transformOrigin: 'center center' },
      { id: 4, name: 'Bottom Edge', transform: 'scale(1.6)', transformOrigin: '50% 80%' }
    ]
  },
  {
    id: 102,
    title: '1953 Horsebit Loafer',
    price: '$285',
    size: 'Size 9',
    image: similarImg2,
    wishlisted: true,
    category: 'Gucci',
    thumbnails: [
      { id: 1, name: 'Full View', transform: 'scale(1)', transformOrigin: 'center center' },
      { id: 2, name: 'Heel Structure', transform: 'scale(1.8)', transformOrigin: '30% 50%' },
      { id: 3, name: 'Metal Horsebit Detail', transform: 'scale(2.2)', transformOrigin: '60% 45%' },
      { id: 4, name: 'Toe Polish', transform: 'scale(1.7)', transformOrigin: '80% 50%' }
    ]
  },
  {
    id: 103,
    title: 'Icelandic Wool Knit',
    price: '$115',
    size: 'Size M',
    image: similarImg3,
    wishlisted: false,
    category: 'Handmade',
    thumbnails: [
      { id: 1, name: 'Full View', transform: 'scale(1)', transformOrigin: 'center center' },
      { id: 2, name: 'Neckline Trim', transform: 'scale(1.8)', transformOrigin: 'center 15%' },
      { id: 3, name: 'Wool Knit Detail', transform: 'scale(2.3)', transformOrigin: 'center center' },
      { id: 4, name: 'Bottom Ribbing', transform: 'scale(1.6)', transformOrigin: 'center 85%' }
    ]
  },
  {
    id: 104,
    title: 'Knot Hoop Earrings',
    price: '$210',
    size: 'One Size',
    image: similarImg4,
    wishlisted: false,
    category: 'Celine',
    thumbnails: [
      { id: 1, name: 'Full View', transform: 'scale(1)', transformOrigin: 'center center' },
      { id: 2, name: 'Gold Knot Detail', transform: 'scale(2.0)', transformOrigin: '65% 55%' },
      { id: 3, name: 'Polished Rim Detail', transform: 'scale(2.3)', transformOrigin: '55% 50%' },
      { id: 4, name: 'Ear clasp Close-Up', transform: 'scale(1.8)', transformOrigin: '50% 25%' }
    ]
  }
];

export const storefrontProducts = [
  {
    id: 201,
    title: '90s Archival Silk Slip Dress',
    price: '£145',
    size: 'Size S',
    image: storefront1,
    badge: 'VINTAGE',
    wishlisted: false,
    category: 'Outerwear',
    condition: 'Excellent',
    sustainability: 'High',
    description: 'Beautiful 90s silk slip dress in a sleek fluid silhouette. Adjustable straps, perfect lightweight drape. A timeless classic.',
    seller: {
      name: 'CuratedByElena',
      rating: '4.9 (124)',
      location: 'London, UK',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150'
    },
    thumbnails: [
      { id: 1, name: 'Full View', transform: 'scale(1)', transformOrigin: 'center center' },
      { id: 2, name: 'Strap Close-Up', transform: 'scale(1.8)', transformOrigin: 'center 20%' },
      { id: 3, name: 'Silk Texture Detail', transform: 'scale(2.2)', transformOrigin: 'center 50%' },
      { id: 4, name: 'Hem Stitching', transform: 'scale(1.6)', transformOrigin: 'center 85%' }
    ]
  },
  {
    id: 202,
    title: 'Wide Leg Tailored Trousers',
    price: '£85',
    size: 'Size M',
    image: storefront2,
    wishlisted: false,
    category: 'Luxury',
    condition: 'Very Good',
    sustainability: 'High',
    description: 'High-waisted tailored trousers featuring wide legs and crisp pleats. Lightweight wool-blend fabric with beautiful structure.',
    seller: {
      name: 'CuratedByElena',
      rating: '4.9 (124)',
      location: 'London, UK',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150'
    },
    thumbnails: [
      { id: 1, name: 'Full View', transform: 'scale(1)', transformOrigin: 'center center' },
      { id: 2, name: 'Pleats Close-Up', transform: 'scale(1.8)', transformOrigin: 'center 25%' },
      { id: 3, name: 'Waistband Detail', transform: 'scale(2.2)', transformOrigin: 'center 45%' },
      { id: 4, name: 'Pocket Stitching', transform: 'scale(1.6)', transformOrigin: 'center 75%' }
    ]
  },
  {
    id: 203,
    title: 'Minimalist Leather Tote',
    price: '£220',
    size: 'One Size',
    image: storefront3,
    badge: 'DESIGNER',
    wishlisted: false,
    category: 'Accessories',
    condition: 'Excellent',
    sustainability: 'High',
    description: 'Italian textured pebbled leather tote. Spaciously sized with interior zippered pouch. Elegant minimal styling.',
    seller: {
      name: 'CuratedByElena',
      rating: '4.9 (124)',
      location: 'London, UK',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150'
    },
    thumbnails: [
      { id: 1, name: 'Full View', transform: 'scale(1)', transformOrigin: 'center center' },
      { id: 2, name: 'Handle Stitching', transform: 'scale(1.8)', transformOrigin: 'center 30%' },
      { id: 3, name: 'Pebbled Grain Close-Up', transform: 'scale(2.2)', transformOrigin: 'center center' },
      { id: 4, name: 'Clasp Profile', transform: 'scale(1.6)', transformOrigin: 'center 75%' }
    ]
  },
  {
    id: 204,
    title: 'Oversized Poplin Shirt',
    price: '£55',
    size: 'Size L',
    image: storefront4,
    wishlisted: false,
    category: 'Luxury',
    condition: 'Excellent',
    sustainability: 'High',
    description: 'Crisp organic cotton poplin button-up shirt. Oversized, relaxed fit with dropped shoulders and point collar.',
    seller: {
      name: 'CuratedByElena',
      rating: '4.9 (124)',
      location: 'London, UK',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150'
    },
    thumbnails: [
      { id: 1, name: 'Full View', transform: 'scale(1)', transformOrigin: 'center center' },
      { id: 2, name: 'Collar & Yoke', transform: 'scale(1.8)', transformOrigin: 'center 20%' },
      { id: 3, name: 'Cuff Details', transform: 'scale(2.0)', transformOrigin: 'center 60%' },
      { id: 4, name: 'Hem Slits', transform: 'scale(1.6)', transformOrigin: 'center 85%' }
    ]
  },
  {
    id: 205,
    title: 'Pure Cashmere Sweater',
    price: '£110',
    size: 'Size S',
    image: storefront5,
    wishlisted: false,
    category: 'Knitwear',
    condition: 'Excellent',
    sustainability: 'High',
    description: 'Luxuriously soft crewneck sweater knitted from pure sustainable cashmere yarns. Cozy relaxed shape.',
    seller: {
      name: 'CuratedByElena',
      rating: '4.9 (124)',
      location: 'London, UK',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150'
    },
    thumbnails: [
      { id: 1, name: 'Full View', transform: 'scale(1)', transformOrigin: 'center center' },
      { id: 2, name: 'Ribbed Neckline', transform: 'scale(1.8)', transformOrigin: 'center 22%' },
      { id: 3, name: 'Cashmere Knit Grain', transform: 'scale(2.2)', transformOrigin: 'center center' },
      { id: 4, name: 'Ribbed Cuffs', transform: 'scale(1.7)', transformOrigin: 'center 80%' }
    ]
  },
  {
    id: 206,
    title: '90s Sterling Silver Chain',
    price: '£80',
    size: 'One Size',
    image: storefront6,
    wishlisted: false,
    category: 'Jewelry',
    condition: 'Excellent',
    sustainability: 'High',
    description: 'Heavy solid sterling silver cable link chain. Authentic vintage piece with gorgeous natural patina.',
    seller: {
      name: 'CuratedByElena',
      rating: '4.9 (124)',
      location: 'London, UK',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150'
    },
    thumbnails: [
      { id: 1, name: 'Full View', transform: 'scale(1)', transformOrigin: 'center center' },
      { id: 2, name: 'Link Clasp', transform: 'scale(2.2)', transformOrigin: 'center center' },
      { id: 3, name: 'Engraving Close-Up', transform: 'scale(2.5)', transformOrigin: '55% 55%' },
      { id: 4, name: 'Chain Profile', transform: 'scale(1.8)', transformOrigin: '30% 60%' }
    ]
  },
  {
    id: 207,
    title: 'Classic High Rise Denim',
    price: '£65',
    size: 'Size 28',
    image: storefront7,
    wishlisted: false,
    category: 'Denim',
    condition: 'Excellent',
    sustainability: 'High',
    description: 'Timeless high-rise straight-leg jeans in a classic indigo wash. Solid durable cotton construction.',
    seller: {
      name: 'CuratedByElena',
      rating: '4.9 (124)',
      location: 'London, UK',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150'
    },
    thumbnails: [
      { id: 1, name: 'Full View', transform: 'scale(1)', transformOrigin: 'center center' },
      { id: 2, name: 'Front Pockets', transform: 'scale(1.8)', transformOrigin: 'center 30%' },
      { id: 3, name: 'Denim Fading', transform: 'scale(2.2)', transformOrigin: 'center 55%' },
      { id: 4, name: 'Back Patch', transform: 'scale(1.7)', transformOrigin: 'center 80%' }
    ]
  },
  {
    id: 208,
    title: 'Tailored Wool Blazer',
    price: '£190',
    size: 'Size L',
    image: storefront8,
    wishlisted: false,
    category: 'Outerwear',
    condition: 'Excellent',
    sustainability: 'High',
    description: 'Double-breasted tailored wool blazer in charcoal grey. Features padded shoulders, peak lapels, and flap pockets.',
    seller: {
      name: 'CuratedByElena',
      rating: '4.9 (124)',
      location: 'London, UK',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150'
    },
    thumbnails: [
      { id: 1, name: 'Full View', transform: 'scale(1)', transformOrigin: 'center center' },
      { id: 2, name: 'Peak Lapels', transform: 'scale(1.8)', transformOrigin: 'center 20%' },
      { id: 3, name: 'Button Detailing', transform: 'scale(2.2)', transformOrigin: 'center 50%' },
      { id: 4, name: 'Pocket Flaps', transform: 'scale(1.6)', transformOrigin: 'center 75%' }
    ]
  }
];
