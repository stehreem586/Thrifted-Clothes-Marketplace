import React from 'react';
import './CategoryCard.css';

const CategoryCard = ({ category }) => {
  return (
    <div className="category-card">
      <img src={category.image} alt={category.title} className="category-image" loading="lazy" />
      <div className="category-overlay">
        <h3 className="category-title">{category.title}</h3>
        <p className="category-items">{category.items}</p>
      </div>
    </div>
  );
};

export default CategoryCard;
