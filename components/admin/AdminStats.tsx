type AdminStatsProps = {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
};

export default function AdminStats({
  totalProducts,
  totalOrders,
  totalRevenue,
}: AdminStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div className="rounded-lg border bg-white p-6">
        <h3 className="text-sm font-medium text-gray-500">Total Products</h3>
        <p className="mt-2 text-3xl font-bold">{totalProducts}</p>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
        <p className="mt-2 text-3xl font-bold">{totalOrders}</p>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
        <p className="mt-2 text-3xl font-bold">${totalRevenue.toFixed(2)}</p>
      </div>
    </div>
  );
}
