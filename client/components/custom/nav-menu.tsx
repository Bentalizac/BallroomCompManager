import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

import Link from "next/link";

type MenuItem = {
  title: string;
  href?: string;
  children?: { title: string; href: string }[];
};

interface HeaderProps extends React.ComponentProps<"div"> {
  menuItems: MenuItem[];
}

function navMenu({ className, menuItems, ...props }: HeaderProps) {
  return (
    <NavigationMenu viewport={false}>
      <NavigationMenuList>
        {menuItems.map((item) => (
          <NavigationMenuItem key={item.title}>
            {item.children && item.children.length > 0 ? (
              <>
                <NavigationMenuTrigger className={navigationMenuTriggerStyle()}>
                  {item.title}
                </NavigationMenuTrigger>
                <NavigationMenuContent className="w-max min-w-[180px]">
                  <ul className="p-2">
                    {item.children.map((child) => (
                      <li key={child.title}>
                        <NavigationMenuLink
                          asChild
                          className={navigationMenuTriggerStyle()}
                        >
                          <Link href={child.href}>{child.title}</Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </>
            ) : (
              <NavigationMenuLink
                asChild
                className={`${navigationMenuTriggerStyle()} bg-transparent text-accent-foreground hover:bg-secondary hover:text-secondary-foreground data-[state=open]:bg-secondary transition-colors`}
              >
                <Link href={item.href ?? "#"}>{item.title}</Link>
              </NavigationMenuLink>
            )}
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

export { navMenu };
