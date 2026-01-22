import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import VisitForm from '../../components/VisitForm';
import CertificateForm from '../../components/CertificateForm';
import CertificatePreview from '../../components/CertificatePreview';
import { getPatient, createVisit, createCertificate, getCertificate } from '../../lib/api';
import {
  ArrowLeft,
  User,
  Phone,
  Calendar,
  FileText,
  Plus,
  Stethoscope,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { format } from 'date-fns';

export default function PatientDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showVisitForm, setShowVisitForm] = useState(false);
  const [showCertForm, setShowCertForm] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [expandedVisits, setExpandedVisits] = useState({});
  const [previewCert, setPreviewCert] = useState(null);

  useEffect(() => {
    if (id) {
      fetchPatient();
    }
  }, [id]);

  const fetchPatient = async () => {
    setLoading(true);
    try {
      const data = await getPatient(id);
      setPatient(data);
      // Auto-expand first visit if exists
      if (data.visits?.length > 0) {
        setExpandedVisits({ [data.visits[0].id]: true });
      }
    } catch (error) {
      console.error('Failed to fetch patient:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVisit = async (data) => {
    await createVisit(id, data);
    setShowVisitForm(false);
    fetchPatient();
  };

  const handleCreateCertificate = async (data) => {
    const cert = await createCertificate(selectedVisit.id, data);
    setShowCertForm(false);
    setSelectedVisit(null);
    fetchPatient();
    // Show preview
    const fullCert = await getCertificate(cert.id);
    setPreviewCert(fullCert);
  };

  const handleViewCertificate = async (certId) => {
    const cert = await getCertificate(certId);
    setPreviewCert(cert);
  };

  const toggleVisit = (visitId) => {
    setExpandedVisits((prev) => ({
      ...prev,
      [visitId]: !prev[visitId],
    }));
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

  const CERT_TYPE_LABELS = {
    medical_leave: 'Medical Leave',
    lab_request: 'Lab Request',
    result_summary: 'Result Summary',
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12 text-gray-500">Loading patient...</div>
      </Layout>
    );
  }

  if (!patient) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Patient not found</p>
          <Link href="/patients" className="text-primary-600 hover:text-primary-700">
            Back to patients
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Back Button */}
        <Link
          href="/patients"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Patients
        </Link>

        {/* Patient Info Card */}
        <div className="card">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-primary-700 font-bold text-2xl">
                  {patient.first_name[0]}
                  {patient.last_name[0]}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {patient.first_name} {patient.last_name}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-gray-500 mt-2">
                  {patient.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-4 w-4" />
                      {patient.phone}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(patient.dob), 'MMMM d, yyyy')} ({calculateAge(patient.dob)}{' '}
                    years old)
                  </span>
                </div>
                {patient.notes && (
                  <p className="mt-3 text-gray-600 bg-gray-50 p-3 rounded-lg text-sm">
                    {patient.notes}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => setShowVisitForm(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Record Visit
            </button>
          </div>
        </div>

        {/* Visits Section */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Visit History</h2>

          {patient.visits?.length === 0 ? (
            <div className="text-center py-8">
              <Stethoscope className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No visits recorded yet</p>
              <button
                onClick={() => setShowVisitForm(true)}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Record first visit
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {patient.visits.map((visit) => (
                <div
                  key={visit.id}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => toggleVisit(visit.id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Stethoscope className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">{visit.reason}</p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(visit.date), 'MMMM d, yyyy')} • {visit.doctor}
                        </p>
                      </div>
                    </div>
                    {expandedVisits[visit.id] ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </button>

                  {expandedVisits[visit.id] && (
                    <div className="px-4 pb-4 border-t border-gray-100">
                      <div className="pt-4 space-y-4">
                        {visit.diagnosis && (
                          <div>
                            <p className="text-sm text-gray-500">Diagnosis</p>
                            <p className="text-gray-900">{visit.diagnosis}</p>
                          </div>
                        )}

                        {/* Certificates for this visit */}
                        {visit.certificates?.length > 0 && (
                          <div>
                            <p className="text-sm text-gray-500 mb-2">Certificates</p>
                            <div className="flex flex-wrap gap-2">
                              {visit.certificates.map((cert) => (
                                <button
                                  key={cert.id}
                                  onClick={() => handleViewCertificate(cert.id)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm hover:bg-green-100 transition-colors"
                                >
                                  <FileText className="h-4 w-4" />
                                  {CERT_TYPE_LABELS[cert.cert_type]}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        <button
                          onClick={() => {
                            setSelectedVisit(visit);
                            setShowCertForm(true);
                          }}
                          className="btn-secondary inline-flex items-center gap-2 text-sm"
                        >
                          <Plus className="h-4 w-4" />
                          Create Certificate
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showVisitForm && (
        <VisitForm onSubmit={handleCreateVisit} onCancel={() => setShowVisitForm(false)} />
      )}

      {showCertForm && selectedVisit && (
        <CertificateForm
          visit={selectedVisit}
          onSubmit={handleCreateCertificate}
          onCancel={() => {
            setShowCertForm(false);
            setSelectedVisit(null);
          }}
        />
      )}

      {previewCert && (
        <CertificatePreview
          certificate={previewCert}
          patient={previewCert.patient || patient}
          visit={previewCert.visit || selectedVisit}
          onClose={() => setPreviewCert(null)}
        />
      )}
    </Layout>
  );
}
