import { Home, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          {/* Company Info */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold">Nawy</span>
              <p className="text-sm text-gray-400">Find your perfect apartment</p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-sm">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-gray-300">Dubai, UAE</span>
            </div>
            <p className="text-sm text-gray-400">
              © 2024 Nawy. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

