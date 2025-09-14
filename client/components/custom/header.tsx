import { navMenu } from "@/components/custom/nav-menu";

type HeaderProps = {
    id?: string;
};

function Header({ id }: HeaderProps) {
    const menuItems = [
        { title: "Home", href: `/comp/${id}/home` },
        { title: "Schedule", href: `/comp/${id}/schedule` },
        { title: "Results", href: `/comp/${id}/results` },
        { title: "Register", href: `/comp/${id}/register` },
        { title: "Rules", href: `/comp/${id}/rules` },
        { title: "Contact", href: `/comp/${id}/contact` },
        { title: "Login", href: `/auth` }
    ];

    return (
        <header className="w-full px-4 py-3 bg-accent">
            <div className="flex items-center justify-between w-full">
                <div className="text-lg font-bold text-accent-foreground">Logo</div>
                <div>{navMenu({ menuItems })}</div>
            </div>
        </header>
    );
}

export type { HeaderProps };
export { Header };