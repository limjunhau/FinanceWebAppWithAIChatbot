import React, { useState, useRef, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { parseJwt } from '../utils/jwtUtils';

ChartJS.register(ArcElement, Tooltip, Legend);

type ReportType = 'Spending' | 'Earning' | 'Goal' | 'Budget' | 'Comparison';

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

const ReportPage = () => {
  const [selectedType, setSelectedType] = useState<ReportType>('Spending');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const reportRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [transactionsRes, budgetsRes, goalsRes] = await Promise.all([
          api.get('/transactions'),
          api.get('/budgets'),
          api.get('/goals')
        ]);

        setTransactions(transactionsRes.data?.$values || []);
        setBudgets(budgetsRes.data?.$values || []);
        setGoals(goalsRes.data?.$values || []);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchAllData();
  }, []);

  const totalSpending = transactions
    .filter(t => t.type.toLowerCase() === 'expense')
    .reduce((sum, item) => sum + item.amount, 0);

  const totalEarning = transactions
    .filter(t => t.type.toLowerCase() === 'income')
    .reduce((sum, item) => sum + item.amount, 0);

  const getReportData = () => {
    switch (selectedType) {
      case 'Spending': {
        const expenses = transactions.filter(t => t.type.toLowerCase() === 'expense');
        const grouped = expenses.reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + t.amount;
          return acc;
        }, {} as Record<string, number>);
        return Object.entries(grouped).map(([category, amount]) => ({
          category,
          amount,
          percentage: totalSpending > 0 ? (amount / totalSpending) * 100 : 0
        }));
      }

      case 'Earning': {
        const income = transactions.filter(t => t.type.toLowerCase() === 'income');
        const grouped = income.reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + t.amount;
          return acc;
        }, {} as Record<string, number>);
        return Object.entries(grouped).map(([category, amount]) => ({
          category,
          amount,
          percentage: totalEarning > 0 ? (amount / totalEarning) * 100 : 0
        }));
      }

      case 'Budget': {
        return budgets.map(budget => {
          const netUsage = transactions
            .filter(t => t.category === budget.title)
            .reduce((sum, t) => {
              return t.type.toLowerCase() === 'expense' ? sum + t.amount : sum - t.amount;
            }, 0);
          const percent = budget.limitAmount > 0 ? (netUsage / budget.limitAmount) * 100 : 0;
          return {
            title: budget.title,
            earned: netUsage,
            total: budget.limitAmount,
            left: budget.limitAmount - netUsage,
            percentage: percent
          };
        });
      }

      case 'Goal': {
        return goals.map(goal => {
          const totalContributions = transactions
            .filter(t => t.category === goal.title)
            .reduce((sum, t) => {
              return t.type.toLowerCase() === 'income' ? sum + t.amount : sum - t.amount;
            }, 0);
          const percent = goal.targetAmount > 0 ? (totalContributions / goal.targetAmount) * 100 : 0;
          return {
            title: goal.title,
            earned: totalContributions,
            total: goal.targetAmount,
            left: goal.targetAmount - totalContributions,
            percentage: percent
          };
        });
      }

      case 'Comparison': {
        return [
          { category: 'Spending', amount: totalSpending, percentage: totalEarning > 0 ? (totalSpending / totalEarning) * 100 : 0 },
          { category: 'Earning', amount: totalEarning, percentage: totalSpending > 0 ? (totalEarning / totalSpending) * 100 : 0 }
        ];
      }

      default:
        return [];
    }
  };

  const reportData = getReportData() as any[];

  const pieData = {
    labels: reportData.map(d => d.category),
    datasets: [
      {
        data: reportData.map(d => d.amount),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
        ],
        borderWidth: 1
      }
    ]
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom' as const
      }
    }
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

  const handleDownloadPDF = () => {
    if (reportRef.current) {
      html2canvas(reportRef.current).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF();
        const imgProps = (pdf as any).getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${selectedType}-Report.pdf`);
      });
    }
  };

  return (
    <div className="container py-4">
      <button
        className="btn btn-primary mb-3"
        onClick={handleBackToDashboard}
      >
        Back to Dashboard
      </button>

      <h2 className="text-center mb-4">Financial Report</h2>

      <div className="mb-4">
        <label className="form-label fw-bold">Select Report Type:</label>
        <select
          className="form-select"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as ReportType)}
        >
          <option value="Spending">Spending Overview</option>
          <option value="Earning">Earning Overview</option>
          <option value="Goal">Goal Overview</option>
          <option value="Budget">Budget Overview</option>
          <option value="Comparison">Spending vs Earnings Comparison</option>
        </select>
      </div>

      <div ref={reportRef}>
        <div className="mb-5 text-center">
          <h4 className="mb-3">{selectedType} Report</h4>

          {selectedType === 'Goal' || selectedType === 'Budget' ? (
            <div className="row">
              {reportData.map((item, index) => (
                <div key={index} className="col-md-6 mb-4">
                  <div className="card shadow-sm p-3">
                    <h5>{item.title}</h5>
                    <div className="progress mb-2" style={{ height: '20px' }}>
                      <div
                        className={`progress-bar ${
                          item.left < 0
                            ? 'bg-danger'
                            : item.percentage >= 100
                            ? 'bg-success'
                            : 'bg-info'
                        }`}
                        style={{ width: `${Math.min(Math.abs(item.percentage), 100)}%` }}
                      >
                        {item.percentage.toFixed(2)}%
                      </div>
                    </div>
                    <p className="mb-0">Earned/Spent: RM{item.earned.toFixed(2)}</p>
                    <p className="mb-0">Target/Limit: RM{item.total.toFixed(2)}</p>
                    <p className="mb-0">Remaining: RM{item.left.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}>
              <Pie data={pieData} options={pieOptions} />
            </div>
          )}
        </div>

        {(selectedType === 'Spending' || selectedType === 'Earning' || selectedType === 'Comparison') && (
          <ul className="list-group mb-5">
            {reportData.map((item, index) => (
              <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                <span>{item.category}</span>
                <span>RM{item.amount.toFixed(2)} ({item.percentage.toFixed(2)}%)</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="text-center">
        <button className="btn btn-success" onClick={handleDownloadPDF}>
          Download as PDF
        </button>
      </div>
    </div>
  );
};

export default ReportPage;