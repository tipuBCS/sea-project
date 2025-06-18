import pytest
from ..routes.users import is_username_valid, is_password_valid, name_proper_case, isRoleValid, Roles


class TestUsernameValidation:
    def test_empty_username(self):
        is_valid, errors = is_username_valid("")
        assert not is_valid
        assert "Username cannot be blank!" in errors

    def test_username_too_short(self):
        is_valid, errors = is_username_valid("ab")
        assert not is_valid
        assert "Username must be between 3-30 characters!" in errors

    def test_username_too_long(self):
        is_valid, errors = is_username_valid("a" * 31)
        assert not is_valid
        assert "Username must be between 3-30 characters!" in errors

    def test_invalid_characters(self):
        is_valid, errors = is_username_valid("user@name")
        assert not is_valid
        assert (
            "Username can only contain letters, numbers, dots, underscores, and hyphens"
            in errors
        )

    def test_starts_with_number(self):
        is_valid, errors = is_username_valid("1username")
        assert not is_valid
        assert "Username must start with a letter" in errors

    def test_valid_username(self):
        is_valid, errors = is_username_valid("validUsername123")
        assert is_valid
        assert len(errors) == 0


class TestPasswordValidation:
    def test_empty_password(self):
        is_valid, errors = is_password_valid("")
        assert not is_valid
        assert "Password cannot be blank!" in errors

    def test_password_too_short(self):
        is_valid, errors = is_password_valid("Short1")
        assert not is_valid
        assert "Password must be between 8-30 characters!" in errors

    def test_password_too_long(self):
        is_valid, errors = is_password_valid("L" * 31)
        assert not is_valid
        assert "Password must be between 8-30 characters!" in errors

    def test_no_uppercase(self):
        is_valid, errors = is_password_valid("lowercase123")
        assert not is_valid
        assert "Password must have at least one uppercase character" in errors

    def test_no_lowercase(self):
        is_valid, errors = is_password_valid("UPPERCASE123")
        assert not is_valid
        assert "Password must have at least one lowercase character" in errors

    def test_no_numbers(self):
        is_valid, errors = is_password_valid("NoNumbersHere")
        assert not is_valid
        assert "Password must contain at least one number" in errors

    def test_invalid_characters(self):
        is_valid, errors = is_password_valid("Password@123")
        assert not is_valid
        assert (
            "Password can only contain letters, numbers, dots, underscores, and hyphens"
            in errors
        )

    def test_valid_password(self):
        is_valid, errors = is_password_valid("ValidPassword123")
        assert is_valid
        assert len(errors) == 0

class TestNameProperCase:
    def test_empty_string(self):
        """Test that empty string returns empty string"""
        assert name_proper_case("") == ""

    def test_none_value(self):
        """Test that None returns None"""
        assert name_proper_case("") == ""

    def test_single_word(self):
        """Test single word is capitalized correctly"""
        assert name_proper_case("john") == "John"
        assert name_proper_case("JOHN") == "John"
        assert name_proper_case("jOhN") == "John"

    def test_multiple_words(self):
        """Test multiple words are capitalized correctly"""
        assert name_proper_case("john doe") == "John Doe"
        assert name_proper_case("JOHN DOE") == "John Doe"
        assert name_proper_case("jOhN dOe") == "John Doe"

    def test_extra_spaces(self):
        """Test handling of extra spaces"""
        assert name_proper_case("john   doe") == "John Doe"
        assert name_proper_case("   john   doe   ") == "John Doe"

    def test_special_characters(self):
        """Test names with special characters or numbers"""
        assert name_proper_case("mary-jane") == "Mary-jane"
        assert name_proper_case("jean-pierre") == "Jean-pierre"
        assert name_proper_case("o'connor") == "O'connor"

    def test_mixed_case_with_spaces(self):
        """Test mixed case inputs with various spacing"""
        assert name_proper_case("jOhN dOe sMiTh") == "John Doe Smith"
        assert name_proper_case("MARY   JANE    WATSON") == "Mary Jane Watson"

class TestValidRole:
    def test_valid_admin_role(self):
        """Test that admin role is valid regardless of case"""
        assert isRoleValid(Roles.ADMIN.value) == True
        assert isRoleValid("admin") == True
        assert isRoleValid("adMin") == True
        assert isRoleValid("ADMIN") == True

    def test_valid_user_role(self):
        """Test that user role is valid regardless of case"""
        assert isRoleValid(Roles.USER.value) == True
        assert isRoleValid("user") == True
        assert isRoleValid("uSEr") == True
        assert isRoleValid("USER") == True

    def test_invalid_roles(self):
        """Test that invalid roles return False"""
        assert isRoleValid("SUPERADMIN") == False
        assert isRoleValid("MODERATOR") == False
        assert isRoleValid("") == False
        assert isRoleValid("random") == False
        assert isRoleValid("123456") == False

    def test_enum_values(self):
        """Test that enum values are correct"""
        assert Roles.USER.value == "USER"
        assert Roles.ADMIN.value == "ADMIN"