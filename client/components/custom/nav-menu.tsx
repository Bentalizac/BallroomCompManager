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
} from "@/components/ui/navigation-menu"

import Link from "next/link"

type MenuItem = {
  title: string;
  href: string;
};

interface HeaderProps extends React.ComponentProps<"div"> {
  menuItems: MenuItem[];
}

function navMenu({ className, menuItems, ...props }: HeaderProps) {
  return (
    <NavigationMenu>
        <NavigationMenuList>
          {menuItems.map((component) => (
            <NavigationMenuItem key={component.title}>
              <NavigationMenuLink
                asChild
                className={
                  `${navigationMenuTriggerStyle()} bg-transparent text-accent-foreground hover:bg-secondary hover:text-secondary-foreground data-[state=open]:bg-secondary transition-colors`
                }
              >
                <Link href={component.href}>{component.title}</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
    </NavigationMenu>
  )
}

export { navMenu }