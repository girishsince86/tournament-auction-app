#!/bin/bash

# Set the base URL
BASE_URL="http://localhost:3000/api/tournaments/register"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Store registration ID
REGISTRATION_ID=""

# Function to check if a response contains an error
check_error() {
    local response=$1
    if echo "$response" | grep -q '"error"'; then
        echo -e "${RED}Error:${NC} $(echo "$response" | grep -o '"error":"[^"]*"' | cut -d'"' -f4)"
        return 1
    fi
    return 0
}

echo -e "${GREEN}1. Testing jersey number availability...${NC}"
RESPONSE=$(curl -s -X GET "$BASE_URL?jersey_number=24")
echo "$RESPONSE"

if check_error "$RESPONSE"; then
    AVAILABLE=$(echo "$RESPONSE" | grep -o '"available":[^,}]*' | cut -d':' -f2)
    if [ "$AVAILABLE" = "true" ]; then
        echo -e "${GREEN}Jersey number is available${NC}"
        
        echo -e "\n${GREEN}2. Testing tournament registration...${NC}"
        # Update the jersey number in the test registration file
        TMP_FILE=$(mktemp)
        jq '.tshirt_number = "24"' test-registration.json > "$TMP_FILE" && mv "$TMP_FILE" test-registration.json
        
        RESPONSE=$(curl -s -X POST \
            -H "Content-Type: application/json" \
            -d @test-registration.json \
            $BASE_URL)
        echo "$RESPONSE"
        
        if check_error "$RESPONSE"; then
            REGISTRATION_ID=$(echo "$RESPONSE" | grep -o '"registrationId":"[^"]*"' | cut -d'"' -f4)
            if [ ! -z "$REGISTRATION_ID" ]; then
                echo -e "${GREEN}Registration successful. ID: $REGISTRATION_ID${NC}"
                
                echo -e "\n${GREEN}3. Testing registration status...${NC}"
                RESPONSE=$(curl -s -X GET "$BASE_URL?registration_id=$REGISTRATION_ID")
                echo "$RESPONSE"
                
                check_error "$RESPONSE"
            else
                echo -e "${RED}Failed to extract registration ID${NC}"
            fi
        fi
    else
        echo -e "${RED}Jersey number is not available${NC}"
    fi
fi 