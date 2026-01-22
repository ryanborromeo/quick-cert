import { useRef } from 'react';
import { format } from 'date-fns';
import { Download, Printer, X } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const CERT_TYPE_LABELS = {
  medical_leave: 'Medical Leave Certificate',
  lab_request: 'Laboratory Request Form',
  result_summary: 'Laboratory Result Summary',
};

export default function CertificatePreview({ certificate, patient, visit, onClose }) {
  const certRef = useRef(null);
  const certData = JSON.parse(certificate.cert_data);

  const handleDownloadPDF = async () => {
    if (!certRef.current) return;

    const canvas = await html2canvas(certRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(`certificate-${certificate.id}.pdf`);
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr) => {
    return format(new Date(dateStr), 'MMMM d, yyyy');
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full my-8">
        <div className="flex items-center justify-between p-4 border-b no-print">
          <h2 className="text-lg font-semibold">Certificate Preview</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="btn-secondary flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Print
            </button>
            <button
              onClick={handleDownloadPDF}
              className="btn-primary flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-8">
          <div
            ref={certRef}
            className="bg-white p-8 border-2 border-gray-200 rounded-lg"
            style={{ minHeight: '600px' }}
          >
            {/* Header */}
            <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
              <h1 className="text-2xl font-bold text-gray-900">CLINIC QUICKCERT</h1>
              <p className="text-sm text-gray-600 mt-1">
                123 Medical Center Drive, Metro Manila, Philippines
              </p>
              <p className="text-sm text-gray-600">
                Tel: (02) 8123-4567 | Email: info@quickcert.clinic
              </p>
            </div>

            {/* Certificate Title */}
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide">
                {CERT_TYPE_LABELS[certificate.cert_type]}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Certificate No: QC-{certificate.id.toString().padStart(6, '0')}
              </p>
            </div>

            {/* Patient Info */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Patient Name:</span>
                  <span className="ml-2 font-medium">
                    {patient.first_name} {patient.last_name}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Age:</span>
                  <span className="ml-2 font-medium">{calculateAge(patient.dob)} years old</span>
                </div>
                <div>
                  <span className="text-gray-500">Date of Birth:</span>
                  <span className="ml-2 font-medium">{formatDate(patient.dob)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Visit Date:</span>
                  <span className="ml-2 font-medium">{formatDate(visit.date)}</span>
                </div>
              </div>
            </div>

            {/* Certificate Content */}
            <div className="mb-8">
              {certificate.cert_type === 'medical_leave' && (
                <div className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    This is to certify that{' '}
                    <strong>
                      {patient.first_name} {patient.last_name}
                    </strong>{' '}
                    was examined and treated at this clinic on{' '}
                    <strong>{formatDate(visit.date)}</strong>.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    Based on the medical examination, the patient is advised to rest and is
                    excused from work/school for{' '}
                    <strong>{certData.days} day(s)</strong>, from{' '}
                    <strong>{formatDate(certData.start_date)}</strong> to{' '}
                    <strong>{formatDate(certData.end_date)}</strong>.
                  </p>
                  {visit.diagnosis && (
                    <p className="text-gray-700">
                      <span className="text-gray-500">Diagnosis:</span>{' '}
                      <span className="font-medium">{visit.diagnosis}</span>
                    </p>
                  )}
                  {certData.remarks && (
                    <p className="text-gray-700">
                      <span className="text-gray-500">Remarks:</span>{' '}
                      <span className="font-medium">{certData.remarks}</span>
                    </p>
                  )}
                </div>
              )}

              {certificate.cert_type === 'lab_request' && (
                <div className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    Please perform the following laboratory tests for{' '}
                    <strong>
                      {patient.first_name} {patient.last_name}
                    </strong>
                    :
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    {certData.tests.map((test, index) => (
                      <li key={index} className="text-gray-700 font-medium">
                        {test}
                      </li>
                    ))}
                  </ul>
                  {certData.fasting_required && (
                    <p className="text-red-600 font-medium">
                      ⚠️ FASTING REQUIRED: Patient should fast for 8-12 hours before the test.
                    </p>
                  )}
                  {certData.remarks && (
                    <p className="text-gray-700">
                      <span className="text-gray-500">Special Instructions:</span>{' '}
                      <span className="font-medium">{certData.remarks}</span>
                    </p>
                  )}
                </div>
              )}

              {certificate.cert_type === 'result_summary' && (
                <div className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    Laboratory results for{' '}
                    <strong>
                      {patient.first_name} {patient.last_name}
                    </strong>
                    :
                  </p>
                  <table className="w-full border-collapse border border-gray-300 text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-3 py-2 text-left">Test</th>
                        <th className="border border-gray-300 px-3 py-2 text-left">Result</th>
                        <th className="border border-gray-300 px-3 py-2 text-left">Reference</th>
                      </tr>
                    </thead>
                    <tbody>
                      {certData.results.map((result, index) => (
                        <tr key={index}>
                          <td className="border border-gray-300 px-3 py-2">{result.test}</td>
                          <td className="border border-gray-300 px-3 py-2 font-medium">
                            {result.value}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-gray-500">
                            {result.reference}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {certData.remarks && (
                    <p className="text-gray-700">
                      <span className="text-gray-500">Interpretation:</span>{' '}
                      <span className="font-medium">{certData.remarks}</span>
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-12 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-end">
                <div className="text-sm text-gray-500">
                  <p>Issued on: {formatDate(certificate.created_at)}</p>
                </div>
                <div className="text-center">
                  <div className="w-48 border-b border-gray-400 mb-1"></div>
                  <p className="font-medium">{visit.doctor}</p>
                  <p className="text-sm text-gray-500">Attending Physician</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
