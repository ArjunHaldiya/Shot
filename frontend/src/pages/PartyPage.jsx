import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createParty,
  joinParty,
  getPartyStatus,
  uploadPhoto,
  getPartyPhotos,
} from '../services/api';

function PartyPage() {
  const navigate = useNavigate();

  // State
  const [mode, setMode] = useState('select'); // 'select', 'create', 'join', 'active', 'ended'
  const [partyCode, setPartyCode] = useState('');
  const [userName, setUserName] = useState('');
  const [partyData, setPartyData] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Create party form state
  const [hostName, setHostName] = useState('');
  const [duration, setDuration] = useState(4);

  // Helper functions wrapped in useCallback to prevent re-creation
  const loadPhotos = useCallback(async () => {
    try {
      const data = await getPartyPhotos(partyCode);
      setPhotos(data.photos);
    } catch (err) {
      console.error('Failed to load photos:', err);
    }
  }, [partyCode]);

  const checkPartyStatus = useCallback(async () => {
    try {
      const status = await getPartyStatus(partyCode);
      setPartyData(status.party);
      setTimeRemaining(status.time_remaining);

      // If party ended, switch to ended mode
      if (status.has_ended) {
        setMode('ended');
        await loadPhotos();
      }
    } catch (err) {
      console.error('Failed to check party status:', err);
    }
  }, [partyCode, loadPhotos]);

  // Poll party status every 30 seconds when in active mode
  useEffect(() => {
    if (mode === 'active' && partyCode) {
      checkPartyStatus(); // Initial check
      
      const interval = setInterval(() => {
        checkPartyStatus();
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [mode, partyCode, checkPartyStatus]);

  const handleCreateParty = async () => {
    if (!hostName.trim()) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await createParty(hostName, duration);
      setPartyCode(result.party_code);
      setUserName(hostName);
      setMode('active');
      await checkPartyStatus();
    } catch {
      setError('Failed to create party');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinParty = async () => {
    if (!partyCode.trim() || !userName.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await joinParty(partyCode.toUpperCase(), userName);
      setMode('active');
      await checkPartyStatus();
    } catch {
      setError('Failed to join party. Check the party code!');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Photo must be under 5MB');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await uploadPhoto(partyCode, file, userName);
      alert(`📸 ${result.message} Total: ${result.total_photos}`);
      await checkPartyStatus(); // Refresh party data
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload photo');
    } finally {
      setLoading(false);
      event.target.value = ''; // Reset file input
    }
  };

  const handleEndParty = async () => {
    setMode('ended');
    await loadPhotos();
  };

  // ==================== RENDER MODES ====================

  // Mode: Select (Create or Join)
  if (mode === 'select') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <button
            onClick={() => navigate('/')}
            className="text-white/80 hover:text-white mb-4"
          >
            ← Back to Home
          </button>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h1 className="text-3xl font-bold text-white mb-2">
              Party Wrapped 📸
            </h1>
            <p className="text-white/70 mb-6">
              Capture memories throughout the night. Unlock them when it ends!
            </p>

            <div className="space-y-3">
              <button
                onClick={() => setMode('create')}
                className="w-full bg-white text-purple-600 p-4 rounded-xl font-semibold hover:bg-white/90"
              >
                🎉 Create New Party
              </button>
              <button
                onClick={() => setMode('join')}
                className="w-full bg-white/20 text-white p-4 rounded-xl font-semibold hover:bg-white/30"
              >
                🎫 Join Existing Party
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mode: Create Party
  if (mode === 'create') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <button
            onClick={() => setMode('select')}
            className="text-white/80 hover:text-white mb-4"
          >
            ← Back
          </button>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-6">
              Create Your Party 🎉
            </h2>

            {error && (
              <div className="bg-red-500/20 text-white p-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-white/80 text-sm mb-2 block">
                  Your Name
                </label>
                <input
                  type="text"
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-white/10 text-white p-3 rounded-lg border border-white/20 focus:border-white/50 outline-none"
                />
              </div>

              <div>
                <label className="text-white/80 text-sm mb-2 block">
                  Party Duration: {duration} hours
                </label>
                <input
                  type="range"
                  min="1"
                  max="12"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-white/60 text-xs mt-1">
                  <span>1hr</span>
                  <span>12hrs</span>
                </div>
              </div>

              <button
                onClick={handleCreateParty}
                disabled={loading}
                className="w-full bg-white text-purple-600 p-4 rounded-xl font-semibold hover:bg-white/90 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Party 🎊'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mode: Join Party
  if (mode === 'join') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <button
            onClick={() => setMode('select')}
            className="text-white/80 hover:text-white mb-4"
          >
            ← Back
          </button>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-6">
              Join a Party 🎫
            </h2>

            {error && (
              <div className="bg-red-500/20 text-white p-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-white/80 text-sm mb-2 block">
                  Party Code
                </label>
                <input
                  type="text"
                  value={partyCode}
                  onChange={(e) => setPartyCode(e.target.value.toUpperCase())}
                  placeholder="ABC123"
                  maxLength={6}
                  className="w-full bg-white/10 text-white p-3 rounded-lg border border-white/20 focus:border-white/50 outline-none text-center text-2xl tracking-widest font-mono"
                />
              </div>

              <div>
                <label className="text-white/80 text-sm mb-2 block">
                  Your Name
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full bg-white/10 text-white p-3 rounded-lg border border-white/20 focus:border-white/50 outline-none"
                />
              </div>

              <button
                onClick={handleJoinParty}
                disabled={loading}
                className="w-full bg-white text-purple-600 p-4 rounded-xl font-semibold hover:bg-white/90 disabled:opacity-50"
              >
                {loading ? 'Joining...' : 'Join Party 🎉'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mode: Active Party
  if (mode === 'active' && partyData) {
    return (
      <div className="min-h-screen p-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Party Header */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">
                  Party Code: {partyCode}
                </h1>
                <p className="text-white/70">
                  Host: {partyData.host}
                </p>
              </div>
              <div className="text-right">
                <div className="text-white/60 text-sm">Time Remaining</div>
                <div className="text-white text-2xl font-mono">
                  {timeRemaining.split('.')[0]}
                </div>
              </div>
            </div>

            {/* Party Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-3xl mb-1">👥</div>
                <div className="text-white text-xl font-bold">
                  {partyData.members.length}
                </div>
                <div className="text-white/60 text-sm">Members</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-3xl mb-1">📸</div>
                <div className="text-white text-xl font-bold">
                  {partyData.photo_count}
                </div>
                <div className="text-white/60 text-sm">Photos</div>
              </div>
            </div>
          </div>

          {/* Upload Photo Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-4">
            <h2 className="text-2xl font-bold text-white mb-2">
              Capture the Moment 📸
            </h2>
            <p className="text-white/70 mb-4">
              Photos will be revealed when the party ends!
            </p>

            {error && (
              <div className="bg-red-500/20 text-white p-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            <label className="block">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={loading}
                className="hidden"
              />
              <div className="bg-white text-purple-600 p-4 rounded-xl text-center font-semibold cursor-pointer hover:bg-white/90 disabled:opacity-50">
                {loading ? 'Uploading...' : '📷 Take/Upload Photo'}
              </div>
            </label>
          </div>

          {/* Members List */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-3">
              Party Members ({partyData.members.length})
            </h3>
            <div className="space-y-2">
              {partyData.members.map((member, index) => (
                <div
                  key={index}
                  className="bg-white/5 p-3 rounded-lg text-white flex items-center gap-2"
                >
                  <span className="text-xl">
                    {member === partyData.host ? '👑' : '🎉'}
                  </span>
                  <span>{member}</span>
                  {member === partyData.host && (
                    <span className="text-white/60 text-sm ml-auto">Host</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Admin Controls (for host) */}
          {userName === partyData.host && (
            <div className="mt-4">
              <button
                onClick={handleEndParty}
                className="w-full bg-red-500/20 text-white p-4 rounded-xl font-semibold hover:bg-red-500/30 border border-red-500/30"
              >
                🛑 End Party Early & Reveal Photos
              </button>
            </div>
          )}

          <button
            onClick={() => navigate('/')}
            className="mt-4 text-white/60 hover:text-white text-sm block mx-auto"
          >
            Leave Party
          </button>
        </div>
      </div>
    );
  }

  // Mode: Party Ended (Photo Reveal!)
  if (mode === 'ended') {
    return (
      <div className="min-h-screen p-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-white mb-2">
              🎉 Party Wrapped! 🎉
            </h1>
            <p className="text-xl text-white/80">
              Here are all your memories from tonight!
            </p>
          </div>

          {photos.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20 text-center">
              <div className="text-6xl mb-4">📸</div>
              <p className="text-white text-xl">
                No photos were uploaded during this party
              </p>
            </div>
          ) : (
            <>
              {/* Party Stats */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-6">
                <h2 className="text-2xl font-bold text-white mb-4">
                  Party Summary
                </h2>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-bold text-white">
                      {photos.length}
                    </div>
                    <div className="text-white/60">Total Photos</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white">
                      {partyData?.members.length}
                    </div>
                    <div className="text-white/60">People</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white">
                      {partyData?.duration_hours}h
                    </div>
                    <div className="text-white/60">Duration</div>
                  </div>
                </div>
              </div>

              {/* Photo Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {photos.map((photo, index) => (
                  <div
                    key={index}
                    className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20"
                  >
                    <div className="aspect-square bg-white/5 rounded-lg mb-2 flex items-center justify-center text-6xl">
                      📸
                    </div>
                    <div className="text-white/60 text-sm">
                      by {photo.uploaded_by}
                    </div>
                    <div className="text-white/40 text-xs">
                      {new Date(photo.uploaded_at).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="flex gap-4">
            <button
              onClick={() => {
                setMode('select');
                setPartyCode('');
                setUserName('');
                setPartyData(null);
                setPhotos([]);
              }}
              className="flex-1 bg-white/20 text-white p-4 rounded-xl font-semibold hover:bg-white/30"
            >
              Create New Party
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 bg-white text-purple-600 p-4 rounded-xl font-semibold hover:bg-white/90"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default PartyPage;