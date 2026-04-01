import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <nav className="flex items-center justify-between h-20">
          <div className="text-2xl font-bold text-green-700">Ndukaagu</div>
          <div className="space-x-4">
            <Link href="/login" className="text-gray-700 hover:text-green-700 transition">Login</Link>
            <Link href="/signup" className="bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-800 transition">Sign Up</Link>
          </div>
        </nav>

        {/* Hero */}
        <section className="py-20 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Master Indigenous Nigerian Languages
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Learn Igbo, Yoruba, Hausa, Ibibio, and Efik with AI-powered personalized learning, engaging lessons, and gamification rewards.
          </p>
          <Link href="/signup" className="bg-green-700 text-white px-8 py-4 rounded-lg text-lg hover:bg-green-800 transition inline-block">
            Start Learning Free
          </Link>
        </section>

        {/* Features */}
        <section className="grid md:grid-cols-3 gap-8 py-16">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold text-gray-900 mb-3">AI Tutoring</h3>
            <p className="text-gray-600">24/7 AI-powered language tutor providing personalized guidance and corrections.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Gamification</h3>
            <p className="text-gray-600">Earn badges, climb leaderboards, and maintain daily streaks as you learn.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Progress Tracking</h3>
            <p className="text-gray-600">Detailed analytics showing your learning journey and proficiency levels.</p>
          </div>
        </section>
      </div>
    </main>
  )
}
