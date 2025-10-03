# Frontend - SAR Image Colorization

React-based web interface for uploading and colorizing SAR images.

## 🎨 Features

* **Image Upload**: Upload grayscale SAR images for colorization
* **Real-time Processing**: View colorization results instantly
* **Responsive Design**: Works seamlessly on desktop and mobile
* **Modern UI**: Built with Tailwind CSS and shadcn/ui components
* **API Integration**: Connects to Django backend via REST API

## 🚀 Getting Started

### Prerequisites

* Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start
```

The application will run on `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## 🛠️ Tech Stack

* **Framework**: React 18
* **Styling**: Tailwind CSS
* **UI Components**: shadcn/ui
* **HTTP Client**: Axios
* **State Management**: React Hooks

## 📁 Project Structure

```
frontend/
├── public/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components
│   ├── services/       # API service functions
│   ├── utils/          # Helper functions
│   └── App.js          # Main application component
└── package.json
```

## 🔌 API Integration

The frontend communicates with the backend API at `http://localhost:8000/api/`

### Key Endpoints Used:

* `POST /api/colorize/` - Upload SAR image for colorization
* `GET /api/results/:id` - Fetch colorized result

## 🎯 Key Components

* **ImageUpload**: Handles file upload and preview
* **ResultDisplay**: Shows original and colorized images side-by-side
* **ProgressBar**: Displays processing status

## 📝 Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_API_URL=http://localhost:8000/api
```

## 🤝 Contributing

1. Follow the existing code structure
2. Use functional components with hooks
3. Maintain consistent styling with Tailwind CSS
4. Test thoroughly before submitting PRs

## 📄 License

MIT License - see root LICENSE file for details
