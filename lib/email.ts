import nodemailer from 'nodemailer';

const ZEPTOMAIL_HOST = "smtp.zeptomail.in";
const ZEPTOMAIL_PORT = 587;
const ZEPTOMAIL_USER = "emailapikey";
const ZEPTOMAIL_PASS = process.env.ZEPTOMAIL_PASSWORD || "PHtE6r0IE7q/3mUv80UHsP/pRc+tZownrO8zflYS5o1LWfZSGU1VqNl/kTKxqht8XPkWR/SfyN5t5Oycsu6BITzsYG4dWmqyqK3sx/VYSPOZsbq6x00ctF4SfkLVVoDmcd9u1iXRuNnaNA==";
const isDevelopment = process.env.NODE_ENV === 'development';

// Use production domain for all emails
const BASE_URL = 'https://pathpiper.replit.app';

// Create nodemailer transporter
const transport = nodemailer.createTransport({
  host: ZEPTOMAIL_HOST,
  port: ZEPTOMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: ZEPTOMAIL_USER,
    pass: ZEPTOMAIL_PASS
  }
});

// Mock email sending for development
async function mockSendEmail() {
  console.log('Email sending mocked due to missing API key');
  return { success: true, data: { messageId: 'mocked_id' } };
}

export type EmailTemplate = 'verification' | 'parent-approval' | 'parent-approval-existing' | 'parent-approval-new' | 'password-reset' | 'parent-email-verification' | 'student-email-verification';

