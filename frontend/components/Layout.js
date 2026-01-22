import Link from 'next/link';
import { useRouter } from 'next/router';
import { FileText, Users, Home, ClipboardList } from 'lucide-react';

export default function Layout({ children }) {
  const router = useRouter();

  const navItems = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/patients', label: 'Patients', icon: Users },
    { href: '/certificates', label: 'Certificates', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 fixed w-full z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2">
                <ClipboardList className="h-8 w-8 text-primary-600" />
                <span className="text-xl font-bold text-gray-900">QuickCert</span>
              </Link>
              <div className="hidden sm:ml-10 sm:flex sm:space-x-4">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = router.pathname === item.href || 
                    (item.href !== '/' && router.pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
