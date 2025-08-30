// Email utility functions for Arts & Crafts Store
// This module provides email templates and sending functionality
// This would typically integrate with email services like SendGrid, Nodemailer, etc.

import { getStoreSettings } from '@/lib/settings';

// Get store name with fallback
async function getStoreName(): Promise<string> {
  try {
    const settings = await getStoreSettings();
    return settings.storeName;
  } catch (error) {
    console.error('Error getting store name for email:', error);
    return 'Our Store';
  }
}

export interface EmailOptions {
  to: string | string[]
  subject: string
  text?: string
  html?: string
  from?: string
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // This is a placeholder implementation
    // In a real app, you would integrate with an email service
    console.log('Email would be sent:', options)
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // For development, always return true
    return true
  } catch (error) {
    console.error('Email sending failed:', error)
    return false
  }
}

export async function sendContactMessage(
  recipientEmail: string,
  recipientName: string,
  senderName: string,
  senderEmail: string,
  message: string,
  customStoreName?: string
): Promise<boolean> {
  try {
    const storeName = customStoreName || await getStoreName();
    return await sendEmail({
      to: recipientEmail,
      subject: `New Contact Message from ${senderName}`,
      html: `
        <h1>New Contact Message</h1>
        <p><strong>From:</strong> ${senderName} (${senderEmail})</p>
        <p><strong>To:</strong> ${recipientName}</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p>${message}</p>
        </div>
        <p><small>This message was sent through the ${storeName} contact system.</small></p>
      `
    })
  } catch (error) {
    console.error('Contact message failed:', error)
    return false
  }
}

export async function sendWelcomeEmail(userEmail: string, userName: string, customStoreName?: string): Promise<boolean> {
  const storeName = customStoreName || await getStoreName();
  return await sendEmail({
    to: userEmail,
    subject: `Welcome to ${storeName}!`,
    html: `
      <h1>Welcome to ${storeName}, ${userName}!</h1>
      <p>Thank you for joining our community of art lovers and creators.</p>
      <p>Discover our collection of contemporary paintings, handcrafted artworks, and unique artistic creations.</p>
      <p>Stay tuned for new arrivals, exclusive offers, and artistic inspiration!</p>
      <br>
      <p>Best regards,<br>The ${storeName} Team</p>
    `
  })
}

export async function sendOrderConfirmation(
  userEmail: string, 
  orderId: string, 
  items: any[],
  customStoreName?: string
): Promise<boolean> {
  const storeName = customStoreName || await getStoreName();
  return await sendEmail({
    to: userEmail,
    subject: `Order Confirmation #${orderId}`,
    html: `
      <h1>Thank you for your order!</h1>
      <p>Your order #${orderId} has been confirmed and is being prepared by ${storeName}.</p>
      <p><strong>Items ordered:</strong> ${items.length}</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <h3>Order Details:</h3>
        ${items.map(item => `<p>• ${item.name || item.title} - Quantity: ${item.quantity}</p>`).join('')}
      </div>
      <p>We'll send you another email when your order ships.</p>
      <br>
      <p>Best regards,<br>The ${storeName} Team</p>
    `
  })
}

export async function sendShippingNotification(
  userEmail: string,
  userName: string,
  orderId: string,
  trackingNumber?: string,
  customStoreName?: string
): Promise<boolean> {
  const storeName = customStoreName || await getStoreName();
  return await sendEmail({
    to: userEmail,
    subject: `Your ${storeName} Order is Shipped! #${orderId}`,
    html: `
      <h1>Great news, ${userName}!</h1>
      <p>Your order #${orderId} has been shipped and is on its way to you.</p>
      ${trackingNumber ? `<p><strong>Tracking Number:</strong> ${trackingNumber}</p>` : ''}
      <p>Your beautiful artwork will arrive soon!</p>
      <br>
      <p>Best regards,<br>The ${storeName} Team</p>
    `
  })
}

export async function sendNewsletterSubscription(
  userEmail: string,
  userName: string,
  customStoreName?: string
): Promise<boolean> {
  const storeName = customStoreName || await getStoreName();
  return await sendEmail({
    to: userEmail,
    subject: `Welcome to ${storeName} Newsletter!`,
    html: `
      <h1>Thank you for subscribing, ${userName}!</h1>
      <p>You're now part of our artistic community and will receive:</p>
      <ul>
        <li>New artwork announcements</li>
        <li>Exclusive offers and discounts</li>
        <li>Artist spotlights and stories</li>
        <li>Art tips and inspiration</li>
      </ul>
      <p>We promise to only send you the most inspiring content!</p>
      <br>
      <p>Best regards,<br>The ${storeName} Team</p>
    `
  })
}

// Email service for Arts & Crafts Store
export const emailService = {
  sendWelcomeEmail,
  sendOrderConfirmation,
  sendShippingNotification,
  sendContactMessage,
  sendNewsletterSubscription,
  sendEmail
}

// Legacy export for backward compatibility with existing API routes
export const churchEmailService = {
  sendWelcomeEmail,
  sendOrderConfirmation,
  sendDirectoryMessage: sendContactMessage, // Redirect directory messages to contact messages
  sendDonationThankYou: sendWelcomeEmail, // Placeholder - donations don't apply to art store
  sendRecurringDonationConfirmation: sendWelcomeEmail, // Placeholder - subscriptions don't apply
  sendEmail
}
