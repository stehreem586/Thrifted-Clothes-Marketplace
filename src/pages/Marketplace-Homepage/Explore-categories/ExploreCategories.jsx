import React from 'react';
import { Link } from 'react-router-dom';
import './ExploreCategories.css';

// Import local round card images
import topsImg from '../../../assets/images/Marketplace-homepage/round-card1.png';
import bottomsImg from '../../../assets/images/Marketplace-homepage/round-card2.png';
import shoesImg from '../../../assets/images/Marketplace-homepage/round-card3.png';
import accessoriesImg from '../../../assets/images/Marketplace-homepage/round-card4.png';
import outerwearImg from '../../../assets/images/Marketplace-homepage/round-card5.png';
import vintageImg from '../../../assets/images/Marketplace-homepage/round-card6.png';

const categories = [
  { name: 'Tops', image: topsImg, path: '/shop?category=tops' },
  { name: 'Bottoms', image: bottomsImg, path: '/shop?category=bottoms' },
  { name: 'Shoes', image: shoesImg, path: '/shop?category=shoes' },
  { name: 'Accessories', image: accessoriesImg, path: '/shop?category=accessories' },
  { name: 'Outerwear', image: outerwearImg, path: '/shop?category=outerwear' },
  { name: 'Vintage', image: vintageImg, path: '/shop?category=vintage' }
];

const ExploreCategories = () => {
  return (
    <section className="explore-categories">
      <div className="categories-header">
        <h2 className="categories-title">Explore Categories</h2>
        <Link to="/categories" className="view-all-link">
          View All Categories
        </Link>
      </div>
      
      <div className="categories-grid">
        {categories.map((category, index) => (
          <Link key={index} to={category.path} className="category-circle-card">
            <div className="circle-image-wrapper">
              <img src={category.image} alt={category.name} className="circle-image" />
            </div>
            <span className="category-name">{category.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default ExploreCategories;
