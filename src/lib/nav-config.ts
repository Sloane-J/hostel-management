// src/lib/nav-config.ts (complete file)
import {CalendarCheck, ClipboardCheck, DoorOpen, 
  LayoutDashboard, type LucideIcon,User, UserCog, Users, 
} from "lucide-react";

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

type Role = "superadmin" | "manager" | "staff";

export const navConfig: Record<Role, NavItem[]> = {
  superadmin: [
    { label: "Dashboard", path: "/superadmin", icon: LayoutDashboard },
    { label: "Students", path: "/superadmin/students", icon: Users },
    { label: "Rooms", path: "/superadmin/rooms", icon: DoorOpen },
    { label: "Staff", path: "/superadmin/staff", icon: UserCog },
    { label: "Leave", path: "/superadmin/leave", icon: CalendarCheck },
  ],
  manager: [
    { label: "Dashboard", path: "/manager", icon: LayoutDashboard },
    { label: "Students", path: "/manager/students", icon: Users },
    { label: "Rooms", path: "/manager/rooms", icon: DoorOpen },
    { label: "Staff", path: "/manager/staff", icon: UserCog },
    { label: "Leave", path: "/manager/leave", icon: CalendarCheck },
  ],
  staff: [
    { label: "Dashboard", path: "/staff", icon: LayoutDashboard },
    { label: "Attendance", path: "/staff/attendance", icon: ClipboardCheck },
    { label: "Rooms", path: "/staff/rooms", icon: DoorOpen },
    { label: "Profile", path: "/staff/profile", icon: User },
  ],
};