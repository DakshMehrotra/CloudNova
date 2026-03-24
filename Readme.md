# ☁️ CloudNova

> A full-stack cloud storage web application inspired by Google Drive — built with React, Node.js, TypeScript, and MongoDB.

![CloudNova](https://img.shields.io/badge/CloudNova-v1.0.0-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=nodedotjs)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?style=for-the-badge&logo=mongodb)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.0-06B6D4?style=for-the-badge&logo=tailwindcss)

---

##  Preview

| Login | Dashboard | Dark Mode |
|---|---|---|
| Clean auth UI with JWT | File & folder management | Full dark mode support |

---

##  Features

-  **JWT Authentication** — Secure login & register with access + refresh tokens
-  **File Management** — Upload, download, rename, move, and delete files
-  **Folder System** — Create nested folders with breadcrumb navigation
-  **File Preview** — Inline preview for images, PDFs, videos, and audio
-  **Starred Files** — Star important files for quick access
-  **Trash System** — Soft delete with restore and permanent delete
-  **Public Share Links** — Generate shareable links with no login required
-  **File Search** — Search files instantly across your drive
-  **Storage Quota** — Real-time storage usage bar (1GB per user)
-  **Dark Mode** — Full dark/light mode toggle that persists
-  **Drag & Drop Upload** — Drop files directly to upload
-  **Rename & Move** — Inline rename and move files between folders

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + TypeScript | UI framework |
| Vite | Build tool & dev server |
| Tailwind CSS | Styling |
| React Router v6 | Client-side routing |
| Axios | HTTP client with interceptors |
| React Dropzone | Drag & drop uploads |
| Lucide React | Icons |
| React Hot Toast | Notifications |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| TypeScript | Type safety |
| MongoDB + Mongoose | Database & ODM |
| JWT | Authentication tokens |
| Multer | File upload handling |
| Bcryptjs | Password hashing |
| UUID | Unique file identifiers |

---

## Project Structure

```
CloudNova/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts               # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── authController.ts   # Register, login, refresh
│   │   │   ├── fileController.ts   # All file operations
│   │   │   └── folderController.ts # All folder operations
│   │   ├── middleware/
│   │   │   ├── auth.ts             # JWT verification
│   │   │   └── upload.ts           # Multer config
│   │   ├── models/
│   │   │   ├── User.ts             # User schema
│   │   │   ├── File.ts             # File metadata schema
│   │   │   └── Folder.ts           # Folder schema
│   │   ├── routes/
│   │   │   ├── authRoutes.ts
│   │   │   ├── fileRoutes.ts
│   │   │   └── folderRoutes.ts
│   │   └── index.ts                # Entry point
│   ├── uploads/                    # Stored files (gitignored)
│   ├── .env                        # Environment variables
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.ts            # Axios instance + interceptors
│   │   ├── components/
│   │   │   ├── Navbar.tsx          # Top bar with search & dark mode
│   │   │   ├── Sidebar.tsx         # Navigation + storage bar
│   │   │   ├── FileCard.tsx        # File card with context menu
│   │   │   ├── FolderCard.tsx      # Folder card with context menu
│   │   │   ├── UploadModal.tsx     # Drag & drop upload modal
│   │   │   ├── PreviewModal.tsx    # File preview modal
│   │   │   └── MoveModal.tsx       # Move file modal
│   │   ├── context/
│   │   │   ├── AuthContext.tsx     # Global auth state
│   │   │   └── ThemeContext.tsx    # Dark/light mode state
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Dashboard.tsx       # Main drive page
│   │   │   ├── Starred.tsx
│   │   │   ├── Trash.tsx
│   │   │   └── SharePage.tsx       # Public share page
│   │   ├── types/
│   │   │   └── index.ts            # TypeScript interfaces
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
│
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js v20+
- MongoDB 7.0
- npm

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/DakshMehrotra/CloudNova.git
cd CloudNova
```

**2. Install backend dependencies**
```bash
cd backend
npm install
```

**3. Create backend `.env` file**
```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/cloudNova
JWT_SECRET=your_super_secret_jwt_key
JWT_REFRESH_SECRET=your_refresh_secret_key
FRONTEND_URL=http://localhost:5173
```

**4. Install frontend dependencies**
```bash
cd ../frontend
npm install
```

**5. Create frontend `.env` file**
```env
VITE_API_URL=http://localhost:5001/api
```

### Running Locally

**Start MongoDB**
```bash
brew services start mongodb-community@7.0
```

**Start Backend** (Terminal 1)
```bash
cd backend
npm run dev
```

**Start Frontend** (Terminal 2)
```bash
cd frontend
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/me` | Get current user |

### Files
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/files/upload` | Upload a file |
| GET | `/api/files` | Get files in folder |
| GET | `/api/files/starred` | Get starred files |
| GET | `/api/files/trashed` | Get trashed files |
| GET | `/api/files/search?q=` | Search files |
| GET | `/api/files/:id/download` | Download file |
| GET | `/api/files/:id/preview` | Preview file |
| PATCH | `/api/files/:id/star` | Toggle star |
| PATCH | `/api/files/:id/trash` | Move to trash |
| PATCH | `/api/files/:id/restore` | Restore from trash |
| PATCH | `/api/files/:id/rename` | Rename file |
| PATCH | `/api/files/:id/move` | Move to folder |
| DELETE | `/api/files/:id` | Permanently delete |
| POST | `/api/files/:id/share` | Generate share link |
| GET | `/api/files/share/:token` | Get shared file info |

### Folders
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/folders` | Create folder |
| GET | `/api/folders` | Get folders |
| PATCH | `/api/folders/:id/rename` | Rename folder |
| PATCH | `/api/folders/:id/trash` | Trash folder |
| PATCH | `/api/folders/:id/star` | Star folder |

---

## Deployment

- **Backend** — Railway
- **Frontend** — Vercel
- **Database** — MongoDB Atlas / Railway MongoDB

---

## Author

**Daksh Mehrotra**
- GitHub: [@DakshMehrotra](https://github.com/DakshMehrotra)

---

## License

This project is open source and available under the [MIT License](LICENSE).

---
<p align="center">Built with ❤️ by Daksh Mehrotra</p>
