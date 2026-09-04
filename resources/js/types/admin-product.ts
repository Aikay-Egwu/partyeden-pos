/**
 * Shared types for the admin product form and its configuration panels.
 * These mirror the Eloquent relations serialized by the admin product
 * controllers (products/form.tsx and its child panels).
 */

// Image binding — how a product image is attached (gallery, variant, etc.)
export type ImageBindingType =
    | 'default'
    | 'variant'
    | 'primary_color'
    | 'addon';

// Color palette record (colors table uses integer ids)
export type ColorOption = {
    id: number;
    name: string;
    hex_code: string | null;
    is_active: boolean;
};

// Pivot entry linking a product to a main/secondary color
export type ProductColorEntry = {
    id: string;
    color_id: number;
    color: ColorOption;
};

export type AttributeValueOption = {
    id: string;
    value: string;
};

export type AttributeOption = {
    id: string;
    name: string;
    values?: AttributeValueOption[];
};

export type ProductVariant = {
    id: string;
    sku: string;
    name: string | null;
    price_adjustment: string;
    cost_price_adjustment: string;
    is_active: boolean;
    attribute_values?: AttributeValueOption[];
};

// Add-on product with its pivot data
export type ProductAddOn = {
    id: string;
    name: string;
    pivot: {
        add_on_product_id: string;
        is_active: boolean | null;
        sort_order: number | null;
    };
};

export type ProductImage = {
    id: string;
    url: string;
    file_name: string;
    is_primary: boolean;
    binding_type: ImageBindingType | null;
    variant_id: string | null;
    primary_color_id: number | null;
    addon_product_id: string | null;
    alt_text: string | null;
    sort_order: number | null;
    variant?: { id: string; name: string | null; sku: string } | null;
    primary_color?: { id: number; name: string } | null;
    addon_product?: { id: string; name: string } | null;
};

export type KitMappingEntry = {
    id: string;
    product_id: string;
    quantity: string;
    variant_id: string | null;
};

export type SetupInstruction = {
    tools: string | null;
    items: string | null;
    instructions: string | null;
    notes: string | null;
};

export type InventoryBalanceEntry = {
    id: string;
    location_id: string;
    quantity: number;
    reserved_quantity: number;
    location: { id: string; name: string };
};

// Generic id/name pair used for select dropdowns
export type SelectOption = { id: string; name: string };

// Option shape accepted by SearchableSelect (name + optional SKU)
export type ComponentOption = {
    id: string;
    name: string;
    sku?: string | null;
};

// Full product shape loaded by the admin product edit page
export type AdminProduct = {
    id: string;
    name: string;
    sku: string;
    barcode?: string;
    description?: string;
    cost_price: string;
    selling_price: string;
    product_type: string;
    is_active: boolean;
    is_kit: boolean;
    is_online_visible: boolean;
    best_seller_enabled: boolean;
    best_seller_rank?: number | null;
    track_inventory: boolean;
    reorder_level?: string;
    unit: string;
    customise_color: boolean;
    customise_text: boolean;
    preorder: boolean;
    slug?: string | null;
    category?: SelectOption | null;
    taxCategory?: SelectOption | null;
    main_colors?: ProductColorEntry[];
    secondary_colors?: ProductColorEntry[];
    images?: ProductImage[];
    variants?: ProductVariant[];
    add_ons?: ProductAddOn[];
    setup_instruction?: SetupInstruction | null;
    kit_mappings?: KitMappingEntry[];
    inventory_balances?: InventoryBalanceEntry[];
};
