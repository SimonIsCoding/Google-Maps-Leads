import sgMail from '@sendgrid/mail'
import logger from './logger'

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || ''
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@mapscraperhub.com'

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY)
}

export interface EmailOptions {
  to: string
  subject: string
  text: string
  html: string
}

/**
 * Send email using SendGrid
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  if (!SENDGRID_API_KEY) {
    logger.warn('SendGrid API key not configured, email not sent')
    console.log('📧 Email would be sent:', options)
    return
  }

  try {
    await sgMail.send({
      from: FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    })

    logger.info({ to: options.to, subject: options.subject }, 'Email sent successfully')
  } catch (error) {
    logger.error({ error, to: options.to }, 'Failed to send email')
    throw error
  }
}

/**
 * Send search completion notification
 */
export async function sendSearchCompletionEmail(
  userEmail: string,
  userName: string,
  query: string,
  sheetUrl: string
): Promise<void> {
  const subject = 'Your MapScraperHub search is ready!'
  const text = `Hi ${userName},\n\nYour search for "${query}" has been completed.\n\nView your results: ${sheetUrl}\n\nBest regards,\nMapScraperHub Team`
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0ea5e9;">Your search is ready! 🎉</h2>
      <p>Hi ${userName},</p>
      <p>Your search for <strong>"${query}"</strong> has been completed successfully.</p>
      <p>
        <a href="${sheetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #0ea5e9; color: white; text-decoration: none; border-radius: 6px;">
          View Results
        </a>
      </p>
      <p style="color: #666; font-size: 14px;">
        If the button doesn't work, copy and paste this link:<br>
        <a href="${sheetUrl}">${sheetUrl}</a>
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">
      <p style="color: #999; font-size: 12px;">
        MapScraperHub - Transform Google Maps searches into Google Sheets
      </p>
    </div>
  `

  await sendEmail({
    to: userEmail,
    subject,
    text,
    html,
  })
}

/**
 * Send search failed notification
 */
export async function sendSearchFailedEmail(
  userEmail: string,
  userName: string,
  query: string,
  errorMessage: string
): Promise<void> {
  const subject = 'Your MapScraperHub search failed'
  const text = `Hi ${userName},\n\nUnfortunately, your search for "${query}" has failed.\n\nError: ${errorMessage}\n\nPlease try again or contact support if the problem persists.\n\nBest regards,\nMapScraperHub Team`
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Search Failed ❌</h2>
      <p>Hi ${userName},</p>
      <p>Unfortunately, your search for <strong>"${query}"</strong> has failed.</p>
      <p style="background-color: #fee; padding: 12px; border-left: 4px solid #dc2626; border-radius: 4px;">
        <strong>Error:</strong> ${errorMessage}
      </p>
      <p>Please try again or contact support if the problem persists.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">
      <p style="color: #999; font-size: 12px;">
        MapScraperHub - Transform Google Maps searches into Google Sheets
      </p>
    </div>
  `

  await sendEmail({
    to: userEmail,
    subject,
    text,
    html,
  })
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(
  userEmail: string,
  userName: string
): Promise<void> {
  const subject = 'Welcome to MapScraperHub! 🎉'
  const text = `Hi ${userName},\n\nWelcome to MapScraperHub!\n\nYou can now transform Google Maps searches into Google Sheets with just a few clicks.\n\nGet started: ${process.env.APP_BASE_URL}\n\nBest regards,\nMapScraperHub Team`
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0ea5e9;">Welcome to MapScraperHub! 🎉</h2>
      <p>Hi ${userName},</p>
      <p>Thank you for joining MapScraperHub!</p>
      <p>You can now transform Google Maps searches into Google Sheets with just a few clicks.</p>
      <p>
        <a href="${process.env.APP_BASE_URL}/dashboard" style="display: inline-block; padding: 12px 24px; background-color: #0ea5e9; color: white; text-decoration: none; border-radius: 6px;">
          Go to Dashboard
        </a>
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">
      <p style="color: #999; font-size: 12px;">
        MapScraperHub - Transform Google Maps searches into Google Sheets
      </p>
    </div>
  `

  await sendEmail({
    to: userEmail,
    subject,
    text,
    html,
  })
}
