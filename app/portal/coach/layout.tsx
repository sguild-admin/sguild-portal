export default function CoachLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <nav>Coach nav</nav>
      <main>{children}</main>
    </div>
  )
}
