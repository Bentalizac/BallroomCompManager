interface PageProps {
  params: { id: string };
}

import { Hero } from "@/components/custom/hero"

export default function Home({ params }: PageProps) {

    return (
        <>
            <main>

                <Hero title="Dancesport Comp Name" date="10/9 - 10/11" imageUrl="/pexels-prime-cinematics-1005175-2057274.jpg" />

                <div className="flex flex-col">
                    <div className="bg-accent px-20 py-13">
                        <h1 className="text-4xl font-bold mb-2 text-accent-foreground">About</h1>
                        <p className="text-accent-foreground">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                    </div>

                    <div className="bg-secondary px-20 py-13">
                        <h1 className="text-4xl font-bold mb-2 text-secondary-foreground">About</h1>
                        <p className="text-secondary-foreground">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                    </div>
                </div>

            </main>
            <footer>
                <p>Footer</p>
            </footer>
        </>
    );
}
