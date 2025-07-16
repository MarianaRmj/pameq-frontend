export async function fetchDashboardSummary() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard`);
  return res.json();
}