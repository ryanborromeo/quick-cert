import { useState } from 'react';
import { X } from 'lucide-react';

export default function PatientForm({ patient, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    first_name: patient?.first_name || '',
    last_name: patient?.last_name || '',
    dob: patient?.dob || '',
    phone: patient?.phone || '',
    notes: patient?.notes || '',
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
          <h2 className="text-lg font-semibold">
            {patient ? 'Edit Patient' : 'Register New Patient'}
          </h2>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">First Name *</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Last Name *</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Date of Birth *</label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          <div>
            <label className="label">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="input"
              placeholder="+63 9XX XXX XXXX"
            />
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="input"
              rows={3}
              placeholder="Allergies, conditions, etc."
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
              {loading ? 'Saving...' : patient ? 'Update' : 'Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
