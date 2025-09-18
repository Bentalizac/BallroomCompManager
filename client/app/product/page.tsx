'use client';

import React from "react";
import { Header } from "@/components/custom/header";

export default function Home() {
    return (
        <>
            <Header 
                logohref="/"
                menuItems={[
                    { title: "Home", href: "/" },
                    { title: "About", href: "/" },
                    { title: "Contact", href: "/product" },
                    { title: "Demo", href: "/about" },
                    { title: "Pricing", href: "/contact" }
                ]}
            />
            <h1>Product Page</h1>
        </>
    );
};