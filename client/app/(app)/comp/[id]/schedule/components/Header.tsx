import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";

export function Header() {
  return (
    <header className="bg-[#b8a8d4] px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center">
          <div className="w-4 h-4 bg-white rounded"></div>
        </div>
        <div>
          <div className="text-white font-medium">Andrew Rodabough</div>
          <div className="text-white/80 text-sm">Organizer</div>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <Button variant="secondary" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
          Edit Schedule
        </Button>
        <Button variant="secondary" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
          Analytics
        </Button>
        <Button variant="secondary" className="bg-white text-gray-800 hover:bg-gray-100">
          Logout
        </Button>
      </div>
    </header>
  );
}