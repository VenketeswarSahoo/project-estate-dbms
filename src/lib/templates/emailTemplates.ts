export function introductoryEmailTemplate({
  email,
  role,
  password,
}: {
  email: string;
  role: string;
  password: string;
}) {
  return `
    <div>
      <h4>Welcome to Our System, Estate Softwear</h4>
      <p>You have been added to our system as a <strong>${role}</strong>.</p>
      <p>Your login email is: <strong>${email}</strong>.</p>
      <p>Your login password is: <strong>${password}</strong>.</p>
      <br/>
      <p>Best regards,<br/>The Company Team</p>
    </div>
  `;
}

export function messageNotificationTemplate({
  recipientName,
}: {
  recipientName: string;
}) {
  return `
    <div>
      <h4>New Message Notification</h4>
      <p>Dear ${recipientName},</p>
      <p>You have received a new message in your account.</p>
      <p>Please <a href="${process.env.NEXT_PUBLIC_APP_URL}/messages" target="_blank">log in</a> to view and respond to it.</p>
      <br/>
      <p>Best regards,<br/>The Company Team</p>
    </div>
  `;
}
