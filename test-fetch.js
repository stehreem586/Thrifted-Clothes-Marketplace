import { fetchActiveListings } from './src/utils/listingsFetch.js';

async function run() {
  try {
    console.log('Running fetchActiveListings...');
    const result = await fetchActiveListings(1, 20);
    console.log('Fetch completed successfully!');
    console.log('Result listings count:', result.listings.length);
    console.log('Result hasMore:', result.hasMore);
    if (result.listings.length > 0) {
      console.log('Sample mapped listing:', JSON.stringify(result.listings[0], null, 2));
    }
  } catch (err) {
    console.error('Fetch failed with error:', err);
  }
}

run();
