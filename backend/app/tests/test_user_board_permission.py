import pytest
from unittest.mock import Mock, patch
from app.routes.tasks import canUserCreateTaskInBoard  # adjust import path


@pytest.mark.asyncio
class TestUserBoardPermissions:
    @pytest.fixture
    def mock_admin_user(self):
        return Mock(userId="admin123", username="admin", role="admin")  # admin role

    @pytest.fixture
    def mock_regular_user(self):
        return Mock(userId="user123", username="regular_user", role="user")  # user role

    async def test_invalid_login(self):
        """Test that invalid login credentials return False"""
        with patch("app.routes.users.isLoginValid", return_value=False):
            result = await canUserCreateTaskInBoard(
                username="any_user", password="wrong_password", boardUserId="any_board"
            )
            assert result is False

    async def test_admin_can_create_in_any_board(self, mock_admin_user):
        """Test that admin users can create tasks in any board"""
        with patch("app.routes.users.isLoginValid", return_value=True), patch(
            "app.routes.users.getUserByUsername", return_value=mock_admin_user
        ):

            result = await canUserCreateTaskInBoard(
                username=mock_admin_user.username,
                password="valid_password",
                boardUserId="any_board_id",
            )
            assert result is True

    async def test_user_can_create_in_own_board(self, mock_regular_user):
        """Test that users can create tasks in their own board"""
        with patch("app.routes.users.isLoginValid", return_value=True), patch(
            "app.routes.users.getUserByUsername", return_value=mock_regular_user
        ):

            result = await canUserCreateTaskInBoard(
                username=mock_regular_user.username,
                password="valid_password",
                boardUserId=mock_regular_user.userId,
            )
            assert result is True

    async def test_user_cannot_create_in_others_board(self, mock_regular_user):
        """Test that users cannot create tasks in others' boards"""
        with patch("app.routes.users.isLoginValid", return_value=True), patch(
            "app.routes.users.getUserByUsername", return_value=mock_regular_user
        ):

            result = await canUserCreateTaskInBoard(
                username=mock_regular_user.username,
                password="valid_password",
                boardUserId="different_user_id",
            )
            assert result is False

    async def test_empty_credentials(self):
        """Test behavior with empty credentials"""
        with patch("app.routes.users.isLoginValid", return_value=False):
            result = await canUserCreateTaskInBoard("", "", "board123")
            assert result is False

    @pytest.mark.parametrize(
        "role,expected",
        [("admin", True), ("user", False), ("invalid_role", False)],  # admin  # user
    )
    async def test_different_user_roles(self, role, expected):
        """Test behavior with different user roles"""
        mock_user = Mock(userId="user123", username="test_user", role=role)

        with patch("app.routes.users.isLoginValid", return_value=True), patch(
            "app.routes.users.getUserByUsername", return_value=mock_user
        ):

            result = await canUserCreateTaskInBoard(
                username=mock_user.username,
                password="valid_password",
                boardUserId="different_user_id",
            )
            assert result is expected
