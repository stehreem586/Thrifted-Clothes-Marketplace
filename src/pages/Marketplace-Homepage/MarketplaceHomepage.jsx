import React from 'react';
import MHHero from './MH-Hero/MHHero';
import ExploreCategories from './Explore-categories/ExploreCategories';
import NewArrivals from './New-Arrivals/NewArrivals';
import YourImpactMatters from './Your-Impact-Matters/YourImpactMatters';

const MarketplaceHomepage = () => {
  return (
    <div className="marketplace-home">
      <MHHero />
      <ExploreCategories />
      <NewArrivals />
      <YourImpactMatters />
    </div>
  );
};

export default MarketplaceHomepage;
