import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MoodPage from './pages/MoodPage';
import PartyPage from './pages/PartyPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/mood" element={<MoodPage />} />
        <Route path="/party" element={<PartyPage />} />
      </Routes>
    </Router>
  );
}

export default App;