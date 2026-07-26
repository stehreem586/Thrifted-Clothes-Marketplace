import React from 'react';
import HeroSection from '../../components/Hero/Hero';
import TrendingSection from '../../sections/TrendingSection/TrendingSection';
import CategorySection from '../../sections/CategorySection/CategorySection';
import WhyChooseUs from '../../sections/WhyChooseUs/WhyChooseUs';
import Testimonials from '../../sections/Testimonials/Testimonials';
import NewsletterSection from '../../sections/NewsletterSection/NewsletterSection';
import { products } from '../../data/products';
import { categories } from '../../data/categories';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleProductClick = (product) => {
    console.log('Selected product:', product);
  };

  const handleCategoryClick = (category) => {
    console.log('Selected category:', category);
  };

  const handleViewAll = () => {
    console.log('View all trending products');
  };

  const handleBrowseAll = () => {
    console.log('Browse all categories');
  };

  const handleWishlistToggle = () => {
    if (!user) {
      if (window.confirm("You must be logged in to save listings to your wishlist. Would you like to log in now?")) {
        navigate('/login');
      }
    }
  };

  return (
    <div className="app-shell">
      <main>
        <HeroSection />
        <TrendingSection
          products={products}
          onProductClick={handleProductClick}
          onWishlistToggle={handleWishlistToggle}
          onViewAll={handleViewAll}
        />
        <CategorySection
          categories={categories}
          onCategoryClick={handleCategoryClick}
          onBrowseAll={handleBrowseAll}
        />
        <WhyChooseUs />
        <Testimonials />
        <NewsletterSection />
      </main>
    </div>
  );
};

export default Home;
