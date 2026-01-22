import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import { getPatients, getRecentCertificates } from '../lib/api';
import { Users, FileText, Plus, Search, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

export default function Home() {
  const [patients, setPatients] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [patientsData, certsData] = await Promise.all([
          getPatients(),
          getRecentCertificates(5),
        ]);
        setPatients(patientsData);
        setCertificates(certsData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const CERT_TYPE_LABELS = {
    medical_leave: 'Medical Leave',
    lab_request: 'Lab Request',
    result_summary: 'Result Summary',
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Welcome to Clinic QuickCert</h1>
          <p className="text-primary-100 mb-6 max-w-2xl">
            Rapidly generate medical certificates and visit summaries for your patients.
            Register patients, record visits, and create printable certificates in seconds.
          </p>
          <div className="flex gap-4">
            <Link href="/patients" className="bg-white text-primary-700 px-5 py-2.5 rounded-lg font-medium hover:bg-primary-50 transition-colors inline-flex items-center gap-2">
              <Users className="h-5 w-5" />
              View Patients
            </Link>
            <Link href="/patients?new=true" className="bg-primary-500 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary-400 transition-colors inline-flex items-center gap-2 border border-primary-400">
              <Plus className="h-5 w-5" />
              Register Patient
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{patients.length}</p>
                <p className="text-sm text-gray-500">Registered Patients</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{certificates.length}</p>
                <p className="text-sm text-gray-500">Recent Certificates</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Search className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <Link href="/patients" className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-1">
                  Search Patients
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <p className="text-sm text-gray-500">Find by name or phone</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Patients */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Patients</h2>
              <Link href="/patients" className="text-sm text-primary-600 hover:text-primary-700">
                View all
              </Link>
            </div>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : patients.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No patients registered yet.</p>
                <Link href="/patients?new=true" className="text-primary-600 hover:text-primary-700 mt-2 inline-block">
                  Register your first patient
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {patients.slice(0, 5).map((patient) => (
                  <Link
                    key={patient.id}
                    href={`/patients/${patient.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {patient.first_name} {patient.last_name}
                      </p>
                      <p className="text-sm text-gray-500">{patient.phone || 'No phone'}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent Certificates */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Certificates</h2>
              <Link href="/certificates" className="text-sm text-primary-600 hover:text-primary-700">
                View all
              </Link>
            </div>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : certificates.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No certificates created yet.</p>
                <p className="text-sm mt-1">Create a visit to generate certificates.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {certificates.map((cert) => (
                  <Link
                    key={cert.id}
                    href={`/certificates/${cert.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {CERT_TYPE_LABELS[cert.cert_type]}
                      </p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(cert.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      QC-{cert.id.toString().padStart(6, '0')}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
