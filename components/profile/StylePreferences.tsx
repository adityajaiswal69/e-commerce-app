"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const STYLE_OPTIONS = [
  "Casual",
  "Formal",
  "Streetwear",
  "Vintage",
  "Minimalist",
  "Athletic",
];

const COLOR_OPTIONS = [
  "Black",
  "White",
  "Blue",
  "Red",
  "Green",
  "Navy",
  "Brown",
  "Gray",
  "Beige",
];

const OCCASION_OPTIONS = [
  "Daily",
  "Work",
  "Party",
  "Sport",
  "Special Event",
  "Casual",
];

const SIZE_OPTIONS = {
  top: ["XS", "S", "M", "L", "XL", "XXL"],
  bottom: ["28", "30", "32", "34", "36", "38"],
  shoes: ["6", "7", "8", "9", "10", "11", "12"],
};

export default function StylePreferences() {
  const [preferences, setPreferences] = useState({
    preferred_styles: [] as string[],
    preferred_colors: [] as string[],
    size_preferences: { top: "", bottom: "", shoes: "" },
    occasion_preferences: [] as string[],
    budget_range: [0, 500],
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("style_preferences")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (data) {
      setPreferences(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from("style_preferences").upsert({
        user_id: user.id,
        ...preferences,
      });

      setSaved(true);
    } catch (error) {
      console.error("Error saving preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMultiSelect = (
    field: keyof typeof preferences,
    value: string
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-semibold">Style Preferences</h2>

      {/* Preferred Styles */}
      <div>
        <label className="block mb-2 font-medium">Preferred Styles</label>
        <div className="flex flex-wrap gap-2">
          {STYLE_OPTIONS.map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => handleMultiSelect("preferred_styles", style)}
              className={`px-4 py-2 rounded-full ${
                preferences.preferred_styles.includes(style)
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      {/* Preferred Colors */}
      <div>
        <label className="block mb-2 font-medium">Preferred Colors</label>
        <div className="flex flex-wrap gap-2">
          {COLOR_OPTIONS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => handleMultiSelect("preferred_colors", color)}
              className={`px-4 py-2 rounded-full ${
                preferences.preferred_colors.includes(color)
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      {/* Size Preferences */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(SIZE_OPTIONS).map(([category, sizes]) => (
          <div key={category}>
            <label className="block mb-2 font-medium capitalize">
              {category} Size
            </label>
            <select
              value={
                preferences.size_preferences[
                  category as keyof typeof preferences.size_preferences
                ]
              }
              onChange={(e) =>
                setPreferences((prev) => ({
                  ...prev,
                  size_preferences: {
                    ...prev.size_preferences,
                    [category]: e.target.value,
                  },
                }))
              }
              className="w-full p-2 border rounded"
            >
              <option value="">Select Size</option>
              {sizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Occasions */}
      <div>
        <label className="block mb-2 font-medium">Occasions</label>
        <div className="flex flex-wrap gap-2">
          {OCCASION_OPTIONS.map((occasion) => (
            <button
              key={occasion}
              type="button"
              onClick={() =>
                handleMultiSelect("occasion_preferences", occasion)
              }
              className={`px-4 py-2 rounded-full ${
                preferences.occasion_preferences.includes(occasion)
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {occasion}
            </button>
          ))}
        </div>
      </div>

      {/* Budget Range */}
      <div>
        <label className="block mb-2 font-medium">
          Budget Range: ${preferences.budget_range[0]} - $
          {preferences.budget_range[1]}
        </label>
        <input
          type="range"
          min="0"
          max="1000"
          step="50"
          value={preferences.budget_range[1]}
          onChange={(e) =>
            setPreferences((prev) => ({
              ...prev,
              budget_range: [prev.budget_range[0], parseInt(e.target.value)],
            }))
          }
          className="w-full"
        />
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Preferences"}
        </button>
        {saved && <span className="text-green-500">Preferences saved!</span>}
      </div>
    </form>
  );
}
