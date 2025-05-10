import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { parseJwt } from '../utils/jwtUtils';

type Transaction = {
  id: number;
  amount: number;
  category: string;
  type: string;
  goalId?: number | null;
  budgetId?: number | null;
  date: string;
};

type Budget = { id: number; title: string };
type Goal = { id: number; title: string };

export default function Transactions() {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [form, setForm] = useState<Omit<Transaction, 'id'>>({
    amount: 0,
    category: '',
    type: '',
    goalId: null,
    budgetId: null,
    date: new Date().toISOString().slice(0, 10),
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [newCategory, setNewCategory] = useState('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchTransactions();
    fetchBudgetsAndGoals();
  }, []);

  const toLocalDate = (isoString: string) => {
    const date = new Date(isoString);
    const offset = date.getTimezoneOffset();
    date.setMinutes(date.getMinutes() - offset);
    return date.toISOString().slice(0, 10);
  };

  const fetchTransactions = async () => {
    try {
      const res = await api.get('/transactions');
      const values = res.data.$values;
      const transformed = Array.isArray(values)
        ? values.map((txn: Transaction) => ({
            ...txn,
            date: toLocalDate(txn.date),
          }))
        : [];
      setTransactions(transformed);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    }
  };

  const fetchBudgetsAndGoals = async () => {
    try {
      const [budgetsRes, goalsRes] = await Promise.all([
        api.get('/budgets'),
        api.get('/goals'),
      ]);

      const budgetsValues = budgetsRes.data.$values;
      const goalsValues = goalsRes.data.$values;

      setBudgets(Array.isArray(budgetsValues) ? budgetsValues : []);
      setGoals(Array.isArray(goalsValues) ? goalsValues : []);
    } catch (err: any) {
      console.error('Failed to fetch budgets or goals:', err);
      if (err.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const isTokenExpired = (): boolean => {
    const token = localStorage.getItem('accessToken');
    if (!token) return true;

    try {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      return Date.now() >= decodedToken.exp * 1000;
    } catch {
      return true;
    }
  };

  const handleBackToDashboard = () => {
    if (isTokenExpired()) {
      navigate('/login');
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return;
    }

    const decodedToken = parseJwt(token);
    const isAdmin = decodedToken?.IsAdmin?.toString().toLowerCase() === 'true';

    navigate(isAdmin ? '/admin-dashboard' : '/dashboard');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
  
    if (name === 'category') {
      if (value === 'create-new') {
        setIsCreatingCategory(true);
        setForm(prev => ({
          ...prev,
          category: '',
          goalId: null,
          budgetId: null,
        }));
      } else {
        const [type, idOrTitle] = value.split(':');
  
        if (type === 'budget') {
          const id = parseInt(idOrTitle, 10);
          const matched = budgets.find(b => b.id === id);
          setForm(prev => ({
            ...prev,
            category: matched?.title || '',
            budgetId: id,
            goalId: null,
          }));
        } else if (type === 'goal') {
          const id = parseInt(idOrTitle, 10);
          const matched = goals.find(g => g.id === id);
          setForm(prev => ({
            ...prev,
            category: matched?.title || '',
            goalId: id,
            budgetId: null,
          }));
        } else if (type === 'custom') {
          setForm(prev => ({
            ...prev,
            category: idOrTitle,
            goalId: null,
            budgetId: null,
          }));
        }
  
        setIsCreatingCategory(false);
        setNewCategory('');
      }
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleNewCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewCategory(value);
    setForm(prev => ({
      ...prev,
      category: value,
      goalId: null,
      budgetId: null,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category.trim()) {
      alert('Please select or enter a category.');
      return;
    }

    if (isTokenExpired()) {
      navigate('/login');
      return;
    }

    try {
      if (editingId !== null) {
        await api.put(`/transactions/${editingId}`, form);
      } else {
        await api.post('/transactions', form);
        setSuccessMsg('Transaction created successfully!');
        setTimeout(() => setSuccessMsg(null), 3000);
      }

      resetForm();
      fetchTransactions();
    } catch (err) {
      console.error('Error saving transaction:', err);
    }
  };

  const resetForm = () => {
    setForm({
      amount: 0,
      category: '',
      type: '',
      goalId: null,
      budgetId: null,
      date: new Date().toISOString().slice(0, 10),
    });
    setEditingId(null);
    setIsCreatingCategory(false);
    setNewCategory('');
  };

  const handleEdit = (txn: Transaction) => {
    setForm({
      amount: txn.amount,
      category: txn.category,
      type: txn.type,
      goalId: txn.goalId ?? null,
      budgetId: txn.budgetId ?? null,
      date: toLocalDate(txn.date),
    });
    setEditingId(txn.id);
    setIsCreatingCategory(false);
    setNewCategory('');
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this transaction?')) return;
    if (isTokenExpired()) {
      navigate('/login');
      return;
    }

    try {
      await api.delete(`/transactions/${id}`);
      fetchTransactions();
    } catch (err) {
      console.error('Failed to delete transaction:', err);
    }
  };

  const getCategoryValue = () => {
    if (isCreatingCategory) return 'create-new';
    if (form.budgetId !== null) return `budget:${form.budgetId}`;
    if (form.goalId !== null) return `goal:${form.goalId}`;
    return form.category ? `custom:${form.category}` : '';
  };

  const customCategories = Array.from(
    new Set(
      transactions
        .filter(txn => !txn.budgetId && !txn.goalId && txn.category)
        .map(txn => txn.category)
    )
  );

  return (
    <div className="container mt-4">
      <button className="btn btn-primary mb-3" onClick={handleBackToDashboard}>
        Back to Dashboard
      </button>

      <h2>{editingId ? 'Edit Transaction' : 'Add Transaction'}</h2>

      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      <form onSubmit={handleSubmit} className="row g-3 mb-4">
        <div className="col-md-3">
          <input
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            className="form-control"
            placeholder="Amount"
            required
          />
        </div>

        <div className="col-md-3">
        <select
          name="category"
          value={getCategoryValue()}
          onChange={handleChange}
          className="form-select"
          required={!isCreatingCategory}
        >
          <option value="">Select Category</option>

          <optgroup label="Budgets">
            {budgets.map((b) => (
              <option key={`budget-${b.id}`} value={`budget:${b.id}`}>
                {b.title}
              </option>
            ))}
          </optgroup>

          <optgroup label="Goals">
            {goals.map((g) => (
              <option key={`goal-${g.id}`} value={`goal:${g.id}`}>
                {g.title}
              </option>
            ))}
          </optgroup>

          <optgroup label="Custom Categories">
            {customCategories.map((cat) => (
              <option key={`custom-${cat}`} value={`custom:${cat}`}>
                {cat}
              </option>
            ))}
          </optgroup>

          <option value="create-new">Create New Category</option>
        </select>

          {isCreatingCategory && (
            <input
              type="text"
              value={newCategory}
              onChange={handleNewCategoryChange}
              className="form-control mt-2"
              placeholder="Enter new category name"
              required
            />
          )}
        </div>

        <div className="col-md-2">
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="form-select"
            required
          >
            <option value="">Select Type</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>

        <div className="col-md-2">
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        <div className="col-md-2">
          <button type="submit" className="btn btn-success w-100">
            {editingId ? 'Update' : 'Add'}
          </button>
        </div>
      </form>

      <h3>Transaction List</h3>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Amount</th>
            <th>Category</th>
            <th>Type</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((txn) => (
            <tr key={txn.id}>
              <td>RM{txn.amount.toFixed(2)}</td>
              <td>{txn.category}</td>
              <td>{txn.type}</td>
              <td>{txn.date}</td>
              <td>
                <button
                  className="btn btn-sm btn-warning me-2"
                  onClick={() => handleEdit(txn)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(txn.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {transactions.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center">No transactions found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}