type OrgRow = {
  id: string
  name: string
  slug?: string | null
  createdAt?: string | null
}

export function OrgsTable({ items }: { items: OrgRow[] }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="border-b px-4 py-3 text-sm font-medium">Organizations</div>
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left">
          <tr>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Slug</th>
            <th className="px-4 py-2">Created</th>
          </tr>
        </thead>
        <tbody>
          {items.length ? (
            items.map((org) => (
              <tr key={org.id} className="border-t">
                <td className="px-4 py-2 font-medium">{org.name}</td>
                <td className="px-4 py-2 text-muted-foreground">{org.slug ?? "—"}</td>
                <td className="px-4 py-2 text-muted-foreground">{org.createdAt ?? "—"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="px-4 py-6 text-muted-foreground" colSpan={3}>
                No organizations found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
