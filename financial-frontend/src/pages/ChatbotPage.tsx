import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { parseJwt } from '../utils/jwtUtils';

interface Transaction {
  category: string;
  amount: number;
  type: 'Expense' | 'Income';
}

interface Budget {
  title: string;
  limitAmount: number;
}

interface Goal {
  title: string;
  targetAmount: number;
}

const ChatbotPage = () => {
  const navigate = useNavigate();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const [userId, setUserId] = useState('');
  const [transactionQuery, setTransactionQuery] = useState('');
  const [chatbotResponse, setChatbotResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserId(payload.userId || payload.sub || '');
    } catch (error) {
      console.error('Invalid token:', error);
      alert('Session expired. Please log in again.');
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [transRes, budRes, goalRes] = await Promise.all([
          api.get('/transactions'),
          api.get('/budgets'),
          api.get('/goals'),
        ]);

        setTransactions(transRes.data?.$values || []);
        setBudgets(budRes.data?.$values || []);
        setGoals(goalRes.data?.$values || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        alert('Failed to load your financial data.');
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const summarizeData = () => {
    if (!transactions.length && !budgets.length && !goals.length) return 'No financial data available.';
  
    const expenseTrans = transactions.filter(t => t.type.toLowerCase() === 'expense');
    const incomeTrans = transactions.filter(t => t.type.toLowerCase() === 'income');
  
    const totalSpending = expenseTrans.reduce((sum, t) => sum + t.amount, 0);
    const totalEarning = incomeTrans.reduce((sum, t) => sum + t.amount, 0);
  
    const categorySummary = (data: Transaction[], total: number, label: string) => {
      if (!total || total === 0) return `${label}: No data.\n`;
      const map = new Map<string, number>();
  
      data.forEach(t => {
        map.set(t.category, (map.get(t.category) || 0) + t.amount);
      });
  
      const result = Array.from(map.entries()).map(([cat, amt]) =>
        `${cat}: RM${amt.toFixed(2)} (${((amt / total) * 100).toFixed(2)}%)`
      );
  
      return `${label}:\n${result.join('\n')}\n`;
    };
  
    const getTopCategories = (data: Transaction[], label: string) => {
      if (!data.length) return `${label}: No data.\n`;
    
      const map = new Map<string, number>();
      data.forEach(t => {
        map.set(t.category, (map.get(t.category) || 0) + t.amount);
      });
    
      const sorted = Array.from(map.entries()).sort((a, b) => 
        Math.abs(b[1]) - Math.abs(a[1])
      );
    
      const total = data.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
      // Find the highest amount
      const highestAmount = Math.abs(sorted[0][1]);
    
      // Get all categories with the highest amount
      const topCategories = sorted.filter(([cat, amt]) => Math.abs(amt) === highestAmount);
    
      return `${label}:\n${topCategories.map(([cat, amt]) =>
        `${cat}: RM${Math.abs(amt).toFixed(2)} (${((Math.abs(amt) / total) * 100).toFixed(2)}%)`
      ).join('\n') || 'None'}\n`;
    };
  
    const budgetSummary = budgets.map(b => {
      const totalUsed = transactions
        .filter(t => t.category === b.title)
        .reduce((sum, t) => t.type.toLowerCase() === 'expense' ? sum + t.amount : sum - t.amount, 0);
  
      const percent = b.limitAmount ? (totalUsed / b.limitAmount) * 100 : 0;
      return `${b.title}: used RM${totalUsed.toFixed(2)} of RM${b.limitAmount.toFixed(2)} (${percent.toFixed(1)}%)`;
    }).join('\n');
  
    const goalSummary = goals.map(g => {
      const totalSaved = transactions
        .filter(t => t.category === g.title)
        .reduce((sum, t) => t.type.toLowerCase() === 'income' ? sum + t.amount : sum - t.amount, 0);
  
      const percent = g.targetAmount ? (totalSaved / g.targetAmount) * 100 : 0;
      return `${g.title}: saved RM${totalSaved.toFixed(2)} of RM${g.targetAmount.toFixed(2)} (${percent.toFixed(1)}%)`;
    }).join('\n');
  
    return `
  ${categorySummary(expenseTrans, totalSpending, 'Spending')}
  ${categorySummary(incomeTrans, totalEarning, 'Earning')}
  ${getTopCategories(expenseTrans, 'Top Spending Categories')}
  ${getTopCategories(incomeTrans, 'Top Earning Categories')}
  Budget Usage:\n${budgetSummary}
  \nGoal Progress:\n${goalSummary}
    `.trim();
  };
    const isTokenExpired = (): boolean => {
      const token = localStorage.getItem('accessToken');
      if (!token) return true;
  
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const expiration = decodedToken?.exp;
  
      if (expiration) {
        return Date.now() >= expiration * 1000;
      }
      return true;
    };
  
    // Handle the Back to Dashboard button click
    const handleBackToDashboard = () => {
      // Check if the token is expired first
      if (isTokenExpired()) {
        console.log('Token is expired, redirecting to login.');
        navigate('/login');
      } else {
        const token = localStorage.getItem('accessToken');
    
        if (token) {
          // Decode the JWT token (access token)
          const decodedToken = parseJwt(token); // Assuming parseJwt is a utility that decodes JWT tokens
          console.log('Decoded Token:', decodedToken); // Debugging log
    
          // Check if decoded token has an 'IsAdmin' claim
          const isAdmin = decodedToken?.IsAdmin?.toString().toLowerCase() === 'true';
    
          if (isAdmin) {
            console.log('Admin detected, redirecting to admin-dashboard.');
            navigate('/admin-dashboard');
          } else {
            console.log('Regular user detected, redirecting to dashboard.');
            navigate('/dashboard');
          }
        } else {
          console.log('No access token found, redirecting to login.');
          navigate('/login');
        }
      }
    };
    
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
  
    if (!transactionQuery.trim()) {
      alert('Please enter a transaction query.');
      return;
    }
  
    setLoading(true);
    setChatbotResponse('');
  
    try {
      // Just send the message the user typed in, no additional information added
      const fullQuery = transactionQuery.trim();
  
      const response = await api.post(`/chatbot/ask`, {
        message: fullQuery,
      });
  
      setChatbotResponse(response.data.response || 'No response from the bot.');
    } catch (err) {
      console.error('Chatbot error:', err);
      setChatbotResponse('There was an error processing your request. Please try again later.');
    } finally {
      setLoading(false);
    }

  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <div className="container py-4">
      <button
        className="btn btn-primary mb-3"
        onClick={handleBackToDashboard}
      >
        Back to Dashboard
      </button>

        <h1 className="text-center mb-4">Chat with Finance Bot</h1>

        {dataLoading ? (
          <p className="text-center text-muted">Loading your data...</p>
        ) : (
          chatbotResponse && (
            <div className="alert alert-secondary" style={{ whiteSpace: 'pre-wrap', maxHeight: '530px', overflowY: 'auto' }}>
              <strong>Response:</strong>
              <p className="mt-2">{chatbotResponse}</p>
            </div>
          )
        )}
      </div>

      {!dataLoading && (
        <div className="fixed-bottom bg-white border-top shadow p-3">
          <div className="container">
            <form onSubmit={handleSubmit}>
              <div className="d-flex flex-column flex-md-row align-items-end gap-2">
                <textarea
                  ref={textAreaRef}
                  rows={1}
                  className="form-control flex-grow-1"
                  style={{
                    resize: 'none',
                    overflowY: transactionQuery.split('\n').length > 8 ? 'auto' : 'hidden',
                    minHeight: '38px',
                    maxHeight: '200px',
                  }}
                  placeholder="Ask something about your transactions..."
                  value={transactionQuery}
                  onChange={(e) => {
                    setTransactionQuery(e.target.value);
                    const el = e.target as HTMLTextAreaElement;
                    el.style.height = 'auto';
                    const newHeight = Math.min(el.scrollHeight, 200);
                    el.style.height = `${newHeight}px`;
                    el.style.overflowY = el.scrollHeight > 200 ? 'auto' : 'hidden';
                  }}
                  required
                />

                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      setTransactionQuery(summarizeData());
                      textAreaRef.current?.focus();
                    }}
                  >
                    Use Financial Summary
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'GPT is thinking...' : 'Ask GPT'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotPage;