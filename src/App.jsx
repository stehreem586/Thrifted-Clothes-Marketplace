import React from 'react';
import { products } from './data/products';
import { categories } from './data/categories';
import SectionHeading from './components/SectionHeading/SectionHeading';
import ProductGrid from './components/ProductGrid/ProductGrid';
import CategoryGrid from './components/CategoryGrid/CategoryGrid';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <section className="app-section">
        <SectionHeading title="Trending Now" linkText="View All" />
        <ProductGrid products={products} />
      </section>

      <section className="app-section">
        <SectionHeading title="Shop by Category" linkText="Browse All Categories" />
        <CategoryGrid categories={categories} />
      </section>
    </div>
  );
}

export default App;
import Admin from "./Admin";

function App() {
  return <Admin />;
}

export default App;
