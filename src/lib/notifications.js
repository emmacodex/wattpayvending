// Notification system for PowerVend app
export const notifications = {
  // Send SMS notification
  sendSMS: async (phoneNumber, message) => {
    try {
      const response = await fetch('/api/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: phoneNumber,
          message: message,
        }),
      })

      const result = await response.json()
      return result
    } catch (error) {
      console.error('SMS sending failed:', error)
      return { success: false, error: error.message }
    }
  },

  // Send email notification
  sendEmail: async (email, subject, message) => {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          subject: subject,
          message: message,
        }),
      })

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Email sending failed:', error)
      return { success: false, error: error.message }
    }
  },

  // Send transaction notification
  sendTransactionNotification: async (user, transaction) => {
    const message = `PowerVend: Your electricity token purchase was successful!
    
Token: ${transaction.token}
Amount: ₦${transaction.amount.toLocaleString()}
DISCO: ${transaction.disco_name}
Meter: ${transaction.meter_number}
Date: ${new Date(transaction.created_at).toLocaleString()}

Thank you for using PowerVend!`

    // Send SMS if phone number is available
    if (user.phone) {
      await notifications.sendSMS(user.phone, message)
    }

    // Send email if email is available
    if (user.email) {
      await notifications.sendEmail(
        user.email,
        'PowerVend - Transaction Successful',
        message
      )
    }
  },

  // Send low balance notification
  sendLowBalanceNotification: async (user, balance) => {
    const message = `PowerVend: Your wallet balance is low (₦${balance.toLocaleString()}). 
Please top up to continue purchasing electricity tokens.`

    if (user.phone) {
      await notifications.sendSMS(user.phone, message)
    }

    if (user.email) {
      await notifications.sendEmail(
        user.email,
        'PowerVend - Low Balance Alert',
        message
      )
    }
  }
}
