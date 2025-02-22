
  
const emailTemplateReminder = (userName, medicationName, dosage, medicationTime, reminderLink) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Medication Reminder</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f9;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          padding: 20px;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          padding-bottom: 20px;
        }
        .header h1 {
          color: #4CAF50;
        }
        .content {
          font-size: 16px;
          line-height: 1.5;
          margin-bottom: 20px;
        }
        .footer {
          font-size: 14px;
          text-align: center;
          color: #888;
        }
        .button {
          display: block;
          width: 200px;
          margin: 20px auto;
          padding: 10px;
          background-color: #4CAF50;
          color: white;
          text-align: center;
          border-radius: 4px;
          text-decoration: none;
        }
        .button:hover {
          background-color: #45a049;
        }
      </style>
    </head>
    <body>

      <div class="container">
        <div class="header">
          <h1>Medication Reminder</h1>
        </div>

        <div class="content">
          <p>Dear ${userName},</p>
          <p>This is a friendly reminder to take your medication:</p>
          <p><strong>${medicationName}</strong></p>
          <p>Dosage: <strong>${dosage}</strong></p>
          <p><strong>Time:</strong> ${medicationTime}</p>
          <p>Please take your medication as prescribed. Your health is important!</p>
        </div>

        <a href="${reminderLink}" class="button">Mark as Taken</a>

        <div class="footer">
          <p>If you have any questions, feel free to contact us.</p>
          <p>Best regards,<br>Your Health Team</p>
        </div>
      </div>

    </body>
    </html>
  `;
}

module.exports = emailTemplateReminder;
