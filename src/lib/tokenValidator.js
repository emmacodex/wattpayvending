// Token validation utilities for electricity tokens
export const tokenValidator = {
  // Validate token format (Nigerian electricity tokens are typically 20 digits)
  validateTokenFormat: (token) => {
    // Remove spaces and dashes
    const cleanToken = token.replace(/[\s-]/g, '')
    
    // Check if token is 20 digits
    if (!/^\d{20}$/.test(cleanToken)) {
      return { valid: false, error: 'Token must be 20 digits' }
    }
    
    return { valid: true, cleanToken }
  },

  // Validate token checksum (basic validation)
  validateChecksum: (token) => {
    const cleanToken = token.replace(/[\s-]/g, '')
    
    if (cleanToken.length !== 20) {
      return { valid: false, error: 'Invalid token length' }
    }
    
    // Basic checksum validation (this is a simplified version)
    // In a real app, you'd implement the actual DISCO token validation algorithm
    const digits = cleanToken.split('').map(Number)
    const sum = digits.reduce((acc, digit) => acc + digit, 0)
    
    // Simple checksum: sum should be divisible by 10
    if (sum % 10 !== 0) {
      return { valid: false, error: 'Invalid token checksum' }
    }
    
    return { valid: true }
  },

  // Format token for display
  formatToken: (token) => {
    const cleanToken = token.replace(/[\s-]/g, '')
    if (cleanToken.length === 20) {
      return `${cleanToken.slice(0, 4)}-${cleanToken.slice(4, 8)}-${cleanToken.slice(8, 12)}-${cleanToken.slice(12, 16)}-${cleanToken.slice(16, 20)}`
    }
    return token
  },

  // Generate a realistic token (for demo purposes)
  generateToken: () => {
    // Generate 20 random digits
    let token = ''
    for (let i = 0; i < 20; i++) {
      token += Math.floor(Math.random() * 10)
    }
    
    // Ensure checksum is valid
    const digits = token.split('').map(Number)
    const sum = digits.reduce((acc, digit) => acc + digit, 0)
    
    // Adjust last digit to make checksum valid
    const lastDigit = (10 - (sum % 10)) % 10
    token = token.slice(0, -1) + lastDigit
    
    return tokenValidator.formatToken(token)
  },

  // Validate token with DISCO API (simulated)
  validateWithDisco: async (token, discoCode) => {
    try {
      // Simulate API call to DISCO
      const response = await fetch(`/api/validate-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token.replace(/[\s-]/g, ''),
          disco: discoCode,
        }),
      })

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Token validation failed:', error)
      return { valid: false, error: 'Validation service unavailable' }
    }
  }
}
