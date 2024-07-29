import Link from "next/link";
import Image from "next/image";

import { MobileNavbar } from "@/components/mobile-navbar";

export function Header() {
  return (
    <header className="container flex items-center justify-between gap-10 py-4">
      <Link href="/" className="flex items-center gap-3">
        <Image
          src="/images/logo.webp"
          alt="DBlockEd Logo"
          width={40}
          height={40}
          className="rounded-[10px]"
        />
        <span className="font-heading text-xl font-bold">DBlockEd</span>
      </Link>
      <div className="flex items-center gap-10">
        <nav className="hidden items-center gap-10 md:flex justify-end">
          <Link
            href="/faucet"
            className="flex cursor-pointer items-center text-lg font-medium text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
          >
            Faucet
          </Link>
        </nav>
      </div>
      <MobileNavbar>
        <div className="rounded-b-lg bg-background py-4 container text-foreground shadow-xl">
          <nav className="flex flex-col gap-1 pt-2">
            <Link
              href="/faucet"
              className="flex w-full cursor-pointer items-center rounded-md p-2 font-medium text-muted-foreground hover:text-foreground"
            >
              Faucet
            </Link>
          </nav>
        </div>
      </MobileNavbar>
    </header>
  );
}
