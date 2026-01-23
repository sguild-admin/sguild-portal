export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <nav>Portal nav</nav>
      <div>{children}</div>
    </div>
  )
}
