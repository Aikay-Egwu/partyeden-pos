import { Link } from '@inertiajs/react';
import {
    ClipboardList,
    FileText,
    LayoutGrid,
    MessageSquare,
    Package,
    Palette,
    Receipt,
    ShoppingCart,
    Tags,
    Truck,
    Undo2,
    Users,
    Warehouse,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';

// Navigation item shape for admin sidebar
type AdminNavItem = {
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
};

// Grouped navigation sections for the admin dashboard
const adminNavSections: { label: string; items: AdminNavItem[] }[] = [
    {
        label: 'Overview',
        items: [{ title: 'Dashboard', href: '/admin', icon: LayoutGrid }],
    },
    {
        label: 'Catalog',
        items: [
            { title: 'Products', href: '/admin/products', icon: Package },
            { title: 'Categories', href: '/admin/categories', icon: Tags },
            { title: 'Occasions', href: '/admin/occasions', icon: Tags },
            { title: 'Attributes', href: '/admin/attributes', icon: Tags },
            {
                title: 'Tax Categories',
                href: '/admin/tax-categories',
                icon: Receipt,
            },
            { title: 'Colors', href: '/admin/colors', icon: Palette },
        ],
    },
    {
        label: 'Inventory',
        items: [
            { title: 'Locations', href: '/admin/locations', icon: Warehouse },
            { title: 'Stock Levels', href: '/admin/inventory', icon: Package },
            {
                title: 'Reservations',
                href: '/admin/stock-reservations',
                icon: ClipboardList,
            },
        ],
    },
    {
        label: 'Purchasing',
        items: [
            { title: 'Suppliers', href: '/admin/suppliers', icon: Truck },
            {
                title: 'Purchase Orders',
                href: '/admin/purchase-orders',
                icon: ClipboardList,
            },
        ],
    },
    {
        label: 'Sales',
        items: [
            {
                title: 'Transactions',
                href: '/admin/transactions',
                icon: ShoppingCart,
            },
            { title: 'Discounts', href: '/admin/discounts', icon: Tags },
            { title: 'Gift Cards', href: '/admin/gift-cards', icon: Receipt },
            {
                title: 'Till Sessions',
                href: '/admin/till-sessions',
                icon: Receipt,
            },
        ],
    },
    {
        label: 'Customers',
        items: [
            { title: 'Customers', href: '/admin/customers', icon: Users },
            { title: 'Loyalty', href: '/admin/loyalty', icon: Users },
            { title: 'Reviews', href: '/admin/reviews', icon: MessageSquare },
        ],
    },
    {
        label: 'Orders',
        items: [
            { title: 'Orders', href: '/admin/orders', icon: ShoppingCart },
            { title: 'Shipments', href: '/admin/shipments', icon: Truck },
        ],
    },
    {
        label: 'Returns',
        items: [{ title: 'Returns', href: '/admin/returns', icon: Undo2 }],
    },
    {
        label: 'Staff',
        items: [{ title: 'Staff Members', href: '/admin/staff', icon: Users }],
    },
    {
        label: 'System',
        items: [
            {
                title: 'Blog Posts',
                href: '/admin/blog-posts',
                icon: FileText,
            },
            {
                title: 'Audit Logs',
                href: '/admin/audit-logs',
                icon: ClipboardList,
            },
        ],
    },
];

/**
 * Admin sidebar with grouped navigation sections.
 * Highlights the current page and parent section.
 */
export function AdminSidebar() {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/admin" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {adminNavSections.map((section) => (
                    <SidebarGroup key={section.label} className="px-2 py-0">
                        <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
                        <SidebarMenu>
                            {section.items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isCurrentOrParentUrl(
                                            item.href,
                                        )}
                                        tooltip={{ children: item.title }}
                                    >
                                        <Link href={item.href} prefetch>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
