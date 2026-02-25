"""
API Testing Script
Quick way to test your endpoints
"""
import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_login():
    """Test login and return tokens"""
    print("=" * 50)
    print("Testing Login...")
    print("=" * 50)
    
    response = requests.post(
        f"{BASE_URL}/auth/login/",
        json={
            "email": "edwardaja750@gmail.com",
            "password": "edward_tonny_data"
        }
    )
    
    print(f"Status: {response.status_code}")
    data = response.json()
    print(json.dumps(data, indent=2))
    
    if response.status_code == 200:
        return data.get('access_token'), data.get('refresh_token')
    return None, None


def test_wallet(access_token):
    """Test wallet endpoint"""
    print("\n" + "=" * 50)
    print("Testing Wallet...")
    print("=" * 50)
    
    headers = {"Authorization": f"Bearer {access_token}"}
    
    response = requests.get(f"{BASE_URL}/wallet/", headers=headers)
    print(f"Status: {response.status_code}")
    print(json.dumps(response.json(), indent=2))


def test_initiate_payment(access_token):
    """Test payment initiation"""
    print("\n" + "=" * 50)
    print("Testing Payment Initiation...")
    print("=" * 50)
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    response = requests.post(
        f"{BASE_URL}/payment/initiate/",
        headers=headers,
        json={
            "amount": 1000,
            "gateway": "paystack",
            "transaction_type": "WALLET_FUNDING"
        }
    )
    
    print(f"Status: {response.status_code}")
    print(json.dumps(response.json(), indent=2))


def main():
    print("\n🚀 Starting API Tests...\n")
    
    # 1. Login
    access_token, refresh_token = test_login()
    
    if not access_token:
        print("\n❌ Login failed! Cannot proceed with other tests.")
        return
    
    print(f"\n✅ Got Access Token: {access_token[:50]}...")
    
    # 2. Test Wallet
    test_wallet(access_token)
    
    # 3. Test Payment
    test_initiate_payment(access_token)
    
    print("\n✅ All tests completed!\n")


if __name__ == "__main__":
    main()