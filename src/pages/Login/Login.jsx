import "./Login.css";

function Login() {
  return (
    <div className="login-container">
      <div className="login-box">

        <h1>Welcome Back</h1>

        <p className="subtitle">
          Please enter your credentials to access the marketplace dashboard.
        </p>

        <label>Email Address</label>
        <input
          type="email"
          placeholder="Enter your email address"
        />

        <label>Password</label>
        <input
          type="password"
          placeholder="********"
        />

        <div className="remember">
          <input type="checkbox" id="remember" />
          <label htmlFor="remember">Stay signed in for 30 days</label>
        </div>

        <button className="login-btn">
          Login
        </button>

        <p className="signup-text">
          Don't have an account? <a href="#">Apply here</a>
        </p>

      </div>
    </div>
  );
}

export default Login;