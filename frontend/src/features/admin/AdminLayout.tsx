import type { ReactNode } from "react";
import { Link } from "react-router-dom";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-blue-200 border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/admin" className="text-xl font-bold text-gray-900">
            Admin • PetCare+
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/admin" className="text-gray-600 hover:text-gray-900">
              Dashboard
            </Link>
            <Link
              to="/admin/vets/new"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              + Create Vet
            </Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
