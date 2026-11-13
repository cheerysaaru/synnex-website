<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class PromoteAdmin extends Command
{
    protected $signature = 'admin:promote {username : Username of the account to make an admin}';

    protected $description = 'Grant owner/admin access to an existing account';

    public function handle(): int
    {
        $username = strtolower((string) $this->argument('username'));

        $user = User::whereRaw('LOWER(username) = ?', [$username])->first();

        if (! $user) {
            $this->error("No account found for {$username}. Create the account first, then run this again.");

            return self::FAILURE;
        }

        $user->forceFill(['is_admin' => true])->save();

        $this->info("@{$user->username} can now open /admin.");

        return self::SUCCESS;
    }
}
