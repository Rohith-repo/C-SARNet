# C-SARNet: Colorization of SAR Imagery with Neural Networks

## Project Overview

C-SARNet is a web application that leverages **Deep Learning** to colorize **grayscale Synthetic Aperture Radar (SAR) images**, enhancing interpretability for applications like **geological studies, environmental monitoring, and remote sensing analysis**.

Users can upload SAR images, process them through the AI model, and download colorized outputs in multiple formats.

---

## Features

### User Features

* **Authentication**: Login, Registration, and OAuth (Google/GitHub)
* **Password Reset**: Email-based OTP for secure password recovery
* **User Profile**: View personal details, avatar, and join date
* **Image Upload**: Upload SAR images (PNG, JPEG, TIFF) up to 50MB
* **Processing Pipeline**: Upload → Preprocess → Model Load → Colorize → Finalize
* **Output**: Download colorized images in multiple formats
* **Upload History**: Track processed images with status (completed/processing/failed)
* **Chatbot**: AI-powered chatbot for assistance and queries
* **Settings**: Email notifications and auto-delete processed files
* **Account Deletion**: Request account deletion securely

### Admin Features

* **Admin Login**: Dedicated admin panel (username/password)
* **Dashboard**: Manage users, monitor uploads, view processing logs, and system statistics
* **Audit Logging**: Track all actions performed by users/admins
* **Retry Processing**: Re-run failed image processing jobs

---

## Technology Stack

* **Frontend**: React.js
* **Backend**: Django REST Framework
* **Database**: PostgreSQL
* **AI/ML**: PyTorch / TensorFlow for SAR image colorization
* **Hosting/Deployment**: Render / any cloud server
* **Version Control**: Git & GitHub

---

## Repository Structure

```
C-SARNet/
├─ frontend/      # React frontend application
├─ backend/       # Django backend API
├─ docs/          # Project documentation
├─ README.md
└─ .gitignore
```

---

## Installation & Setup

### Clone Repository

```bash
git clone https://github.com/rohith-repo/C-SARNet.git
cd C-SARNet
```

### Frontend

Run the following commands to start the frontend server:

```bash
cd frontend
npm install
npm start
```

### Backend

Run the following commands to set up and start the backend server:

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Database

* PostgreSQL recommended
* Run migrations to create tables using the provided schema

---

## Contributors


| Name | Role & Contributions |
|------|--------------------|
| [**Rohith B**](https://github.com/rohith-repo) | Frontend Development (50%), Deep Learning Model Implementation, API Integration |
| [**Devika C.V**](https://github.com/devikacv20) | Frontend Development (50%), Backend & Database Development, Project Paper Research |
| [**Hariesh N.V**](https://github.com/Hariesh2004) | Project Documentation & Research Support |


---

## License

This project is licensed under both the **MIT License** and **BSD 3-Clause License**.
