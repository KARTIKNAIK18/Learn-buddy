# Learn-Buddy

A dyslexia-friendly learning platform for **Teachers**, **Parents**, and **Students**.  
Built with **React ** (frontend) and **FastAPI + PostgreSQL** (backend).

---

## What is Learn-Buddy?

Learn-Buddy is a web application designed to support students — especially those with dyslexia — through interactive learning tools, activities, and content management.

**Teachers** create classrooms, upload learning content, manage student enrollments, and add custom vocabulary.  
**Parents** register their children, enroll them in classrooms, and track their progress.  
**Students** access a full suite of dyslexia-friendly tools: reading space, writing helper, language learning, and 9 interactive activities — all with text-to-speech support.

---

## Project Structure

```
Learn-buddy/
└── auth/            FastAPI backend
    ├── app/
    │   ├── main.py              Entry point — registers all routers
    │   ├── api/
    │   │   ├── routers/         All API route handlers
    │   │   │   ├── users.py     Auth: login, signup, currentuser
    │   │   │   ├── teacher.py   Teacher: classrooms, enrollments, content
    │   │   │   ├── parents.py   Parent: students, enrollment
    │   │   │   ├── student.py   Student: classroom, content, performance, points
    │   │   │   ├── classroom.py Classroom CRUD
    │   │   │   ├── tts.py       Text-to-speech proxy (Google TTS)
    │   │   │   ├── points.py    Student points / activity scoring
    │   │   │   └── vocab.py     Teacher custom vocabulary words
    │   │   └── helper/
    │   │       └── current_user.py  JWT dependency — extracts current user
    │   ├── db/
    │   │   ├── models.py        SQLAlchemy ORM models
    │   │   └── orm.py           Database engine + session
    │   └── schema/              Pydantic request/response schemas
    ├── alembic/                 Database migrations
    ├── alembic.ini
    └── .env                     Backend environment variables
```

### Frontend Source Structure

```
frontend/src/
├── api/
│   ├── axiosInstance.js    Base Axios — reads REACT_APP_API_URL, attaches JWT
│   ├── auth.js             login, signup, currentUser
│   ├── teacher.js          classrooms, enrollments, content, vocabulary
│   ├── parent.js           students, enrollment
│   ├── student.js          classroom, content, performance, points, vocab
│   └── cloudinary.js       (reserved for future image upload)
│
├── context/
│   └── AuthContext.js      Global auth state — login(), logout(), user object
│
├── hooks/
│   ├── useTTS.js           Text-to-speech hook (wraps browser + backend TTS)
│   └── (other hooks)
│
├── components/
│   ├── common/
│   │   ├── Sidebar.js          Role-aware collapsible nav sidebar
│   │   ├── ProtectedRoute.js   JWT + role guard
│   │   ├── StatCard.js         Dashboard stat card
│   │   ├── LoadingSpinner.js   Full-page spinner
│   │   └── ConfettiEffect.js   Celebration animation on correct answers
│   └── layout/
│       └── DashboardLayout.js  Sidebar + main content wrapper
│
├── pages/
│   ├── auth/
│   │   ├── LoginPage.js        Sign-in (split-panel + animated background)
│   │   └── SignupPage.js       Sign-up with interactive role picker
│   │
│   ├── teacher/
│   │   ├── TeacherDashboard.js     Overview stats + quick actions
│   │   ├── MyClassrooms.js         Create and list classrooms
│   │   ├── ClassroomStudents.js    Students inside a classroom
│   │   ├── PendingEnrollments.js   Approve / reject enrollment requests
│   │   ├── AddLearningContent.js   Upload content to a classroom
│   │   ├── StudentPerformance.js   Per-student activity scores
│   │   └── ManageVocabulary.js     Add / delete custom vocabulary words
│   │
│   ├── parent/
│   │   ├── ParentDashboard.js   Overview + children list
│   │   ├── MyStudents.js        Add children + view their activity stats
│   │   └── EnrollStudent.js     Enroll a child into a classroom
│   │
│   └── student/
│       ├── StudentDashboard.js     Welcome screen + points + quick links
│       ├── MyClassroom.js          Enrolled classroom details
│       ├── LearningContent.js      Browse teacher-uploaded content
│       ├── MyProgress.js           Activity scores and progress
│       ├── ReadingSpace.js         Click-to-speak reading tool with highlighting
│       ├── WritingHelper.js        Grammar checker + sentence starters + read-aloud
│       ├── LanguageLearning.js     Vocabulary flip-cards (English / Kannada / Tulu)
│       ├── LearningActivities.js   Activity hub — lists all 9 activities
│       └── activities/
│           ├── FlashCardsActivity.js       Flip flash cards with TTS
│           ├── WordMatchActivity.js        Match words to meanings
│           ├── WordScrambleActivity.js     Unscramble jumbled words
│           ├── MissingLetterActivity.js    Fill in the missing letter
│           ├── SightWordsActivity.js       Recognize sight words
│           ├── ListenSpellActivity.js      Hear a word, spell it
│           ├── RhymeFinderActivity.js      Find the rhyming word
│           ├── SentenceBuilderActivity.js  Build sentences from word tiles
│           └── OddOneOutActivity.js        Pick the word that doesn't belong
│
├── index.css     Complete design system (Tailwind @layer components)
├── App.js        All route definitions
└── index.js      React entry point
```

