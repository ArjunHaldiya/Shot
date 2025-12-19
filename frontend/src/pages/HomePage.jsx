import { useNavigate } from 'react-router-dom';

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Hero Section */}
        <div className="text-center mb-16 fade-in-up">
          <div className="mb-6">
            <div className="inline-block text-8xl mb-4 pulse">🍸</div>
          </div>
          <h1 className="text-7xl font-black text-white mb-4 tracking-tight">
            Shot
          </h1>
          <p className="text-2xl text-white/60 font-light">
            Your vibe. Your drink. Your moment.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Mood Card */}
          <div 
            onClick={() => navigate('/mood')}
            className="glass-strong rounded-3xl p-8 cursor-pointer hover:scale-105 hover:shadow-2xl group relative overflow-hidden stagger-item"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                🎭
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">
                Vibe Check
              </h2>
              <p className="text-white/60 text-lg leading-relaxed">
                Take our mood quiz and get personalized drink recommendations that match your energy
              </p>
              <div className="mt-6 flex items-center text-pink-400 font-semibold">
                <span>Start Quiz</span>
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Party Card */}
          <div 
            onClick={() => navigate('/party')}
            className="glass-strong rounded-3xl p-8 cursor-pointer hover:scale-105 hover:shadow-2xl group relative overflow-hidden stagger-item"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                📸
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">
                Party Wrapped
              </h2>
              <p className="text-white/60 text-lg leading-relaxed">
                Capture the night as it happens. Unlock all memories when the party ends
              </p>
              <div className="mt-6 flex items-center text-purple-400 font-semibold">
                <span>Create Party</span>
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tagline */}
        <div className="text-center text-white/40 text-sm font-light fade-in-up">
          <p>Made for moments worth remembering ✨</p>
        </div>
      </div>
    </div>
  );
}

export default HomePage;