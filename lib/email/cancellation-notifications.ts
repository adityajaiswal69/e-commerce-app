/**
 * Email notification system for order cancellations
 * This is a basic implementation - integrate with your preferred email service
 */

export interface EmailNotificationData {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface CancellationEmailData {
  customerEmail: string;
  customerName?: string;
  orderNumber: string;
  orderAmount: number;
  cancellationReason: string;
  adminNotes?: string;
  refundAmount?: number;
  refundStatus?: string;
}

/**
 * Generate email content for cancellation request created
 */
export function generateCancellationRequestEmail(data: CancellationEmailData): EmailNotificationData {
  const { customerEmail, customerName, orderNumber, orderAmount, cancellationReason } = data;
  
  const subject = `Cancellation Request Received - Order #${orderNumber}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Cancellation Request Received</h2>
      
      <p>Dear ${customerName || 'Customer'},</p>
      
      <p>We have received your cancellation request for the following order:</p>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #333;">Order Details</h3>
        <p><strong>Order Number:</strong> #${orderNumber}</p>
        <p><strong>Order Amount:</strong> ₹${orderAmount.toFixed(2)}</p>
        <p><strong>Cancellation Reason:</strong> ${cancellationReason}</p>
      </div>
      
      <p>Your cancellation request is currently being reviewed by our team. We will notify you once a decision has been made.</p>
      
      <p>If you have any questions, please don't hesitate to contact our customer support.</p>
      
      <p>Thank you for your patience.</p>
      
      <p>Best regards,<br>The Uniformat Team</p>
    </div>
  `;
  
  const text = `
    Cancellation Request Received - Order #${orderNumber}
    
    Dear ${customerName || 'Customer'},
    
    We have received your cancellation request for Order #${orderNumber} (Amount: ₹${orderAmount.toFixed(2)}).
    
    Cancellation Reason: ${cancellationReason}
    
    Your request is being reviewed and you will be notified once a decision has been made.
    
    Thank you for your patience.
    
    Best regards,
    The Uniformat Team
  `;
  
  return {
    to: customerEmail,
    subject,
    html,
    text
  };
}

/**
 * Generate email content for cancellation request approved
 */
export function generateCancellationApprovedEmail(data: CancellationEmailData): EmailNotificationData {
  const { customerEmail, customerName, orderNumber, orderAmount, refundAmount, adminNotes } = data;
  
  const subject = `Cancellation Approved - Order #${orderNumber}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #28a745;">Cancellation Request Approved</h2>
      
      <p>Dear ${customerName || 'Customer'},</p>
      
      <p>Your cancellation request has been <strong style="color: #28a745;">approved</strong>.</p>
      
      <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
        <h3 style="margin-top: 0; color: #155724;">Order Details</h3>
        <p><strong>Order Number:</strong> #${orderNumber}</p>
        <p><strong>Original Amount:</strong> ₹${orderAmount.toFixed(2)}</p>
        ${refundAmount ? `<p><strong>Refund Amount:</strong> ₹${refundAmount.toFixed(2)}</p>` : ''}
        <p><strong>Status:</strong> Cancelled</p>
      </div>
      
      ${refundAmount ? `
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <h4 style="margin-top: 0; color: #856404;">Refund Information</h4>
          <p>A refund of ₹${refundAmount.toFixed(2)} will be processed to your original payment method within 3-7 business days.</p>
        </div>
      ` : ''}
      
      ${adminNotes ? `
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #333;">Additional Notes</h4>
          <p>${adminNotes}</p>
        </div>
      ` : ''}
      
      <p>If you have any questions about your refund or need further assistance, please contact our customer support.</p>
      
      <p>Thank you for choosing Uniformat.</p>
      
      <p>Best regards,<br>The Uniformat Team</p>
    </div>
  `;
  
  const text = `
    Cancellation Request Approved - Order #${orderNumber}
    
    Dear ${customerName || 'Customer'},
    
    Your cancellation request has been APPROVED.
    
    Order Details:
    - Order Number: #${orderNumber}
    - Original Amount: ₹${orderAmount.toFixed(2)}
    ${refundAmount ? `- Refund Amount: ₹${refundAmount.toFixed(2)}` : ''}
    - Status: Cancelled
    
    ${refundAmount ? `A refund of ₹${refundAmount.toFixed(2)} will be processed within 3-7 business days.` : ''}
    
    ${adminNotes ? `Additional Notes: ${adminNotes}` : ''}
    
    Thank you for choosing Uniformat.
    
    Best regards,
    The Uniformat Team
  `;
  
  return {
    to: customerEmail,
    subject,
    html,
    text
  };
}

/**
 * Generate email content for cancellation request rejected
 */
export function generateCancellationRejectedEmail(data: CancellationEmailData): EmailNotificationData {
  const { customerEmail, customerName, orderNumber, orderAmount, adminNotes } = data;
  
  const subject = `Cancellation Request Update - Order #${orderNumber}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc3545;">Cancellation Request Update</h2>
      
      <p>Dear ${customerName || 'Customer'},</p>
      
      <p>After careful review, we are unable to approve your cancellation request for the following order:</p>
      
      <div style="background-color: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
        <h3 style="margin-top: 0; color: #721c24;">Order Details</h3>
        <p><strong>Order Number:</strong> #${orderNumber}</p>
        <p><strong>Order Amount:</strong> ₹${orderAmount.toFixed(2)}</p>
        <p><strong>Status:</strong> Active (No changes)</p>
      </div>
      
      ${adminNotes ? `
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #333;">Reason for Decision</h4>
          <p>${adminNotes}</p>
        </div>
      ` : ''}
      
      <p>Your order will continue to be processed as normal. You can track your order status in your account.</p>
      
      <p>If you have any questions or concerns about this decision, please contact our customer support team.</p>
      
      <p>Thank you for your understanding.</p>
      
      <p>Best regards,<br>The Uniformat Team</p>
    </div>
  `;
  
  const text = `
    Cancellation Request Update - Order #${orderNumber}
    
    Dear ${customerName || 'Customer'},
    
    We are unable to approve your cancellation request for Order #${orderNumber}.
    
    Order Details:
    - Order Number: #${orderNumber}
    - Order Amount: ₹${orderAmount.toFixed(2)}
    - Status: Active (No changes)
    
    ${adminNotes ? `Reason: ${adminNotes}` : ''}
    
    Your order will continue to be processed as normal.
    
    If you have questions, please contact our customer support.
    
    Best regards,
    The Uniformat Team
  `;
  
  return {
    to: customerEmail,
    subject,
    html,
    text
  };
}

/**
 * Send email notification (placeholder implementation)
 * Replace this with your actual email service integration
 */
export async function sendCancellationEmail(emailData: EmailNotificationData): Promise<boolean> {
  try {
    // TODO: Integrate with your email service (SendGrid, AWS SES, etc.)
    console.log('Sending cancellation email:', {
      to: emailData.to,
      subject: emailData.subject,
      // Don't log the full content for security
    });
    
    // For now, just log the email content
    // In production, replace this with actual email sending logic
    
    return true;
  } catch (error) {
    console.error('Error sending cancellation email:', error);
    return false;
  }
}