---

## How the Application Works

### Authentication Flow

1. User visits `/login` or `/signup`
2. On login, the backend returns `{ access_token, role, email }`
3. Token is stored in `sessionStorage` as `access_token`
4. `axiosInstance.js` automatically attaches `Authorization: Bearer <token>` to every API request
5. A global `401` response handler clears storage and redirects to `/login`
6. On page load, `AuthContext` calls `/auth/currentuser` to restore the session

### Role-Based Access

| Role | Backend value | Landing page |
|------|--------------|--------------|
| Teacher | `"teacher"` | `/teacher/dashboard` |
| Parent | `"parents"` | `/parent/dashboard` |
| Student | `"student"` | `/student/dashboard` |

Every protected route is wrapped in `<ProtectedRoute allowedRoles={[...]} />`. Accessing a route with the wrong role redirects to the user's own dashboard.

### Student Points System

Every activity awards points when completed:
- Each activity calls `POST /points/add` with activity name + points value
- Points accumulate in the `StudentActivityLog` table (backend)
- Student dashboard and parent `MyStudents` page display total points per activity

### Text-to-Speech

Two modes are used:
1. **Browser TTS** — `window.speechSynthesis` for general reading (WritingHelper, etc.)
2. **Backend TTS proxy** — `GET /tts?text=...&lang=...` proxies Google Translate TTS for Kannada and Tulu pronunciation in Language Learning

### Custom Vocabulary

Teachers can add vocabulary words (English / Kannada / Tulu) per classroom via the **Manage Vocabulary** page. Students see teacher-added words merged with the built-in word list in Language Learning, with a "Teacher Added" badge.

---

## Running the Application

### Prerequisites

- **Node.js** 18+ and **npm**
- **Python** 3.10+
- **PostgreSQL** running locally (or a hosted connection string)

---

### 1. Backend Setup (FastAPI)

```bash
cd auth

# Create and activate a virtual environment
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # Mac/Linux

# Install dependencies
pip install -r requirements.txt
```

**Create the `.env` file** inside `auth/`:

```bash
# auth/.env
DB_NAME=fastapi
HOST_NAME=localhost
USER_NAME=postgres
DB_PASSWORD=your_postgres_password
SQLALCHEMY_DATABASE_URL=postgresql://postgres:your_postgres_password@localhost/demo
SECRET_KEY=09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=300000
```

| Variable | Description |
|----------|-------------|
| `SQLALCHEMY_DATABASE_URL` | Full PostgreSQL connection string ||
| `SECRET_KEY` | JWT signing secret — change this in production |
| `ALGORITHM` | JWT algorithm (keep as `HS256`) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifetime in minutes |

**Create the database** in PostgreSQL:

```sql
CREATE DATABASE demo;
```

**Run migrations** (creates all tables):

```bash
# Option 1 — Alembic migrations
alembic upgrade head

# Option 2 — Auto-create from models (dev only, inside app/)
# Tables are auto-created on startup via: models.Base.metadata.create_all(bind=engine)
```

**Start the backend server:**

```bash
uvicorn app.main:app --reload
# Runs at http://localhost:8000
# Interactive docs at http://localhost:8000/docs
```

---

### 2. Frontend Setup (React)

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# or create .env manually:
```

**Create `frontend/.env`:**

```bash
REACT_APP_API_URL=http://localhost:8000

# Cloudinary (used for file/image uploads)
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_URL` | FastAPI backend base URL — no trailing slash | `http://localhost:8000` |
| `REACT_APP_CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name (from cloudinary.com dashboard) | — |
| `REACT_APP_CLOUDINARY_UPLOAD_PRESET` | Unsigned upload preset name configured in Cloudinary | — |



> **Important:** React bakes env vars at build time. After editing `.env` you must restart `npm start` or re-run `npm run build`.

**Start the frontend:**

```bash
npm start
# Opens http://localhost:3000
```

---

### 3. Running Both Together

Open two terminals:

```bash
# Terminal 1 — Backend
cd auth
.venv\Scripts\activate
uvicorn app.main:app --reload

# Terminal 2 — Frontend
cd frontend
npm start
```

Visit **http://localhost:3000** — the app is ready.

---

## API Overview

All endpoints are prefixed by `REACT_APP_API_URL`. Interactive Swagger docs available at `http://localhost:8000/docs`.

### Auth — `/auth`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Login — returns JWT token |
| POST | `/auth/signup/` | Register new user |
| GET | `/auth/currentuser` | Get logged-in user (JWT required) |

### Teacher — `/teachers`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/teachers/classrooms/` | List own classrooms |
| POST | `/teachers/createclassroom` | Create a new classroom |
| GET | `/teachers/approve-enrollment/pending` | List pending enrollments |
| PUT | `/teachers/approve-enrollment/{id}/approve` | Approve enrollment |
| DELETE | `/teachers/approve-enrollment/{id}/reject` | Reject enrollment |
| POST | `/classroom/{id}/add-content` | Add content to classroom |
| GET | `/teachers/classroom/{id}/students` | List students in classroom |
| GET | `/teachers/student/{id}/performance` | Get student activity stats |

