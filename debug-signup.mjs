const payload = JSON.stringify({ email: 'debug@example.com', password: 'password123' });

fetch('http://127.0.0.1:3000/api/auth/sign-up', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: payload,
})
  .then(async (response) => {
    const text = await response.text();
    console.log('status:', response.status);
    console.log('body:', text);
  })
  .catch((error) => {
    console.error('fetch error:', error);
  });
