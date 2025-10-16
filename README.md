# n8n Workflow Front-End Template

A modern, responsive React template for building custom front-ends for your n8n workflows. This template provides authentication, user management, and a complete workflow interface that you can easily customize and duplicate for each of your n8n workflows.

## Features

- **Modern Tech Stack**: React 18, TypeScript, Vite, Tailwind CSS
- **Authentication**: Complete auth flow with Supabase (login, signup, password reset)
- **Protected Routes**: Secure pages that require authentication
- **Workflow Integration**: Pre-built service for calling n8n webhooks
- **API Key Storage**: Securely store and manage API keys in Supabase
- **Responsive Design**: Mobile-first design that works on all devices
- **Form Components**: Rich set of form controls (text, number, select, textarea, file upload, etc.)
- **Loading States**: Built-in loading and error handling
- **Theme Customization**: Easy color and branding customization
- **Type Safety**: Full TypeScript support

## Quick Start

### 1. Prerequisites

- Node.js 18+ installed
- A Supabase account ([sign up here](https://supabase.com))
- An n8n instance with webhook nodes ([learn more](https://n8n.io))

### 2. Clone and Install

```bash
# Navigate to the project directory
cd front-end-template

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

### 3. Configure Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project or select an existing one
3. Go to Project Settings → API
4. Copy your Project URL and anon/public key
5. Update `.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

6. Set up the database table for API key storage (SQL Editor in Supabase):

```sql
CREATE TABLE user_api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  key_name TEXT NOT NULL,
  encrypted_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_api_keys ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to manage their own keys
CREATE POLICY "Users can manage their own API keys"
  ON user_api_keys
  FOR ALL
  USING (auth.uid() = user_id);
```

### 4. Configure n8n Webhook

1. In your n8n workflow, add a Webhook node
2. Set it to POST method
3. Copy the webhook URL
4. Update `.env`:

```env
VITE_N8N_WEBHOOK_URL=https://your-n8n-webhook-url.com
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

```
src/
├── components/           # Reusable components
│   ├── ui/              # UI components (Button, Input, Card, etc.)
│   ├── Layout.tsx       # Main layout with navigation
│   └── ProtectedRoute.tsx  # Route protection wrapper
├── contexts/            # React contexts
│   └── AuthContext.tsx  # Authentication state management
├── lib/                 # Utilities and configurations
│   ├── supabase.ts      # Supabase client setup
│   └── utils.ts         # Helper functions
├── pages/               # Page components
│   ├── Login.tsx        # Login page
│   ├── Signup.tsx       # Sign up page
│   ├── ResetPassword.tsx # Password reset page
│   ├── Dashboard.tsx    # Main workflow page
│   └── Settings.tsx     # User settings and API keys
├── services/            # External service integrations
│   └── n8nService.ts    # n8n webhook communication
├── App.tsx              # Main app component with routing
├── main.tsx             # App entry point
└── index.css            # Global styles and theme variables
```

## Customization Guide

### For Each New Workflow

When creating a new front-end for a different n8n workflow:

1. **Copy the entire project** to a new directory
2. **Update branding** in `src/components/Layout.tsx` (line 24)
3. **Customize the form** in `src/pages/Dashboard.tsx`:
   - Modify `WorkflowFormData` type for your inputs
   - Add/remove form fields as needed
   - Update the `onSubmit` function for your data structure
4. **Configure webhook** in `.env` for the new workflow
5. **Customize theme** (optional) - see THEME_CUSTOMIZATION.md

### Quick Customizations

**Change Application Name:**
Edit `src/components/Layout.tsx` line 24

**Add a Logo:**
1. Add logo to `src/assets/`
2. Import and use in Layout component

**Modify Colors:**
Edit CSS variables in `src/index.css`

**Add Form Fields:**
Use the examples in `src/pages/Dashboard.tsx` as templates

See `THEME_CUSTOMIZATION.md` for detailed theming instructions.

## Available Form Components

All form components are in `src/components/ui/`:

- **Button** - Multiple variants (default, outline, destructive, ghost)
- **Input** - Text, email, password, number, date, file
- **Select** - Dropdown selection
- **Textarea** - Multi-line text input
- **Label** - Form labels
- **Card** - Container for grouped content
- **Alert** - Success/error messages
- **Loading** - Loading spinner with optional text

## n8n Integration

The template includes a comprehensive n8n service (`src/services/n8nService.ts`) with:

### Basic Workflow Execution

```typescript
import { executeWorkflow } from '../services/n8nService'

const response = await executeWorkflow({
  input1: 'value1',
  input2: 'value2',
})

if (response.success) {
  console.log('Result:', response.data)
} else {
  console.error('Error:', response.error)
}
```

### File Upload

```typescript
import { executeWorkflowWithFiles } from '../services/n8nService'

const formData = new FormData()
formData.append('file', fileInput.files[0])
formData.append('description', 'My file')

const response = await executeWorkflowWithFiles(formData)
```

### Long-Running Workflows (Polling)

```typescript
import { pollWorkflowStatus } from '../services/n8nService'

// First, start the workflow and get a job ID
const startResponse = await executeWorkflow({ data: 'value' })
const jobId = startResponse.data.jobId

// Then poll for results
const result = await pollWorkflowStatus(
  jobId,
  'https://your-status-endpoint.com',
  2000,  // Check every 2 seconds
  30     // Maximum 30 attempts
)
```

## Deployment

### Build for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

### Deploy to Render.com

1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Create a new Static Site
4. Connect your GitHub repository
5. Configure:
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
6. Add environment variables in Render dashboard
7. Deploy!

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Follow the prompts and add environment variables in the Vercel dashboard.

### Deploy to Netlify

1. Build the project: `npm run build`
2. Drag and drop the `dist` folder to [Netlify Drop](https://app.netlify.com/drop)
3. Or use Netlify CLI:

```bash
npm install -g netlify-cli
netlify deploy --prod
```

## Environment Variables in Production

Remember to set these environment variables in your hosting platform:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_N8N_WEBHOOK_URL`

## Security Notes

1. **API Keys**: The current implementation stores API keys in plain text in Supabase. For production, implement proper encryption on the backend.

2. **Environment Variables**: Never commit `.env` files to version control. The `.env.example` file is for reference only.

3. **Supabase RLS**: The template includes Row Level Security policies. Make sure they're enabled on your Supabase tables.

4. **n8n Webhooks**: Consider adding authentication to your n8n webhooks in production.

## Troubleshooting

### "Missing Supabase environment variables"

Make sure you've created a `.env` file and added your Supabase credentials.

### Authentication not working

1. Check that your Supabase URL and anon key are correct
2. Verify that email confirmation is disabled in Supabase (or handle email confirmation)
3. Check browser console for errors

### n8n webhook not responding

1. Verify the webhook URL is correct and accessible
2. Check that your n8n workflow is active
3. Test the webhook directly with a tool like Postman
4. Check CORS settings on your n8n instance

### API keys not saving

1. Make sure you've created the `user_api_keys` table in Supabase
2. Verify Row Level Security policies are set up correctly
3. Check browser console for errors

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint (if configured)

### Tech Stack Details

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Router** - Client-side routing
- **React Hook Form** - Form handling
- **Supabase** - Authentication and database
- **Lucide React** - Icons

## License

This is a template - feel free to use it for your projects!

## Support

For issues or questions:
- Check the troubleshooting section above
- Review the n8n documentation: https://docs.n8n.io
- Review the Supabase documentation: https://supabase.com/docs

## Next Steps

1. Sign up for a free account and create your first user
2. Customize the Dashboard page form fields for your workflow
3. Test the integration with your n8n webhook
4. Customize the theme and branding
5. Deploy to your hosting platform
6. Create copies for additional workflows!
