# PermitPro - Permit Management System

A React frontend application for managing permit packages with document uploads and status tracking.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A backend API server (see Backend Requirements below)

## Quick Start

### 1. Setup Frontend

```bash
# Create project directory
mkdir permitpro-frontend
cd permitpro-frontend

# Initialize npm project
npm init -y

# Install dependencies
npm install react react-dom

# Install development dependencies
npm install -D @babel/core @babel/preset-react webpack webpack-cli webpack-dev-server babel-loader html-webpack-plugin css-loader style-loader
```

### 2. Create Project Structure

```
permitpro-frontend/
├── src/
│   ├── index.html
│   ├── index.js (your fixed React app)
│   └── styles.css
├── package.json
├── webpack.config.js
└── README.md
```

### 3. Configuration Files

Create `webpack.config.js`:
```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  entry: './src/index.js',
  mode: 'development',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    })
  ],
  devServer: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:8000'
    }
  }
};
```

Create `src/index.html`:
```html
<!DOCTYPE html>
<html>
<head>
    <title>PermitPro</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
    <div id="root"></div>
</body>
</html>
```

Create `src/styles.css`:
```css
/* Add any custom styles here */
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
```

### 4. Add Scripts to package.json

```json
{
  "scripts": {
    "start": "webpack serve --open",
    "build": "webpack --mode production"
  }
}
```

### 5. Copy Your React Code

- Copy the fixed React code to `src/index.js`
- Import styles: Add `import './styles.css';` at the top of index.js

### 6. Run the Application

```bash
npm start
```

The frontend will start on `http://localhost:3000`

## Backend Requirements

Your backend must provide these API endpoints:

### Authentication
```
POST /api/auth/login
Body: { "email": "admin@permitpro.com", "password": "password123" }
Response: { "name": "Admin User", "role": "Administrator" }
```

### Permit Packages
```
GET /api/permits
Response: [
  {
    "id": 1,
    "customerName": "John Doe",
    "propertyAddress": "123 Main St",
    "county": "Miami-Dade",
    "status": "Draft",
    "createdAt": "2024-01-01T00:00:00Z",
    "documents": []
  }
]

POST /api/permits
Body: { "customerName": "...", "propertyAddress": "...", "county": "..." }

PUT /api/permits/:id
Body: { "status": "Submitted" }
```

### Document Upload
```
POST /api/permits/:id/documents
Body: FormData with 'document' file
Response: Updated package object with new document
```

## Sample Backend (Node.js/Express)

Create a simple backend for testing:

```bash
mkdir permitpro-backend
cd permitpro-backend
npm init -y
npm install express cors multer
```

Create `server.js`:
```javascript
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const app = express();

app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });
let packages = [];
let nextId = 1;

// Auth
app.post('/api/auth/login', (req, res) => {
  res.json({ name: 'Admin User', role: 'Administrator' });
});

// Packages
app.get('/api/permits', (req, res) => {
  res.json(packages);
});

app.post('/api/permits', (req, res) => {
  const newPackage = {
    id: nextId++,
    ...req.body,
    status: 'Draft',
    createdAt: new Date().toISOString(),
    documents: []
  };
  packages.push(newPackage);
  res.json(newPackage);
});

app.put('/api/permits/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const packageIndex = packages.findIndex(p => p.id === id);
  if (packageIndex !== -1) {
    packages[packageIndex] = { ...packages[packageIndex], ...req.body };
    res.json(packages[packageIndex]);
  } else {
    res.status(404).json({ error: 'Package not found' });
  }
});

app.post('/api/permits/:id/documents', upload.single('document'), (req, res) => {
  const id = parseInt(req.params.id);
  const packageIndex = packages.findIndex(p => p.id === id);
  if (packageIndex !== -1 && req.file) {
    const document = {
      id: Date.now(),
      fileName: req.file.originalname,
      filePath: req.file.filename,
      uploadedAt: new Date().toISOString(),
      uploaderName: 'Admin User',
      version: '1.0'
    };
    packages[packageIndex].documents.push(document);
    res.json(packages[packageIndex]);
  } else {
    res.status(404).json({ error: 'Package not found' });
  }
});

app.listen(8000, () => {
  console.log('Backend running on http://localhost:8000');
});
```

Run backend:
```bash
node server.js
```

## Default Login Credentials

- Email: `admin@permitpro.com`
- Password: `password123`

## Troubleshooting

### CORS Issues
Ensure your backend includes CORS headers or use the proxy configuration in webpack.

### API Connection
- Frontend runs on port 3000
- Backend should run on port 8000
- Check browser network tab for API call errors

### File Uploads
Ensure your backend handles multipart/form-data for document uploads.

## Production Build

```bash
npm run build
```

Serve the `dist` folder with any static file server.
