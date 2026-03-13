import pytest
from unittest.mock import patch, MagicMock


class TestGenerateEndpoint:
    def test_generate_requires_auth(self, client):
        response = client.post(
            "/api/v1/generate/",
            json={
                "name": "Test App",
                "prompt": "A simple counter app",
                "framework": "react",
            },
        )
        assert response.status_code == 401

    def test_generate_validates_prompt_length(self, client, auth_headers):
        response = client.post(
            "/api/v1/generate/",
            headers=auth_headers,
            json={
                "name": "Test App",
                "prompt": "short",  # Too short, min is 10
                "framework": "react",
            },
        )
        assert response.status_code == 422

    def test_generate_validates_framework(self, client, auth_headers):
        response = client.post(
            "/api/v1/generate/",
            headers=auth_headers,
            json={
                "name": "Test App",
                "prompt": "A simple counter app with buttons",
                "framework": "invalid_framework",
            },
        )
        assert response.status_code == 422

    @patch("app.services.project.generate_code")
    def test_generate_success(self, mock_generate, client, auth_headers):
        mock_generate.return_value = "const Counter = () => { return <div>Counter</div>; };"

        response = client.post(
            "/api/v1/generate/",
            headers=auth_headers,
            json={
                "name": "Counter App",
                "prompt": "A simple counter app with increment and decrement buttons",
                "framework": "react",
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Counter App"
        assert data["status"] == "completed"
        assert data["generated_code"] is not None
        assert "Counter" in data["generated_code"]

    @patch("app.services.project.generate_code")
    def test_generate_failure(self, mock_generate, client, auth_headers):
        mock_generate.side_effect = Exception("API Error")

        response = client.post(
            "/api/v1/generate/",
            headers=auth_headers,
            json={
                "name": "Failed App",
                "prompt": "A simple counter app with buttons",
                "framework": "react",
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["status"] == "failed"
        assert data["error_message"] == "API Error"


class TestListProjects:
    def test_list_projects_requires_auth(self, client):
        response = client.get("/api/v1/generate/")
        assert response.status_code == 401

    @patch("app.services.project.generate_code")
    def test_list_projects(self, mock_generate, client, auth_headers):
        mock_generate.return_value = "const App = () => <div>App</div>;"

        # Create a project first
        client.post(
            "/api/v1/generate/",
            headers=auth_headers,
            json={
                "name": "My Project",
                "prompt": "A todo list application",
                "framework": "react",
            },
        )

        response = client.get("/api/v1/generate/", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
        assert data[0]["name"] == "My Project"


class TestGetProject:
    def test_get_project_requires_auth(self, client):
        response = client.get("/api/v1/generate/1")
        assert response.status_code == 401

    def test_get_nonexistent_project(self, client, auth_headers):
        response = client.get("/api/v1/generate/9999", headers=auth_headers)
        assert response.status_code == 404

    @patch("app.services.project.generate_code")
    def test_get_project_success(self, mock_generate, client, auth_headers):
        mock_generate.return_value = "const App = () => <div>App</div>;"

        # Create a project first
        create_response = client.post(
            "/api/v1/generate/",
            headers=auth_headers,
            json={
                "name": "Get Test Project",
                "prompt": "A simple landing page",
                "framework": "react",
            },
        )
        project_id = create_response.json()["id"]

        response = client.get(f"/api/v1/generate/{project_id}", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Get Test Project"
        assert data["id"] == project_id
