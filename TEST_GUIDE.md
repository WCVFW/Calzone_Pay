#!/bin/bash
# Test Script for Recharge App

echo "🧪 Recharge App - Testing Guide"
echo "================================"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
test_endpoint() {
  local method=$1
  local url=$2
  local data=$3
  local headers=$4
  
  echo -n "Testing $method $url ... "
  
  if [ -z "$data" ]; then
    response=$(curl -s -w "\n%{http_code}" -X $method "$url" $headers)
  else
    response=$(curl -s -w "\n%{http_code}" -X $method "$url" -H "Content-Type: application/json" $headers -d "$data")
  fi
  
  http_code=$(echo "$response" | tail -n 1)
  body=$(echo "$response" | head -n -1)
  
  if [[ $http_code =~ ^[2] ]]; then
    echo -e "${GREEN}✓ ${http_code}${NC}"
    echo "$body"
  else
    echo -e "${RED}✗ ${http_code}${NC}"
    echo "$body"
  fi
  echo ""
}

echo -e "${BLUE}1. Testing API Server (http://localhost:3000)${NC}"
echo "================================================="

# Test basic endpoint
test_endpoint "GET" "http://localhost:3000" "" ""

# Test signup
echo "Testing Signup..."
test_endpoint "POST" "http://localhost:3000/api/auth/signup" \
  '{"name":"TestUser","email":"test@example.com","phone":"9876543210","password":"password123"}' ""

# Test login (adjust with actual user)
echo "Testing Login..."
test_endpoint "POST" "http://localhost:3000/api/auth/login" \
  '{"email":"test@example.com","password":"password123"}' ""

echo ""
echo -e "${BLUE}2. Database Verification${NC}"
echo "=========================="
echo "Run the following SQL to verify setup:"
echo ""
echo "mysql> SELECT COUNT(*) as user_count FROM recharge_db.users;"
echo "mysql> SELECT * FROM recharge_db.users WHERE email='test@example.com';"
echo "mysql> SELECT * FROM recharge_db.kyc WHERE user_id=1;"
echo ""

echo ""
echo -e "${BLUE}3. Manual Testing Steps${NC}"
echo "======================="
echo ""
echo "Step 1: Signup Flow"
echo "  - Go to http://localhost:5173/signup"
echo "  - Fill: Name, Email, Phone, Password"
echo "  - Click 'Create account & Continue to KYC'"
echo "  - Should redirect to /kyc"
echo ""

echo "Step 2: KYC Submission"
echo "  - Fill: Aadhaar (12 digits), PAN (10 chars), Address"
echo "  - Click 'Submit KYC'"
echo "  - See: 'KYC submitted successfully'"
echo ""

echo "Step 3: Admin Approval"
echo "  - Create admin user in database:"
echo "    INSERT INTO users (name, email, phone, password, kyc_status, role)"
echo "    VALUES ('Admin', 'admin@test.com', '9999999999', 'hashed_pwd', 'APPROVED', 'ADMIN');"
echo "  - Login with admin credentials"
echo "  - Go to http://localhost:5173/admin"
echo "  - See pending KYC in table"
echo "  - Click 'Approve' button"
echo ""

echo "Step 4: Recharge Payment"
echo "  - Logout and login as regular user"
echo "  - Go to http://localhost:5173/recharge"
echo "  - Enter mobile number: 9876543210"
echo "  - Click 'Check Plans'"
echo "  - Select a plan and click 'Pay'"
echo "  - Pay button should now be ENABLED (green)"
echo "  - Razorpay checkout should open"
echo ""

echo ""
echo -e "${BLUE}4. Verification Checklist${NC}"
echo "=========================="
echo ""
echo "Frontend:"
echo "  [ ] Signup page works and creates user"
echo "  [ ] KYC page accessible after signup"
echo "  [ ] KYC submission successful"
echo "  [ ] Navbar shows user name when logged in"
echo "  [ ] Navbar shows Admin link for admin users"
echo "  [ ] Admin dashboard shows pending KYC"
echo "  [ ] Admin can approve/reject KYC"
echo ""

echo "Backend:"
echo "  [ ] /api/auth/signup creates user with kyc_status='PENDING'"
echo "  [ ] /api/auth/login returns JWT token"
echo "  [ ] /api/auth/me returns user with is_active flag"
echo "  [ ] /api/kyc/submit updates kyc_status"
echo "  [ ] /api/admin/kyc-pending returns pending users"
echo "  [ ] /api/admin/kyc-approve updates user status"
echo ""

echo "Payment:"
echo "  [ ] /api/payment/razorpay-order returns order_id"
echo "  [ ] /api/payment/verify saves transaction"
echo "  [ ] Transaction linked to user_id"
echo ""

echo ""
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo "If all steps pass, the app is ready for production testing."
echo ""
