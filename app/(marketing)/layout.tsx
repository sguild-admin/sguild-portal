export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <header>Marketing header</header>
      <main>{children}</main>
    </div>
  )
}
