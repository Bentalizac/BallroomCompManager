"use client";

import React, { useContext } from "react";
import { Header } from "@/components/custom/header";
import {
    IdProvider,
    IdContext,
} from "@/providers/compIdProvider/compIdProvider";
import { useRouter } from "next/dist/client/components/navigation";
import { useAuth } from "@/providers/auth/authProvider";

function LayoutWithContext({ children }: { children: React.ReactNode }) {
    const context = useContext(IdContext);
    const id = context?.id;

    const menuItemsLoggedOut = [
        { title: "Home",href: `/comp/${id}` },
        { title: "Schedule", href: `/comp/${id}/schedule` },
        { title: "Results", href: `/comp/${id}/results` },
        { title: "Register", href: `/comp/${id}/register` },
        { title: "Rules", href: `/comp/${id}/rules` },
        { title: "Contact", href: `/comp/${id}/contact` },

        { title: "Login", href: `/auth` }
    ]

    const menuItemsLoggedIn = [

        { title: "Home", href: `/comp/${id}` },
        { title: "Schedule", href: `/comp/${id}/schedule` },
        { title: "Results", href: `/comp/${id}/results` },
        { title: "Register", href: `/comp/${id}/register` },
        { title: "Rules", href: `/comp/${id}/rules` },
        { title: "Contact", href: `/comp/${id}/contact` },

        // { title: "Profile", href: `/user` },
        
        // Admin
        { title: "Comp Dash", href: `/comp/${id}/manage` },
        { title: "Edit Schedule", href: `/comp/${id}/manage/schedule` },
        { title: "Edit Settings", href: `/comp/${id}/manage/settings` },
        { title: "View Analytic", href: `/comp/${id}/manage/analytics` },

        // staff
        { title: "Judge", href: `/comp/${id}/run/judge` },
        { title: "On-Deck", href: `/comp/${id}/run/ondeck` },
        
        // { title: "Logout", href: `/auth` }
    ]

    const { user, loading } = useAuth();
    const router = useRouter()

    return (
    <>
        <div>
            { user ? (
                <Header
                    logohref={`/comp/${id}`}
                    menuItems={menuItemsLoggedIn}
                />
            ) : (
                <Header
                    logohref={`/comp/${id}`}
                    menuItems={menuItemsLoggedOut}
                />
            )}
        </div>
        <main>{children}</main>
    </>
    );
}

export default function RootLayout({
    children,
    params,
} : {
    children: React.ReactNode;
    params: Promise<{ id: string }>;
}) {
    const { id } = React.use(params);
    return (
        <IdProvider id={id}>
            <LayoutWithContext>{children}</LayoutWithContext>
        </IdProvider>
    );
}
