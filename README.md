cd macromed-frontend $env:NODE_OPTIONS="--openssl-legacy-provider"; npm run dev
cd macromed_backend php artisan serve
cd Dashboard pyhtojn app.py

....................................................

# Macromed Dashboard - Medical Equipment E-commerce Platform

A comprehensive medical equipment e-commerce platform with recommendation systems, analytics, and user tracking capabilities.

## 🏗️ Project Architecture

This project consists of three main components:

- **Frontend**: Next.js React application (Port 3000)
- **Backend**: Laravel PHP API (Port 8000) 
- **Python API**: Flask recommendation engine (Port 5001)

## 📋 Prerequisites

Before running this project, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **PHP** (v8.0 or higher)
- **Composer** (PHP package manager)
- **Python** (v3.8 or higher)
- **PostgreSQL** database
- **Git**

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Dashboard
```

### 2. Frontend Setup (Next.js)

```bash
# Navigate to frontend directory
cd macromed-frontend

# Install dependencies
npm install

# Start the development server
$env:NODE_OPTIONS="--openssl-legacy-provider"; npm run dev
```

**Frontend will be available at:** `http://localhost:3000`

### 3. Backend Setup (Laravel)

```bash
# Navigate to backend directory
cd macromed_backend

# Install PHP dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure database in .env file
# Update DB_DATABASE, DB_USERNAME, DB_PASSWORD

# Run database migrations
php artisan migrate

# Seed the database (optional)
php artisan db:seed

# Start the Laravel server
php artisan serve
```

**Backend API will be available at:** `http://localhost:8000`

### 4. Python API Setup (Flask)

```bash
# Navigate to dashboard directory
cd dashboard

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\Activate.ps1
# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Start the Python Flask server
python app.py
```

**Python API will be available at:** `http://localhost:5001`

## 🔧 Configuration

### Database Configuration

Update the `.env` file in the `macromed_backend` directory:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=your_database_name
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

### Frontend Configuration

Update the API base URL in `macromed-frontend/config/config.js`:

```javascript
const config = {
  baseURLApi: 'http://localhost:8000/api',
  // ... other config
};
```

## 📁 Project Structure

```
Dashboard/
├── macromed-frontend/          # Next.js Frontend
│   ├── pages/                 # React pages
│   ├── components/            # React components
│   ├── config/               # Configuration files
│   └── package.json
├── macromed_backend/          # Laravel Backend
│   ├── app/
│   │   ├── Http/Controllers/ # API Controllers
│   │   └── Models/           # Database Models
│   ├── routes/               # API Routes
│   ├── database/migrations/  # Database Migrations
│   └── .env                  # Environment Configuration
├── dashboard/                # Python Flask API
│   ├── app.py               # Main Flask application
│   ├── requirements.txt     # Python dependencies
│   └── venv/               # Virtual environment
└── README.md               # This file
```

## 🛠️ Available Scripts

### Frontend (macromed-frontend/)
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
```

### Backend (macromed_backend/)
```bash
php artisan serve    # Start development server
php artisan migrate  # Run database migrations
php artisan db:seed  # Seed database
php artisan route:list # List all routes
```

### Python API (dashboard/)
```bash
python app.py        # Start Flask server
```

## 🔌 API Endpoints

### Laravel Backend (Port 8000)

#### Authentication
- `POST /api/login` - User login
- `POST /api/signup` - User registration
- `POST /api/logout` - User logout (protected)

#### Products
- `GET /api/products` - Get all products
- `GET /api/products/{id}` - Get specific product
- `GET /api/products/search` - Search products
- `POST /api/products/by-category` - Get products by category

#### Recommendations
- `GET /api/recommendations/content-based` - Content-based recommendations
- `GET /api/recommendations/price-based` - Price-based recommendations
- `GET /api/recommendations/hybrid` - Hybrid recommendations

#### Tracking & Analytics
- `POST /api/track/view` - Track product view
- `POST /api/track/cart` - Track cart action
- `POST /api/track/wishlist` - Track wishlist action
- `GET /api/insights/analytics` - User analytics
- `GET /api/insights/trending` - Trending products
- `GET /api/insights/frequently-viewed` - Frequently viewed products

### Python API (Port 5001)

#### Recommendations
- `GET /api/recommend?type=content` - Content-based recommendations
- `GET /api/recommend?type=price` - Price-based recommendations
- `GET /api/recommend?type=hybrid` - Hybrid recommendations
- `GET /api/health` - Health check

## 🎯 Features

### Frontend Features
- **Product Catalog**: Browse and search medical equipment
- **Product Details**: Detailed product information with images
- **Shopping Cart**: Add/remove items from cart
- **Wishlist**: Save products for later
- **User Authentication**: Login/signup functionality
- **Recommendations**: Multiple recommendation systems
- **Analytics Dashboard**: User insights and analytics

### Backend Features
- **RESTful API**: Complete API for frontend
- **User Management**: Authentication and authorization
- **Product Management**: CRUD operations for products
- **Order Management**: Order processing and tracking
- **Analytics**: User behavior tracking and insights
- **Recommendations**: Integration with Python API

### Python API Features
- **Content-Based Recommendations**: Based on product features
- **Price-Based Recommendations**: Based on price ranges
- **Hybrid Recommendations**: Combined approach
- **Machine Learning**: Advanced recommendation algorithms

## 🐛 Troubleshooting

### Common Issues

#### Frontend Issues
```bash
# If you get OpenSSL errors on Windows
$env:NODE_OPTIONS="--openssl-legacy-provider"; npm run dev

# If dependencies are missing
npm install
```

#### Backend Issues
```bash
# If you get "No application encryption key" error
php artisan key:generate

# If database connection fails
# Check .env file configuration
# Ensure PostgreSQL is running

# If routes are not working
php artisan route:clear
php artisan config:clear
```

#### Python API Issues
```bash
# If virtual environment is not activated
venv\Scripts\Activate.ps1  # Windows
source venv/bin/activate   # macOS/Linux

# If dependencies are missing
pip install -r requirements.txt

# If port 5001 is already in use
# Change port in app.py or kill the process using the port
```

### Port Conflicts
- **Frontend**: 3000 (change in package.json if needed)
- **Backend**: 8000 (change with --port flag: `php artisan serve --port=8001`)
- **Python API**: 5001 (change in app.py if needed)

## 📊 Database

The project uses PostgreSQL as the primary database. Make sure to:

1. Create a PostgreSQL database
2. Update the `.env` file with correct credentials
3. Run migrations: `php artisan migrate`
4. Optionally seed with sample data: `php artisan db:seed`

## 🔒 Security

- All sensitive data is stored in `.env` files
- API endpoints are protected with Laravel Sanctum
- CORS is configured for cross-origin requests
- Input validation is implemented on all endpoints

## 📝 Development

### Adding New Features
1. Create feature branch from main
2. Implement changes in respective components
3. Test all three services work together
4. Update documentation if needed
5. Create pull request

### Code Style
- **Frontend**: Follow React/Next.js best practices
- **Backend**: Follow Laravel conventions
- **Python**: Follow PEP 8 style guide

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section above
- Review the API documentation

---

**Happy Coding! 🚀** 