import { Button } from "@/components/ui/button"

export default function Home() {

    return (
        <>
            <main>
                <div>
                    <div className="relative flex flex-col items-center gap-4 py-45 bg-[url('/pexels-prime-cinematics-1005175-2057274.jpg')] bg-cover bg-center">
                        <div className="absolute inset-0 bg-accent opacity-25 pointer-events-none z-0" />
                        <div className="relative z-10 inline-block flex flex-col items-center gap-4 before:content-[''] before:absolute before:inset-0 before:bg-accent/15 before:backdrop-blur-sm before:rounded-xl before:-z-10 before:pointer-events-none overflow-hidden p-5">
                            <h1 className="text-6xl font-bold tracking-tight text-center text-accent-foreground">Dancesport Comp Name</h1>
                            <h2 className="text-2xl font-medium text-accent-foreground text-center">10/9 - 10/11</h2>

                            <div className="flex gap-2 justify-center py-3">
                                <Button>Buy Tickets</Button>
                                <Button>Register</Button>
                            </div>
                        </div>
                    </div>
                </div>

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