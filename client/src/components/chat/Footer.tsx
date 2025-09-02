import { Link } from "wouter";
import { HelpCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full p-4 bg-muted/80 text-xs text-muted-foreground border-t">
      <div className="max-w-screen-xl mx-auto flex justify-between items-center">
        <div>
          © {new Date().getFullYear()} Nevermined | Pay. All rights reserved.
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/terms"
            className="hover:text-foreground transition-colors flex items-center gap-1"
          >
            Terms & Conditions
          </Link>
          <Link
            href="/help"
            className="hover:text-foreground transition-colors flex items-center gap-1"
          >
            <HelpCircle className="h-4 w-4" />
            Help
          </Link>
        </div>
      </div>
    </footer>
  );
}
