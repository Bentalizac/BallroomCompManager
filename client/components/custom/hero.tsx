import { Button } from "@/components/ui/button"

type HeroProps = {
    title?: string;
    date?: string;
    imageUrl?: string;
}

function Hero({ title, date }: HeroProps) {
    return (
        <div className="relative flex flex-col items-center gap-4 py-45 bg-[url('/pexels-prime-cinematics-1005175-2057274.jpg')] bg-cover bg-center">
            <div className="absolute inset-0 bg-accent opacity-25 pointer-events-none z-0" />
            <div className="relative z-10 inline-block flex flex-col items-center gap-4 before:content-[''] before:absolute before:inset-0 before:bg-accent/15 before:backdrop-blur-sm before:rounded-xl before:-z-10 before:pointer-events-none overflow-hidden p-5">
                <h1 className="text-6xl font-bold tracking-tight text-center text-accent-foreground">{title}</h1>
                <h2 className="text-2xl font-medium text-accent-foreground text-center">{date}</h2>

                <div className="flex gap-2 justify-center py-3">
                    <Button>Buy Tickets</Button>
                    <Button>Register</Button>
                </div>
            </div>
        </div>
    );
};

export { Hero };