export async function sendEmail(
  template: EmailTemplate,
  to: string,
  data: {
    userName?: string;
    verificationLink?: string;
    studentName?: string;
    approvalLink?: string;
    resetLink?: string;
    parentName?: string;
  }
) {
  try {
    console.log(`Attempting to send ${template} email to ${to}`);

    // Check if we're in development mode without proper API key
    if (!ZEPTOMAIL_PASS && isDevelopment) {
      console.log('Development mode: Mocking email send');
      return mockSendEmail();
    }

    if (!ZEPTOMAIL_PASS) {
      console.error('ZEPTOMAIL_PASSWORD is not configured');
      return { success: false, error: 'Email service not configured' };
    }

    let subject = '';
    let html = '';

    switch (template) {
      case 'verification':
        subject = 'Verify your PathPiper account';
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="https://path-piper.replit.app/images/pathpiper-logo-full.png" alt="PathPiper" style="height: 60px; width: auto;" />
            </div>

            <h2 style="color: #1f2937; margin-bottom: 20px;">Welcome to PathPiper!</h2>

            <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
              Hi ${data.userName || 'there'},
            </p>

            <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
              Please verify your email address by clicking the button below:
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.verificationLink}" 
                 style="display: inline-block; background-color: #14b8a6; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                Verify Email
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              © ${new Date().getFullYear()} PathPiper. All rights reserved.
            </p>
          </div>
        `;
        break;

      case 'parent-approval':
        subject = 'Parent Approval Required for PathPiper Account';
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="https://path-piper.replit.app/images/pathpiper-logo-full.png" alt="PathPiper" style="height: 60px; width: auto;" />
            </div>

            <h2 style="color: #1f2937; margin-bottom: 20px;">Parent Approval Request</h2>

            <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
              Dear Parent/Guardian,
            </p>

            <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
              ${data.studentName} has created an account on PathPiper and requires your approval to proceed.
            </p>

            <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
              Please review and approve their account by clicking the button below:
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.approvalLink}" 
                 style="display: inline-block; background-color: #14b8a6; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                Review and Approve
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              © ${new Date().getFullYear()} PathPiper. All rights reserved.
            </p>
          </div>
        `;
        break;

      case 'parent-approval-existing':
        subject = 'Account Approval Request from Your Child';
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="https://path-piper.replit.app/images/pathpiper-logo-full.png" alt="PathPiper" style="height: 60px; width: auto;" />
            </div>

            <h2 style="color: #1f2937; margin-bottom: 20px;">Account Approval Request</h2>

            <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
              Dear Parent/Guardian,
            </p>

            <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
              Your child <strong>${data.studentName}</strong> has requested for account approval on PathPiper. Please click on the link below for approving their account:
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.approvalLink}" 
                 style="display: inline-block; background-color: #14b8a6; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                Approve Account
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              © ${new Date().getFullYear()} PathPiper. All rights reserved.
            </p>
          </div>
        `;
        break;

      case 'parent-approval-new':
        subject = 'Your Child Needs Your Approval - Register on PathPiper';
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="https://path-piper.replit.app/images/pathpiper-logo-full.png" alt="PathPiper" style="height: 60px; width: auto;" />
            </div>

            <h2 style="color: #1f2937; margin-bottom: 20px;">Registration & Approval Required</h2>

            <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
              Dear Parent/Guardian,
            </p>

            <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
              Your child <strong>${data.studentName}</strong> is asking for approval on PathPiper, but as you are not registered as a parent on PathPiper, please click on the link below to register and then approve their account:
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.approvalLink}" 
                 style="display: inline-block; background-color: #14b8a6; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                Register & Approve
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              © ${new Date().getFullYear()} PathPiper. All rights reserved.
            </p>
          </div>
        `;
        break;

      case 'password-reset':
        subject = 'Reset your PathPiper password';
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="https://path-piper.replit.app/images/pathpiper-logo-full.png" alt="PathPiper" style="height: 60px; width: auto;" />
            </div>

            <h2 style="color: #1f2937; margin-bottom: 20px;">Reset Your Password</h2>

            <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
              Hi ${data.userName || 'there'},
            </p>

            <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
              We received a request to reset your PathPiper account password. Click the button below to reset it:
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.resetLink}" 
                 style="display: inline-block; background-color: #14b8a6; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                Reset Password
              </a>
            </div>

            <p style="color: #6b7280; font-size: 14px; line-height: 1.5;">
              If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.
            </p>

            <p style="color: #6b7280; font-size: 14px; line-height: 1.5;">
              This link will expire in 1 hour for security reasons.
            </p>

            <p style="color: #6b7280; font-size: 14px; line-height: 1.5;">
              If the button doesn't work, copy and paste this link into your browser: ${data.resetLink}
            </p>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              © ${new Date().getFullYear()} PathPiper. All rights reserved.
            </p>
          </div>
        `;
        break;

        case 'parent-email-verification':
        subject = 'Verify Your PathPiper Parent Account Email';
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
           <div style="text-align: center; margin-bottom: 30px;">
              <img src="https://path-piper.replit.app/images/pathpiper-logo-full.png" alt="PathPiper" style="height: 60px; width: auto;" />
            </div>
            <h2 style="color: #2D5AA0;">Verify Your Email Address</h2>
            <p>Hello ${data.parentName},</p>
            <p>Thank you for creating a PathPiper parent account! To complete your registration and access your dashboard, please verify your email address.</p>
            <div style="margin: 30px 0; text-align: center;">
              <a href="${data.verificationLink}" style="background-color: #2D5AA0; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email Address</a>
            </div>
            <p>This verification link will expire in 24 hours. If you didn't create this account, please ignore this email.</p>
            <p>Best regards,<br>The PathPiper Team</p>
          </div>
        `;
        break;

      case 'student-email-verification':
        subject = 'Verify Your PathPiper Email Address';
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="https://path-piper.replit.app/images/pathpiper-logo-full.png" alt="PathPiper" style="height: 60px; width: auto;" />
            </div>

            <h2 style="color: #1f2937; margin-bottom: 20px;">Verify Your Email Address</h2>

            <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
              Hi ${data.studentName},
            </p>

            <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
              We have sent an approval email to your parent. Meanwhile, please verify your email address by clicking the button below:
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.verificationLink}" 
                 style="display: inline-block; background-color: #14b8a6; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                Verify Email Address
              </a>
            </div>

            <p style="color: #6b7280; font-size: 14px; line-height: 1.5;">
              Once you verify your email and your parent approves your account, you'll be able to start your learning journey on PathPiper!
            </p>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              © ${new Date().getFullYear()} PathPiper. All rights reserved.
            </p>
          </div>
        `;
        break;
    }

    console.log(`Sending email with subject: ${subject}`);

    const mailOptions = {
      from: '"PathPiper" <noreply@www.pathpiper.com>',
      to: to,
      subject: subject,
      html: html
    };

    const result = await transport.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return { success: true, data: result };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error };
  }
}