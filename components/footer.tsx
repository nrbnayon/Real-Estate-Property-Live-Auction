import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="h-8 w-8 rounded bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">AZ</span>
              </div>
              <span className="font-bold text-xl">Deal Hub</span>
            </div>
            <p className="text-sm text-gray-600">
              AI-powered real estate acquisition platform for distressed properties in Arizona.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/properties" className="text-gray-600 hover:text-blue-600">
                  Browse Properties
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-gray-600 hover:text-blue-600">
                  Admin Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Features</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>AI Comp Analysis</li>
              <li>Automated Bidding</li>
              <li>Skip Tracing</li>
              <li>SMS Notifications</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <p className="text-sm text-gray-600">Arizona Real Estate Opportunities</p>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-gray-600">
          <p>&copy; 2024 AZ Deal Hub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
