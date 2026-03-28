# 🌱 FoodBridge — AI-Powered Real-Time Surplus Food Redistribution

### Vashisht Hackathon 3.0 | EcoTech Track | IIITDM Kancheepuram

> **FoodBridge** uses 8 trained ML models to match surplus food with communities in need — optimizing routes, predicting spoilage, detecting anomalies, forecasting demand, clustering hotspots, and learning receiver preferences in real time.

---

## 🎯 Problem Statement

India wastes **68.7 million tonnes** of food annually (FAO). Meanwhile, millions go hungry. The gap? There's no real-time, intelligent system to connect surplus food providers with those who need it most. FoodBridge bridges this gap using AI.

## 💡 Our Solution

FoodBridge is a **full-stack intelligent redistribution platform** powered by **8 distinct AI/ML components**:

| # | AI Engine | Technology | What It Does |
|---|-----------|-----------|-------------|
| 1 | 🔗 **Smart Matching** | GradientBoosting Regressor (sklearn) | Matches donors to receivers by distance, urgency, capacity, reliability — trained on 2000 samples |
| 2 | 🦠 **Spoilage Predictor** | RandomForest Classifier (sklearn) | Predicts food safety risk level (low/medium/high) with probability scores — 78% accuracy |
| 3 | 📝 **NLP Categorizer** | TF-IDF + Keyword Matching | Extracts food type, quantity & items from plain-text descriptions — 7 food categories |
| 4 | 🗺️ **Route Optimizer** | Nearest Neighbor TSP | Minimizes pickup distance & calculates CO₂ savings per optimized route |
| 5 | 📍 **Hotspot Clustering** | KMeans (sklearn) | Identifies 5 food-waste hotspot zones from donation GPS coordinates |
| 6 | ⚠️ **Anomaly Detection** | IsolationForest (sklearn) | Flags suspicious listings — unusual quantities, late-night submissions, old food |
| 7 | 📈 **Demand Forecaster** | GradientBoosting Regressor (sklearn) | Predicts donation volume for next 6 hours by category — R²: 0.64 |
| 8 | 🤝 **Collaborative Filter** | Cosine Similarity (sklearn) | Learns receiver food preferences from acceptance history — boosts match accuracy |

### What Makes This Different?
- **Real trained ML models** — not just API calls or hardcoded rules. 8 models serialized as `.pkl` files with real feature importances, training metrics, and test accuracy
- **AI is integral to every flow** — from NLP food listing → anomaly check → spoilage prediction → AI matching (GBR + collaborative filter) → route optimization → impact calculation
- **Proactive intelligence** — demand forecasting predicts surplus before it’s listed, hotspot clustering helps NGOs pre-position, anomaly detection flags food safety risks

---

## 🌍 Impact Metrics (Live from Database)

| Metric | How It's Calculated |
|--------|---------------------|
| 🍱 **Food Redistributed** | Sum of `quantity_kg` for all delivered donations |
| 🌿 **CO₂ Offset** | `food_kg × 2.5` (IPCC/FAO reference) |
| 👨‍👩‍👧 **Families Fed** | `serves ÷ 4` per delivered donation |
| ⚡ **Avg Match Time** | `accepted_at - created_at` average |
| 🛣️ **Route Distance Saved** | TSP optimization savings logged per delivery |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)            │
│  ┌────────┐ ┌──────────┐ ┌────────────┐ ┌─────────┐ │
│  │  Home  │ │  Donor   │ │  Receiver  │ │  Admin  │ │
│  │  Page  │ │Dashboard │ │ Dashboard  │ │  Panel  │ │
│  └────────┘ └──────────┘ └────────────┘ └─────────┘ │
│     Leaflet Maps · Chart.js · WebSocket · Glassmorphism │
└──────────────────────┬───────────────────────────────┘
                       │ REST API + WebSocket
