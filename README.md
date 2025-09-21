# PowerVend - Electricity Token Vending App

A modern, responsive React application for purchasing electricity tokens from Nigerian Distribution Companies (DISCOs). Built with React, Vite, and Tailwind CSS.

## Features

- 🔐 **User Authentication** - Login and registration system
- ⚡ **Token Purchase** - Buy electricity tokens from all major Nigerian DISCOs
- 💳 **Multiple Payment Methods** - Card, Bank Transfer, USSD, and Wallet payments
- 📱 **Mobile-First Design** - Responsive design optimized for mobile devices
- 📊 **Transaction History** - View and search past transactions
- 🎫 **Receipt Management** - Download transaction receipts
- 🆘 **Customer Support** - Live chat and FAQ support
- 👤 **User Profile** - Manage account settings and preferences

## Supported DISCOs

- Abuja Electricity Distribution Company (AEDC)
- Benin Electricity Distribution Company (BEDC)
- Eko Electricity Distribution Company (EKEDC)
- Enugu Electricity Distribution Company (EEDC)
- Ibadan Electricity Distribution Company (IBEDC)
- Ikeja Electric (IE)
- Jos Electricity Distribution Company (JEDC)
- Kaduna Electricity Distribution Company (KEDC)
- Kano Electricity Distribution Company (KEDCO)
- Port Harcourt Electricity Distribution Company (PHEDC)
- Yola Electricity Distribution Company (YEDC)

## Tech Stack

- **Frontend**: React 18
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Package Manager**: npm

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn
- Supabase account (free at [supabase.com](https://supabase.com))

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd power-vend-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up Supabase:
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to Settings > API to get your project URL and anon key
   - Copy `env.example` to `.env` and fill in your Supabase credentials:
   ```bash
   cp env.example .env
   ```
   - Update `.env` with your Supabase URL and anon key

4. Set up the database:
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Copy and run the SQL from `database/schema.sql`
   - This will create all necessary tables and set up authentication

5. Start the development server:
```bash
npm run dev
```

6. Open your browser and navigate to `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Project Structure

```
power-vend-app/
├── public/
│   └── vite.svg
├── src/
│   ├── contexts/
│   │   └── AuthContext.jsx    # Authentication context
│   ├── hooks/
│   │   └── useTransactions.js # Transaction management hook
│   ├── lib/
│   │   └── supabase.js        # Supabase client and helpers
│   ├── App.jsx                # Main application component
│   ├── main.jsx               # Application entry point
│   └── index.css              # Global styles and Tailwind imports
├── database/
│   └── schema.sql             # Database schema and setup
├── index.html                 # HTML template
├── package.json               # Dependencies and scripts
├── tailwind.config.js         # Tailwind CSS configuration
├── postcss.config.js          # PostCSS configuration
├── vite.config.js             # Vite configuration
├── env.example                # Environment variables template
└── README.md                  # Project documentation
```

## Deployment

### Build for Production

```bash
npm run build
```

This creates a `dist` folder with optimized production files.

### Deploy to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Set up environment variables in Vercel:
   - Go to your Vercel project settings
   - Add environment variables:
     - `VITE_SUPABASE_URL`: Your Supabase project URL
     - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

3. Deploy:
```bash
vercel
```

### Deploy to Netlify

1. Build the project:
```bash
npm run build
```

2. Set up environment variables in Netlify:
   - Go to your Netlify site settings
   - Navigate to Environment variables
   - Add:
     - `VITE_SUPABASE_URL`: Your Supabase project URL
     - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

3. Drag and drop the `dist` folder to Netlify or connect your Git repository.

### Deploy to GitHub Pages

1. Install gh-pages:
```bash
npm install --save-dev gh-pages
```

2. Add deploy script to package.json:
```json
"scripts": {
  "deploy": "gh-pages -d dist"
}
```

3. Build and deploy:
```bash
npm run build
npm run deploy
```

## Features Overview

### Authentication
- **Real user authentication** with Supabase Auth
- Login with email and password
- Registration with full name, phone, email, and password
- Password visibility toggle
- Automatic profile creation
- Secure JWT token management

### Dashboard
- Quick purchase button
- Recent transactions overview
- Quick access to common features

### Purchase Flow
- **Real-time DISCO data** from Supabase database
- Meter number input with validation
- Amount selection with quick amount buttons
- Payment method selection
- Form validation and error handling
- **Persistent transaction storage**

### Transaction Management
- **Real transaction history** stored in PostgreSQL
- **Live search functionality** across transactions
- Token display and receipt download
- Transaction status tracking
- **Real-time updates** with Supabase subscriptions

### User Experience
- Smooth animations and transitions
- Mobile-optimized interface
- Intuitive navigation
- Loading states and feedback
- **Toast notifications** for user feedback
- **Real-time data synchronization**

## Customization

### Styling
The app uses Tailwind CSS with custom configuration. You can modify colors, fonts, and other design tokens in `tailwind.config.js`.

### Adding New DISCOs
To add new distribution companies, insert them into the `discos` table in your Supabase database:

```sql
INSERT INTO discos (name, code) VALUES 
('New Distribution Company', 'NDC');
```

### Payment Integration
The current implementation includes UI for payment methods. To integrate with actual payment providers, you'll need to:

1. Add payment provider SDKs (Stripe, Paystack, etc.)
2. Implement payment processing logic
3. Add proper error handling and validation
4. Update the `transactions` table to store payment references
5. Add webhook handlers for payment confirmations

### Database Schema
The app uses the following main tables:
- `profiles` - User profile information
- `discos` - Electricity distribution companies
- `transactions` - User purchase transactions

All tables include Row Level Security (RLS) for data protection.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.
