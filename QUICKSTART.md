# Quick Start Guide

Get your n8n workflow front-end running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- A Supabase account
- An n8n instance with a webhook

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Environment Variables

Copy the example file:
```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

### Get Supabase Credentials:
1. Go to https://app.supabase.com
2. Select your project (or create a new one)
3. Go to **Project Settings** → **API**
4. Copy your **Project URL** and **anon/public key**

### Get n8n Webhook URL:
1. In your n8n workflow, add a **Webhook** node
2. Set it to **POST** method
3. Copy the **Test URL** or **Production URL**

Your `.env` should look like:
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-id
```

## Step 3: Set Up Supabase Database

In Supabase SQL Editor, run this SQL:

```sql
CREATE TABLE user_api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  key_name TEXT NOT NULL,
  encrypted_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE user_api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own API keys"
  ON user_api_keys
  FOR ALL
  USING (auth.uid() = user_id);
```

## Step 4: Configure Supabase Auth (Optional but Recommended)

For testing, disable email confirmation:

1. Go to **Authentication** → **Providers** → **Email**
2. Turn OFF **Confirm email**
3. Click Save

(In production, you'll want this enabled with proper email templates)

## Step 5: Start Development Server

```bash
npm run dev
```

Open http://localhost:5173

## Step 6: Create Your First Account

1. Click "Sign up"
2. Enter email and password
3. Create your account
4. You'll be redirected to the dashboard

## Step 7: Test Your Workflow

1. Fill in the form fields
2. Click "Execute Workflow"
3. Check the response from your n8n workflow

## Next Steps

### Customize the Form

Edit `src/pages/Dashboard.tsx`:
- Change the form fields to match your workflow
- Update the `WorkflowFormData` type
- Modify the `onSubmit` function to format your data

### Change Branding

1. App name: Edit `src/components/Layout.tsx` line 24
2. Colors: Edit `src/index.css` (see THEME_CUSTOMIZATION.md)
3. Add logo: Place in `src/assets/` and update Layout component

### Deploy

When ready to deploy:

```bash
npm run build
```

Then deploy the `dist/` folder to:
- Render.com (recommended for Render-hosted n8n)
- Vercel
- Netlify
- Any static hosting service

## Troubleshooting

### Can't log in?
- Check Supabase URL and key in .env
- Verify email confirmation is disabled (for testing)
- Check browser console for errors

### Workflow not triggering?
- Verify n8n webhook URL is correct
- Check that n8n workflow is active
- Test webhook with Postman first
- Check CORS settings on n8n

### Build errors?
- Delete `node_modules` and run `npm install` again
- Make sure Node.js version is 18+
- Check for TypeScript errors: `npm run build`

## Common Customizations

### Add a new form field

In `src/pages/Dashboard.tsx`:

1. Add to the type:
```typescript
type WorkflowFormData = {
  // existing fields...
  myNewField: string
}
```

2. Add the JSX:
```tsx
<div className="space-y-2">
  <Label htmlFor="myNewField">My New Field</Label>
  <Input
    id="myNewField"
    {...register('myNewField', { required: 'Required' })}
  />
</div>
```

3. Include in the submission:
```typescript
const workflowData = {
  // existing fields...
  myNewField: data.myNewField,
}
```

### Change colors

Edit `src/index.css` and modify the `--primary` value:

```css
:root {
  --primary: 221.2 83.2% 53.3%;  /* Blue */
}
```

Try these:
- Green: `142 71% 45%`
- Purple: `262 83% 58%`
- Orange: `25 95% 53%`

## Support

- Check the main README.md for detailed documentation
- See THEME_CUSTOMIZATION.md for styling
- Visit n8n docs: https://docs.n8n.io
- Visit Supabase docs: https://supabase.com/docs

## License

This template is free to use for your projects!
