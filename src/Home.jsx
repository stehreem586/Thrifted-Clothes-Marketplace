import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      {/* NAVBAR */}
      <nav className="navbar">

        {/* LOGO */}
        <div className="logo">
          <img className='second' src='logoo.png'></img>
          
        </div>

        {/* SEARCH */}
        {/* SEARCH */}
<div className="search">
  <input type="text" placeholder="Search thrift items..." />
  <span className="search-icon">🔍</span>
</div>
        {/* ACTIONS */}
        <div className="nav-actions">

          {/* SIMPLE PROFILE */}
          <div className="profile">
            <img src="image.png" alt="" />
          </div>

          {/* LOGIN | SIGNUP (SAME LINE) */}
          <a href="#" className="nav-link">Login</a>
          <span className="divider">|</span>
          <a href="#" className="nav-link">Signup</a>

          {/* HEART BIGGER */}
          <span className="icon heart">♡</span>

          {/* CART */}
          <span className="icon">🛒</span>

        </div>
      </nav>

      {/* CATEGORIES */}
      <div className="categories">
       <a href="#">Women's</a>
        <a href="#">Mens</a>
        <a href="#">Categories</a>
        <a href="#">More</a>
        <a href="#">About Us</a>
        <a href="#">Blog</a>

      </div>

      {/* ORIGINAL CONTENT */}
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="vite" />
        </div>

        <h1>Get started</h1>
        <p>Edit <code>src/App.jsx</code> and save to test <code>HMR</code></p>

        <button className="counter" onClick={() => setCount(count + 1)}>
          Count is {count}
        </button>
      </section>
    </>
  )
}

export default App