"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/database.types";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/auth-utils";
import Image from "next/image";
import { useRouter } from "next/navigation";

type UserProfile = {
  id: string;
  email?: string;
  full_name?: string | null;
  avatar_url?: string | null;
  role?: string;
  design_role?: boolean;
  created_at?: string;
  raw_user_meta_data?: any;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClientComponentClient<Database>();
  const router = useRouter();

  // Check if current user is admin
  const checkAuth = async () => {
    try {
      const { user: currentUser, error } = await getCurrentUser();
      if (error) throw error;
      
      if (!currentUser || currentUser.role !== 'admin') {
        router.push('/');
        return;
      }
      
      setCurrentUser(currentUser);
    } catch (error) {
      console.error("Error checking auth:", error);
      router.push('/sign-in');
    }
  };

  // Fetch all users using a server-side function or direct query
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // First, try to get users from auth.users table directly (this requires RLS policies to be set up properly)
      const { data: authUsers, error: authError } = await supabase
        .from('auth.users')
        .select('id, email, raw_user_meta_data, created_at');

      let authUsersMap = new Map();

      if (!authError && authUsers) {
        // If we can access auth.users directly
        authUsers.forEach((user: any) => {
          authUsersMap.set(user.id, {
            email: user.email,
            raw_user_meta_data: user.raw_user_meta_data,
            created_at: user.created_at
          });
        });
      } else {
        console.warn("Cannot access auth.users directly:", authError);
        
        // Fallback: Use a database function or edge function to get user data
        // You'll need to create a database function or edge function for this
        try {
          const { data: functionData, error: functionError } = await supabase
            .rpc('get_all_users_with_auth_data');
          
          if (!functionError && functionData) {
            functionData.forEach((user: any) => {
              authUsersMap.set(user.id, {
                email: user.email,
                raw_user_meta_data: user.raw_user_meta_data,
                created_at: user.created_at
              });
            });
          }
        } catch (rpcError) {
          console.warn("RPC function not available:", rpcError);
        }
      }

      // Get profiles data
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (profilesError) {
        console.error("Profiles error:", profilesError);
        throw profilesError;
      }

      // Combine profiles with auth data
      const formattedUsers: UserProfile[] = profiles?.map((profile: any) => {
        const authUser = authUsersMap.get(profile.id);
        const metaData = authUser?.raw_user_meta_data || {};
        
        return {
          id: profile.id,
          email: authUser?.email || profile.email || 'Email not available',
          full_name: profile.full_name || 
                    metaData?.full_name || 
                    metaData?.name || 
                    metaData?.display_name ||
                    'No name',
          avatar_url: profile.avatar_url || 
                     metaData?.avatar_url || 
                     metaData?.picture ||
                     null,
          role: profile.role || 'user',
          design_role: profile.design_role || false,
          created_at: profile.created_at || authUser?.created_at,
          raw_user_meta_data: metaData
        };
      }) || [];

      console.log("Fetched users:", formattedUsers); // Debug log
      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser]);

  // Update user role in profiles table
  const updateUserRole = async (userId: string, roleType: 'admin' | 'design', isEnabled: boolean) => {
    if (updating) return;
    
    try {
      setUpdating(userId);
      setError(null);

      console.log(`Updating ${roleType} role for user ${userId} to ${isEnabled}`); // Debug log

      const targetUser = users.find(u => u.id === userId);
      if (!targetUser) {
        throw new Error('User not found');
      }

      // Prevent current user from removing their own admin role
      if (userId === currentUser?.id && roleType === 'admin' && !isEnabled) {
        setError('You cannot remove your own admin privileges');
        setUpdating(null);
        return;
      }

      let updateData: any = {};

      if (roleType === 'admin') {
        updateData.role = isEnabled ? 'admin' : 'user';
        // If removing admin, ensure design role is also removed
        if (!isEnabled) {
          updateData.design_role = false;
        }
      } else if (roleType === 'design') {
        updateData.design_role = isEnabled;
      }

      console.log("Update data:", updateData); // Debug log

      // Update profiles table
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)
        .select();
          
      if (updateError) {
        console.error("Update error:", updateError);
        throw updateError;
      }

      console.log("Update successful:", data); // Debug log

      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { 
                ...user, 
                ...updateData
              }
            : user
        )
      );

      // Show success message briefly
      console.log(`Successfully updated ${roleType} role for user ${userId}`);

    } catch (error) {
      console.error('Error updating user role:', error);
      
      // More specific error messages
      let errorMessage = `Failed to update ${roleType} role.`;
      if (error instanceof Error) {
        if (error.message.includes('permission')) {
          errorMessage += ' You may not have sufficient permissions.';
        } else if (error.message.includes('policy')) {
          errorMessage += ' Database policy restriction.';
        } else {
          errorMessage += ` ${error.message}`;
        }
      }
      
      setError(errorMessage);
    } finally {
      setUpdating(null);
    }
  };

  const getRoleDisplayText = (user: UserProfile) => {
    const roles = [];
    if (user.role === 'admin') roles.push('Admin');
    if (user.design_role) roles.push('Design');
    if (roles.length === 0) roles.push('User');
    return roles.join(', ');
  };

  const getInitial = (name?: string | null) => {
    if (!name || name === 'No name') return '?';
    return name.charAt(0).toUpperCase();
  };

  // Refresh users data
  const handleRefresh = () => {
    if (currentUser) {
      fetchUsers();
    }
  };

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="mt-2 text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-gray-600 mt-2">Manage user roles and permissions</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex justify-between items-center">
          <span>{error}</span>
          <button 
            onClick={() => setError(null)}
            className="ml-2 text-red-600 hover:text-red-800 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading users...</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Current Roles
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Admin Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Design Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {users.map((user) => (
                <tr key={user.id} className={user.id === currentUser?.id ? 'bg-blue-50' : ''}>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      {user.avatar_url ? (
                        <div className="h-10 w-10 relative overflow-hidden rounded-full">
                          <Image
                            src={user.avatar_url}
                            alt={user.full_name || 'User'}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              // Fallback to initial if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300 text-gray-600 font-medium">
                          {getInitial(user.full_name)}
                        </div>
                      )}
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {user.full_name || 'No name'}
                          {user.id === currentUser?.id && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 truncate" title={user.id}>
                          ID: {user.id.slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {getRoleDisplayText(user)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={user.role === 'admin'}
                          disabled={updating === user.id || (user.id === currentUser?.id)}
                          onChange={(e) => updateUserRole(user.id, 'admin', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"></div>
                      </label>
                      {updating === user.id && (
                        <div className="ml-2 animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      )}
                    </div>
                    {user.id === currentUser?.id && (
                      <div className="text-xs text-gray-500 mt-1">Cannot modify own role</div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={user.design_role || false}
                          disabled={updating === user.id}
                          onChange={(e) => updateUserRole(user.id, 'design', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"></div>
                      </label>
                      {updating === user.id && (
                        <div className="ml-2 animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && users.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No users found.</p>
          <button
            onClick={handleRefresh}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      )}

      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Role Information:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li><strong>Admin:</strong> Full access to admin features and user management</li>
          <li><strong>Design:</strong> Access to design tools and features</li>
          <li><strong>User:</strong> Standard user access (default when both roles are off)</li>
          <li><strong>Note:</strong> You cannot remove your own admin privileges</li>
          <li><strong>Note:</strong> Removing admin role also removes design role automatically</li>
        </ul>
      </div>

      <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-yellow-800 mb-2">Database Setup Required:</h3>
        <div className="text-sm text-yellow-700 space-y-2">
          <p>To access email and metadata, you need to create a database function:</p>
          
          <p>Alternative: Set up RLS policies to allow admin access to auth.users table directly.</p>
        </div>
      </div>
    </div>
  );
}