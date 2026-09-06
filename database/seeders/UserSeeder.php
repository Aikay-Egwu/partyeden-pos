<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $first_user = User;
        $first_user->name = 'Ikenna Egwu';
        $first_user->email = 'justaikay@gmail.com';
        $first_user->password = Hash::make('SecretPassword');
        $first_user->save();

        $second_user = User;
        $second_user->name = 'Chioma Egwu';
        $second_user->email = 'chiomaegwu@gmail.com';
        $second_user->password = Hash::make('SecretPassword');
        $second_user->save();
    }
}
