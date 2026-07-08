import React from 'react';
import SectionHeading from '../../components/common/SectionTitle/SectionHeading/SectionHeading';
import ProductGrid from '../../components/ProductGrid/ProductGrid';
import './TrendingSection.css';

const TrendingSection = ({ products, onProductClick, onViewAll }) => {
  return (
    <section className="trending-section">
      <SectionHeading
        title="Trending Now"
        linkText={onViewAll ? 'View All' : null}
        onLinkClick={onViewAll}
      />
      <ProductGrid products={products} onProductClick={onProductClick} />
    </section>
  );
};

export default TrendingSection;
