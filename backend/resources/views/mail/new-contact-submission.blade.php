<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>New enquiry</title>
</head>
<body style="font-family: Arial, Helvetica, sans-serif; color: #10233f; line-height: 1.6;">
    <h1 style="font-size: 20px; margin: 0 0 16px;">New website enquiry</h1>

    <p style="margin: 0 0 8px;"><strong>Name:</strong> {{ $submission->name }}</p>
    <p style="margin: 0 0 8px;"><strong>Email:</strong> {{ $submission->email }}</p>
    <p style="margin: 0 0 8px;"><strong>Phone:</strong> {{ $submission->phone }}</p>
    <p style="margin: 0 0 8px;"><strong>Service:</strong> {{ $submission->service }}</p>

    <p style="margin: 16px 0 4px;"><strong>Message:</strong></p>
    <p style="margin: 0; white-space: pre-line;">{{ $submission->message }}</p>

    <hr style="border: none; border-top: 1px solid #dbe3ee; margin: 24px 0;">
    <p style="margin: 0; font-size: 12px; color: #5c6b80;">
        Sent {{ $submission->created_at?->format('j M Y, H:i') }} from the Synnex Technology website.
        @if ($submission->user_id)
            Signed-in account ID: {{ $submission->user_id }}.
        @else
            Sent by a guest visitor.
        @endif
    </p>
</body>
</html>
