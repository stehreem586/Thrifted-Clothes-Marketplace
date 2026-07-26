import { supabase } from './supabaseClient.js';

/**
 * Fetches active listings with seller profile data from Supabase.
 * Paginates results by range.
 * 
 * @param {number} page - Page number (1-indexed)
 * @param {number} limit - Number of items to fetch
 * @returns {Promise<{listings: Array, hasMore: boolean}>}
 */
export const fetchActiveListings = async (page = 1, limit = 20, filters = {}) => {
  const start = (page - 1) * limit;
  const end = start + limit - 1;

  // 1. Build supabase query dynamically
  let query = supabase
    .from('listings')
    .select('*')
    .ilike('status', 'active');

  // Filter by Search Keyword (title or description contains keyword case-insensitively)
  if (filters.search && filters.search.trim() !== '') {
    const keyword = `%${filters.search.trim()}%`;
    query = query.or(`title.ilike."${keyword}",description.ilike."${keyword}"`);
  }

  // Filter by Category (multiple selection)
  if (filters.categories && filters.categories.length > 0) {
    const normalizedCategories = [];
    filters.categories.forEach(cat => {
      normalizedCategories.push(cat);
      normalizedCategories.push(cat.toLowerCase());
      if (cat === 'Footwear') normalizedCategories.push('shoes', 'Shoes', 'footwear');
      if (cat === 'Bags') normalizedCategories.push('Bag', 'bag', 'bags');
      if (cat === 'Tops') normalizedCategories.push('top', 'tops');
      if (cat === 'Bottoms') normalizedCategories.push('bottom', 'bottoms');
      if (cat === 'Dresses') normalizedCategories.push('dress', 'dresses');
      if (cat === 'Outerwear') normalizedCategories.push('outerwear', 'jacket', 'coat');
    });
    query = query.in('category', normalizedCategories);
  }

  // Filter by Size (multiple selection)
  if (filters.sizes && filters.sizes.length > 0) {
    const normalizedSizes = [];
    filters.sizes.forEach(sz => {
      normalizedSizes.push(sz);
      normalizedSizes.push(sz.toLowerCase());
      if (sz === 'Free Size') normalizedSizes.push('Free Size', 'One Size', 'OS', 'free size', 'one size');
    });
    query = query.in('size', normalizedSizes);
  }

  // Filter by Condition (multiple selection)
  if (filters.conditions && filters.conditions.length > 0) {
    const normalizedConditions = [];
    filters.conditions.forEach(cond => {
      normalizedConditions.push(cond);
      if (cond === 'New with Tags') normalizedConditions.push('New With Tags', 'NWT', 'new with tags');
      if (cond === 'Like New') normalizedConditions.push('Like New', 'Excellent', 'excellent', 'like new');
      if (cond === 'Good Condition') normalizedConditions.push('Good Condition', 'Good', 'Very Good', 'verygood', 'good condition');
      if (cond === 'Fair Condition') normalizedConditions.push('Fair Condition', 'Fair', 'fair condition', 'fair');
    });
    query = query.in('condition', normalizedConditions);
  }

  // Filter by Price range (Min / Max price in PKR)
  if (filters.minPrice !== undefined && filters.minPrice !== '' && filters.minPrice !== null) {
    query = query.gte('price', parseFloat(filters.minPrice));
  }
  if (filters.maxPrice !== undefined && filters.maxPrice !== '' && filters.maxPrice !== null) {
    query = query.lte('price', parseFloat(filters.maxPrice));
  }

  // Filter by City (resolves seller profile IDs)
  if (filters.city && filters.city !== 'All') {
    const { data: matchingProfiles, error: cityProfilesError } = await supabase
      .from('profiles')
      .select('id')
      .ilike('city', filters.city);
      
    if (!cityProfilesError && matchingProfiles) {
      const matchingIds = matchingProfiles.map(p => p.id);
      if (matchingIds.length > 0) {
        query = query.in('seller_id', matchingIds);
      } else {
        // No sellers in this city
        return { listings: [], hasMore: false };
      }
    } else if (cityProfilesError) {
      console.warn('Error filtering by city profiles:', cityProfilesError.message);
    }
  }

  // Apply sorting and range
  const { data: listings, error: listingsError } = await query
    .order('created_at', { ascending: false })
    .range(start, end);

  if (listingsError) {
    console.error('Error fetching listings from Supabase:', listingsError.message);
    throw new Error(listingsError.message);
  }

  if (!listings || listings.length === 0) {
    return { listings: [], hasMore: false };
  }

  // 2. Fetch corresponding seller profiles in-memory to map names/cities
  const sellerIds = [...new Set(listings.map(item => item.seller_id).filter(Boolean))];
  
  let profilesMap = {};
  if (sellerIds.length > 0) {
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, city')
      .in('id', sellerIds);
      
    if (!profilesError && profiles) {
      profiles.forEach(p => {
        profilesMap[p.id] = p;
      });
    } else if (profilesError) {
      console.warn('Error fetching profiles from Supabase:', profilesError.message);
    }
  }

  // 3. Map profile info back to listings
  const listingsWithSellers = listings.map(item => {
    const seller = profilesMap[item.seller_id] || {};
    return {
      id: item.id,
      title: item.title,
      price: parseFloat(item.price) || 0,
      size: item.size || 'OS',
      category: item.category || 'Other',
      condition: item.condition || 'Good',
      description: item.description || '',
      image_url: item.image_url || 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80',
      created_at: item.created_at,
      seller_name: seller.name || 'Verified Seller',
      seller_city: seller.city || 'Pakistan',
      seller_id: item.seller_id
    };
  });

  return {
    listings: listingsWithSellers,
    hasMore: listings.length === limit
  };
};
