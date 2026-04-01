export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Dashboard</h1>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Languages Learning</p>
            <p className="text-3xl font-bold text-green-700">5</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Lessons Completed</p>
            <p className="text-3xl font-bold text-green-700">24</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Current Streak</p>
            <p className="text-3xl font-bold text-green-700">7 days</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Total Points</p>
            <p className="text-3xl font-bold text-green-700">1,240</p>
          </div>
        </div>
      </div>
    </div>
  )
}
