# E-commerce App with Next.js and Supabase

A modern e-commerce application built with Next.js 14, Supabase, and Tailwind CSS.

## Features

- 🛍️ Product browsing and searching
- 🔍 Category filtering
- 🌟 Product reviews and ratings
- 🛒 Shopping cart functionality
- 👤 User authentication and profiles
- 💳 Secure checkout process

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **State Management**: React Context

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/rohit-og/e-commerce-app.git
cd e-commerce-app
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
   Create a `.env.local` file with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

4. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Database Setup

The application requires the following Supabase tables:

- `products`: Store product information
- `profiles`: User profiles
- `reviews`: Product reviews
- `orders`: Order information

Check the SQL setup files in the `supabase` directory for detailed schema information.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
