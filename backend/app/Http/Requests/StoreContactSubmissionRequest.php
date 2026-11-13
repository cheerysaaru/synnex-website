<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreContactSubmissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'string', 'email', 'max:160'],
            'phone' => ['required', 'string', 'max:40'],
            'service' => ['required', 'string', 'max:160'],
            'message' => ['required', 'string', 'max:2000'],
        ];
    }
}
