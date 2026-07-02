<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    /**
     * Send a WhatsApp message to a phone number.
     *
     * This is currently a PLACEHOLDER driver — it logs the message instead
     * of actually sending it. Swap the body of this method with a real
     * provider call (Twilio, Meta Cloud API, etc.) when credentials are
     * available. The rest of the application (jobs, controllers) does not
     * need to change — they all call this single method.
     */
    public function send(string $phoneNumber, string $message): bool
    {
        $driver = config('services.whatsapp.driver', 'log');

        return match ($driver) {
            'meta' => $this->sendViaMetaCloudApi($phoneNumber, $message),
            'twilio' => $this->sendViaTwilio($phoneNumber, $message),
            default => $this->sendViaLog($phoneNumber, $message),
        };
    }

    /**
     * Placeholder driver: just logs the message. Always "succeeds" so the
     * rest of the app (job retries, notification records) behaves the same
     * way it would with a real provider.
     */
    protected function sendViaLog(string $phoneNumber, string $message): bool
    {
        Log::channel('single')->info('[WhatsApp:PLACEHOLDER] Message not actually sent (no provider configured).', [
            'to' => $phoneNumber,
            'message' => $message,
        ]);

        return true;
    }

    /**
     * Example real implementation for Meta's WhatsApp Cloud API.
     * Uncomment and configure when ready — requires:
     *   WHATSAPP_DRIVER=meta
     *   WHATSAPP_META_TOKEN=...
     *   WHATSAPP_META_PHONE_ID=...
     */
    protected function sendViaMetaCloudApi(string $phoneNumber, string $message): bool
    {
        $token = config('services.whatsapp.meta_token');
        $phoneId = config('services.whatsapp.meta_phone_id');

        if (! $token || ! $phoneId) {
            Log::warning('WhatsApp Meta driver selected but not configured. Falling back to log.');
            return $this->sendViaLog($phoneNumber, $message);
        }

        $response = Http::withToken($token)
            ->post("https://graph.facebook.com/v20.0/{$phoneId}/messages", [
                'messaging_product' => 'whatsapp',
                'to' => $phoneNumber,
                'type' => 'text',
                'text' => ['body' => $message],
            ]);

        if (! $response->successful()) {
            Log::error('WhatsApp Meta API send failed.', ['response' => $response->body()]);
        }

        return $response->successful();
    }

    /**
     * Example real implementation for Twilio's WhatsApp API.
     * Uncomment and configure when ready — requires:
     *   WHATSAPP_DRIVER=twilio
     *   WHATSAPP_TWILIO_SID=...
     *   WHATSAPP_TWILIO_TOKEN=...
     *   WHATSAPP_TWILIO_FROM=whatsapp:+14155238886
     */
    protected function sendViaTwilio(string $phoneNumber, string $message): bool
    {
        $sid = config('services.whatsapp.twilio_sid');
        $token = config('services.whatsapp.twilio_token');
        $from = config('services.whatsapp.twilio_from');

        if (! $sid || ! $token || ! $from) {
            Log::warning('WhatsApp Twilio driver selected but not configured. Falling back to log.');
            return $this->sendViaLog($phoneNumber, $message);
        }

        $response = Http::withBasicAuth($sid, $token)
            ->asForm()
            ->post("https://api.twilio.com/2010-04-01/Accounts/{$sid}/Messages.json", [
                'From' => $from,
                'To' => "whatsapp:{$phoneNumber}",
                'Body' => $message,
            ]);

        if (! $response->successful()) {
            Log::error('WhatsApp Twilio API send failed.', ['response' => $response->body()]);
        }

        return $response->successful();
    }
}