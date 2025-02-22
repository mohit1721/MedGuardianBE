const emailTemplateAdd = (name, dosage, time, startDate, duration, reminderEnabled) => {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; background-color: #f4f7fc; margin: 0; padding: 0;">
          <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); padding: 20px; color: #333;">
            <h2 style="text-align: center; color: #2d87f0;">Medication Added Successfully</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #555;">
              Dear User,
            </p>
            <p style="font-size: 16px; line-height: 1.6; color: #555;">
              Your medication has been successfully added to your schedule. Below are the details:
            </p>
            <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
              <tr style="background-color: #f9f9f9;">
                <td style="padding: 10px; font-weight: bold; color: #555;">Medication Name</td>
                <td style="padding: 10px;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold; color: #555;">Dosage</td>
                <td style="padding: 10px;">${dosage}</td>
              </tr>
              <tr style="background-color: #f9f9f9;">
                <td style="padding: 10px; font-weight: bold; color: #555;">Time</td>
                <td style="padding: 10px;">${time}</td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold; color: #555;">Start Date</td>
                <td style="padding: 10px;">${startDate}</td>
              </tr>
              <tr style="background-color: #f9f9f9;">
                <td style="padding: 10px; font-weight: bold; color: #555;">Duration</td>
                <td style="padding: 10px;">${duration} days</td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold; color: #555;">Reminder Enabled</td>
                <td style="padding: 10px;">${reminderEnabled ? "Yes" : "No"}</td>
              </tr>
            </table>
            <p style="font-size: 16px; line-height: 1.6; color: #555; margin-top: 20px;">
              You will receive reminders based on your preferences.
            </p>
            <p style="font-size: 16px; line-height: 1.6; color: #555;">
              Best regards,<br />
              <span style="font-weight: bold; color: #2d87f0;">Your Medication Reminder Service</span>
            </p>
          </div>
        </body>
      </html>
    `;
  };
  
  module.exports = emailTemplateAdd;
  