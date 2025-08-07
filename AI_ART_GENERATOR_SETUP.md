# AI Art Generator Feature

This document explains the AI Art Generator feature implementation for the e-commerce design tool.

## Features Implemented

### 1. Database Schema
- **Table**: `ai_art` - Stores AI-generated artwork metadata
- **Storage Bucket**: `ai-art-images` - Stores generated images and SVGs
- **RLS Policies**: Users can only access their own AI art

### 2. UI Components
- **AI Art Button**: Added to the "Add Elements" section in DesignToolbar
- **AI Art Generator Modal**: Full-featured modal with prompt input, style selection, and preview
- **Art History**: Users can view and reuse previously generated art

### 3. API Endpoints
- `POST /api/ai-art/generate` - Generate new AI art
- `GET /api/ai-art/history` - Fetch user's AI art history
- `GET /api/ai-art/[id]` - Get specific AI art item
- `DELETE /api/ai-art/[id]` - Delete AI art item
- `POST /api/ai-art/convert-to-svg` - Convert images to SVG (future enhancement)

### 4. Canvas Integration
- AI art is added as image elements to the design canvas
- Includes metadata about the generation prompt and parameters
- Supports all standard canvas operations (move, resize, delete)

## Database Schema

```sql
-- AI Art table
CREATE TABLE public.ai_art (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    prompt text NOT NULL,
    image_url text NOT NULL,
    svg_url text,
    original_image_url text,
    generation_params jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Storage bucket for AI art images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'ai-art-images',
    'ai-art-images',
    true,
    10485760, -- 10MB limit
    ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
);
```

## Setup Instructions

### 1. Run Database Migration
Execute the SQL schema file:
```bash
# In your Supabase SQL Editor, run:
sql/schema/022_ai_art.sql
```

### 2. Environment Variables (Future Enhancement)
For production Stable Diffusion integration, add these to your `.env.local`:
```env
# Replicate API (recommended)
REPLICATE_API_TOKEN=your_replicate_token

# Or Hugging Face API
HUGGINGFACE_API_TOKEN=your_huggingface_token

# Or OpenAI DALL-E
OPENAI_API_KEY=your_openai_key
```

### 3. Install Additional Dependencies (Optional)
For SVG conversion with potrace:
```bash
# Install potrace system dependency
# Ubuntu/Debian: sudo apt-get install potrace
# macOS: brew install potrace
# Windows: Download from http://potrace.sourceforge.net/

# Install Node.js wrapper (optional)
npm install potrace
```

## How It Works

### Current Implementation (Mock)
1. User enters a prompt and selects a style
2. Mock AI service generates a simple SVG pattern
3. SVG is uploaded to Supabase storage
4. Metadata is saved to `ai_art` table
5. User can preview and add to design canvas

### Production Implementation (TODO)
1. Replace mock generation with actual Stable Diffusion API
2. Add image-to-SVG conversion using potrace
3. Implement advanced generation parameters
4. Add style transfer and fine-tuning options

## Usage

### For Users
1. Open the design tool for any product
2. Click the sparkles (✨) icon in the "Add Elements" section
3. Enter a descriptive prompt (e.g., "elegant floral pattern")
4. Select an art style from the dropdown
5. Click "Generate AI Art"
6. Preview the generated artwork
7. Click "Add to Design" to place it on the canvas

### For Developers
```typescript
import { generateAIArt, getUserAIArt } from '@/lib/services/ai-art';

// Generate new AI art
const aiArt = await generateAIArt({
  prompt: "geometric tribal pattern",
  style: "vector art",
  width: 512,
  height: 512
});

// Get user's art history
const history = await getUserAIArt(10);
```

## File Structure

```
app/api/ai-art/
├── generate/route.ts          # AI art generation endpoint
├── history/route.ts           # Fetch user's AI art history
├── convert-to-svg/route.ts    # SVG conversion endpoint
└── [id]/route.ts             # Get/delete specific AI art

components/design/
└── AIArtGenerator.tsx         # Main AI art generator modal

lib/services/
└── ai-art.ts                 # AI art service functions

sql/schema/
└── 022_ai_art.sql            # Database schema

types/
└── database.types.ts         # Updated with AIArt type
```

## Future Enhancements

### 1. Real AI Integration
- Replace mock with Replicate/Hugging Face Stable Diffusion
- Add support for different AI models
- Implement style transfer and fine-tuning

### 2. Advanced Features
- Batch generation with variations
- Prompt enhancement and suggestions
- Custom style training
- Image editing and refinement

### 3. SVG Optimization
- Implement potrace for bitmap-to-vector conversion
- Add SVG optimization and compression
- Support for complex vector graphics

### 4. User Experience
- Generation progress tracking
- Prompt history and favorites
- Collaborative art sharing
- AI art marketplace

## Testing

To test the feature:
1. Navigate to any product design page
2. Look for the sparkles icon in the toolbar
3. Click to open the AI Art Generator
4. Test prompt generation and canvas integration
5. Verify art history functionality

## Troubleshooting

### Common Issues
1. **Storage bucket not found**: Run the database migration
2. **Authentication errors**: Ensure user is logged in
3. **Generation fails**: Check API endpoints and error logs
4. **Images not displaying**: Verify storage policies and URLs

### Debug Mode
Enable debug logging by adding to your environment:
```env
DEBUG_AI_ART=true
```
