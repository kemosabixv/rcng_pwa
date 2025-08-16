<!DOCTYPE html>
<html>
<head>
    <title>Test Email</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
        .header {
            background-color: #4CAF50;
            color: white;
            padding: 10px 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }
        .content {
            padding: 20px;
        }
        .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 12px;
            color: #777;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>RCNG - Test Email</h1>
        </div>
        <div class="content">
            <p>Hello {{ $details['name'] }},</p>
            <p>This is a test email from the RCNG application.</p>
            <p>If you received this email, your email configuration is working correctly.</p>
            <p>Here are some details:</p>
            <ul>
                <li>Time: {{ now() }}</li>
                <li>App URL: {{ config('app.url') }}</li>
                <li>Environment: {{ config('app.env') }}</li>
            </ul>
        </div>
        <div class="footer">
            <p>This is an automated message, please do not reply to this email.</p>
            <p>&copy; {{ date('Y') }} RCNG. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
