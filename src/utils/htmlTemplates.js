export const tempPassEmailTemplate = ({ userName, tempPassword }) => {
  return `<html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: auto;
            background: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: #007bff;
            color: #ffffff;
            padding: 10px;
            border-radius: 8px 8px 0 0;
            text-align: center;
          }
          .content {
            margin: 20px 0;
            text-align: center;
          }
          .footer {
            font-size: 14px;
            color: #888888;
            text-align: center;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Temporary Password</h1>
          </div>
          <div class="content">
            <p>Hi ${userName},</p>
            <p>Your temporary password is: <strong>${tempPassword}</strong></p>
            <p>Please log in using this password and change it immediately for security reasons.</p>
          </div>
          <div class="footer">
            <p>If you did not request this password, please contact our support team.</p>
            <p>Best regards,<br>E-commerce Team</p>
          </div>
        </div>
      </body>
      </html>
`;
};
export const verifyEmailTemplate = ({ userName, req, token }) => {
  return `
    <html>
    <head>
      <style>
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes glowing {
          0% { box-shadow: 0 0 8px #007bff; }
          50% { box-shadow: 0 0 15px #0056b3; }
          100% { box-shadow: 0 0 8px #007bff; }
        }

        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f9fafc;
          margin: 0;
          padding: 0;
        }

        .container {
          max-width: 600px;
          margin: 40px auto;
          background: #ffffff;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          animation: fadeIn 1s ease-out;
        }

        .header {
          text-align: center;
          background-color: #007bff;
          padding: 20px;
          border-radius: 12px 12px 0 0;
        }

        .header h1 {
          font-size: 26px;
          color: #ffffff;
          margin: 0;
        }

        .content {
          text-align: center;
          margin: 30px 0;
          font-size: 18px;
          color: #444444;
          line-height: 1.8;
          animation: fadeIn 1.2s ease-out;
        }

        .content p {
          margin: 0 0 15px;
        }

        .button {
          display: inline-block;
          background-color: #007bff;
          color: #ffffff;
          padding: 14px 32px;
          font-size: 16px;
          font-weight: bold;
          border-radius: 8px;
          text-decoration: none;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: background-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
          animation: glowing 2s infinite alternate;
        }

        .button:hover {
          background-color: #0056b3;
          transform: scale(1.05);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        }

        .footer {
          text-align: center;
          font-size: 14px;
          color: #888888;
          margin-top: 30px;
        }

        .footer p {
          margin: 0 0 5px;
        }

        .footer a {
          color: #007bff;
          text-decoration: none;
        }

        .footer a:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome, ${userName}!</h1>
        </div>
        <div class="content">
          <p>We're thrilled to have you on board! Please verify your email address by clicking the button below:</p>
          <a href="${req.protocol}://${req.headers.host}/auth/verify?token=${token}" class="button">Verify My Account</a>
        </div>
        <div class="footer">
          <p>If you didn’t sign up for this account, please disregard this email.</p>
          <p>Best Regards,</p>
          <p><strong>E-commerce Team</strong></p>
          <p><a href="#">Contact Support</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
};
