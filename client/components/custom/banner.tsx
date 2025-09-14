interface BannerProps {
    name: string;
}

function Banner({ name }: BannerProps) {
    return (
        <div className="w-full flex justify-center items-center py-12 bg-accent text-accent-foreground text-shadow-lg">
            <h1 className="text-6xl font-bold text-center">{name}</h1>
        </div>
    );
}

export { Banner };