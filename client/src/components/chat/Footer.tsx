import { Link } from "wouter";
import { HelpCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer
      className="w-full p-4 text-xs border-t"
      style={{ backgroundColor: "#0D3F48", color: "#299091" }}
    >
      <div className="max-w-screen-xl mx-auto flex justify-between items-center">
        <div>
          © {new Date().getFullYear()} Nevermined | Pay. All rights reserved.
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/terms"
            className="transition-colors flex items-center gap-1"
          >
            Terms & Conditions
          </Link>
          <Link
            href="/help"
            className="transition-colors flex items-center gap-1"
          >
            <HelpCircle className="h-4 w-4" />
            Help
          </Link>
        </div>
      </div>
    </footer>
  );
}
