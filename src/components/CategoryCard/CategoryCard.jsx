import React from 'react';
import './CategoryCard.css';

const CategoryCard = ({ category, onClick }) => {
  return (
    <div className="category-card" role="button" tabIndex={0} onClick={onClick} onKeyPress={(event) => event.key === 'Enter' && onClick?.()}>
      <img src={category.image} alt={category.title} className="category-image" loading="lazy" />
      <div className="category-overlay">
        <h3 className="category-title">{category.title}</h3>
        <p className="category-items">{category.items}</p>
      </div>
    </div>
  );
};

export default CategoryCard;
