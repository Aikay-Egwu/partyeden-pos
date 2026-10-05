<?php

namespace Database\Seeders;

use App\Models\Faq;
use Illuminate\Database\Seeder;

class FaqSeeder extends Seeder
{
    /**
     * Seed the public balloon-care guide with its initial answers.
     */
    public function run(): void
    {
        $faqs = [
            [
                'category' => 'winter',
                'sort_order' => 10,
                'question' => 'Will cold weather make my helium balloons go flat?',
                'answer' => 'Cold air makes helium contract, so a balloon may look smaller or seem less full after moving outside. Bring it back to room temperature and it should expand again. Avoid leaving balloons outdoors or in a cold car for long periods.',
            ],
            [
                'category' => 'winter',
                'sort_order' => 20,
                'question' => 'How should I carry balloons from a warm shop into the cold?',
                'answer' => 'Keep balloons inside the vehicle for the journey and avoid sudden temperature changes where you can. In cold weather, latex can become more brittle, so handle knots and ribbons gently and keep balloons away from sharp edges.',
            ],
            [
                'category' => 'winter',
                'sort_order' => 30,
                'question' => 'Can I bring cold balloons straight into a heated room?',
                'answer' => 'Let them warm up gradually in a comfortable room, away from radiators, fires and heat vents. The helium will expand as the balloon warms; balloons filled very tightly can be more likely to burst when temperatures rise.',
            ],
            [
                'category' => 'summer',
                'sort_order' => 10,
                'question' => 'Why do helium balloons need extra care in summer?',
                'answer' => 'Heat causes helium to expand and can put extra pressure on the balloon. Keep balloons in a cool, shaded, indoor space and away from windows in direct sun, radiators, hot lights and other heat sources.',
            ],
            [
                'category' => 'summer',
                'sort_order' => 20,
                'question' => 'Can I leave my balloons in a parked car?',
                'answer' => 'No. A parked car can heat up quickly, even when the weather outside feels mild. Take balloons with you or arrange a cool, shaded place for them; never leave them in a parked vehicle.',
            ],
            [
                'category' => 'summer',
                'sort_order' => 30,
                'question' => 'Can helium balloons be used outside in hot weather?',
                'answer' => 'They can be, but direct sunlight and hot conditions may shorten their float time and increase the risk of expansion or damage. Keep them shaded when possible, secure them against wind, and bring them indoors when the event is over.',
            ],
            [
                'category' => 'general',
                'sort_order' => 10,
                'question' => 'Where should I keep helium balloons between collection and the party?',
                'answer' => 'Choose a clean, dry room at a comfortable temperature. Keep balloons away from sharp objects, rough walls, ceilings with hot lights, pets and anything that could snag the ribbon. Tie them securely so they cannot drift away.',
            ],
            [
                'category' => 'general',
                'sort_order' => 20,
                'question' => 'Is it normal for helium balloons to lose lift over time?',
                'answer' => 'Yes. Helium gradually escapes through balloon material, so lift reduces over time. Latex balloons usually lose lift sooner than foil balloons. The exact float time depends on balloon type, size, finish and the surrounding conditions.',
            ],
        ];

        foreach ($faqs as $faq) {
            Faq::query()->firstOrCreate(
                ['question' => $faq['question']],
                [...$faq, 'is_visible' => true],
            );
        }
    }
}
