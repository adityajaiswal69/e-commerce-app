'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function StorageTest() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testStorageSetup = async () => {
    setLoading(true);
    setResult('Testing storage setup...\n');

    try {
      // Test 1: Check if bucket exists
      setResult(prev => prev + 'Checking if blog-images bucket exists...\n');
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        setResult(prev => prev + `Error listing buckets: ${bucketsError.message}\n`);
        return;
      }

      const blogImagesBucket = buckets?.find(bucket => bucket.id === 'blog-images');
      if (blogImagesBucket) {
        setResult(prev => prev + '✅ blog-images bucket exists\n');
      } else {
        setResult(prev => prev + '❌ blog-images bucket does not exist\n');
        setResult(prev => prev + 'Available buckets: ' + buckets?.map(b => b.id).join(', ') + '\n');
      }

      // Test 2: Try to list files in the bucket
      if (blogImagesBucket) {
        setResult(prev => prev + 'Testing bucket access...\n');
        const { data: files, error: listError } = await supabase.storage
          .from('blog-images')
          .list('', { limit: 1 });

        if (listError) {
          setResult(prev => prev + `❌ Cannot access bucket: ${listError.message}\n`);
        } else {
          setResult(prev => prev + '✅ Bucket access successful\n');
          setResult(prev => prev + `Files in bucket: ${files?.length || 0}\n`);
        }
      }

      // Test 3: Check authentication
      setResult(prev => prev + 'Checking authentication...\n');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        setResult(prev => prev + `❌ Auth error: ${authError.message}\n`);
      } else if (user) {
        setResult(prev => prev + `✅ User authenticated: ${user.email}\n`);
      } else {
        setResult(prev => prev + '❌ No user authenticated\n');
      }

    } catch (error) {
      setResult(prev => prev + `❌ Test failed: ${error}\n`);
    } finally {
      setLoading(false);
    }
  };

  const createBucket = async () => {
    setLoading(true);
    setResult('Creating blog-images bucket...\n');

    try {
      const { data, error } = await supabase.storage.createBucket('blog-images', {
        public: true,
        allowedMimeTypes: ['image/*'],
        fileSizeLimit: 5242880 // 5MB
      });

      if (error) {
        setResult(prev => prev + `❌ Failed to create bucket: ${error.message}\n`);
      } else {
        setResult(prev => prev + '✅ Bucket created successfully\n');
      }
    } catch (error) {
      setResult(prev => prev + `❌ Error: ${error}\n`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-2xl">
      <h2 className="text-xl font-bold mb-4">Storage Setup Test</h2>
      
      <div className="space-x-4 mb-4">
        <button
          onClick={testStorageSetup}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Storage Setup'}
        </button>
        
        <button
          onClick={createBucket}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Bucket'}
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Test Results:</h3>
        <pre className="whitespace-pre-wrap text-sm">{result || 'Click "Test Storage Setup" to begin'}</pre>
      </div>
    </div>
  );
}
