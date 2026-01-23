export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <nav>Super admin nav</nav>
      <main>{children}</main>
    </div>
  )
}
