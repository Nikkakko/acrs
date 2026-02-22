import { cn } from "@/lib/utils";
import { Link, NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Schedule" },
  { to: "/staff", label: "Staff" },
  { to: "/services", label: "Services" },
];

export function Header() {
  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    cn(
      "rounded-md px-4 py-2 text-sm font-medium transition-colors",
      isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent",
    );
  return (
    <header className="mb-4 flex items-center justify-between border-b border-border bg-card px-4 py-3 shadow-sm">
      <h1 className="m-0">
        <Link to="/" className="text-xl font-medium text-foreground no-underline transition-colors hover:text-primary">
          Aesthetic Center Reservation System
        </Link>
      </h1>
      <nav className="flex gap-1">
        {navItems.map(item => (
          <NavLink key={item.to} to={item.to} end className={navLinkClasses}>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
