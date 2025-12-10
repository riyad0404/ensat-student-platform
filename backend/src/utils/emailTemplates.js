export const getResetPasswordEmailTemplate = (firstName, resetUrl) => `
<!DOCTYPE html>
<html lang="en" style="margin: 0; padding: 0;">
  <head>
    <meta charset="UTF-8" />
    <title>Password Reset</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body style="margin: 0; padding: 0; background-color: #f7f4ff; font-family: Arial, sans-serif;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" 
           style="background-color: #f7f4ff; padding: 20px 0;">
      <tr>
        <td align="center">
          <table width="600" border="0" cellspacing="0" cellpadding="0" 
                 style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 20px rgba(0,0,0,0.05);">
            
            <!-- Header / Banner -->
            <tr>
              <td align="center" 
                  style="background: linear-gradient(90deg, #ff4f9a, #4f8bff); padding: 24px 20px;">
                <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                  Password Reset Request
                </h1>
                <p style="margin: 8px 0 0; color: #ffe8f4; font-size: 14px;">
                  ENSA Students Platform
                </p>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding: 24px 28px 16px 28px; color: #1a1a1a; font-size: 14px; line-height: 1.6;">
                <p style="margin: 0 0 12px 0;">
                  Hello ${firstName || 'there'},
                </p>

                <p style="margin: 0 0 12px 0;">
                  We received a request to reset the password for your account on the 
                  <strong>ENSA Student Information Platform</strong>.
                </p>

                <p style="margin: 0 0 16px 0;">
                  If you made this request, please click the button below to set a new password.
                  This link will remain valid for <strong>1 hour</strong>.
                </p>

                <!-- Button -->
                <table border="0" cellspacing="0" cellpadding="0" style="margin: 0 0 20px 0;">
                  <tr>
                    <td align="center">
                      <a href="${resetUrl}" 
                         style="
                           display: inline-block;
                           background-color: #4f8bff;
                           color: #ffffff;
                           text-decoration: none;
                           padding: 12px 28px;
                           border-radius: 999px;
                           font-size: 14px;
                           font-weight: 600;
                           box-shadow: 0 4px 12px rgba(79,139,255,0.4);
                         ">
                        Reset My Password
                      </a>
                    </td>
                  </tr>
                </table>

                <!-- Fallback link -->
                <p style="margin: 0 0 10px 0; font-size: 13px; color: #555555;">
                  If the button above does not work, copy and paste this link into your browser:
                </p>
                <p style="margin: 0 0 16px 0; font-size: 12px; color: #777777; word-break: break-all;">
                  <a href="${resetUrl}" style="color: #4f8bff; text-decoration: underline;">
                    ${resetUrl}
                  </a>
                </p>

                <p style="margin: 0 0 12px 0; font-size: 13px; color: #555555;">
                  If you did not request a password reset, you can safely ignore this email.
                  Your password will not be changed.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center" 
                  style="padding: 16px 20px 20px 20px; background-color: #fdf0fa; border-top: 1px solid #f6d4f0;">
                <p style="margin: 0 0 4px 0; font-size: 12px; color: #b03070;">
                  ENSA Student Information Platform
                </p>
                <p style="margin: 0; font-size: 11px; color: #9a6295;">
                  This is an automated email, please do not reply.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
