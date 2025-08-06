// Test script to verify login functionality
async function testLoginFlow() {
  console.log("Testing login flow...")

  // Test data
  const testUser = {
    email: "test@example.com",
    password: "testpass123",
    fullName: "Test User",
    phone: "1234567890",
    city: "Test City",
  }

  try {
    // 1. Test registration
    console.log("1. Testing registration...")
    const registerResponse = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: testUser.fullName,
        email: testUser.email,
        password: testUser.password,
        confirmPassword: testUser.password,
        phone: testUser.phone,
        city: testUser.city,
      }),
    })

    const registerData = await registerResponse.json()
    console.log("Registration result:", registerData)

    if (!registerResponse.ok) {
      throw new Error(`Registration failed: ${registerData.error}`)
    }

    // 2. Test login
    console.log("2. Testing login...")
    const loginResponse = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password,
      }),
    })

    const loginData = await loginResponse.json()
    console.log("Login result:", loginData)

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginData.error}`)
    }

    console.log("✅ Login flow test completed successfully!")
  } catch (error) {
    console.error("❌ Login flow test failed:", error.message)
  }
}

// Run the test
testLoginFlow()
