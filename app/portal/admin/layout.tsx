export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <aside>Admin menu</aside>
      <section>{children}</section>
    </div>
  )
}
