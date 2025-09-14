import { navMenu } from "@/components/custom/nav-menu";

function Header() {
    const menuItems = [
        { title: "Home", href: "/home" },
        { title: "Schedule", href: "/schedule" },
        { title: "Results", href: "/results" },
        { title: "Register", href: "/register" },
        { title: "Rules", href: "/rules" },
        { title: "Contact", href: "/contact" },
        { title: "Login", href: "/login" }
    ];

    return (
        <header className="w-full px-4 py-2 bg-white shadow">
            <div className="flex items-center justify-between w-full">
                <div className="text-lg font-bold">Logo</div>
                <div>{navMenu({ menuItems })}</div>
            </div>
        </header>
    );
}

export { Header };