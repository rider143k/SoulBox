const { getReminderEmailTemplate, getUnlockEmailTemplate } = require('../emails/emailTemplates');

class EmailService {
  constructor(sendMailFunction) {
    this.sendMail = sendMailFunction;
  }

  async sendReminderEmail(reminder) {
    try {
      const unlockUrl = `${process.env.BASE_URL}/capsule/${reminder.share_token}`;
      const emailTemplate = getReminderEmailTemplate(reminder, unlockUrl);
      
      await this.sendMail({
        to: reminder.recipient_email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text
      });
      
      return true;
    } catch (error) {
      console.warn('❌ Reminder Email Failed:', error.message);
      throw error;
    }
  }

  async sendUnlockEmail(capsule) {
    try {
      const unlockUrl = `${process.env.BASE_URL}/capsule/${capsule.share_token}`;
      const emailTemplate = getUnlockEmailTemplate(capsule, unlockUrl);
      
      await this.sendMail({
        to: capsule.recipient_email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text
      });
      
      return true;
    } catch (error) {
      console.warn('❌ Unlock Email Failed:', error.message);
      throw error;
    }
  }
}

module.exports = EmailService;