### Parent — `/parents`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/parents/mystudents` | List own children |
| POST | `/parents/addstudent` | Add a child account |
| POST | `/parents/enroll-student` | Enroll child in classroom |
| GET | `/parents/student/{id}/activity-log` | Child's activity points |

### Student — `/student`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/student/classroom` | Get enrolled classroom |
| GET | `/student/content` | Get classroom content |

### Points — `/points`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/points/add` | Add activity points for student |
| GET | `/points/my` | Get own activity log |

### Vocabulary — `/vocab`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/vocab/` | Teacher adds a vocabulary word |
| GET | `/vocab/my` | Teacher's vocabulary words |
| DELETE | `/vocab/{id}` | Delete a vocabulary word |
| GET | `/vocab/student` | Student gets words from their teachers |

### TTS — `/tts`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tts?text=...&lang=...` | Proxy audio from Google Translate TTS |

---

## Route Map (Frontend)

| Path | Page | Allowed Roles |
|------|------|---------------|
| `/login` | LoginPage | Public |
| `/signup` | SignupPage | Public |
| `/teacher/dashboard` | TeacherDashboard | `teacher` |
| `/teacher/classrooms` | MyClassrooms | `teacher` |
| `/teacher/classrooms/:id/students` | ClassroomStudents | `teacher` |
| `/teacher/enrollments` | PendingEnrollments | `teacher` |
| `/teacher/add-content` | AddLearningContent | `teacher` |
| `/teacher/performance` | StudentPerformance | `teacher` |
| `/teacher/vocabulary` | ManageVocabulary | `teacher` |
| `/parent/dashboard` | ParentDashboard | `parents` |
| `/parent/students` | MyStudents | `parents` |
| `/parent/enroll` | EnrollStudent | `parents` |
| `/student/dashboard` | StudentDashboard | `student` |
| `/student/classroom` | MyClassroom | `student` |
| `/student/content` | LearningContent | `student` |
| `/student/progress` | MyProgress | `student` |
| `/student/reading` | ReadingSpace | `student` |
| `/student/writing` | WritingHelper | `student` |
| `/student/language` | LanguageLearning | `student` |
| `/student/activities` | LearningActivities | `student` |
| `/student/activities/flashcards` | FlashCardsActivity | `student` |
| `/student/activities/wordmatch` | WordMatchActivity | `student` |
| `/student/activities/scramble` | WordScrambleActivity | `student` |
| `/student/activities/missinglette` | MissingLetterActivity | `student` |
| `/student/activities/sightwords` | SightWordsActivity | `student` |
| `/student/activities/listenspell` | ListenSpellActivity | `student` |
| `/student/activities/rhyme` | RhymeFinderActivity | `student` |
| `/student/activities/sentence` | SentenceBuilderActivity | `student` |
| `/student/activities/oddoneout` | OddOneOutActivity | `student` |
| `*` | Redirect → `/login` | — |

---

## Production Build

```bash
cd frontend
npm run build
```

Output goes to `frontend/build/`. Serve it with any static file server (Nginx, Vercel, Netlify, etc.)

For the backend on a server:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Update `REACT_APP_API_URL` in `.env` to point to your deployed backend URL before building.

---

## Design System

The UI is built with **Tailwind CSS v3** and a custom design system in `src/index.css` using `@layer components`.

### Brand Colors (`tailwind.config.js`)

| Token | Hex | Usage |
|-------|-----|-------|
| `brand-600` | `#4f46e5` | Primary buttons, active nav |
| `brand-50` | `#eef2ff` | Light accent backgrounds |
| `navy-900` | `#060b18` | Sidebar background |
| `surface` | `#f8fafc` | Page background |

### Key CSS Classes

```
Buttons     .btn-primary  .btn-outline  .btn-ghost  .btn-danger  .btn-success
Inputs      .input  .input-label
Cards       .card  .card-hover
Badges      .badge-pending  .badge-active  .badge-blue  .badge-violet  .badge-gray
Alerts      .alert-error  .alert-success  .alert-info
Tables      .tbl-wrap  .tbl  .tbl-th  .tbl-td  .tbl-row
Animations  .animate-fade-in  .animate-slide-up  .animate-slide-up2
            .animate-float  .animate-float-alt  .animate-float-slow
Utilities   .spinner  .spinner-sm  .empty-state
```

---

## Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend framework | React 19 |
| Styling | Tailwind CSS v3 |
| Routing | React Router DOM v7 |
| HTTP client | Axios (JWT interceptor) |
| Icons | lucide-react |
| Build tool | Create React App (react-scripts 5) |
| Backend framework | FastAPI |
| Database | PostgreSQL |
| ORM | SQLAlchemy |
| Migrations | Alembic |
| Auth | JWT (python-jose) |
| TTS | Browser SpeechSynthesis + Google Translate TTS proxy |