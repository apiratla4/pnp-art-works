// server/src/controllers/customOrderController.js
import nodemailer from 'nodemailer';

export const submitOrder = async (req, res) => {
  try {
    const { name, email, phone, artType, size, description, budget, deadline } = req.body;
    const attachment = req.file;

    if (!name || !email || !artType || !size || !description) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,     // e.g. smtp.gmail.com
      port: Number(process.env.EMAIL_PORT || 587),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,   // SMTP user
        pass: process.env.EMAIL_PASS,   // SMTP password / app password
      },
    });

    const html = `
      <h2>New Custom Art Commission Request</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
      <p><strong>Art Type:</strong> ${artType}</p>
      <p><strong>Size:</strong> ${size}</p>
      <p><strong>Budget:</strong> ${budget || 'Not specified'}</p>
      <p><strong>Deadline:</strong> ${deadline || 'Not specified'}</p>
      <hr />
      <p><strong>Description:</strong></p>
      <p>${(description || '').replace(/\n/g, '<br />')}</p>
    `;

    const mail = await transporter.sendMail({
      from: `"${name}" <${process.env.EMAIL_USER}>`,
      replyTo: email,
      to: 'contact@codewithjay.in',
      subject: `Custom Art Request  ${name}`,
      html,
      attachments: attachment ? [{
        filename: attachment.originalname,
        content: attachment.buffer
      }] : [],
    });

    return res.status(200).json({ message: 'Request submitted successfully.' });
  } catch (err) {
    console.error('submitOrder error:', err);
    return res.status(500).json({ message: 'Failed to submit request. Please try again.' });
  }
};
