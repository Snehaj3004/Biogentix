# BioQentix™ — Multi-AI Engine Diagnosis & Screening Platform

> "Transforming Public Health Intelligence — From Field to Cloud"

A production-grade full-stack platform for AI-powered disease 
screening across 8 disease modules targeting rural India.

## 🚀 Tech Stack
-Frontend: React 18, Vite, TailwindCSS, Recharts
-Backend: Python FastAPI, SQLAlchemy, Pydantic v2
-Database: MySQL 8.0 (10 normalized tables)
-ML:Scikit-learn, XGBoost (8 trained models)
-Auth:JWT + BCrypt

## 🦠 Disease Modules (8)
TB | HIV/AIDS | Malaria | STI | Maternal Health | 
Malnutrition | Dengue/NTDs | Enteric Diseases

## 🤖 AI Engines (5)
1. Disease-Specific AI
2. Syndromic Engine
3. Maternal & Nutrition AI
4. Epidemiology AI
5. Regulatory AI

## 📊 ML Model Performance
| Disease | Accuracy | AUC-ROC |
|---------|----------|---------|
| TB | 89.25% | 0.94 |
| HIV | 87.50% | 0.93 |
| Malaria | 91.00% | 0.96 |
| Maternal | 88.00% | 0.94 |
| Malnutrition | 92.00% | 0.96 |
| Dengue | 89.50% | 0.94 |
| STI | 86.00% | 0.92 |
| Enteric | 90.50% | 0.95 |

## 🛠️ Local Setup

### Prerequisites
- Python 3.12+
- Node.js 18+
- MySQL 8.0+

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/Scripts/activate  # Windows Git Bash
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your MySQL credentials
uvicorn main:app --reload --port 8000
```

### Train ML Models
```bash
python ml/train_models.py
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Database Setup
```sql
CREATE DATABASE biogentix_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;
```

## 🔐 Default API Docs
Visit `http://localhost:8000/docs` after starting backend.

## 📁 Project Structure


biogentix/

├── backend/

│   ├── app/

│   │   ├── api/routes/      # 20+ API endpoints

│   │   ├── core/            # Config, DB, Security

│   │   ├── models/          # SQLAlchemy models

│   │   ├── schemas/         # Pydantic schemas

│   │   └── services/        # Business logic

│   ├── ml/

│   │   ├── train_models.py  # ML training pipeline

│   │   └── trained_models/  # .pkl files (gitignored)

│   └── main.py

└── frontend/

└── src/

├── pages/           # 5 React pages

├── components/      # Sidebar, Layout

├── context/         # Auth context

└── api/             # Axios config



## 👥 User Roles
| Role | Access |
|------|--------|
| Admin | Full platform access |
| Doctor | View + confirm diagnoses |
| Field Worker | Register patients + screenings |
| Lab Tech | Enter lab results |

## 🏗️ Architecture
3-tier: React Frontend → FastAPI Backend → MySQL Database

## 📄 License
MIT License — BioQentix™ AI Private Limited © 2026

## 👩‍💻 Developer
Sneha Jagdale — Industry Project 2026