┌──────────────────────▼───────────────────────────────┐
│                   BACKEND (FastAPI + SQLAlchemy)      │
│  ┌────────────┐ ┌──────────────┐ ┌────────────────┐  │
│  │ Auth (JWT) │ │  Donations   │ │  Matching API  │  │
│  └────────────┘ └──────────────┘ └────────────────┘  │
│  ┌────────────┐ ┌──────────────┐ ┌────────────────┐  │
│  │ Impact API │ │  Reviews API │ │  WebSocket Hub │  │
│  └────────────┘ └──────────────┘ └────────────────┘  │
└──────────────────────┬───────────────────────────────┘
                       │ ML Pipeline
┌──────────────────────▼───────────────────────────────┐
│                   AI/ML LAYER (sklearn + numpy)       │
│  ┌────────────────┐  ┌──────────────────────────┐    │
│  │ matcher_model  │  │   spoilage_model.pkl     │    │
│  │   .pkl (GB)    │  │   (RandomForest)         │    │
│  └────────────────┘  └──────────────────────────┘    │
│  ┌────────────────┐  ┌──────────────────────────┐    │
│  │  NLP Pipeline  │  │  TSP Route Optimizer     │    │
│  │  (TF-IDF)      │  │  (Nearest Neighbor)      │    │
│  └────────────────┘  └──────────────────────────┘    │
└──────────────────────────────────────────────────────┘
                       │
               ┌───────▼───────┐
               │   SQLite DB   │
               └───────────────┘
