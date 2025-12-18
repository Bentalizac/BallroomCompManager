import { AppHeader } from "@/components/headers/AppHeader";
import { SearchParamsWrapper } from "@/components/headers/SearchParamsWrapper";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SearchParamsWrapper>
        <AppHeader />
      </SearchParamsWrapper>
      {children}
    </>
  );
}
