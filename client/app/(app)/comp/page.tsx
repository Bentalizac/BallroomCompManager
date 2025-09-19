import { CompetitionsList } from "@/components/competitions/CompetitionsList";

export default function CompetitionsPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Ballroom Competitions</h1>
                <p className="text-gray-600">Browse and register for upcoming ballroom dance competitions</p>
            </div>
            
            <CompetitionsList />
        </div>
    );
}
