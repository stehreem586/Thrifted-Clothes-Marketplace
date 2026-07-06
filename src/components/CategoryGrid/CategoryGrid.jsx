import React from 'react';
import CategoryCard from '../CategoryCard/CategoryCard';
import './CategoryGrid.css';

const CategoryGrid = ({ categories }) => {
  return (
    <div className="category-grid">
      {categories.map(category => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </div>
  );
};

export default CategoryGrid;
