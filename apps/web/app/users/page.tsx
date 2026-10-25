import { Card } from "@glow/ui";

async function getUsers() {
  try {
    const res = await fetch("http://localhost:3000/api/users", { cache: "no-store" });
    if (!res.ok) return [];
    const json = (await res.json()) as { data: { id: string; email: string; name: string | null }[] };
    return json.data ?? [];
  } catch {
    return [];
  }
}

export default async function UsersPage() {
  const users = await getUsers();
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Users</h2>
      <Card>
        {users.length === 0 ? (
          <p className="text-gray-600">No users yet. POST to /api/users to create one.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {users.map((u) => (
              <li key={u.id} className="py-2">
                <span className="font-medium">{u.name ?? u.email}</span>
                <span className="ml-2 text-sm text-gray-500">{u.email}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
