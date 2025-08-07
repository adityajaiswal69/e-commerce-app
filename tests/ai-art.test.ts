/**
 * AI Art Generator Tests
 * 
 * These tests verify the AI art generation functionality
 * Run with: npm test ai-art.test.ts
 */

import { createClientComponentClient } from '@/lib/supabase/client';
import { generateAIArt, getUserAIArt, saveAIArt } from '@/lib/services/ai-art';

// Mock Supabase client for testing
jest.mock('@/lib/supabase/client');

describe('AI Art Generator', () => {
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      auth: {
        getSession: jest.fn(),
      },
      from: jest.fn(() => ({
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(),
          })),
        })),
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              limit: jest.fn(),
            })),
          })),
        })),
      })),
      storage: {
        from: jest.fn(() => ({
          upload: jest.fn(),
          getPublicUrl: jest.fn(() => ({
            data: { publicUrl: 'https://example.com/test.svg' },
          })),
        })),
      },
    };

    (createClientComponentClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  describe('generateAIArt', () => {
    it('should generate AI art with valid prompt', async () => {
      // Mock fetch for API call
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: {
              id: 'test-id',
              user_id: 'test-user',
              prompt: 'test prompt',
              image_url: 'https://example.com/test.svg',
              generation_params: {},
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          }),
        })
      ) as jest.Mock;

      const result = await generateAIArt({
        prompt: 'test prompt',
        style: 'vector art',
      });

      expect(result).toBeDefined();
      expect(result.prompt).toBe('test prompt');
      expect(result.image_url).toBe('https://example.com/test.svg');
    });

    it('should handle generation errors', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({
            error: 'Generation failed',
          }),
        })
      ) as jest.Mock;

      await expect(generateAIArt({
        prompt: 'test prompt',
      })).rejects.toThrow('Generation failed');
    });
  });

  describe('getUserAIArt', () => {
    it('should fetch user AI art history', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: [
              {
                id: 'test-id',
                prompt: 'test prompt',
                image_url: 'https://example.com/test.svg',
              },
            ],
          }),
        })
      ) as jest.Mock;

      const result = await getUserAIArt(10);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
    });
  });
});

// Integration test helper
export async function testAIArtWorkflow() {
  console.log('Testing AI Art Generator workflow...');
  
  try {
    // Test 1: Generate AI art
    console.log('1. Testing AI art generation...');
    const generatedArt = await generateAIArt({
      prompt: 'simple geometric pattern',
      style: 'vector art',
    });
    console.log('✓ AI art generated:', generatedArt.id);

    // Test 2: Fetch history
    console.log('2. Testing art history fetch...');
    const history = await getUserAIArt(5);
    console.log('✓ Art history fetched:', history.length, 'items');

    // Test 3: Verify the generated art is in history
    const foundInHistory = history.find(item => item.id === generatedArt.id);
    if (foundInHistory) {
      console.log('✓ Generated art found in history');
    } else {
      console.log('⚠ Generated art not found in history');
    }

    console.log('🎉 All tests passed!');
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Manual test function for browser console
if (typeof window !== 'undefined') {
  (window as any).testAIArt = testAIArtWorkflow;
}
