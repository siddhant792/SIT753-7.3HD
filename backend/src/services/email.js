import nodemailer from 'nodemailer'
import logger from '../utils/logger.js'

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })
  }

  async sendEmail(to, subject, html) {
    try {
      const info = await this.transporter.sendMail({
        from: `"Task Management" <${process.env.SMTP_FROM}>`,
        to,
        subject,
        html
      })

      logger.info('Email sent:', info.messageId)
      return info
    } catch (error) {
      logger.error('Error sending email:', error)
      throw error
    }
  }

  
  async sendWelcomeEmail(user) {
    const subject = 'Welcome to Task Management'
    const html = `
      <h1>Welcome ${user.name}!</h1>
      <p>Thank you for joining our task management platform.</p>
      <p>You can now start creating and managing your tasks.</p>
      <p>If you have any questions, feel free to contact our support team.</p>
    `

    return this.sendEmail(user.email, subject, html)
  }

  async sendTaskAssignmentEmail(user, task) {
    const subject = 'New Task Assigned'
    const html = `
      <h1>Hello ${user.name},</h1>
      <p>You have been assigned a new task:</p>
      <h2>${task.title}</h2>
      <p>${task.description}</p>
      <p>Priority: ${task.priority}</p>
      <p>Due Date: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}</p>
      <p>Click here to view the task: <a href="${process.env.FRONTEND_URL}/tasks/${task.id}">View Task</a></p>
    `

    return this.sendEmail(user.email, subject, html)
  }

  async sendTaskUpdateEmail(user, task) {
    const subject = 'Task Updated'
    const html = `
      <h1>Hello ${user.name},</h1>
      <p>A task you are assigned to has been updated:</p>
      <h2>${task.title}</h2>
      <p>${task.description}</p>
      <p>Priority: ${task.priority}</p>
      <p>Status: ${task.status}</p>
      <p>Due Date: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}</p>
      <p>Click here to view the task: <a href="${process.env.FRONTEND_URL}/tasks/${task.id}">View Task</a></p>
    `

    return this.sendEmail(user.email, subject, html)
  }

  async sendCommentNotificationEmail(user, task, comment) {
    const subject = 'New Comment on Task'
    const html = `
      <h1>Hello ${user.name},</h1>
      <p>There is a new comment on your task:</p>
      <h2>${task.title}</h2>
      <p>Comment by ${comment.user.name}:</p>
      <p>${comment.content}</p>
      <p>Click here to view the task: <a href="${process.env.FRONTEND_URL}/tasks/${task.id}">View Task</a></p>
    `

    return this.sendEmail(user.email, subject, html)
  }

  async sendTenantDeletionEmail(user) {
    const subject = 'Tenant Deletion Notice'
    const html = `
      <h1>Hello ${user.name},</h1>
      <p>Your tenant account has been deleted.</p>
      <p>If you believe this was done in error, please contact our support team immediately.</p>
    `

    return this.sendEmail(user.email, subject, html)
  }

  async sendSubscriptionUpdateEmail(user, plan) {
    const subject = 'Subscription Plan Updated'
    const html = `
      <h1>Hello ${user.name},</h1>
      <p>Your subscription plan has been updated to: ${plan}</p>
      <p>Thank you for your continued support!</p>
    `

    return this.sendEmail(user.email, subject, html)
  }
}

const emailService = new EmailService()
export default emailService 