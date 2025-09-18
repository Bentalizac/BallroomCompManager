import { navMenu } from "@/components/custom/nav-menu";
import { useRouter } from "next/dist/client/components/navigation";

import { useAuth } from "@/providers/auth/authProvider";
import React, { useEffect } from "react";
import { title } from "process";



type MenuItem = {
    title: string;
    href?: string;
    children?: { title: string; href: string }[]; 
};

type HeaderProps = {
    logohref?: string,
    menuItems?: MenuItem[]
};

function Header({ logohref, menuItems }: HeaderProps) {
    return (
        <header className="w-full px-4 py-3 bg-accent">
            <div className="flex items-center justify-between w-full">
                <div className="text-lg font-bold text-accent-foreground">
                    {logohref ? <a href={logohref}>Logo</a> : "Logo"}
                </div>
                {navMenu({ menuItems: menuItems ?? [] })}
            </div>
        </header>
    );
}

export type { HeaderProps };
export { Header };