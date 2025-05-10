import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api'; // Make sure this points to your backend API
import { parseJwt } from '../utils/jwtUtils'; // Assuming this is your utility for decoding the JWT

type Article = {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  author: string;
  sourceName: string;
};

export default function ArticlePage() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    // Check token on page load
    if (!isTokenValid()) {
      navigate('/login', { state: { message: 'Please login again' } });
    } else {
      fetchArticles();
    }
  }, [navigate]);

  const fetchArticles = async () => {
    try {
      const res = await api.get('/news');
      console.log('API Response:', res.data);

      // Check for backend structure
      if (res.data?.$values && Array.isArray(res.data.$values)) {
        setArticles(res.data.$values);
      } else {
        console.error('Unexpected response format:', res.data);
      }
    } catch (err) {
      console.error('Failed to fetch articles:', err);
    }
  };

  const isTokenValid = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return false;

    const payload = parseJwt(token);
    if (!payload) return false;

    const expiry = payload.exp * 1000; // Convert expiry to milliseconds
    return expiry > Date.now();
  };

  const handleBackToDashboard = () => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = storedUser?.isAdmin;

    if (!isTokenValid()) {
      navigate('/login', { state: { message: 'Session expired. Please login again.' } });
      return;
    }

    if (isAdmin) {
      navigate('/admin-dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="container mt-4">
      <button
        className="btn btn-primary mb-3"
        onClick={handleBackToDashboard}
      >
        Back to Dashboard
      </button>

      <h2>Financial News</h2>

      {articles.length === 0 ? (
        <p>No financial news available.</p>
      ) : (
        <div className="row">
          {articles.map((article, index) => (
            <div className="col-md-6 mb-4" key={index}>
              <div className="card h-100 shadow-sm">
                {article.urlToImage && (
                  <img
                    src={article.urlToImage}
                    className="card-img-top"
                    alt={article.title}
                    style={{ maxHeight: '200px', objectFit: 'cover' }}
                  />
                )}
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{article.title}</h5>
                  <p className="card-text">{article.description}</p>
                  <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                    {article.sourceName} • {new Date(article.publishedAt).toLocaleDateString()}
                  </p>
                  <a
                    href={article.url}
                    className="btn btn-primary mt-auto"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Read Full Article
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}