import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="container py-5 mb-5">
      <div className="text-center mb-5">
        <h1 className="display-4">Welcome to Smart Finance</h1>
        <p className="lead">Track your spending, set goals, and chat with our AI assistant!</p>
        <div className="mt-4 d-flex flex-column flex-sm-row justify-content-center align-items-center gap-2">
          <Link to="/signup" className="btn btn-primary">Sign Up</Link>
          <Link to="/login" className="btn btn-outline-secondary">Login</Link>
        </div>
      </div>

      <div className="row">
        <div className="col-12 col-md-4 mb-4">
          <div className="card h-100">
            <div className="card-body text-center">
              <h5 className="card-title">📊 Track Transactions</h5>
              <p className="card-text">Keep track of all your income and expenses in one place.</p>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4 mb-4">
          <div className="card h-100">
            <div className="card-body text-center">
              <h5 className="card-title">🎯 Set Financial Goals</h5>
              <p className="card-text">Create and manage goals to help you save and grow financially.</p>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4 mb-4">
          <div className="card h-100">
            <div className="card-body text-center">
              <h5 className="card-title">🤖 AI Chatbot</h5>
              <p className="card-text">Get personalized tips and budgeting advice from our AI assistant.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;