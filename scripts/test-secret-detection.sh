#!/bin/bash

# Property Test: Secret Pattern Detection Completeness
# Feature: v1.0.2-security-audit, Property 1: Secret Pattern Detection Completeness
# Validates: Requirements 3.4
#
# For any common secret type (API key, password, token, private key),
# when a test file containing that secret type is scanned, the Security_Scanner
# should detect and report it.

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Create temporary directory for test files
TEST_DIR=$(mktemp -d)
trap "rm -rf $TEST_DIR" EXIT

echo "🧪 Property Test: Secret Pattern Detection Completeness"
echo "========================================================"
echo "Test Directory: $TEST_DIR"
echo ""

# Function to test secret detection
test_secret_detection() {
    local secret_type="$1"
    local test_content="$2"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    # Create test file
    local test_file="$TEST_DIR/test_${TOTAL_TESTS}_${secret_type}.txt"
    echo "$test_content" > "$test_file"
    
    # Run gitleaks on the test file
    local output=$(gitleaks detect --source "$test_file" --no-git --redact 2>&1)
    
    # Check if secrets were found
    if echo "$output" | grep -q "leaks found"; then
        echo -e "${GREEN}✓${NC} Test $TOTAL_TESTS: $secret_type - DETECTED"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        echo -e "${RED}✗${NC} Test $TOTAL_TESTS: $secret_type - NOT DETECTED"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

# Test 1-20: API Keys (hex format, 32+ chars)
echo "Testing API Keys (hex format)..."
for i in {1..20}; do
    api_key=$(openssl rand -hex 32)
    test_secret_detection "api_key_hex" "API_KEY=$api_key"
done

# Test 21-40: API Keys (base64 format, 32+ chars)
echo ""
echo "Testing API Keys (base64 format)..."
for i in {1..20}; do
    api_key=$(openssl rand -base64 32 | tr -d '\n')
    test_secret_detection "api_key_base64" "SECRET_KEY=$api_key"
done

# Test 41-60: Generic Secrets (various variable names)
echo ""
echo "Testing Generic Secrets..."
secret_vars=("PASSWORD" "TOKEN" "AUTH_TOKEN" "API_SECRET" "PRIVATE_KEY" "ENCRYPTION_KEY" "JWT_SECRET" "SESSION_SECRET" "DB_PASSWORD" "NEXTAUTH_SECRET")
for i in {1..20}; do
    secret=$(openssl rand -hex 32)
    var_name=${secret_vars[$((i % 10))]}
    test_secret_detection "generic_secret" "$var_name=$secret"
done

# Test 61-80: Long secrets (64+ chars)
echo ""
echo "Testing Long Secrets..."
for i in {1..20}; do
    secret=$(openssl rand -hex 64)
    test_secret_detection "long_secret" "LONG_SECRET=$secret"
done

# Test 81-100: Mixed format secrets
echo ""
echo "Testing Mixed Format Secrets..."
for i in {1..20}; do
    # Mix of alphanumeric and special chars
    secret=$(openssl rand -base64 48 | tr -d '\n' | head -c 64)
    test_secret_detection "mixed_secret" "MIXED_KEY=$secret"
done

# Summary
echo ""
echo "========================================================"
echo "Test Summary:"
echo "  Total Tests: $TOTAL_TESTS"
echo -e "  ${GREEN}Passed: $PASSED_TESTS${NC}"
echo -e "  ${RED}Failed: $FAILED_TESTS${NC}"
echo "  Success Rate: $(awk "BEGIN {printf \"%.2f\", ($PASSED_TESTS/$TOTAL_TESTS)*100}")%"
echo ""

# Property test passes if at least 95% of tests pass (allowing for some edge cases)
if [ $PASSED_TESTS -ge 95 ]; then
    echo -e "${GREEN}✓ Property Test PASSED${NC}"
    echo "Secret detection rate: $(awk "BEGIN {printf \"%.2f\", ($PASSED_TESTS/$TOTAL_TESTS)*100}")% (>= 95% required)"
    exit 0
else
    echo -e "${RED}✗ Property Test FAILED${NC}"
    echo "Secret detection rate: $(awk "BEGIN {printf \"%.2f\", ($PASSED_TESTS/$TOTAL_TESTS)*100}")% (< 95% required)"
    echo "Some secret types were not detected. Review gitleaks configuration."
    exit 1
fi
