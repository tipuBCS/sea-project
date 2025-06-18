import pytest
from unittest.mock import Mock, patch
from fastapi import HTTPException
from ..routes.tasks import doesUserHavePermissionToTask, TaskTableModel

# First, create some fixtures for common test data
@pytest.fixture
def mock_user_admin():
    return Mock(userId="admin123", username="admin", role="Admin")  # admin role


@pytest.fixture
def mock_user_regular():
    return Mock(userId="user123", username="user", role="User")  # user role


@pytest.fixture
def mock_task():
    return Mock(taskId="task123", userId="user123", name="Test Task")


class MockResultIterator:
    def __init__(self, items):
        self.items = items

    def __iter__(self):
        return iter(self.items)


# Now create the tests
@pytest.mark.asyncio  # Mark as async test
class TestUserTaskPermissions:

    @pytest.mark.parametrize(
        "username,password", [("admin", "validpass"), ("user", "validpass")]
    )
    async def test_invalid_login(self, username, password):
        """Test that invalid login credentials raise HTTPException"""
        # Mock the login validation to return False
        with patch("app.routes.users.isLoginValid", return_value=False):
            with pytest.raises(HTTPException) as exc_info:
                await doesUserHavePermissionToTask(username, password, "task123")
            assert exc_info.value.status_code == 500
            assert exc_info.value.detail == "Login was invalid"

    async def test_admin_always_has_access(self, mock_user_admin):
        """Test that admin users always have access"""
        # Mock the necessary functions
        with patch("app.routes.users.isLoginValid", return_value=True), patch(
            "app.routes.users.getUserByUsername", return_value=mock_user_admin
        ):

            result = await doesUserHavePermissionToTask(
                mock_user_admin.username, "validpass", "any_task_id"
            )
            assert result is True

    async def test_user_has_access_to_own_task(self, mock_user_regular, mock_task):
        """Test that regular users have access to their own tasks"""
        # Create a mock task that's owned by the user
        mock_task = Mock(
            taskId="task123",
            userId=mock_user_regular.userId,  # Make sure this matches the user's ID
        )

        # Create MockResultIterator with the task
        mock_results = MockResultIterator([mock_task])

        with patch("app.routes.users.isLoginValid", return_value=True), patch(
            "app.routes.users.getUserByUsername", return_value=mock_user_regular
        ), patch.object(TaskTableModel, "taskId_index") as mock_index:

            mock_index.query.return_value = mock_results

            result = await doesUserHavePermissionToTask(
                mock_user_regular.username, "validpass", mock_task.taskId
            )
            assert result is True

    async def test_user_no_access_to_others_task(self, mock_user_regular):
        """Test that regular users don't have access to others' tasks"""
        # Create a mock task owned by someone else
        other_task = Mock(
            taskId="task123",
            userId="different_user_id",  # Different from mock_user_regular.userId
        )

        # Create MockResultIterator with the task
        mock_results = MockResultIterator([other_task])

        with patch("app.routes.users.isLoginValid", return_value=True), patch(
            "app.routes.users.getUserByUsername", return_value=mock_user_regular
        ), patch.object(TaskTableModel, "taskId_index") as mock_index:

            mock_index.query.return_value = mock_results

            result = await doesUserHavePermissionToTask(
                mock_user_regular.username, "validpass", "task123"
            )
            assert result is False

    async def test_task_not_found(self, mock_user_regular):
        """Test behavior when task is not found"""
        # Create MockResultIterator with no tasks
        mock_results = MockResultIterator([])

        with patch("app.routes.users.isLoginValid", return_value=True), patch(
            "app.routes.users.getUserByUsername", return_value=mock_user_regular
        ), patch.object(TaskTableModel, "taskId_index") as mock_index:

            mock_index.query.return_value = mock_results

            result = await doesUserHavePermissionToTask(
                mock_user_regular.username, "validpass", "nonexistent_task"
            )
            assert result is False
