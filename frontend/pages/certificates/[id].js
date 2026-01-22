import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import CertificatePreview from '../../components/CertificatePreview';
import { getCertificate } from '../../lib/api';
import { ArrowLeft } from 'lucide-react';

export default function CertificateDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchCertificate();
    }
  }, [id]);

  const fetchCertificate = async () => {
    try {
      const data = await getCertificate(id);
      setCertificate(data);
    } catch (error) {
      console.error('Failed to fetch certificate:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12 text-gray-500">Loading certificate...</div>
      </Layout>
    );
  }

  if (!certificate) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Certificate not found</p>
          <Link href="/certificates" className="text-primary-600 hover:text-primary-700">
            Back to certificates
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <Link
          href="/certificates"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Certificates
        </Link>

        <CertificatePreview
          certificate={certificate}
          patient={certificate.patient}
          visit={certificate.visit}
          onClose={() => router.push('/certificates')}
        />
      </div>
    </Layout>
  );
}
