import { MarketingHeader } from "@/components/headers/MarketingHeader";
import { SearchParamsWrapper } from "@/components/headers/SearchParamsWrapper";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SearchParamsWrapper>
        <MarketingHeader />
      </SearchParamsWrapper>
      {children}
    </>
  );
}
