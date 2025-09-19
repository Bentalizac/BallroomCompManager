"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/auth/authProvider";
import { useState, useEffect } from "react";

type MenuItem = {
  title: string;
  href?: string;
  children?: { title: string; href: string }[];
};

export function AppHeader() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string | null>(null);
  
  // Extract competition ID from pathname
  const competitionMatch = pathname.match(/^\/comp\/([^\/]+)/);
  const competitionId = competitionMatch ? competitionMatch[1] : null;

  // Fetch user role (simplified - you may want to move this to a custom hook)
  useEffect(() => {
    if (user) {
      // TODO: Replace with actual role fetching logic
      // This is a placeholder - implement your role fetching logic here
      setUserRole('admin'); // Default to admin for now
    } else {
      setUserRole(null);
    }
  }, [user]);

  const getNavItems = (): MenuItem[] => {
    if (!user) {
      // Guest navigation for app routes
      if (competitionId) {
        return [
          { title: "Home", href: `/comp/${competitionId}` },
          { title: "Schedule", href: `/comp/${competitionId}/schedule` },
          { title: "Results", href: `/comp/${competitionId}/results` },
          { title: "Register", href: `/comp/${competitionId}/register` },
          { title: "Rules", href: `/comp/${competitionId}/rules` },
          { title: "Login", href: "/auth" }
        ];
      }
      return [
        { title: "Home", href: "/home" },
        { title: "Login", href: "/auth" }
      ];
    }

    // Authenticated navigation
    const baseItems: MenuItem[] = [
      { title: "Home", href: "/home" },
      { title: "Dashboard", href: "/dashboard" }
    ];

    // Add competition-specific items if in competition context
    if (competitionId) {
      const competitionItems: MenuItem[] = [
        { title: "Overview", href: `/comp/${competitionId}` },
        { title: "Schedule", href: `/comp/${competitionId}/schedule` },
        { title: "Results", href: `/comp/${competitionId}/results` },
        { title: "Register", href: `/comp/${competitionId}/register` },
        { title: "Rules", href: `/comp/${competitionId}/rules` }
      ];

      // Add admin/judge items based on role
      if (userRole === 'admin' || userRole === 'organizer') {
        competitionItems.push({
          title: "Manage",
          children: [
            { title: "Dashboard", href: `/comp/${competitionId}/manage` },
            { title: "Schedule", href: `/comp/${competitionId}/manage/schedule` },
            { title: "Settings", href: `/comp/${competitionId}/manage/settings` },
            { title: "Analytics", href: `/comp/${competitionId}/manage/analytics` }
          ]
        });
      }

      if (userRole === 'admin' || userRole === 'judge') {
        competitionItems.push({
          title: "Run",
          children: [
            { title: "Judge", href: `/comp/${competitionId}/run/judge` },
            { title: "On-Deck", href: `/comp/${competitionId}/run/ondeck` }
          ]
        });
      }

      return [...baseItems, ...competitionItems, {
        title: "Account",
        children: [
          { title: "Profile", href: "/profile" },
          { title: "Settings", href: "/settings" },
          { title: "Logout", href: "/auth/logout" }
        ]
      }];
    }

    // Non-competition authenticated navigation
    return [
      ...baseItems,
      { title: "Competitions", href: "/competitions" },
      {
        title: "Account",
        children: [
          { title: "Profile", href: "/profile" },
          { title: "Settings", href: "/settings" },
          { title: "Logout", href: "/auth/logout" }
        ]
      }
    ];
  };

  const navItems = getNavItems();

  return (
    <header className="w-full px-4 py-3 bg-accent border-b">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="text-xl font-bold text-accent-foreground">
          <Link href="/home">
            {competitionId ? `Competition ${competitionId}` : "BallroomCompManager"}
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          {navItems.map((item, index) => (
            <div key={index} className="relative group">
              {item.href ? (
                <Link 
                  href={item.href}
                  className="text-accent-foreground hover:text-accent-foreground/80 transition-colors"
                >
                  {item.title}
                </Link>
              ) : (
                <>
                  <button className="text-accent-foreground hover:text-accent-foreground/80 transition-colors">
                    {item.title} ▾
                  </button>
                  {item.children && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      {item.children.map((child, childIndex) => (
                        <Link
                          key={childIndex}
                          href={child.href}
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          {child.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </nav>
      </div>
    </header>
  );
}