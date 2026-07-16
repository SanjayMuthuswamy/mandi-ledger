// using native fetch

async function test() {
  try {
    const loginRes = await fetch('http://localhost:8000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@mandi.local', password: 'Admin@1234' })
    });
    const loginData = await loginRes.json();
    console.log('Login:', loginData);

    const token = loginData.accessToken;
    
    const stockRes = await fetch('http://localhost:8000/api/stock', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        varietyName: 'Sona Masuri',
        varietyId: 'sona',
        quantity: 100,
        price: 54,
        threshold: 2000,
        max: 10000
      })
    });
    const stockData = await stockRes.json();
    console.log('Stock response status:', stockRes.status);
    console.log('Stock Data:', stockData);
  } catch (e) {
    console.error(e);
  }
}
test();
