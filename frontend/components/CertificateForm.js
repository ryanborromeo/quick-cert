import { useState } from 'react';
import { X } from 'lucide-react';

const CERT_TYPES = [
  { value: 'medical_leave', label: 'Medical Leave Certificate' },
  { value: 'lab_request', label: 'Laboratory Request' },
  { value: 'result_summary', label: 'Result Summary' },
];

export default function CertificateForm({ visit, onSubmit, onCancel }) {
  const [certType, setCertType] = useState('medical_leave');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Medical Leave fields
  const today = new Date().toISOString().split('T')[0];
  const [leaveData, setLeaveData] = useState({
    start_date: visit?.date || today,
    end_date: visit?.date || today,
    days: 1,
    remarks: '',
  });

  // Lab Request fields
  const [labData, setLabData] = useState({
    tests: '',
    fasting_required: false,
    remarks: '',
  });

  // Result Summary fields
  const [resultData, setResultData] = useState({
    results: [{ test: '', value: '', reference: '' }],
    remarks: '',
  });

  const handleLeaveChange = (e) => {
    const { name, value } = e.target;
    setLeaveData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'start_date' || name === 'end_date') {
        const start = new Date(updated.start_date);
        const end = new Date(updated.end_date);
        const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        updated.days = diff > 0 ? diff : 1;
      }
      return updated;
    });
  };

  const handleLabChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLabData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleResultChange = (index, field, value) => {
    setResultData((prev) => {
      const results = [...prev.results];
      results[index] = { ...results[index], [field]: value };
      return { ...prev, results };
    });
  };

  const addResultRow = () => {
    setResultData((prev) => ({
      ...prev,
      results: [...prev.results, { test: '', value: '', reference: '' }],
    }));
  };

  const removeResultRow = (index) => {
    setResultData((prev) => ({
      ...prev,
      results: prev.results.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let certData;
    if (certType === 'medical_leave') {
      certData = leaveData;
    } else if (certType === 'lab_request') {
      certData = {
        ...labData,
        tests: labData.tests.split(',').map((t) => t.trim()).filter(Boolean),
      };
    } else {
      certData = {
        ...resultData,
        results: resultData.results.filter((r) => r.test),
      };
    }

    try {
      await onSubmit({
        cert_type: certType,
        cert_data: JSON.stringify(certData),
      });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Create Certificate</h2>
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
            <label className="label">Certificate Type *</label>
            <select
              value={certType}
              onChange={(e) => setCertType(e.target.value)}
              className="input"
            >
              {CERT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {certType === 'medical_leave' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Start Date *</label>
                  <input
                    type="date"
                    name="start_date"
                    value={leaveData.start_date}
                    onChange={handleLeaveChange}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">End Date *</label>
                  <input
                    type="date"
                    name="end_date"
                    value={leaveData.end_date}
                    onChange={handleLeaveChange}
                    className="input"
                    required
                  />
                </div>
              </div>
              <div className="text-sm text-gray-600">
                Duration: <strong>{leaveData.days} day(s)</strong>
              </div>
              <div>
                <label className="label">Remarks</label>
                <textarea
                  name="remarks"
                  value={leaveData.remarks}
                  onChange={handleLeaveChange}
                  className="input"
                  rows={2}
                  placeholder="Additional notes"
                />
              </div>
            </>
          )}

          {certType === 'lab_request' && (
            <>
              <div>
                <label className="label">Tests (comma-separated) *</label>
                <textarea
                  name="tests"
                  value={labData.tests}
                  onChange={handleLabChange}
                  className="input"
                  rows={2}
                  placeholder="CBC, Lipid Panel, FBS"
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="fasting_required"
                  id="fasting_required"
                  checked={labData.fasting_required}
                  onChange={handleLabChange}
                  className="h-4 w-4 text-primary-600 rounded"
                />
                <label htmlFor="fasting_required" className="text-sm text-gray-700">
                  Fasting required
                </label>
              </div>
              <div>
                <label className="label">Remarks</label>
                <textarea
                  name="remarks"
                  value={labData.remarks}
                  onChange={handleLabChange}
                  className="input"
                  rows={2}
                  placeholder="Special instructions"
                />
              </div>
            </>
          )}

          {certType === 'result_summary' && (
            <>
              <div>
                <label className="label">Test Results</label>
                {resultData.results.map((result, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={result.test}
                      onChange={(e) => handleResultChange(index, 'test', e.target.value)}
                      className="input flex-1"
                      placeholder="Test name"
                    />
                    <input
                      type="text"
                      value={result.value}
                      onChange={(e) => handleResultChange(index, 'value', e.target.value)}
                      className="input w-24"
                      placeholder="Value"
                    />
                    <input
                      type="text"
                      value={result.reference}
                      onChange={(e) => handleResultChange(index, 'reference', e.target.value)}
                      className="input w-28"
                      placeholder="Reference"
                    />
                    {resultData.results.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeResultRow(index)}
                        className="text-red-500 hover:text-red-700 px-2"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addResultRow}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  + Add another result
                </button>
              </div>
              <div>
                <label className="label">Remarks</label>
                <textarea
                  value={resultData.remarks}
                  onChange={(e) => setResultData((prev) => ({ ...prev, remarks: e.target.value }))}
                  className="input"
                  rows={2}
                  placeholder="Summary and recommendations"
                />
              </div>
            </>
          )}

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
              {loading ? 'Creating...' : 'Create Certificate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
