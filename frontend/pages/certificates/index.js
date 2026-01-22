import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { getRecentCertificates } from '../../lib/api';
import { FileText, ArrowRight, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const data = await getRecentCertificates(50);
      setCertificates(data);
    } catch (error) {
      console.error('Failed to fetch certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const CERT_TYPE_LABELS = {
    medical_leave: 'Medical Leave Certificate',
    lab_request: 'Laboratory Request',
    result_summary: 'Result Summary',
  };

  const CERT_TYPE_COLORS = {
    medical_leave: 'bg-blue-100 text-blue-700',
    lab_request: 'bg-purple-100 text-purple-700',
    result_summary: 'bg-green-100 text-green-700',
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Certificates</h1>
          <p className="text-gray-500">View and manage all generated certificates</p>
        </div>

        {/* Certificate List */}
        <div className="card">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading certificates...</div>
          ) : certificates.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No certificates created yet</p>
              <Link href="/patients" className="text-primary-600 hover:text-primary-700 font-medium">
                Go to patients to create certificates
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {certificates.map((cert) => (
                <Link
                  key={cert.id}
                  href={`/certificates/${cert.id}`}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors -mx-6 px-6 first:-mt-6 first:pt-6 last:-mb-6 last:pb-6"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gray-100 rounded-lg">
                      <FileText className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          QC-{cert.id.toString().padStart(6, '0')}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            CERT_TYPE_COLORS[cert.cert_type]
                          }`}
                        >
                          {CERT_TYPE_LABELS[cert.cert_type]}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {format(new Date(cert.created_at), 'MMMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
