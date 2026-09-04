<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Seeds the database with real shop data from JSON files.
 *
 * Reads transformed JSON files from storage/app/public/shop/ and
 * populates users, categories, products, and product_images tables
 * while preserving all entity relationships.
 */
class ShopDataSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Path to the shop JSON data directory.
     */
    private string $shopDir;

    public function __construct()
    {
        $this->shopDir = storage_path('app/public/shop');
    }

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->seedUsers();
        $this->seedCategories();
        // $this->seedProducts();
        // $this->seedProductImages();

        $this->command->info('Shop data seeded successfully.');
    }

    /**
     * Seed users from users.json.
     *
     * The users table uses auto-increment integer IDs, so original
     * UUIDs are skipped. Uses DB::table insert to bypass the 'hashed'
     * password cast (passwords in JSON are already bcrypt-hashed).
     */
    private function seedUsers(): void
    {
        $users = $this->loadJson('users.json');

        if (empty($users)) {
            $this->command->warn('No user data found in users.json');

            return;
        }

        foreach ($users as $userData) {
            $existingUser = User::where('email', $userData['email'])->first();

            if ($existingUser) {
                $sourcePermissions = $userData['permissions'] ?? [];

                // Backfill legacy seeded users that predate the permissions column
                // so existing admin accounts can still access the admin area.
                if (($existingUser->permissions === null || $existingUser->permissions === []) && $sourcePermissions !== []) {
                    $existingUser->forceFill([
                        'permissions' => $sourcePermissions,
                    ])->save();
                }

                continue;
            }

            // Use raw DB insert to avoid double-hashing the already-hashed password
            DB::table('users')->insert([
                'name' => $userData['name'],
                'email' => $userData['email'],
                'email_verified_at' => $userData['email_verified_at'],
                'password' => $userData['password'], // Already bcrypt-hashed
                'permissions' => json_encode($userData['permissions'] ?? []),
                'created_at' => $userData['created_at'],
                'updated_at' => $userData['updated_at'],
            ]);
        }

        $this->command->info('Users seeded: '.count($users));
    }

    /**
     * Seed categories from categories.json.
     *
     * Preserves original UUID primary keys from the legacy data.
     */
    private function seedCategories(): void
    {
        $categories = $this->loadJson('categories2.json');

        if (empty($categories)) {
            $this->command->warn('No category data found in categories.json');

            return;
        }

        foreach ($categories as $catData) {
            // Skip if category with this ID already exists
            if (Category::where('id', $catData['id'])->exists()) {
                continue;
            }

            Category::create([
                'id' => $catData['id'],
                'name' => $catData['name'],
                'slug' => $catData['slug'],
                'description' => $catData['description'],
                'image_path' => $catData['image_path'] ?? null,
                'parent_id' => $catData['parent_id'] ?? null,
                'sort_order' => $catData['sort_order'] ?? 0,
                'is_active' => $catData['is_active'] ?? true,
                'created_at' => $catData['created_at'],
                'updated_at' => $catData['updated_at'],
            ]);
        }

        $this->command->info('Categories seeded: '.count($categories));
    }

    /**
     * Seed products from products.json.
     *
     * Preserves original UUID primary keys. Requires categories
     * to be seeded first so category_id foreign keys resolve.
     */
    private function seedProducts(): void
    {
        $products = $this->loadJson('products.json');

        if (empty($products)) {
            $this->command->warn('No product data found in products.json');

            return;
        }

        // Collect valid category IDs for FK validation
        $validCategoryIds = Category::pluck('id')->toArray();

        foreach ($products as $prodData) {
            // Skip if product with this ID already exists
            if (Product::where('id', $prodData['id'])->exists()) {
                continue;
            }

            // Validate the category_id FK exists; set to null if missing
            $categoryId = $prodData['category_id'] ?? null;
            if ($categoryId && ! in_array($categoryId, $validCategoryIds, true)) {
                $categoryId = null;
            }

            Product::create([
                'id' => $prodData['id'],
                'sku' => $prodData['sku'],
                'barcode' => $prodData['barcode'] ?? null,
                'name' => $prodData['name'],
                'slug' => $prodData['slug'],
                'description' => $prodData['description'],
                'category_id' => $categoryId,
                'tax_category_id' => $prodData['tax_category_id'] ?? null,
                'cost_price' => $prodData['cost_price'] ?? 0,
                'selling_price' => $prodData['selling_price'] ?? 0,
                'product_type' => $prodData['product_type'] ?? 'standard',
                'is_active' => $prodData['is_active'] ?? true,
                'track_inventory' => $prodData['track_inventory'] ?? true,
                'reorder_level' => $prodData['reorder_level'] ?? null,
                'unit' => $prodData['unit'] ?? 'each',
                'customise_color' => $prodData['customise_color'] ?? false,
                'customise_text' => $prodData['customise_text'] ?? false,
                'preorder' => $prodData['preorder'] ?? false,
                'created_at' => $prodData['created_at'],
                'updated_at' => $prodData['updated_at'],
            ]);
        }

        $this->command->info('Products seeded: '.count($products));
    }

    /**
     * Seed product images from images.json.
     *
     * The product_images table uses UUID auto-generation, so original
     * image IDs are discarded. product_id must reference an existing product.
     */
    private function seedProductImages(): void
    {
        $images = $this->loadJson('images.json');

        if (empty($images)) {
            $this->command->warn('No image data found in images.json');

            return;
        }

        // Collect valid product IDs for FK validation
        $validProductIds = Product::pluck('id')->toArray();

        $seededCount = 0;
        foreach ($images as $imgData) {
            $productId = $imgData['product_id'] ?? null;

            // Skip images whose product doesn't exist in the database
            if (! $productId || ! in_array($productId, $validProductIds, true)) {
                continue;
            }

            ProductImage::create([
                'product_id' => $productId,
                'file_path' => $imgData['file_path'],
                'file_name' => $imgData['file_name'],
                'mime_type' => $imgData['mime_type'] ?? 'image/png',
                'file_size' => $imgData['file_size'] ?? null,
                'alt_text' => $imgData['alt_text'] ?? null,
                'sort_order' => $imgData['sort_order'] ?? 0,
                'is_primary' => $imgData['is_primary'] ?? false,
                'created_at' => $imgData['created_at'],
                'updated_at' => $imgData['updated_at'],
            ]);

            $seededCount++;
        }

        $this->command->info('Product images seeded: '.$seededCount);
    }

    /**
     * Load and decode a JSON file from the shop directory.
     *
     * @return array<int, array<string, mixed>>
     */
    private function loadJson(string $filename): array
    {
        $path = $this->shopDir.'/'.$filename;

        if (! file_exists($path)) {
            $this->command->warn("JSON file not found: {$filename}");

            return [];
        }

        $contents = file_get_contents($path);
        $data = json_decode($contents, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            $this->command->error("Failed to parse {$filename}: ".json_last_error_msg());

            return [];
        }

        if (! is_array($data)) {
            $this->command->warn("{$filename} does not contain a valid JSON array.");

            return [];
        }

        return $data;
    }
}
