import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api'; // Ensure the API instance is set up correctly
import { parseJwt } from '../utils/jwtUtils';

type Budget = {
  id: number;
  title: string;
  limitAmount: number;
  startDate: string;
  endDate: string;
};

const toLocalDate = (isoString: string) => {
  const date = new Date(isoString);
  const offset = date.getTimezoneOffset();
  date.setMinutes(date.getMinutes() - offset);
  return date.toISOString().slice(0, 10); // Convert to YYYY-MM-DD format
};

export default function BudgetPage() {
  const navigate = useNavigate();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Budget, 'id'>>({
    title: '',
    limitAmount: 0,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  // Fetch budgets on component mount
  useEffect(() => {
    fetchBudgets();
  }, []);

  // Fetch budgets from the API
  const fetchBudgets = async () => {
    try {
      const res = await api.get('/budgets');
      console.log('Raw /budgets response:', res.data);
  
      const values = res.data.$values; // 👈 Extract array from $values
  
      if (Array.isArray(values)) {
        const transformedBudgets = values.map((budget: Budget) => ({
          ...budget,
          startDate: toLocalDate(budget.startDate), // Convert start date
          endDate: toLocalDate(budget.endDate), // Convert end date
        }));
        setBudgets(transformedBudgets);
      } else {
        console.error('Unexpected format in /budgets response:', res.data);
        setBudgets([]);
      }
    } catch (err) {
      console.error('Failed to fetch budgets:', err);
    }
  };

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!form.title.trim()) {
      alert('Please enter a title.');
      return;
    }
  
    if (new Date(form.endDate) < new Date(form.startDate)) {
      alert('End date cannot be earlier than start date.');
      return;
    }
  
    try {
      if (editingId !== null) {
        await api.put(`/budgets/${editingId}`, form);
      } else {
        await api.post('/budgets', form);
        setSuccessMsg('Budget created!');
        setTimeout(() => setSuccessMsg(null), 3000);
      }
  
      setForm({
        title: '',
        limitAmount: 0,
        startDate: new Date().toISOString().slice(0, 10),
        endDate: new Date().toISOString().slice(0, 10),
      });
      setEditingId(null);
      fetchBudgets();
    } catch (err) {
      console.error('Failed to save budget:', err);
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

  // Handle delete
  const handleDelete = async (id: number) => {
    if (window.confirm('Delete this budget?')) {
      try {
        await api.delete(`/budgets/${id}`);
        fetchBudgets();
      } catch (err) {
        console.error('Failed to delete budget:', err);
      }
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

      <h2>{editingId ? 'Edit Budget' : 'Add Budget'}</h2>

      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      <form onSubmit={handleSubmit} className="row g-3 mb-4">
        <div className="col-md-3">
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="form-control"
            placeholder="Title"
            required
          />
        </div>

        <div className="col-md-3">
          <input
            type="number"
            name="limitAmount"
            value={form.limitAmount}
            onChange={handleChange}
            className="form-control"
            placeholder="Limit Amount"
            required
          />
        </div>

        <div className="col-md-2">
          <input
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        <div className="col-md-2">
          <input
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        <div className="col-md-2 d-grid">
          <button type="submit" className="btn btn-success">
            {editingId ? 'Update' : 'Add'}
          </button>
        </div>
      </form>

      <h4>Budget History</h4>
      {budgets.length === 0 ? (
        <p>No budgets found.</p>
      ) : (
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th>Title</th>
              <th>Limit Amount</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {budgets.map((budget) => (
              <tr key={budget.id}>
                <td>{budget.title}</td>
                <td>RM{budget.limitAmount.toFixed(2)}</td>
                <td>{budget.startDate.slice(0, 10)}</td>
                <td>{budget.endDate.slice(0, 10)}</td>
                <td>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(budget.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}