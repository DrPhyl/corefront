import pytest


class TestRegister:
    def test_register_success(self, client, test_user_data):
        response = client.post("/api/v1/auth/register", json=test_user_data)
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == test_user_data["email"]
        assert data["full_name"] == test_user_data["full_name"]
        assert "id" in data
        assert "hashed_password" not in data

    def test_register_duplicate_email(self, client, registered_user):
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": registered_user["email"],
                "password": "anotherpassword",
            },
        )
        assert response.status_code == 400
        assert "already exists" in response.json()["detail"]

    def test_register_invalid_email(self, client):
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "invalid-email",
                "password": "testpassword123",
            },
        )
        assert response.status_code == 422


class TestLogin:
    def test_login_success(self, client, registered_user):
        response = client.post(
            "/api/v1/auth/login",
            data={
                "username": registered_user["email"],
                "password": registered_user["password"],
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_login_wrong_password(self, client, registered_user):
        response = client.post(
            "/api/v1/auth/login",
            data={
                "username": registered_user["email"],
                "password": "wrongpassword",
            },
        )
        assert response.status_code == 401
        assert "Incorrect" in response.json()["detail"]

    def test_login_nonexistent_user(self, client):
        response = client.post(
            "/api/v1/auth/login",
            data={
                "username": "nonexistent@example.com",
                "password": "anypassword",
            },
        )
        assert response.status_code == 401


class TestGetCurrentUser:
    def test_get_me_authenticated(self, client, auth_headers, registered_user):
        response = client.get("/api/v1/auth/me", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == registered_user["email"]
        assert data["full_name"] == registered_user["full_name"]

    def test_get_me_unauthenticated(self, client):
        response = client.get("/api/v1/auth/me")
        assert response.status_code == 401

    def test_get_me_invalid_token(self, client):
        response = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": "Bearer invalid-token"},
        )
        assert response.status_code == 401


class TestHealthCheck:
    def test_health_check(self, client):
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "healthy"}
