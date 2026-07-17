import {
  LayoutDashboard,
  TrendingUp,
  BookCheck,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  description: string;
}

export const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Treasury & working-capital overview",
  },
  {
    label: "Cash Flow Forecast",
    href: "/forecast",
    icon: TrendingUp,
    description: "Rolling 4-week direct cash forecast",
  },
  {
    label: "Close Workbook",
    href: "/close",
    icon: BookCheck,
    description: "Month-end close checklist & status",
  },
  {
    label: "Covenant Monitor",
    href: "/covenants",
    icon: ShieldCheck,
    description: "Debt covenant headroom tracking",
  },
];
