"use client";

import { User } from "@supabase/supabase-js";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@/lib/supabase/client";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
const OrderHistory = dynamic(() => import("./OrderHistory"), { ssr: false });

type Address = {
  name?: string;
  phone?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
};

export default function ProfileInfo({ user }: { user: User }) {
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [address, setAddress] = useState<Address>({});
  const [addresses, setAddresses] = useState<(Address & { id?: string; label?: 'Home'|'Office'|'Other'|'Custom'; is_default_shipping?: boolean; is_default_billing?: boolean; })[]>([]);
  const [newAddress, setNewAddress] = useState<Address & { label?: 'Home'|'Office'|'Other'|'Custom' }>({});

  useEffect(() => {
    async function loadProfile() {
      const { data } = await supabase
        .from("profiles")
        .select("role, full_name, avatar_url, address")
        .eq("id", user.id)
        .single();
      setIsAdmin(data?.role === "admin");
      setFullName(data?.full_name || "");
      setAvatarUrl(data?.avatar_url || "");
      setAddress((data?.address as any) || {});
    }
    async function loadAddresses() {
      const { data: rows } = await supabase
        .from('user_addresses')
        .select('*')
        .order('created_at', { ascending: false });
      setAddresses(rows || []);
    }
    loadProfile();
    loadAddresses();
  }, [supabase, user.id]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setLoading(true);
      const file = e.target.files?.[0];
      if (!file) return;
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      setAvatarUrl(data.publicUrl);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to upload avatar");
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName, avatar_url: avatarUrl, address })
        .eq("id", user.id);
      if (error) throw error;
      setMessage("Profile updated");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email!, {
        redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || window.location.origin}/auth/callback?type=recovery`,
      });
      if (error) throw error;
      setMessage("Password reset link sent to your email");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const updateAddress = (key: keyof Address, value: string) => {
    setAddress((prev) => ({ ...prev, [key]: value }));
  };

  const updateNewAddress = (key: keyof Address | 'label', value: string) => {
    setNewAddress((prev: any) => ({ ...prev, [key]: value }));
  };

  const addAddress = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const payload: any = {
        user_id: user.id,
        label: (newAddress.label as any) || 'Home',
        name: newAddress.name || '',
        phone: newAddress.phone || '',
        address_line_1: newAddress.address_line_1 || '',
        address_line_2: newAddress.address_line_2 || null,
        city: newAddress.city || '',
        state: newAddress.state || '',
        postal_code: newAddress.postal_code || '',
        country: newAddress.country || '',
      };
      const { error } = await supabase.from('user_addresses').insert(payload);
      if (error) throw error;
      setNewAddress({});
      const { data: rows } = await supabase.from('user_addresses').select('*').order('created_at', { ascending: false });
      setAddresses(rows || []);
      setMessage('Address added');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to add address');
    } finally {
      setLoading(false);
    }
  };

  const removeAddress = async (id?: string) => {
    if (!id) return;
    setLoading(true);
    setMessage(null);
    try {
      const { error } = await supabase.from('user_addresses').delete().eq('id', id);
      if (error) throw error;
      setAddresses(addresses.filter((a) => a.id !== id));
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to remove address');
    } finally {
      setLoading(false);
    }
  };

  const makeDefault = async (id?: string, type: 'shipping'|'billing' = 'shipping') => {
    if (!id) return;
    setLoading(true);
    setMessage(null);
    try {
      if (type === 'shipping') {
        await supabase.from('user_addresses').update({ is_default_shipping: false }).eq('user_id', user.id);
        await supabase.from('user_addresses').update({ is_default_shipping: true }).eq('id', id);
      } else {
        await supabase.from('user_addresses').update({ is_default_billing: false }).eq('user_id', user.id);
        await supabase.from('user_addresses').update({ is_default_billing: true }).eq('id', id);
      }
      const { data: rows } = await supabase.from('user_addresses').select('*').order('created_at', { ascending: false });
      setAddresses(rows || []);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to set default');
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders inside a useEffect, since 'await' cannot be used at the top level in a component
  const [orders, setOrders] = useState<any[]>([]);
  useEffect(() => {
    const fetchOrders = async () => {
      const { data } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (
              name,
              image_url
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setOrders(data || []);
    };
    fetchOrders();
  }, [supabase, user.id]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 rounded-lg border bg-white p-6">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 overflow-hidden rounded-full border">
            <Image src={avatarUrl || "/default-avatar.png"} alt="Avatar" fill className="object-cover" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Signed in as</p>
            <p className="font-medium">{user.email}</p>
            <p className="text-sm text-gray-500">Member since {new Date(user.created_at).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="mt-4">
          <label className="cursor-pointer inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm border hover:bg-gray-50">
            Change Avatar
            <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={loading} />
          </label>
        </div>
        {isAdmin && (
          <Link href="/admin" className="mt-4 inline-flex rounded-md bg-gray-800 px-3 py-2 text-sm text-white hover:bg-gray-900">
            Admin Dashboard
          </Link>
        )}
      </div>

      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-lg border bg-white p-6">
          <h3 className="text-lg font-semibold mb-4">Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-md border border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={user.email || ''} disabled className="w-full rounded-md border border-gray-200 bg-gray-50" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6">
          <h3 className="text-lg font-semibold mb-4">Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input className="w-full rounded-md border border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white" value={address.name || ''} onChange={(e) => updateAddress('name', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input className="w-full rounded-md border border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white" value={address.phone || ''} onChange={(e) => updateAddress('phone', e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
              <input className="w-full rounded-md border border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white" value={address.address_line_1 || ''} onChange={(e) => updateAddress('address_line_1', e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
              <input className="w-full rounded-md border border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white" value={address.address_line_2 || ''} onChange={(e) => updateAddress('address_line_2', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input className="w-full rounded-md border border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white" value={address.city || ''} onChange={(e) => updateAddress('city', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input className="w-full rounded-md border border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white" value={address.state || ''} onChange={(e) => updateAddress('state', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
              <input className="w-full rounded-md border border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white" value={address.postal_code || ''} onChange={(e) => updateAddress('postal_code', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <input className="w-full rounded-md border border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white" value={address.country || ''} onChange={(e) => updateAddress('country', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6">
          <h3 className="text-lg font-semibold mb-4">Saved Addresses</h3>
          <div className="space-y-4">
            {addresses.map((addr) => (
              <div key={addr.id} className="border rounded-md p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{addr.label || 'Home'}</p>
                    <p className="text-sm text-gray-600">{addr.name} {addr.phone ? `• ${addr.phone}` : ''}</p>
                    <p className="text-sm">{addr.address_line_1}{addr.address_line_2 ? `, ${addr.address_line_2}` : ''}</p>
                    <p className="text-sm">{addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.postal_code}</p>
                    <p className="text-sm">{addr.country}</p>
                  </div>
                  <div className="space-x-2">
                    <button onClick={() => makeDefault(addr.id, 'shipping')} className={`text-sm px-2 py-1 rounded border ${addr.is_default_shipping ? 'bg-green-50 border-green-200' : ''}`}>Default Shipping</button>
                    <button onClick={() => makeDefault(addr.id, 'billing')} className={`text-sm px-2 py-1 rounded border ${addr.is_default_billing ? 'bg-blue-50 border-blue-200' : ''}`}>Default Billing</button>
                    <button onClick={() => removeAddress(addr.id)} className="text-sm px-2 py-1 rounded border">Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 border-t pt-6">
            <h4 className="font-medium mb-3">Add New Address</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                <select value={newAddress.label || ''} onChange={(e) => updateNewAddress('label', e.target.value)} className="w-full rounded-md border border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white">
                  <option value="Home">Home</option>
                  <option value="Office">Office</option>
                  <option value="Other">Other</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input className="w-full rounded-md border border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white" value={newAddress.name || ''} onChange={(e) => updateNewAddress('name', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input className="w-full rounded-md border border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white" value={newAddress.phone || ''} onChange={(e) => updateNewAddress('phone', e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
                <input className="w-full rounded-md border border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white" value={newAddress.address_line_1 || ''} onChange={(e) => updateNewAddress('address_line_1', e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                <input className="w-full rounded-md border border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white" value={newAddress.address_line_2 || ''} onChange={(e) => updateNewAddress('address_line_2', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input className="w-full rounded-md border border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white" value={newAddress.city || ''} onChange={(e) => updateNewAddress('city', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input className="w-full rounded-md border border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white" value={newAddress.state || ''} onChange={(e) => updateNewAddress('state', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                <input className="w-full rounded-md border border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white" value={newAddress.postal_code || ''} onChange={(e) => updateNewAddress('postal_code', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input className="w-full rounded-md border border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white" value={newAddress.country || ''} onChange={(e) => updateNewAddress('country', e.target.value)} />
              </div>
            </div>
            <button onClick={addAddress} disabled={loading} className="mt-4 inline-flex rounded-md bg-gray-900 px-4 py-2 text-white text-sm hover:bg-black disabled:opacity-50">Add Address</button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={saveProfile} disabled={loading} className="inline-flex rounded-md bg-blue-600 px-4 py-2 text-white text-sm hover:bg-blue-700 disabled:opacity-50">Save Changes</button>
          <button onClick={handlePasswordReset} disabled={loading} className="inline-flex rounded-md border px-4 py-2 text-sm hover:bg-gray-50">Update Password</button>
        </div>
        {message && <p className="text-sm text-gray-600">{message}</p>}
      </div>

      <div className="lg:col-span-3">
        <div className="rounded-lg border bg-white p-6">
          <OrderHistory orders={orders || []} />
        </div>
      </div>
    </div>
  );
}
