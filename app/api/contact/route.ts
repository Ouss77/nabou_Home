import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json()

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Create a transporter
    const transporter = nodemailer.createTransporter({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    // Email content for admin notification
    const adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: "support@barberbook.com", // Replace with your support email
      subject: "New Contact Form Submission - BarberBook",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #374151; margin-top: 0;">Contact Details:</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
          </div>
          
          <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h3 style="color: #374151; margin-top: 0;">Message:</h3>
            <p style="line-height: 1.6; color: #4b5563;">${message}</p>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #dbeafe; border-radius: 8px;">
            <p style="margin: 0; color: #1e40af; font-size: 14px;">
              <strong>Note:</strong> Please respond to this inquiry within 24 hours to maintain our service standards.
            </p>
          </div>
        </div>
      `,
    }

    // Auto-reply email for the user
    const userMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Thank you for contacting BarberBook",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">Thank You, ${name}!</h1>
          </div>
          
          <div style="padding: 30px; background-color: #ffffff; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; color: #374151; line-height: 1.6;">
              We've received your message and appreciate you taking the time to contact us.
            </p>
            
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #374151; margin-top: 0;">Your Message:</h3>
              <p style="color: #4b5563; font-style: italic;">"${message}"</p>
            </div>
            
            <p style="color: #374151; line-height: 1.6;">
              Our team will review your inquiry and respond within 24 hours. If you have an urgent matter, 
              please don't hesitate to call us at <strong>(555) 123-4567</strong>.
            </p>
            
            <div style="margin-top: 30px; padding: 20px; background-color: #dbeafe; border-radius: 8px;">
              <h4 style="color: #1e40af; margin-top: 0;">In the meantime:</h4>
              <ul style="color: #1e40af; margin: 10px 0;">
                <li>Explore our <a href="#" style="color: #2563eb;">store locations</a></li>
                <li>Book an appointment at your nearest location</li>
                <li>Follow us on social media for updates</li>
              </ul>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              Best regards,<br>
              The BarberBook Team
            </p>
          </div>
        </div>
      `,
    }

    // Send both emails
    await Promise.all([transporter.sendMail(adminMailOptions), transporter.sendMail(userMailOptions)])

    return NextResponse.json({ message: "Message sent successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error sending contact form email:", error)
    return NextResponse.json({ error: "Failed to send message. Please try again." }, { status: 500 })
  }
}
