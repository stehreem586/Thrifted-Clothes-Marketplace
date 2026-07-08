import React from 'react';
import SectionHeading from '../../components/common/SectionTitle/SectionHeading/SectionHeading';
import CategoryGrid from '../../components/CategoryGrid/CategoryGrid';
import './CategorySection.css';

const CategorySection = ({ categories, onCategoryClick, onBrowseAll }) => {
  return (
    <section className="category-section">
      <SectionHeading
        title="Shop by Category"
        linkText={onBrowseAll ? 'Browse All Categories' : null}
        onLinkClick={onBrowseAll}
      />
      <CategoryGrid categories={categories} onCategoryClick={onCategoryClick} />
    </section>
  );
};

export default CategorySection;
