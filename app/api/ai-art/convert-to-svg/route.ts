import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    // For now, we'll use a mock SVG conversion
    // In production, you would use potrace or similar tool
    const svgUrl = await convertToSVGMock(imageUrl, session.user.id);

    return NextResponse.json({
      success: true,
      svgUrl
    });

  } catch (error) {
    console.error('Error converting to SVG:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Mock SVG conversion - replace with actual potrace integration
 */
async function convertToSVGMock(imageUrl: string, userId: string): Promise<string> {
  // Create a simple SVG version
  const svg = `
    <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="posterize">
          <feComponentTransfer>
            <feFuncR type="discrete" tableValues="0 .5 1"/>
            <feFuncG type="discrete" tableValues="0 .5 1"/>
            <feFuncB type="discrete" tableValues="0 .5 1"/>
          </feComponentTransfer>
        </filter>
      </defs>
      <image href="${imageUrl}" width="512" height="512" filter="url(#posterize)"/>
    </svg>
  `;

  const svgBlob = new Blob([svg], { type: 'image/svg+xml' });
  const fileName = `${uuidv4()}_converted.svg`;
  
  const supabase = await createServerSupabaseClient();
  const filePath = `${userId}/${fileName}`;
  
  const { data, error } = await supabase.storage
    .from('ai-art-images')
    .upload(filePath, svgBlob, {
      contentType: 'image/svg+xml',
      upsert: true,
    });

  if (error) {
    throw error;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('ai-art-images')
    .getPublicUrl(filePath);

  return publicUrl;
}

// TODO: Replace with actual potrace integration
/*
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

async function convertToSVGWithPotrace(imageUrl: string, userId: string): Promise<string> {
  try {
    // Download the image
    const response = await fetch(imageUrl);
    const imageBuffer = await response.arrayBuffer();
    
    // Save temporarily
    const tempDir = '/tmp';
    const tempImagePath = path.join(tempDir, `${uuidv4()}.png`);
    const tempSvgPath = path.join(tempDir, `${uuidv4()}.svg`);
    
    fs.writeFileSync(tempImagePath, Buffer.from(imageBuffer));
    
    // Convert to SVG using potrace
    await execAsync(`potrace ${tempImagePath} -s -o ${tempSvgPath}`);
    
    // Read the SVG
    const svgContent = fs.readFileSync(tempSvgPath, 'utf8');
    
    // Upload to storage
    const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
    const fileName = `${uuidv4()}_traced.svg`;
    
    const supabase = await createServerSupabaseClient();
    const filePath = `${userId}/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('ai-art-images')
      .upload(filePath, svgBlob, {
        contentType: 'image/svg+xml',
        upsert: true,
      });

    if (error) {
      throw error;
    }

    // Clean up temp files
    fs.unlinkSync(tempImagePath);
    fs.unlinkSync(tempSvgPath);

    const { data: { publicUrl } } = supabase.storage
      .from('ai-art-images')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error with potrace conversion:', error);
    throw error;
  }
}
*/
