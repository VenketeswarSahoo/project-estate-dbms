const styles = {
  container: `
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    max-width: 600px;
    margin: 0 auto;
    background-color: #ffffff;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  `,
  header: `
    background-color: #ffffff;
    padding: 24px 20px;
    text-align: center;
    border-bottom: 1px solid #f0f0f0;
  `,
  headerText: `
    color: #ffb606;
    font-size: 24px;
    font-weight: 700;
    margin: 0;
    letter-spacing: -0.5px;
    text-transform: none;
  `,
  content: `
    padding: 40px 30px;
    color: #333333;
    line-height: 1.6;
  `,
  greeting: `
    font-size: 18px;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 24px;
  `,
  paragraph: `
    margin-bottom: 12px;
    font-size: 16px;
    color: #4a4a4a;
  `,
  highlightBox: `
    background-color: #f8f9fa;
    border-left: 4px solid #ffb606;
    padding: 20px;
    margin: 24px 0;
    border-radius: 0 4px 4px 0;
  `,
  credentialGroup: `
    margin-bottom: 12px;
  `,
  label: `
    display: block;
    font-size: 12px;
    color: #888888;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
    font-weight: 600;
  `,
  value: `
    display: block;
    font-size: 16px;
    font-weight: 500;
    color: #1a1a1a;
    font-family: monospace;
    background: #ffffff;
    padding: 8px 12px;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    width: fit-content;
  `,
  button: `
    display: inline-block;
    background-color: #ffb606;
    color: #ffffff !important;
    padding: 14px 28px;
    text-decoration: none;
    border-radius: 6px;
    font-weight: 600;
    font-size: 16px;
    margin-top: 24px;
    text-align: center;
    transition: background-color 0.2s;
  `,
  footer: `
    background-color: #f5f5f5;
    padding: 24px;
    text-align: center;
    font-size: 13px;
    color: #888888;
    border-top: 1px solid #e0e0e0;
  `,
  footerLink: `
    color: #ffb606;
    text-decoration: none;
  `,
};

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
    <div style="${styles.container}">
      <div style="${styles.header}">
        <h1 style="${styles.headerText}">Onarach Estate App</h1>
      </div>
      <div style="${styles.content}">
        <div style="${styles.greeting}">Welcome to the Team!</div>
        <p style="${
          styles.paragraph
        }">You have been successfully added to our system. We are excited to have you on board as a <strong>${role}</strong>.</p>
        
        <p style="${
          styles.paragraph
        }">Here are your secure login credentials:</p>
        
        <div style="${styles.highlightBox}">
          <div style="${styles.credentialGroup}">
            <span style="${styles.label}">Email Address</span>
            <span style="${styles.value}">${email}</span>
          </div>
          <div style="${styles.credentialGroup}">
            <span style="${styles.label}">Your Password</span>
            <span style="${styles.value}">${password}</span>
          </div>
        </div>
        
        <div style="text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="${
    styles.button
  }">Access Your Account</a>
        </div>
      </div>
      <div style="${styles.footer}">
        <p style="margin: 0 0 8px 0;">&copy; ${new Date().getFullYear()} Onarach Estate App. All rights reserved.</p>
        <p style="margin: 0;">This is an automated message. Please do not reply directly to this email.</p>
      </div>
    </div>
  `;
}

export function messageNotificationTemplate({
  recipientName,
}: {
  recipientName: string;
}) {
  return `
    <div style="${styles.container}">
      <div style="${styles.header}">
        <h1 style="${styles.headerText}">New Message</h1>
      </div>
      <div style="${styles.content}">
        <div style="${styles.greeting}">Hello ${recipientName},</div>
        <p style="${
          styles.paragraph
        }">You have received a new message in your Onarach Estate App inbox.</p>
        
        <div style="${styles.highlightBox}">
          <p style="${
            styles.paragraph
          }; margin: 0;">Logging in to your account is required to view and reply to this secure message.</p>
        </div>

        <div style="text-align: center;">
          <a href="${
            process.env.NEXT_PUBLIC_APP_URL
          }/dashboard/messages" target="_blank" style="${
    styles.button
  }">View Message</a>
        </div>
      </div>
      <div style="${styles.footer}">
        <p style="margin: 0 0 8px 0;">&copy; ${new Date().getFullYear()} Onarach Estate App. All rights reserved.</p>
        <p style="margin: 0;">Need help? Contact our <a href="#" style="${
          styles.footerLink
        }">support team</a>.</p>
      </div>
    </div>
  `;
}
