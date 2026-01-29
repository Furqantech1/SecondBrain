const axios = require('axios');

const API_URL = 'http://localhost:5000/api/auth';

async function runTest() {
    const email = `nopass_${Date.now()}@example.com`;
    // Create user WITHOUT password (simulating Google Auth user)
    // We need to match how Google Auth creates users.
    // However, the signup endpoint REQUIRES password usually?
    // Let's assume we can't key in via signup.
    // I will try to use the signup endpoint but maybe it fails?
    // Actually, let's try to signup with a password first, then DELETE the password from DB?
    // I can't easily access DB directly without mongoose script.

    // Instead, let's assume the user IS creating a normal account and it IS "accepting whatever".
    // Wait, the previous test PASSED (rejected wrong password).
    // This means for a NORMAL user, it works.

    // Maybe the user is sending a request that confuses the backend?
    // What if password is sent as something else?

    // Let's try to create a user via a script interacting with Mongoose directly to simulate a google user.
    // But I can't import mongoose and connect easily in this script without setup.

    // Let's try different "wrong" passwords or empty password.

    const email2 = `test_empty_${Date.now()}@example.com`;
    const password = 'realpassword';

    console.log(`1. Registering: ${email2}`);
    await axios.post(`${API_URL}/signup`, { email: email2, password });

    console.log(`2. Login with EMPTY password`);
    try {
        const res = await axios.post(`${API_URL}/login`, { email: email2, password: '' });
        if (res.data.token) console.error('   -> [FAIL] Logged in with EMPTY password');
    } catch (e) {
        console.log('   -> [PASS] Rejected empty password');
    }

    console.log(`3. Login with NULL password`);
    try {
        const res = await axios.post(`${API_URL}/login`, { email: email2, password: null });
        if (res.data.token) console.error('   -> [FAIL] Logged in with NULL password');
    } catch (e) {
        console.log('   -> [PASS] Rejected null password');
    }
}

runTest();
