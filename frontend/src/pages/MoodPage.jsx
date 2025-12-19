import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMoodQuestions, getSuggestions } from '../services/api';

function MoodPage() {
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  console.log('MoodPage state:', { currentQuestion, answers, suggestions, loading });

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const data = await getMoodQuestions();
        setQuestions(data.questions);
        setLoading(false);
      } catch {
        setError('Failed to load questions. Is the backend running?');
        setLoading(false);
      }
    };

    loadQuestions();
  }, []);

  const handleAnswer = (answerIndex) => {
    const newAnswers = [...answers, answerIndex];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setCurrentQuestion(questions.length);
    }
  };

  const handlePreference = async (pref) => {
    setLoading(true);

    try {
      const data = await getSuggestions(answers, pref);
      setSuggestions(data);
      setLoading(false);
    } catch {
      setError('Failed to get suggestions');
      setLoading(false);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setSuggestions(null);
  };

  const shareResults = () => {
    const text = `My Shot vibe today:\n\n${suggestions.suggestions.map((d, i) => `${i + 1}. ${d.name}`).join('\n')}\n\nFind your drink at Shot! 🍹`;
    
    if (navigator.share) {
      navigator.share({
        title: 'My Shot Results',
        text: text,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      alert('Results copied to clipboard! 📋');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 pulse">🍹</div>
          <div className="text-white text-xl">Loading your vibe...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <div className="glass-strong rounded-3xl p-8 max-w-md">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-4">Oops!</h2>
          <p className="text-white/80 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-gradient-to-r from-pink-500 to-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-pink-500/50"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }


  // Results Screen - SHAREABLE DESIGN
  if (suggestions) {
    console.log('Rendering results:', suggestions);
  
    
    const getRarityColor = (rarity) => {
      const colors = {
        common: 'from-gray-400 to-gray-600',
        rare: 'from-blue-400 to-blue-600',
        epic: 'from-purple-400 to-purple-600',
        legendary: 'from-yellow-400 to-orange-600'
      };
      return colors[rarity] || colors.common;
    };

    const getRarityBadge = (rarity) => {
      const badges = {
        common: '⚪',
        rare: '🔵',
        epic: '🟣',
        legendary: '🟡'
      };
      return badges[rarity] || badges.common;
    };

    const nextSlide = () => {
      setCurrentSlide((prev) => (prev + 1) % suggestions.suggestions.length);
    };

    const prevSlide = () => {
      setCurrentSlide((prev) => (prev - 1 + suggestions.suggestions.length) % suggestions.suggestions.length);
    };
    
    return (
      <div className="min-h-screen py-12 px-4" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 fade-in-up">
            <div className="text-6xl mb-4">✨</div>
            <h1 className="text-5xl font-black text-white mb-3">
              Your Vibe Match
            </h1>
            <p className="text-2xl gradient-text font-bold">
              {suggestions.mood_summary}
            </p>
          </div>

          {/* Carousel View - Swipeable Cards */}
          <div className="mb-12">
            {/* Carousel Container */}
            <div className="relative">
              {/* Cards Display */}
              <div className="overflow-hidden rounded-3xl">
                <div 
                  className="flex transition-transform duration-500 ease-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {suggestions.suggestions.map((drink, index) => (
                    <div
                      key={index}
                      className="w-full flex-shrink-0 px-4"
                    >
                      {/* Compact Card (Click to Expand) */}
                      {selectedCard !== index ? (
                        <div
                          onClick={() => setSelectedCard(index)}
                          className="glass-strong rounded-3xl p-1 cursor-pointer hover:scale-105 transition-all duration-300 relative overflow-hidden group"
                          style={{ 
                            background: `linear-gradient(135deg, ${drink.color?.replace('from-', '').replace('to-', ', ')})`,
                          }}
                        >
                          {/* Shine effect */}
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500"
                               style={{
                                 background: 'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)',
                                 animation: 'shine 3s infinite'
                               }} />

                          <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-3xl p-8 relative">
                            {/* Compact View */}
                            <div className="flex items-center justify-between mb-6">
                              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getRarityColor(drink.rarity)} flex items-center justify-center text-xl font-black text-white`}>
                                #{index + 1}
                              </div>
                              <div className="text-2xl">{getRarityBadge(drink.rarity)}</div>
                            </div>

                            <div className="text-center">
                              <div className="text-7xl mb-6 group-hover:scale-110 transition-transform">
                                {drink.icon || (index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉')}
                              </div>
                              
                              <h3 className="text-4xl font-black text-white mb-3">
                                {drink.name}
                              </h3>
                              
                              <p className="text-white/70 text-lg mb-6 italic">
                                "{drink.description}"
                              </p>

                              <div className="glass px-6 py-3 rounded-full inline-flex items-center gap-2 text-white/80">
                                <span className="text-sm">Tap to view details</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Expanded Card (Full Pokemon Details) */
                        <div
                          className="glass-strong rounded-3xl p-1 relative overflow-hidden"
                          style={{ 
                            background: `linear-gradient(135deg, ${drink.color?.replace('from-', '').replace('to-', ', ')})`,
                          }}
                        >
                          <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-3xl p-8 relative max-h-[80vh] overflow-y-auto">
                            
                            {/* Close Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCard(null);
                              }}
                              className="absolute top-4 right-4 w-10 h-10 rounded-full glass flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 z-10"
                            >
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>

                            {/* Full Card Content */}
                            <div className="fade-in-up">
                              {/* Top Section */}
                              <div className="flex justify-between items-start mb-8">
                                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getRarityColor(drink.rarity)} flex items-center justify-center text-3xl font-black text-white shadow-xl`}>
                                  #{index + 1}
                                </div>
                                <div className="text-right">
                                  <div className="text-4xl mb-1">{getRarityBadge(drink.rarity)}</div>
                                  <div className="text-xs text-white/60 uppercase tracking-wider font-bold">
                                    {drink.rarity}
                                  </div>
                                </div>
                              </div>

                              {/* Icon */}
                              <div className="text-center mb-8">
                                <div className="text-8xl mb-4 inline-block pulse">
                                  {drink.icon || (index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉')}
                                </div>
                              </div>

                              {/* Name */}
                              <div className="text-center mb-8">
                                <h3 className="text-5xl font-black text-white mb-3 tracking-tight">
                                  {drink.name}
                                </h3>
                                <p className="text-white/70 text-xl italic">
                                  "{drink.description}"
                                </p>
                              </div>

                              {/* Stats */}
                              <div className="glass rounded-2xl p-6 mb-6">
                                <div className="text-white/60 text-xs uppercase tracking-wider font-bold mb-4">Stats</div>
                                
                                <div className="space-y-4">
                                  <div>
                                    <div className="flex justify-between text-sm text-white/80 mb-2">
                                      <span className="font-semibold">💪 Strength</span>
                                      <span className="font-mono">{drink.strength || 5}/10</span>
                                    </div>
                                    <div className="bg-white/10 rounded-full h-3 overflow-hidden">
                                      <div 
                                        className="bg-gradient-to-r from-red-500 to-orange-500 h-full rounded-full transition-all duration-1000"
                                        style={{ width: `${(drink.strength || 5) * 10}%` }}
                                      />
                                    </div>
                                  </div>

                                  <div>
                                    <div className="flex justify-between text-sm text-white/80 mb-2">
                                      <span className="font-semibold">🍬 Sweetness</span>
                                      <span className="font-mono">{drink.sweetness || 5}/10</span>
                                    </div>
                                    <div className="bg-white/10 rounded-full h-3 overflow-hidden">
                                      <div 
                                        className="bg-gradient-to-r from-pink-500 to-purple-500 h-full rounded-full transition-all duration-1000"
                                        style={{ width: `${(drink.sweetness || 5) * 10}%` }}
                                      />
                                    </div>
                                  </div>

                                  <div>
                                    <div className="flex justify-between text-sm text-white/80 mb-2">
                                      <span className="font-semibold">🎨 Complexity</span>
                                      <span className="font-mono">{drink.complexity || 5}/10</span>
                                    </div>
                                    <div className="bg-white/10 rounded-full h-3 overflow-hidden">
                                      <div 
                                        className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full rounded-full transition-all duration-1000"
                                        style={{ width: `${(drink.complexity || 5) * 10}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* ABV */}
                              {drink.abv && (
                                <div className="flex justify-center mb-6">
                                  <div className="glass px-6 py-3 rounded-full">
                                    <span className="text-white/60 text-sm mr-2">ABV:</span>
                                    <span className="text-white font-bold text-lg">{drink.abv}</span>
                                  </div>
                                </div>
                              )}

                              {/* Brands */}
                              {drink.brands && drink.brands.length > 0 && (
                                <div className="glass rounded-2xl p-6">
                                  <div className="text-white/60 text-xs uppercase tracking-wider font-bold mb-4">
                                    🏷️ Recommended Brands
                                  </div>
                                  <div className="flex flex-wrap gap-3">
                                    {drink.brands.map((brand, i) => (
                                      <div 
                                        key={i}
                                        className="glass-strong px-4 py-3 rounded-xl text-white/80 text-sm font-medium hover:bg-white/20 transition-all"
                                      >
                                        {brand}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Match Score */}
                              <div className="mt-8 flex items-center justify-center gap-3">
                                <div className="flex gap-1">
                                  {[...Array(10)].map((_, i) => (
                                    <div 
                                      key={i} 
                                      className={`w-2 h-2 rounded-full ${
                                        i < (10 - (drink.match_score || 0))
                                          ? 'bg-gradient-to-r from-pink-500 to-orange-500'
                                          : 'bg-white/20'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-white/50 text-xs font-semibold">PERFECT MATCH</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Arrows */}
              {suggestions.suggestions.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 rounded-full glass-strong flex items-center justify-center text-white hover:bg-white/20 transition-all z-10"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 rounded-full glass-strong flex items-center justify-center text-white hover:bg-white/20 transition-all z-10"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Slide Indicators */}
            <div className="flex justify-center gap-2 mt-8">
              {suggestions.suggestions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 rounded-full transition-all ${
                    currentSlide === index 
                      ? 'w-8 bg-gradient-to-r from-pink-500 to-orange-500' 
                      : 'w-2 bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4 fade-in-up">
            {/* Share Button - PRIMARY ACTION */}
            <button
              onClick={shareResults}
              className="w-full bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 text-white px-8 py-5 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-pink-500/50 hover:scale-105 flex items-center justify-center gap-3 group"
            >
              <svg className="w-6 h-6 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share Your Vibe
            </button>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={resetQuiz}
                className="glass text-white px-6 py-4 rounded-2xl font-semibold hover:bg-white/10"
              >
                Retake Quiz
              </button>
              <button
                onClick={() => navigate('/')}
                className="glass text-white px-6 py-4 rounded-2xl font-semibold hover:bg-white/10"
              >
                Home
              </button>
            </div>
          </div>

          {/* Branding */}
          <div className="text-center mt-8 text-white/30 text-sm">
            <p>Powered by Shot 🍸</p>
          </div>
        </div>
      </div>
    );
  }

  // Preference Selection
  if (currentQuestion === questions.length) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="glass-strong rounded-3xl p-8 fade-in-up">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">🍸</div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Last Question
              </h2>
              <p className="text-white/60 text-lg">
                What's your preference?
              </p>
            </div>

            <div className="space-y-3">
              {[
                { value: 'cocktails', label: 'Cocktails', emoji: '🍹', gradient: 'from-pink-500 to-purple-500' },
                { value: 'hard', label: 'Hard Liquor', emoji: '🥃', gradient: 'from-amber-500 to-orange-500' },
                { value: 'soft', label: 'Beer/Wine', emoji: '🍺', gradient: 'from-yellow-500 to-amber-500' },
              ].map((pref) => (
                <button
                  key={pref.value}
                  onClick={() => handlePreference(pref.value)}
                  className="w-full glass hover:glass-strong p-6 rounded-2xl text-left border border-white/10 hover:border-white/30 flex items-center gap-4 group hover:scale-105"
                >
                  <div className="text-4xl group-hover:scale-110 transition-transform">{pref.emoji}</div>
                  <div className="flex-1">
                    <div className="text-xl font-bold text-white">{pref.label}</div>
                  </div>
                  <svg className="w-6 h-6 text-white/40 group-hover:text-white/80 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Question Screen
  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Progress */}
        <div className="mb-8 fade-in-up">
          <div className="flex justify-between text-white/60 text-sm mb-3 font-semibold">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="bg-white/10 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-pink-500 to-orange-500 h-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="glass-strong rounded-3xl p-10 fade-in-up">
          <h2 className="text-3xl font-bold text-white mb-8 leading-tight">
            {question.question}
          </h2>

          {/* Options */}
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                className="w-full glass hover:glass-strong p-5 rounded-2xl text-left border border-white/10 hover:border-white/30 text-white text-lg hover:scale-102 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  <svg className="w-5 h-5 text-white/0 group-hover:text-white/60 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Back */}
        <button
          onClick={() => navigate('/')}
          className="mt-6 text-white/40 hover:text-white/80 text-sm flex items-center gap-2 mx-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default MoodPage;