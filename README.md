# 🍸 Shot

**Your vibe. Your drink. Your moment.**

Shot is a modern web app that combines AI-powered mood-based drink recommendations with a unique "Party Wrapped" feature that captures memories throughout the night and reveals them when the party ends.

![Shot Banner](Add Later)

## ✨ Features

### 🎭 Vibe Check (Mood-Based Recommendations)
- Interactive 5-question quiz about your current mood
- Personalized drink suggestions matched to your energy
- Pokemon card-style results with detailed stats
- Brand recommendations and drink information
- Beautiful, shareable cards perfect for social media

### 📸 Party Wrapped
- Create private parties with unique codes
- Upload photos throughout the event
- **Photos stay locked until the party ends**
- Collaborative memory collection with friends
- Beautiful reveal with party statistics

## 🎨 Design Philosophy

Shot features a **dark, premium aesthetic** inspired by:
- Modern cocktail bars
- Pokemon card collectibles  
- Spotify Wrapped
- Apple's design language

With **glassmorphism effects**, **animated gradients**, and **smooth micro-interactions** for a premium feel.

## 🛠️ Tech Stack

**Frontend:**
- React 18
- Vite
- React Router
- Tailwind CSS 3
- Axios

**Backend:**
- Python 3.8+
- FastAPI
- Uvicorn
- Pydantic
- File-based storage

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- Node.js 16 or higher
- npm

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/shot.git
cd shot
```

2. **Backend Setup**
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

3. **Frontend Setup**
```bash
cd ../frontend
npm install
```

### Running the App

**Terminal 1 - Backend:**
```bash
cd backend
venv\Scripts\activate  # or source venv/bin/activate on Mac/Linux
python main.py
```
Backend runs on `http://localhost:8000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:5173`

Open your browser to `http://localhost:5173` 🎉

## 📖 API Documentation

Once the backend is running, visit `http://localhost:8000/docs` for interactive API documentation powered by FastAPI.

## 🎮 How to Use

### Mood Quiz
1. Click "Vibe Check" on the homepage
2. Answer 5 fun questions about your current mood
3. Select your drink preference (Cocktails, Hard Liquor, or Beer/Wine)
4. Get 3 personalized recommendations!
5. Click cards to see full details (stats, brands, ABV)
6. Share your results on social media

### Party Wrapped
1. Click "Party Wrapped" on the homepage
2. **Host:** Create a new party, set duration, get a 6-character code
3. **Guest:** Join with the party code
4. Upload photos throughout the party (encouraged: 1 photo per hour)
5. When the party ends (or host ends it early), all photos are revealed!
6. View party statistics and download memories

## 📁 Project Structure

```
shot/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── requirements.txt     # Python dependencies
│   └── data/                # File storage (auto-created)
│       ├── parties/         # Party metadata
│       └── photos/          # Uploaded photos
├── frontend/
│   ├── src/
│   │   ├── pages/          # Main views
│   │   │   ├── HomePage.jsx
│   │   │   ├── MoodPage.jsx
│   │   │   └── PartyPage.jsx
│   │   ├── services/       # API integration
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```

## 🎯 Key Features Explained

### Mood Matching Algorithm
Shot uses a simple but effective matching system:
- Each drink has a "mood profile" (5 numbers representing energy, social, adventure, flavor, occasion)
- User answers are compared against each drink's profile
- Closest match = best recommendation
- Stats visualized with Pokemon-style bars

### Photo Locking Mechanism
- Backend enforces time-based locks
- Photos stored with metadata (uploader, timestamp)
- Frontend cannot access photos until party end time
- Creates anticipation and surprise when memories unlock

### Rarity System
Drinks are classified by rarity:
- ⚪ **Common** - Everyday drinks
- 🔵 **Rare** - Classic cocktails
- 🟣 **Epic** - Sophisticated choices
- 🟡 **Legendary** - Ultimate drinks

## 🔮 Future Enhancements

### Phase 2
- [ ] User authentication & profiles
- [ ] Save favorite drinks
- [ ] Party history & analytics
- [ ] Push notifications for photo reminders
- [ ] Photo collage generator
- [ ] Recipe instructions for cocktails

### Phase 3
- [ ] Mobile app (React Native)
- [ ] Real-time photo feed (WebSockets)
- [ ] AI-powered drink recommendations (Claude API)
- [ ] Social sharing integrations
- [ ] Drink collection/Pokedex
- [ ] Group chat during parties

## 🤝 Contributing

Contributions are welcome! This is a learning project, so feel free to:
- Add new features
- Improve UI/UX
- Optimize code
- Fix bugs
- Add tests

## 📝 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Design inspiration from Spotify Wrapped, Pokemon cards, and modern bar culture
- Built as a learning project to explore React, FastAPI, and system design concepts

## 📧 Contact

- GitHub: [@yourusername](https://github.com/yourusername)
- Project Link: [https://github.com/yourusername/shot](https://github.com/yourusername/shot)

---

**Made with ❤️ for fun times with friends**

🍹 Cheers! 🎉