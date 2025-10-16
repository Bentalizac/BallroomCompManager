"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/auth/authProvider";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { useUserRole } from "@/hooks/useUserRole";
import { useCompetitionBySlug } from "@/hooks/useCompetitionBySlug";
import { Shield } from "lucide-react";

type MenuItem = {
  title: string;
  href?: string;
  onClick?: () => void;
  children?: { title: string; href: string }[];
  isAdmin?: boolean; // Flag for admin styling
};

export function AppHeader() {
  const { user } = useAuth();
  const pathname = usePathname();
  const { redirectToAuth } = useAuthRedirect();

  // Extract competition slug from pathname
  const competitionMatch = pathname.match(/^\/comp\/([^\/]+)/);
  const competitionSlug = competitionMatch ? competitionMatch[1] : null;

  // Get competition details and user role
  const { competitionId } = useCompetitionBySlug(competitionSlug || undefined);
  const {
    role: userRole,
    isAdmin,
    isOrganizer,
    isJudge,
    isLoading: roleLoading,
  } = useUserRole(competitionId);

  const getNavItems = (): MenuItem[] => {
    if (!user) {
      // Guest navigation for app routes
      if (competitionSlug) {
        return [
          { title: "Home", href: `/comp/${competitionSlug}` },
          { title: "Schedule", href: `/comp/${competitionSlug}/schedule` },
          { title: "Results", href: `/comp/${competitionSlug}/results` },
          { title: "Register", href: `/comp/${competitionSlug}/register` },
          { title: "Rules", href: `/comp/${competitionSlug}/rules` },
          {
            title: "Login",
            onClick: () => redirectToAuth(pathname),
          },
        ];
      }
      return [
        { title: "Home", href: "/home" },
        {
          title: "Login",
          onClick: () => redirectToAuth(pathname),
        },
      ];
    }

    // Authenticated navigation
    const baseItems: MenuItem[] = [{ title: "Home", href: "/home" }];

    // Add competition-specific items if in competition context
    if (competitionSlug) {
      const competitionItems: MenuItem[] = [
        { title: "Overview", href: `/comp/${competitionSlug}` },
        { title: "Schedule", href: `/comp/${competitionSlug}/schedule` },
        { title: "Results", href: `/comp/${competitionSlug}/results` },
        { title: "Register", href: `/comp/${competitionSlug}/register` },
        { title: "Rules", href: `/comp/${competitionSlug}/rules` },
      ];

      // Add admin/judge items based on role
      if (isAdmin || isOrganizer) {
        competitionItems.push({
          title: "Admin",
          isAdmin: true, // Flag for special styling
          children: [
            { title: "Overview", href: `/comp/${competitionSlug}` },
            { title: "Events", href: `/comp/${competitionSlug}/events` },
            {
              title: "Registrants",
              href: `/comp/${competitionSlug}/registrants`,
            },
            { title: "Schedule", href: `/comp/${competitionSlug}/schedule` },
            { title: "Settings", href: `/comp/${competitionSlug}/settings` },
          ],
        });
      }

      if (isAdmin || isJudge) {
        competitionItems.push({
          title: "Run",
          children: [
            { title: "Judge", href: `/comp/${competitionSlug}/run/judge` },
            { title: "On-Deck", href: `/comp/${competitionSlug}/run/ondeck` },
          ],
        });
      }

      return [
        ...baseItems,
        ...competitionItems,
        {
          title: "Account",
          children: [
            { title: "Profile", href: "/profile" },
            { title: "Settings", href: "/settings" },
            { title: "Logout", href: "/auth/logout" },
          ],
        },
      ];
    }

    // Non-competition authenticated navigation
    return [
      ...baseItems,
      { title: "Competitions", href: "/comp" },
      {
        title: "Account",
        children: [
          { title: "Profile", href: "/profile" },
          { title: "Settings", href: "/settings" },
          { title: "Logout", href: "/auth/logout" },
        ],
      },
    ];
  };

  const navItems = getNavItems();

  return (
    <header className="w-full px-4 py-3 bg-accent border-b">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="text-xl font-bold text-accent-foreground">
            <Link href="/home">
              {competitionSlug
                ? `Competition ${competitionSlug}`
                : "BallroomCompManager"}
            </Link>
          </div>
          {competitionSlug && (isAdmin || isOrganizer) && (
            <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-full border border-blue-200">
              <Shield className="h-3 w-3" />
              {isAdmin ? "Admin" : "Organizer"}
            </div>
          )}
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
              ) : item.onClick ? (
                <button
                  onClick={item.onClick}
                  className="text-accent-foreground hover:text-accent-foreground/80 transition-colors"
                >
                  {item.title}
                </button>
              ) : (
                <>
                  <button
                    className={`flex items-center gap-2 transition-colors ${
                      item.isAdmin
                        ? "text-blue-600 hover:text-blue-700 font-medium"
                        : "text-accent-foreground hover:text-accent-foreground/80"
                    }`}
                  >
                    {item.isAdmin && <Shield className="h-4 w-4" />}
                    {item.title} ▾
                  </button>
                  {item.children && (
                    <div
                      className={`absolute right-0 top-full mt-2 w-48 bg-white border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 ${
                        item.isAdmin ? "border-blue-200" : "border-gray-200"
                      }`}
                    >
                      {item.isAdmin && (
                        <div className="px-3 py-2 bg-blue-50 border-b border-blue-100">
                          <div className="flex items-center gap-2 text-xs font-medium text-blue-600">
                            <Shield className="h-3 w-3" />
                            Admin Panel
                          </div>
                        </div>
                      )}
                      {item.children.map((child, childIndex) => (
                        <Link
                          key={childIndex}
                          href={child.href}
                          className={`block px-4 py-2 transition-colors ${
                            item.isAdmin
                              ? "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
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
