import { useState } from 'react';
import { X } from 'lucide-react';

export default function VisitForm({ onSubmit, onCancel }) {
  const today = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({
    date: today,
    doctor: '',
    reason: '',
    diagnosis: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Record New Visit</h2>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="label">Visit Date *</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          <div>
            <label className="label">Doctor *</label>
            <input
              type="text"
              name="doctor"
              value={formData.doctor}
              onChange={handleChange}
              className="input"
              placeholder="Dr. "
              required
            />
          </div>

          <div>
            <label className="label">Reason for Visit *</label>
            <input
              type="text"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              className="input"
              placeholder="e.g., Annual checkup, Fever"
              required
            />
          </div>

          <div>
            <label className="label">Diagnosis</label>
            <textarea
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleChange}
              className="input"
              rows={3}
              placeholder="Doctor's findings and diagnosis"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? 'Saving...' : 'Record Visit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
