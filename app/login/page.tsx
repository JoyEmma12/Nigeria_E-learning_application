export const dynamic = 'force-dynamic'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Welcome Back</h1>
        <p className="text-gray-600 mb-8">Login to continue learning indigenous Nigerian languages.</p>
        <div className="space-y-4">
          <input type="email" placeholder="Email" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
          <input type="password" placeholder="Password" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
          <button className="w-full bg-green-700 text-white py-2 rounded-lg hover:bg-green-800 transition font-semibold">Login</button>
        </div>
        <p className="text-center text-gray-600 mt-6">Don&apos;t have an account? <a href="/signup" className="text-green-700 hover:underline">Sign up</a></p>
      </div>
    </div>
  )
}
