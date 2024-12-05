"use client";

import { ReactNode } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

interface LayoutProps {
    children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow flex justify-center items-center p-4">
                {children}
            </main>
            <Footer />
        </div>
    );
}

export default Layout;
