import React from 'react';
import './YourImpactMatters.css';

const YourImpactMatters = () => {
  return (
    <section className="your-impact">
      <div className="your-impact-card">
        <div className="your-impact-content">
          <h2 className="your-impact-title">Your Impact Matters</h2>
          <p className="your-impact-description">
            Every item purchased on SecondLife saves an average of 25kg of carbon emissions. Track your personal contribution to a circular fashion future.
          </p>
          <div className="your-impact-progress-container">
            <div className="your-impact-progress-bar">
              <div className="your-impact-progress-fill" style={{ width: '65%' }}></div>
            </div>
            <span className="your-impact-progress-text">
              65% of our community target for this month reached
            </span>
          </div>
        </div>
        <div className="your-impact-action">
          <button className="view-impact-btn">
            View My Impact
          </button>
        </div>
      </div>
    </section>
  );
};

export default YourImpactMatters;
