import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api'; // Ensure the API instance is set up correctly
import { parseJwt } from '../utils/jwtUtils';

type Goal = {
  id: number;
  title: string;
  targetAmount: number;
  targetDate: string;
};

// Utility function to convert ISO string to local date format
const toLocalDate = (isoString: string) => {
  const date = new Date(isoString);
  const offset = date.getTimezoneOffset();
  date.setMinutes(date.getMinutes() - offset);
  return date.toISOString().slice(0, 10);
};

export default function GoalPage() {
  const navigate = useNavigate();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Goal, 'id'>>({
    title: '',
    targetAmount: 0,
    targetDate: new Date().toISOString().slice(0, 10),
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  // Fetch goals on component mount
  useEffect(() => {
    fetchGoals();
  }, []);

  // Fetch goals from the API and apply toLocalDate to targetDate
  const fetchGoals = async () => {
    try {
      const res = await api.get('/goals');
      const values = res.data.$values; // 👈 Extract array from $values
      if (Array.isArray(values)) {
        // Map through the goals to convert targetDate to local date format
        const transformedGoals = values.map((goal: Goal) => ({
          ...goal,
          targetDate: toLocalDate(goal.targetDate),
        }));
        setGoals(transformedGoals);
      } else {
        console.error('Unexpected format in /goals response:', res.data);
        setGoals([]);
      }
    } catch (err) {
      console.error('Failed to fetch goals:', err);
    }
  };

  // Check if the token is expired
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
    if (isTokenExpired()) {
      console.log('Token is expired, redirecting to login.');
      navigate('/login');
    } else {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const decodedToken = parseJwt(token);
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

    try {
      if (editingId !== null) {
        // Updating the goal
        await api.put(`/goals/${editingId}`, form);
      } else {
        // Creating a new goal
        await api.post('/goals', form);
        setSuccessMsg('Goal created!');
        setTimeout(() => setSuccessMsg(null), 3000);
      }

      // Reset form and fetch goals again
      setForm({
        title: '',
        targetAmount: 0,
        targetDate: new Date().toISOString().slice(0, 10),
      });
      setEditingId(null);
      fetchGoals();
    } catch (err) {
      console.error('Failed to save goal:', err);
    }
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (window.confirm('Delete this goal?')) {
      try {
        await api.delete(`/goals/${id}`);
        fetchGoals();
      } catch (err) {
        console.error('Failed to delete goal:', err);
      }
    }
  };

  return (
    <div className="container mt-4">
      <button className="btn btn-primary mb-3" onClick={handleBackToDashboard}>
        Back to Dashboard
      </button>

      <h2>{editingId ? 'Edit Goal' : 'Add Goal'}</h2>

      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      <form onSubmit={handleSubmit} className="row g-3 mb-4">
        <div className="col-md-4">
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

        <div className="col-md-4">
          <input
            type="number"
            name="targetAmount"
            value={form.targetAmount}
            onChange={handleChange}
            className="form-control"
            placeholder="Target Amount"
            required
          />
        </div>

        <div className="col-md-2">
          <input
            type="date"
            name="targetDate"
            value={form.targetDate}
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

      <h4>Goal History</h4>
      {goals.length === 0 ? (
        <p>No goals found.</p>
      ) : (
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th>Title</th>
              <th>Target Amount</th>
              <th>Target Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {goals.map((goal) => (
              <tr key={goal.id}>
                <td>{goal.title}</td>
                <td>RM{goal.targetAmount.toFixed(2)}</td>
                <td>{goal.targetDate}</td>
                <td>
                  <button
                    className="btn btn-sm btn-danger ms-2"
                    onClick={() => handleDelete(goal.id)}
                  >
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