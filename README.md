[![Live Demo](https://img.shields.io/badge/Live%20Demo-food--bridge--cyan.vercel.app-brightgreen)](https://food-bridge-cyan.vercel.app)
[![API Docs](https://img.shields.io/badge/API%20Docs-Swagger%20UI-blue)](https://foodbridge-api-m7ht.onrender.com/docs)

# 🌱 FoodBridge — AI-Powered Real-Time Surplus Food Redistribution

### Vashisht Hackathon 3.0 | EcoTech Track | IIITDM Kancheepuram

> **FoodBridge** uses 8 trained ML models to match surplus food with communities in need — optimizing routes, predicting spoilage, detecting anomalies, forecasting demand, clustering hotspots, and learning receiver preferences in real time.

### 🔗 Live Demo
| | URL |
|---|---|
| 🌐 **Frontend** | [food-bridge-cyan.vercel.app](https://food-bridge-cyan.vercel.app) |
| ⚡ **Backend API** | [foodbridge-api-m7ht.onrender.com](https://foodbridge-api-m7ht.onrender.com) |
| 📖 **API Docs** | [/docs (Swagger)](https://foodbridge-api-m7ht.onrender.com/docs) |

> **Quick Login:** `donor1@foodbridge.in` / `password123` · `receiver1@foodbridge.in` / `password123` · `admin@foodbridge.in` / `admin123`

---

## 🎯 Problem Statement

India wastes **68.7 million tonnes** of food annually (FAO). Meanwhile, millions go hungry. The gap? There's no real-time, intelligent system to connect surplus food providers with those who need it most. FoodBridge bridges this gap using AI.

## 💡 Our Solution

FoodBridge is a **full-stack intelligent redistribution platform** powered by **8 distinct AI/ML components**:

| # | AI Engine | Algorithm | Training Data | Key Metric |
|---|-----------|-----------|---------------|------------|
| 1 | 🔗 **Smart Matcher** | GradientBoostingRegressor | **2,000 samples**, 7 features | RMSE: 0.033 |
| 2 | 🦠 **Spoilage Predictor** | RandomForestClassifier | **1,500 samples**, 5 features | Accuracy: 78.3% |
| 3 | 📝 **NLP Categorizer** | TF-IDF + Keywords | 7 categories, 200+ terms | 87%+ confidence |
| 4 | 🗺️ **Route Optimizer** | Nearest Neighbor TSP | Per-request | CO₂ savings/km |
| 5 | 📍 **Hotspot Clustering** | KMeans (k=5) | **2,000 GPS coords** | 5 waste zones |
| 6 | ⚠️ **Anomaly Detector** | IsolationForest | **2,000 donation patterns** | Contamination: 5% |
| 7 | 📈 **Demand Forecaster** | GradientBoostingRegressor | **2,000 time-series** | R²: 0.81 |
| 8 | 🤝 **Collaborative Filter** | Cosine Similarity | **2,000 acceptance events** | 50-receiver matrix |

### 🧠 Composite Matching Formula

```
Final Match Score = 0.7 × GBR_score + 0.3 × CollabFilter_score
```

The GradientBoosting model produces a base match relevance score (distance, urgency, capacity), while the Collaborative Filter learns receiver food preferences from acceptance history. The weighted composite ensures both operational efficiency and personalized matching.

### What Makes This Different?
- **Real trained ML models** — not just API calls or hardcoded rules. 8 models serialized as `.pkl` files with real feature importances, training metrics, and test accuracy
- **AI is integral to every flow** — from NLP food listing → anomaly check → spoilage prediction → AI matching (GBR + collaborative filter) → route optimization → impact calculation
- **Proactive intelligence** — demand forecasting predicts surplus before it's listed, hotspot clustering helps NGOs pre-position, anomaly detection flags food safety risks

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
┌──────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                │
│  ┌────────┐ ┌──────────┐ ┌────────────┐ ┌─────────────┐ │
│  │  Home  │ │  Donor   │ │  Receiver  │ │   Admin     │ │
│  │  Page  │ │Dashboard │ │ Dashboard  │ │   Panel     │ │
│  └────────┘ └──────────┘ └────────────┘ └─────────────┘ │
│  Leaflet Maps · Chart.js · WebSocket · Glassmorphism     │
└──────────────────────┬───────────────────────────────────┘
                       │ REST API + WebSocket
┌──────────────────────▼───────────────────────────────────┐
│                   BACKEND (FastAPI + SQLAlchemy)          │
│  ┌────────────┐ ┌──────────────┐ ┌────────────────────┐  │
│  │ Auth (JWT) │ │  Donations   │ │  Matching API      │  │
│  └────────────┘ └──────────────┘ └────────────────────┘  │
│  ┌────────────┐ ┌──────────────┐ ┌────────────────────┐  │
│  │ Impact API │ │  Reviews API │ │  WebSocket Hub     │  │
│  └────────────┘ └──────────────┘ └────────────────────┘  │
└──────────────────────┬───────────────────────────────────┘
                       │ ML Pipeline (8 Models)
┌──────────────────────▼───────────────────────────────────┐
│              AI/ML LAYER (sklearn + numpy)                │
│  ┌───────────────────┐  ┌────────────────────────────┐   │
│  │ matcher_model.pkl │  │ spoilage_model.pkl         │   │
│  │ (GBRegressor)     │  │ (RandomForestClassifier)   │   │
│  │ 2,000 samples     │  │ 1,500 samples              │   │
│  └───────────────────┘  └────────────────────────────┘   │
│  ┌───────────────────┐  ┌────────────────────────────┐   │
│  │ cluster_model.pkl │  │ anomaly_model.pkl          │   │
│  │ (KMeans k=5)      │  │ (IsolationForest)          │   │
│  │ 2,000 GPS coords  │  │ 2,000 donation patterns    │   │
│  └───────────────────┘  └────────────────────────────┘   │
│  ┌───────────────────┐  ┌────────────────────────────┐   │
│  │ forecast_model.pkl│  │ collab_filter.pkl          │   │
│  │ (GBRegressor)     │  │ (Cosine Similarity)        │   │
│  │ 2,000 time-series │  │ 2,000 acceptance events    │   │
│  └───────────────────┘  └────────────────────────────┘   │
│  ┌───────────────────┐  ┌────────────────────────────┐   │
│  │ NLP Pipeline      │  │ TSP Route Optimizer        │   │
│  │ (TF-IDF + Rules)  │  │ (Nearest Neighbor)         │   │
│  └───────────────────┘  └────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
                       │
               ┌───────▼───────┐
               │  PostgreSQL   │
               │  (Render)     │
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
> 📝 Database auto-seeds with **90+ donations**, 12 donors, 8 receivers, and 3 months of impact history on first startup. All 8 ML models are trained automatically — 4 models on 2,000 synthetic samples each.

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
- 🎉 **Engaging UI (WOW Factors)** — React-Confetti on dispatch, beautiful slide-up Toasts for notifications, and CSS radar-pulsing map markers
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
| **Real AI/ML** | 8 distinct trained models (not just APIs) with `.pkl` serialization, feature importances, and test metrics — each trained on 1,500–2,000 samples |
| **End-to-End Flow** | Complete donor → anomaly check → AI analysis → matching (GBR + collab filter) → route → delivery → rating → impact cycle |
| **Proactive AI** | Demand forecasting (R²: 0.81), hotspot clustering (5 zones), anomaly detection — intelligence that acts before problems occur |
| **Composite Matching** | `final_score = 0.7 × GBR_score + 0.3 × CollaborativeFilter_score` — match quality improves over time |
| **Quantified Impact** | Live CO₂ calculations, downloadable certificates, SDG alignment |
| **Premium Design** | Dark EcoTech theme with glassmorphism, micro-animations, Leaflet maps, Chart.js |
| **Voice AI** | Web Speech API integration for hands-free food description |
| **Explainable AI** | Match explanations showing GBR factor weights + collaborative filter preference scores |
| **Real-Time** | WebSocket for instant notifications, live activity feed, anomaly alerts |
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

### 1. Matching Engine (`matcher_model.pkl`)
- **Algorithm**: GradientBoostingRegressor (sklearn)
- **Training Data**: 2,000 synthetic donor-receiver pairs
- **Features**: distance_km, food_compatibility, qty_ratio, reliability_score, urgency_hours, receiver_capacity, past_pickups
- **RMSE**: 0.033
- **Feature Importances**: Distance (40%) > Compatibility (25%) > Reliability (15%) > Capacity (13%) > Urgency (7%)

### 2. Spoilage Predictor (`spoilage_model.pkl`)
- **Algorithm**: RandomForestClassifier (sklearn)
- **Training Data**: 1,500 samples (80/20 split)
- **Features**: food_category, storage_type, hours_since_preparation, ambient_temperature, humidity
- **Test Accuracy**: 78%
- **Per-Class F1**: Safe: 82% | Medium: 75% | Risky: 77%

### 3. NLP Food Categorizer
- **Method**: TF-IDF keyword extraction + weighted scoring
- **Categories**: cooked, raw, packaged, dairy, bakery, fruits_vegetables, beverages
- **Capabilities**: Food type detection, quantity pattern matching, item extraction

### 4. TSP Route Optimizer
- **Algorithm**: Nearest Neighbor Heuristic
- **Input**: Array of lat/lng coordinates
- **Output**: Optimized visit order, total distance, estimated time, CO₂ savings

### 5. Hotspot Clustering (`cluster_model.pkl`)
- **Algorithm**: KMeans (k=5, sklearn)
- **Training Data**: 2,000 synthetic Chennai GPS coordinates from 12 hotspot centers
- **Features**: latitude, longitude (weighted by donation density)
- **Inertia**: 1.798
- **Output**: 5 food-waste hotspot zones with centroid coords, radius, donation counts

### 6. Anomaly Detector (`anomaly_model.pkl`)
- **Algorithm**: IsolationForest (sklearn)
- **Training Data**: 2,000 samples (95% normal + 5% anomalous patterns)
- **Features**: food_category, hours_since_preparation, quantity_kg, hour_of_day
- **Contamination**: 5%
- **Detects**: Late-night submissions, unusually large quantities, stale food listings

### 7. Demand Forecaster (`forecast_model.pkl`)
- **Algorithm**: GradientBoostingRegressor (sklearn)
- **Training Data**: 2,000 time-series samples (80/20 split)
- **Features**: hour, day_of_week, category, is_weekend, is_evening_rush, is_lunch_hour
- **Test R²**: 0.81 | **Test RMSE**: 3.70
- **Predicts**: Donation volume for next 6 hours by food category

### 8. Collaborative Filter (`collab_filter.pkl`)
- **Algorithm**: Cosine Similarity (sklearn)
- **Training Data**: 2,000 acceptance events across 50 receiver profiles
- **Receiver Types**: General NGO, vegetarian-focused, bakery-focused, fresh-only
- **Matrix**: 50 receivers × 7 food categories
- **Formula**: `final_match = 0.7 × GBR_score + 0.3 × preference_score`

### Composite Matching Formula
```
final_score = 0.7 × GradientBoosting_score + 0.3 × CollaborativeFilter_score
```
Match quality improves as receiver acceptance data accumulates. The collaborative filter learns from every accepted/rejected match and surfaces preference patterns via cosine similarity across similar receiver profiles.

---

*Built for Vashisht Hackathon 3.0 | EcoTech Track | IIITDM Kancheepuram | March 28–29, 2026*
