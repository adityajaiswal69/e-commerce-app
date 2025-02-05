"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";

type SearchAndFilterProps = {
  categories: string[];
  minPrice?: number;
  maxPrice?: number;
};

export default function SearchAndFilter({
  categories,
  minPrice = 0,
  maxPrice = 1000,
}: SearchAndFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [price, setPrice] = useState(searchParams.get("price") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "");

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("q", debouncedSearch);
    if (category) params.set("category", category);
    if (price) params.set("price", price);
    if (sort) params.set("sort", sort);

    const queryString = params.toString();
    router.push(`/products${queryString ? `?${queryString}` : ""}`);
  }, [debouncedSearch, category, price, sort, router]);

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div>
        <input
          type="search"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md border p-2"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {/* Category Filter */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-md border p-2"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Price Filter */}
        <select
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="rounded-md border p-2"
        >
          <option value="">Any Price</option>
          <option value="0-50">Under $50</option>
          <option value="50-100">$50 - $100</option>
          <option value="100-200">$100 - $200</option>
          <option value="200+">$200 & Above</option>
        </select>

        {/* Sort Options */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-md border p-2"
        >
          <option value="">Sort By</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="newest">Newest First</option>
        </select>
      </div>
    </div>
  );
}
