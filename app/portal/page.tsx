import { UserButton } from "@clerk/nextjs"

export default function Page() {
  return (
    <main className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Portal</h1>
        <UserButton />
      </div>
    </main>
  )
}
