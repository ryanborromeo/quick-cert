import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import PatientForm from '../../components/PatientForm';
import { getPatients, createPatient } from '../../lib/api';
import { Search, Plus, User, Phone, Calendar, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

export default function PatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (router.query.new === 'true') {
      setShowForm(true);
    }
  }, [router.query]);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async (query = '') => {
    setLoading(true);
    try {
      const data = await getPatients(query);
      setPatients(data);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPatients(searchQuery);
  };

  const handleCreatePatient = async (data) => {
    const newPatient = await createPatient(data);
    setShowForm(false);
    router.push(`/patients/${newPatient.id}`);
  };

  const calculateAge = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
            <p className="text-gray-500">Manage patient records and registrations</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Register Patient
          </button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="card">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or phone number..."
                className="input pl-10"
              />
            </div>
            <button type="submit" className="btn-primary">
              Search
            </button>
          </div>
        </form>

        {/* Patient List */}
        <div className="card">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading patients...</div>
          ) : patients.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No patients found</p>
              <button
                onClick={() => setShowForm(true)}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Register your first patient
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {patients.map((patient) => (
                <Link
                  key={patient.id}
                  href={`/patients/${patient.id}`}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors -mx-6 px-6 first:-mt-6 first:pt-6 last:-mb-6 last:pb-6"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-700 font-semibold text-lg">
                        {patient.first_name[0]}
                        {patient.last_name[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {patient.first_name} {patient.last_name}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        {patient.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3.5 w-3.5" />
                            {patient.phone}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {calculateAge(patient.dob)} years old
                        </span>
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <PatientForm
          onSubmit={handleCreatePatient}
          onCancel={() => {
            setShowForm(false);
            router.replace('/patients', undefined, { shallow: true });
          }}
        />
      )}
    </Layout>
  );
}
