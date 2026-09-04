<?php

namespace Database\Seeders;

use App\Models\DeliveryZone;
use App\Models\DeliveryZonePostcodePrefix;
use Illuminate\Database\Seeder;

class DeliveryZoneSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Example zones and prefixes
        $zones = [
            [
                'name' => 'Sunderland City Centre, East End',
                'delivery_price' => 3.99,
                'min_order_amount' => null,
                'is_active' => true,
                'notes' => 'Premium central areas',
                'prefixes' => ['SR1 1', 'SR1 2', 'SR1 3'],
            ],
            [
                'name' => 'Ashbrooke, Hendon, Ryhope, Grangetown',
                'delivery_price' => 3.99,
                'min_order_amount' => null,
                'is_active' => true,
                'notes' => null,
                'prefixes' => ['sr2 0', 'SR2 7', 'SR2 8', 'SR2 9'],
            ],
            [
                'name' => 'Doxford Park, Farringdon, Silksworth, Tunstall',
                'delivery_price' => 4.99,
                'min_order_amount' => null,
                'is_active' => true,
                'notes' => null,
                'prefixes' => ['SR3 1', 'SR3 2', 'SR3 3', 'SR3 4'],
            ],
            [
                'name' => 'Ayres Quay, Barnes, Chester Road, Deptford, Ford Estate, Millfield, Pallion, Pennywell',
                'delivery_price' => 3.99,
                'min_order_amount' => null,
                'is_active' => true,
                'notes' => null,
                'prefixes' => ['SR4 0', 'SR4 6', 'SR4 7', 'SR4 8'],
            ],
            [
                'name' => 'Carley Hill, Downhill, Fulwell,  Marley Pots, Monkwearmouth ,  Southwick, Town End Farm, Witherwack, Pallion, Pennywell',
                'delivery_price' => 3.99,
                'min_order_amount' => null,
                'is_active' => true,
                'notes' => null,
                'prefixes' => ['SR5 1', 'SR5 2'],
            ],
            [
                'name' => 'Castletown, Fulwell, Hylton Castle,  Marley Pots, Monkwearmouth , Sheepfolds, Town End Farm, Witherwack',
                'delivery_price' => 4.99,
                'min_order_amount' => null,
                'is_active' => true,
                'notes' => null,
                'prefixes' => ['SR5 3', 'SR5 4', 'SR5 5'],
            ],
            [
                'name' => 'Cleadon, Fulwell, Monkwearmouth, North Haven, Roker, St Peters Riverside, Seaburn, Seaburn Dene, South Bents, Whitburn',
                'delivery_price' => 5.99,
                'min_order_amount' => null,
                'is_active' => true,
                'notes' => null,
                'prefixes' => ['SR6 0', 'SR6 7', 'SR6 8', 'SR6 9'],
            ],
            [
                'name' => 'Cold Hesledon, Dalton-le-Dale, Dawdon, Deneside, Greenhill, Murton, Northlea, Parkside, Seaham, Westlea',
                'delivery_price' => 6.99,
                'min_order_amount' => null,
                'is_active' => true,
                'notes' => null,
                'prefixes' => ['SR7 0', 'SR7 7', 'SR7 8', 'SR7 9'],
            ],
        ];

        foreach ($zones as $z) {
            $zone = DeliveryZone::create([
                'name' => $z['name'],
                'delivery_price' => $z['delivery_price'],
                'min_order_amount' => $z['min_order_amount'],
                'is_active' => $z['is_active'],
                'notes' => $z['notes'],
            ]);

            foreach ($z['prefixes'] as $prefix) {
                DeliveryZonePostcodePrefix::create([
                    'delivery_zone_id' => $zone->id,
                    'code_prefix' => strtoupper(str_replace(' ', '', $prefix)),
                    'level' => null,
                    'is_active' => true,
                ]);
            }
        }
    }
}
