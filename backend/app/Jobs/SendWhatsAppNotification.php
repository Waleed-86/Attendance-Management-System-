<?php

namespace App\Jobs;

use App\Services\WhatsAppService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendWhatsAppNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 30; // seconds between retries

    public function __construct(
        public string $phoneNumber,
        public string $message,
    ) {}

    public function handle(WhatsAppService $whatsAppService): void
    {
        $sent = $whatsAppService->send($this->phoneNumber, $this->message);

        if (! $sent) {
            Log::warning('WhatsApp notification failed to send.', [
                'phone' => $this->phoneNumber,
            ]);
        }
    }
}