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
    href: "/",
    icon: LayoutDashboard,
    description: "Treasury & working-capital overview",
  },
  {
    label: "Cash Flow Forecast",
    href: "/cash-flow-forecast",
    icon: TrendingUp,
    description: "13-week direct cash forecast",
  },
  {
    label: "Close Workbook",
    href: "/close-workbook",
    icon: BookCheck,
    description: "Month-end close checklist & status",
  },
  {
    label: "Covenant Monitor",
    href: "/covenant-monitor",
    icon: ShieldCheck,
    description: "Debt covenant headroom tracking",
  },
];
