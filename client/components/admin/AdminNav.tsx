"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Users,
  Calendar,
  Shield,
} from "lucide-react";

interface AdminNavProps {
  competitionSlug: string;
  className?: string;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  badge?: string;
}

export function AdminNav({ competitionSlug, className }: AdminNavProps) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      name: "Events",
      href: `/comp/${competitionSlug}/events`,
      icon: Calendar,
      description: "Manage competition events",
    },
    {
      name: "Registrants",
      href: `/comp/${competitionSlug}/registrants`,
      icon: Users,
      description: "View and manage registrations",
    },
    {
      name: "Settings",
      href: `/comp/${competitionSlug}/settings`,
      icon: Settings,
      description: "Competition settings and configuration",
      badge: "Soon",
    },
  ];

  return (
    <div className={cn("bg-white border-b border-gray-200", className)}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Shield className="h-4 w-4" />
            <span className="font-medium">Admin Panel</span>
          </div>
        </div>

        <nav className="flex space-x-8 -mb-px">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 py-4 px-1 border-b-2 text-sm font-medium transition-colors",
                  isActive
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.name}
                {item.badge && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

export default AdminNav;