```

---

## 🏗️ Tech Stack

### Backend
- **Python 3.11+** · **FastAPI** · **SQLAlchemy** · **SQLite**
- **scikit-learn** · **NumPy** · **Pandas**
- JWT Authentication · Pydantic Schemas · WebSocket

### Frontend
- **React 18** (Vite) · **Vanilla CSS** (Custom EcoTech Dark Design System)
- **React-Leaflet** (Interactive Maps) · **Chart.js** (Analytics Visualization)
- **React Icons** · **Axios** · **WebSocket**

### AI/ML
- **GradientBoostingRegressor** — demand-supply matching + demand forecasting (sklearn)
- **RandomForestClassifier** — spoilage risk prediction (sklearn)
- **KMeans** — geographic hotspot clustering (sklearn)
- **IsolationForest** — anomaly detection for food safety (sklearn)
- **Cosine Similarity** — collaborative filtering for receiver preferences (sklearn)
- **TF-IDF + Keyword Matching** — NLP food categorization
- **Nearest Neighbor TSP** — route optimization

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+ · Node.js 18+

### Backend
```bash
cd foodbridge
pip install -r backend/requirements.txt
python -m uvicorn backend.main:app --reload --port 8000
```
> 📝 Database auto-seeds with **90+ donations**, 12 donors, 8 receivers, and 3 months of impact history on first startup.

### Frontend
```bash
cd foodbridge/frontend
npm install
npm run dev
```

### Demo Accounts
| Role | Email | Password |
|------|-------|----------|
| 🍱 Donor | `donor1@foodbridge.in` | `password123` |
| 🤝 Receiver | `receiver1@foodbridge.in` | `password123` |
| 📊 Admin | `admin@foodbridge.in` | `admin123` |

---

## 📡 API Documentation

### Authentication
```
POST /api/auth/register     → Register new user (donor/receiver/admin)
POST /api/auth/login        → Login → JWT token
GET  /api/auth/me           → Get current user profile
```

### Donations
```
POST /api/donations/        → Create food listing (auto spoilage check)
GET  /api/donations/        → List all donations
GET  /api/donations/available → Available donations only (for receivers)
```

### AI Endpoints
```
POST /api/spoilage          → Predict food safety risk (RandomForest)
POST /api/categorize        → NLP auto-categorize food from text (TF-IDF)
POST /api/route             → Optimized pickup route (TSP algorithm)
GET  /api/match/{id}        → AI-ranked receiver matches (GradientBoosting + CollabFilter)
POST /api/match/accept      → Receiver accepts match
GET  /api/models            → All 8 trained model metadata & feature importances
GET  /api/clusters          → Geographic hotspot zones (KMeans)
GET  /api/forecast          → Predicted surplus for next 6 hours (GBR)
POST /api/anomaly           → Check if donation is anomalous (IsolationForest)
GET  /api/preference/{id}   → Receiver preference score (Collaborative Filter)
```

### Impact & Reviews
```
GET  /api/impact/           → Environmental impact dashboard (live metrics)
POST /api/reviews           → Submit delivery rating (1-5 stars)
GET  /api/reviews/{user_id} → Get user reviews & average rating
GET  /api/surplus-prediction → Predictive surplus forecast (day-of-week AI)
```

### WebSocket
```
WS  /ws                     → Real-time notifications (donations, matches, deliveries)
```

> Full interactive docs available at `/docs` (Swagger UI)

---

## 📁 Project Structure

```
foodbridge/
├── backend/
│   ├── main.py              # FastAPI entry + seed data + WebSocket
│   ├── models/
│   │   ├── database.py      # SQLAlchemy models (User, Donation, Match, ImpactLog, Review)
│   │   └── schemas.py       # Pydantic request/response schemas
│   ├── routers/
│   │   ├── auth.py          # JWT authentication (bcrypt)
│   │   ├── donations.py     # CRUD + auto spoilage check on create
│   │   ├── matching.py      # AI matching endpoint (GradientBoosting)
│   │   └── impact.py        # Environmental impact aggregation
│   ├── ml/
│   │   ├── matcher.py       # Demand-supply matcher (trained GBRegressor)
│   │   ├── spoilage.py      # Spoilage risk predictor (trained RF)
│   │   ├── nlp_categorizer.py  # NLP food tagger (TF-IDF)
│   │   └── route_optimizer.py  # TSP route optimizer
│   ├── data/
│   │   ├── synthetic_train.py  # Realistic Chennai seed data
│   │   └── food_categories.json
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── App.jsx          # Router + Navbar + WebSocket + Transitions
│       ├── api.js           # Axios API client
│       ├── index.css         # Complete EcoTech Design System (660+ lines)
│       ├── pages/
│       │   ├── Home.jsx       # Hero + Impact + AI Models + How It Works
│       │   ├── DonorDashboard.jsx  # AI Food Form + My Donations + Insights
│       │   ├── ReceiverDashboard.jsx # Browse + Filters + Route + Rating
│       │   ├── AdminPanel.jsx      # Analytics + Activity + AI Models + Community
│       │   └── Auth.jsx            # Login/Register with JWT
│       ├── components/
│       │   ├── FoodForm.jsx       # NLP input + voice + spoilage integration
│       │   ├── MapView.jsx        # Leaflet with route polylines
│       │   ├── ImpactCounter.jsx  # Animated impact statistics
│       │   ├── MatchCard.jsx      # AI-ranked match visualization
│       │   ├── CountdownTimer.jsx # Live redistribution countdown
│       │   ├── NotificationBell.jsx # Real-time notification center
│       │   ├── ToastNotification.jsx # WebSocket event toasts
│       │   └── HeatmapLayer.jsx   # Supply/demand heatmap overlay
│       └── hooks/
│           └── useWebSocket.js    # WebSocket connection hook
├── screenshots/              # High-quality screenshots of all pages
├── uploads/                  # Food photo uploads
├── foodbridge.db             # SQLite database (auto-seeded)
└── README.md
```

---

## ✨ Key Features

### For Donors
- 🎤 **Voice + Text Input** — Web Speech API for hands-free food description
- 🤖 **NLP Auto-Categorization** — AI extracts food type, quantity, items from plain text
- 🦠 **Spoilage Prediction** — RandomForest predicts risk level before listing
- 📊 **AI Insights** — Donation patterns, predicted surplus, trust scores, environmental certificate
- 📥 **CO₂ Certificate Download** — Downloadable SVG impact certificate

### For Receivers
- 🔍 **Advanced Filtering** — By category, risk level, transport mode, distance radius (2/5/10 km)
- ⏰ **Spoilage-Sorted Display** — Urgent donations shown first
- 🗺️ **Optimized Route View** — TSP-optimized pickup path on Leaflet map
- 🤖 **AI Match Explanation** — Transparent scoring with factor breakdown (distance, compatibility, reliability, capacity, urgency)
- ⭐ **Rating System** — Star ratings + quick feedback + CO₂ certificate on delivery
- 📍 **Expired Donations** — Separated into greyed-out "Missed Opportunities" section

### For Admins
- 📊 **Live Analytics** — Food category distribution, donation status, peak hours
- ⚡ **Live Activity Feed** — Real-time WebSocket-powered donation/match/delivery events
- 📱 **SMS/WhatsApp Notification Log** — Simulated Twilio/WhatsApp integration
- 🧠 **AI Model Dashboard** — Feature importances, accuracy, training samples for each model
- 🏆 **Community Leaderboard** — Top donors/receivers with badges, ratings, kg metrics
- 🗺️ **City Heatmap** — Supply vs demand density overlay on Chennai map

---

## 🏆 Why FoodBridge Stands Out

| Criteria | What We Did |
|----------|------------|
| **Real AI/ML** | 8 distinct trained models (not just APIs) with `.pkl` serialization, feature importances, and test metrics |
| **End-to-End Flow** | Complete donor → anomaly check → AI analysis → matching (GBR + collab filter) → route → delivery → rating → impact cycle |
| **Proactive AI** | Demand forecasting, hotspot clustering, anomaly detection — intelligence that acts before problems occur |
| **Quantified Impact** | Live CO₂ calculations, downloadable certificates, SDG alignment |
| **Premium Design** | Dark EcoTech theme with glassmorphism, micro-animations, Leaflet maps, Chart.js |
| **Voice AI** | Web Speech API integration for hands-free food description |
| **Explainable AI** | Match explanations showing GBR factor weights + collaborative filter preference scores |
| **Real-Time** | WebSocket for instant notifications, live activity feed, receiver alerts |
| **Delivery Partners** | Third-party logistics matching for donors/receivers unable to transport |
| **Smart Notifications** | Category-based subscription system alerts receivers when matching food appears |
| **Scalable Data** | 90+ donations, 3 months of history, realistic Chennai locations |

---

## 🎯 SDG Alignment

| SDG | How FoodBridge Contributes |
|-----|--------------------------|
| 🎯 **SDG #2** — Zero Hunger | Efficiently redistributes surplus food to those in need |
| ♻️ **SDG #12** — Responsible Consumption | AI-driven spoilage prediction reduces waste at source |
| 🌍 **SDG #13** — Climate Action | Quantifies and reduces CO₂ from food waste (2.5x multiplier) |

---

## 📊 AI Model Details

### Matching Engine (`matcher_model.pkl`)
- **Algorithm**: GradientBoostingRegressor (sklearn)
- **Training Data**: 2000 synthetic donor-receiver pairs
- **Features**: distance_km, reliability_score, food_type_match, receiver_capacity, time_score, urgency_factor, receiver_trust
- **RMSE**: 0.033
- **Feature Importances**: Distance (40%) > Compatibility (25%) > Reliability (15%) > Capacity (13%) > Urgency (7%)

### Spoilage Predictor (`spoilage_model.pkl`)
- **Algorithm**: RandomForestClassifier (sklearn)
- **Training Data**: 1500 samples (80/20 split)
- **Features**: food_category, storage_type, hours_since_preparation, ambient_temperature, packaging
- **Test Accuracy**: 78%
- **Per-Class F1**: Safe: 82% | Medium: 75% | Risky: 77%
- **Risk Labels**: {0: safe, 1: medium, 2: risky}

### NLP Food Categorizer
- **Method**: TF-IDF keyword extraction + weighted scoring
- **Categories**: cooked, raw, packaged, dairy, bakery, fruits_vegetables, beverages
- **Capabilities**: Food type detection, quantity pattern matching, item extraction

### TSP Route Optimizer
- **Algorithm**: Nearest Neighbor Heuristic
- **Input**: Array of lat/lng coordinates
- **Output**: Optimized visit order, total distance, estimated time, CO₂ savings

---

*Built for Vashisht Hackathon 3.0 | EcoTech Track | IIITDM Kancheepuram | March 28–29, 2026*
