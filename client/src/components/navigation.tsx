import { Link, useLocation } from "wouter";

export default function Navigation() {
  const [location] = useLocation();

  return (
    <nav className="bg-surface shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <i className="fas fa-headset text-primary text-2xl"></i>
            <h1 className="text-xl font-medium text-gray-900">IssueTracker</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/">
              <button 
                data-testid="button-customer-view"
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  location === '/' 
                    ? 'text-primary bg-blue-50 hover:bg-blue-100' 
                    : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <i className="fas fa-user mr-2"></i>Customer View
              </button>
            </Link>
            <Link href="/team">
              <button 
                data-testid="button-team-view"
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  location === '/team' 
                    ? 'text-primary bg-blue-50 hover:bg-blue-100' 
                    : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <i className="fas fa-users mr-2"></i>Team Dashboard
              </button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
