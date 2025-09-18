import { Header } from "@/components/custom/header";

export const ProductPageHeader = (
  <Header
    logohref="/home"
    menuItems={[
      { title: "Home", href: "/home" },
      { title: "About", href: "/" },
      { title: "Contact", href: "/product" },
      { title: "Demo", href: "/about" },
      { title: "Pricing", href: "/contact" },
    ]}
  />
);
/**
 * Header for un-authorized pages
 */
export const PublicHeader = (
  <Header
    logohref="/home"
    menuItems={[
      { title: "Home", href: "/home" },
      { title: "Login", href: "/auth" },
    ]}
  />
);

export const AuthedHeader = (
  <Header
    logohref="/home"
    menuItems={[
      { title: "Home", href: "/home" },
      { title: "Dashboard", href: "/dashboard" },
      { title: "Profile", href: "/profile" },
      { title: "Settings", href: "/settings" },
      { title: "Logout", href: "/auth" },
    ]}
  />
);
