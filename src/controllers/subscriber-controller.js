import Subscriber from "../models/subscriber.js";
import nodemailer from "nodemailer";

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail", // Replace with SendGrid/Mailgun for production
  auth: {
    user: process.env.EMAIL_USER, // e.g., your-email@gmail.com
    pass: process.env.EMAIL_PASS, // App-specific password
  },
});

// HTML email template with Tailwind-like styling
const getWelcomeEmailTemplate = (email) => `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background-color: #f3f4f6;
        margin: 0;
        padding: 0;
        color: #1f2937;
      }
      .container {
        max-width: 600px;
        margin: 20px auto;
        background-color: #ffffff;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      }
      .header {
        background-color: #3b82f6; /* Tailwind's bg-primary */
        color: #ffffff; /* text-primary-foreground */
        text-align: center;
        padding: 20px;
      }
      .header h1 {
        margin: 0;
        font-size: 24px;
        font-weight: 600;
      }
      .content {
        padding: 24px;
      }
      .content p {
        font-size: 16px;
        line-height: 1.5;
        margin: 0 0 16px;
      }
      .button {
        display: inline-block;
        background-color: #3b82f6;
        color: #ffffff;
        text-decoration: none;
        padding: 12px 24px;
        border-radius: 6px;
        font-weight: 500;
        margin: 16px 0;
      }
      .footer {
        background-color: #f9fafb;
        text-align: center;
        padding: 16px;
        font-size: 14px;
        color: #6b7280; /* text-muted-foreground */
      }
      .footer a {
        color: #3b82f6;
        text-decoration: none;
      }
      @media (prefers-color-scheme: dark) {
        body {
          background-color: #1f2937;
          color: #e5e7eb;
        }
        .container {
          background-color: #374151; /* bg-card */
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        .header {
          background-color: #2563eb;
        }
        .footer {
          background-color: #4b5563;
          color: #9ca3af;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Welcome to D-Blog Platform!</h1>
      </div>
      <div class="content">
        <p>Hello, ${email}!</p>
        <p>Thank you for subscribing to our newsletter! You're now part of our community of storytellers and readers.</p>
        <p>Get ready for the latest blogs, exclusive updates, and captivating content delivered straight to your inbox.</p>
        <a href="http://localhost:5173" class="button">Explore Our Blogs</a>
      </div>
      <div class="footer">
        <p>
          Don't want to receive these emails? 
          <a href="http://localhost:3000/api/unsubscribe?email=${encodeURIComponent(
            email
          )}">Unsubscribe</a>
        </p>
        <p>© ${new Date().getFullYear()} Your Blog Platform. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>
`;

const getUnsubscribeEmailTemplate = (email) => `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background-color: #f3f4f6;
        margin: 0;
        padding: 0;
        color: #1f2937;
      }
      .container {
        max-width: 600px;
        margin: 20px auto;
        background-color: #ffffff;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      }
      .header {
        background-color: #3b82f6;
        color: #ffffff;
        text-align: center;
        padding: 20px;
      }
      .header h1 {
        margin: 0;
        font-size: 24px;
        font-weight: 600;
      }
      .content {
        padding: 24px;
      }
      .content p {
        font-size: 16px;
        line-height: 1.5;
        margin: 0 0 16px;
      }
      .footer {
        background-color: #f9fafb;
        text-align: center;
        padding: 16px;
        font-size: 14px;
        color: #6b7280;
      }
      .footer a {
        color: #3b82f6;
        text-decoration: none;
      }
      @media (prefers-color-scheme: dark) {
        body {
          background-color: #1f2937;
          color: #e5e7eb;
        }
        .container {
          background-color: #374151;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        .header {
          background-color: #2563eb;
        }
        .footer {
          background-color: #4b5563;
          color: #9ca3af;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Unsubscribed Successfully</h1>
      </div>
      <div class="content">
        <p>Hello, ${email}!</p>
        <p>You have been unsubscribed from our newsletter.</p>
        <p>We're sorry to see you go, but you can always resubscribe at <a href="http://localhost:5173">Your Blog Platform</a>.</p>
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} Your Blog Platform. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>
`;

// Shared unsubscribe logic
const handleUnsubscribe = async (email, res) => {
  try {
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const subscriber = await Subscriber.findOneAndDelete({ email });
    if (!subscriber) {
      return res.status(404).json({ message: "Email not found" });
    }

    // Send unsubscribe confirmation email
    const mailOptions = {
      from: `"Your Blog Platform" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Unsubscribed from Your Blog Platform Newsletter",
      html: getUnsubscribeEmailTemplate(email),
    };

    await transporter.sendMail(mailOptions);

    // For GET requests, redirect to a confirmation page
    if (res.headersSent === false) {
      res.redirect("http://localhost:5173/unsubscribed");
    } else {
      res.status(200).json({ message: "Unsubscribed successfully" });
    }
  } catch (error) {
    console.error("Unsubscribe error:", error);
    if (res.headersSent === false) {
      res.status(500).json({ message: "Server error, please try again later" });
    }
  }
};

// Subscribe to newsletter
export const subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check if email already exists
    const existingSubscriber = await Subscriber.findOne({ email });
    if (existingSubscriber) {
      return res.status(409).json({ message: "Email is already subscribed" });
    }

    // Create new subscriber
    const subscriber = new Subscriber({ email });
    await subscriber.save();

    // Send welcome email
    const mailOptions = {
      from: `"Your Blog Platform" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Welcome to Your Blog Platform Newsletter!",
      html: getWelcomeEmailTemplate(email),
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: "Subscribed successfully" });
  } catch (error) {
    console.error("Subscription error:", error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
};

// Unsubscribe from newsletter (DELETE)
export const unsubscribe = async (req, res) => {
  const { email } = req.query;
  await handleUnsubscribe(email, res);
};

// Unsubscribe from newsletter (GET)
export const unsubscribeGet = async (req, res) => {
  const { email } = req.query;
  await handleUnsubscribe(email, res);
};
