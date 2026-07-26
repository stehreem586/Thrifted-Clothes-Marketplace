import { supabase } from './supabaseClient.js';

/**
 * Fetches all listing IDs saved by the user.
 * 
 * @param {string} userId - User UUID
 * @returns {Promise<Array<string>>} - Array of listing IDs
 */
export const fetchSavedListingIds = async (userId) => {
  if (!userId) return [];
  const { data, error } = await supabase
    .from('saved_items')
    .select('listing_id')
    .eq('user_id', userId);
    
  if (error) {
    console.error('Error fetching saved listing IDs:', error.message);
    return [];
  }
  return data.map(item => String(item.listing_id));
};

/**
 * Toggles a listing in the user's saved_items table.
 * 
 * @param {string} userId - User UUID
 * @param {string} listingId - Listing UUID or ID
 * @param {boolean} shouldSave - True to save, false to unsave
 * @returns {Promise<boolean>} - Success status
 */
export const toggleSavedListing = async (userId, listingId, shouldSave) => {
  if (!userId || !listingId) return false;
  
  if (shouldSave) {
    // Insert new row
    const { error } = await supabase
      .from('saved_items')
      .insert({
        user_id: userId,
        listing_id: listingId
      });
      
    if (error) {
      console.error('Error saving listing to DB:', error.message);
      return false;
    }
  } else {
    // Delete existing row
    const { error } = await supabase
      .from('saved_items')
      .delete()
      .eq('user_id', userId)
      .eq('listing_id', listingId);
      
    if (error) {
      console.error('Error unsaving listing from DB:', error.message);
      return false;
    }
  }
  return true;
};

/**
 * Fetches full listings details for all saved items of a user.
 * 
 * @param {string} userId - User UUID
 * @returns {Promise<Array>} - Array of detailed saved listings
 */
export const fetchSavedListingsDetails = async (userId) => {
  if (!userId) return [];
  
  // 1. Fetch saved listings mappings
  const { data: savedMaps, error: mapsError } = await supabase
    .from('saved_items')
    .select('listing_id, created_at')
    .eq('user_id', userId);

  if (mapsError) {
    console.error('Error loading saved maps:', mapsError.message);
    return [];
  }
  if (!savedMaps || savedMaps.length === 0) return [];

  // 2. Fetch full listings
  const listingIds = savedMaps.map(m => m.listing_id);
  const { data: listings, error: listingsError } = await supabase
    .from('listings')
    .select('*')
    .in('id', listingIds);

  if (listingsError) {
    console.error('Error loading saved items details:', listingsError.message);
    return [];
  }
  if (!listings || listings.length === 0) return [];

  // 3. Fetch corresponding profiles in-memory for seller mapping
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
    }
  }

  // 4. Map listings details
  const details = listings.map(item => {
    const seller = profilesMap[item.seller_id] || {};
    return {
      id: item.id,
      title: item.title,
      price: parseFloat(item.price) || 0,
      size: item.size || 'OS',
      category: item.category || 'Other',
      condition: item.condition || 'Good',
      description: item.description || '',
      image_url: item.image_url || '',
      status: item.status || 'Active',
      created_at: item.created_at,
      seller_name: seller.name || 'Verified Seller',
      seller_city: seller.city || 'Pakistan'
    };
  });

  // Re-sort the detailed listings based on their saved_at order
  const idToSavedAt = {};
  savedMaps.forEach(m => {
    idToSavedAt[String(m.listing_id)] = m.created_at ? new Date(m.created_at).getTime() : 0;
  });

  return details.sort((a, b) => (idToSavedAt[String(b.id)] || 0) - (idToSavedAt[String(a.id)] || 0));
};
