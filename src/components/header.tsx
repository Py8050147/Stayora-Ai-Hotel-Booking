import React from "react";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
    return (
        <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
            <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link
                    href="/"
                    className="flex items-center gap-2 rounded-md transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                    <Image
                        src="/logo.png"
                        alt="Stayora logo"
                        width={32}
                        height={32}
                        className="h-8 w-8 object-contain"
                        priority
                    />
                    <span className="text-xl font-bold tracking-tight">
                        Stayora
                    </span>
                </Link>

                <div className="flex items-center gap-3">
                    <Show when="signed-in">
                        <Link
                            href="/dashboard"
                            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                        >
                            Dashboard
                        </Link>
                        <UserButton
                            appearance={{
                                elements: { avatarBox: "h-9 w-9" },
                            }}
                        />
                    </Show>
                    {/* <Show when="signed-up">
                        <UserButton
                            appearance={{
                                elements: { avatarBox: "h-9 w-9" },
                            }}
                        />
                    </Show> */}

                    <Show when="signed-out">
                        <SignInButton mode="modal">
                            <button className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                                Sign in
                            </button>
                        </SignInButton>
                        <SignUpButton mode="modal">
                            <button className="inline-flex h-9 items-center rounded-md bg-secondary px-4 text-sm font-medium text-secondary-foreground shadow-sm transition-colors hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                                Sign up
                            </button>
                        </SignUpButton>
                    </Show>
                </div>
            </nav>
        </header>
    );
}