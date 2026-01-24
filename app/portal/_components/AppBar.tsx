"use client"

import { OrganizationSwitcher, UserButton } from "@clerk/nextjs"
import Image from "next/image"
import Link from "next/link"

export function AppBar() {
  return (
    <div className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/portal" className="flex items-center gap-2">
          <Image
            src="/favicon.ico"
            alt="Sguild Swim Instruction logo"
            width={32}
            height={32}
            className="h-8 w-auto"
            priority
          />
          <span className="text-base font-semibold tracking-tight text-slate-900 leading-none">
            <span className="sm:hidden">Sguild Swim</span>
            <span className="hidden sm:inline">
              Sguild <span className="text-slate-500">Swim Instruction</span>
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <OrganizationSwitcher />
          <UserButton afterSignOutUrl="/sign-in" afterSwitchSessionUrl="/portal" />
        </div>
      </div>
    </div>
  )
}
