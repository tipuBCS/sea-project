import { useState } from "react";
import { FullPageCenteredBoxLayout } from "../components/FullPageCenteredBoxLayout";
import {
  Button,
  Container,
  Form,
  FormField,
  Grid,
  Header,
  Input,
  RadioGroup,
  SpaceBetween,
  Spinner,
} from "@cloudscape-design/components";
import { Navigate, useNavigate } from "react-router-dom";
import { registerAPI } from "../api/api";
import "../helper/signIn.css";

function Register() {
  const [username, setUsername] = useState("");
  const [usernameErrorMessage, setUsernameErrorMessage] = useState("");
  const [password, setPassword] = useState("");
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
  const [password2, setPassword2] = useState("");
  const [password2ErrorMessage, setPassword2ErrorMessage] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [role, setRole] = useState("User");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  function getUsernameErrors(): string[] {
    const errorList = [];
    // Check username entered
    if (username.length === 0) {
      // setUsernameErrorMessage('USername cant be empty', "")
      errorList.push("Username cannot be blank!");
    }

    // Check Length
    if (username.length < 3 || username.length > 30) {
      errorList.push("Username must be between 3-30 characters!");
    }

    // Check allowed characters
    const allowedCharsRegex = /^[a-zA-Z0-9._-]+$/;
    if (!allowedCharsRegex.test(username)) {
      errorList.push(
        "Username can only contain letters, numbers, dots, underscores, and hyphens"
      );
    }

    // Check if username starts with a letter (optional)
    if (!/^[a-zA-Z]/.test(username)) {
      errorList.push("Username must start with a letter");
    }
    return errorList;
  }

  function getPasswordErrors(): string[] {
    const errorList = [];
    // Check password entered
    if (password.length === 0) {
      errorList.push("Password cannot be blank!");
    }

    // Check Length
    if (password.length < 8 || password.length > 30) {
      errorList.push("Password must be between 8-30 characters!");
    }

    // Has one uppercase character
    const hasUpperCase = password
      .split("")
      .some((char) => char >= "A" && char <= "Z");
    if (!hasUpperCase) {
      errorList.push("Password musts have at least one uppercase character");
    }

    // Has one lowercase character
    const hasLowerCase = password
      .split("")
      .some((char) => char >= "a" && char <= "z");
    if (!hasLowerCase) {
      errorList.push("Password musts have at least one lowercase character");
    }

    // Contains number
    if (!/\d/.test(password)) {
      errorList.push("Password must contain at least one number");
    }

    // Check allowed characters
    const allowedPassCharsRegex = /^[a-zA-Z0-9._-]+$/;
    if (!allowedPassCharsRegex.test(password)) {
      errorList.push(
        "Password can only contain letters, numbers, dots, underscores, and hyphens"
      );
    }
    return errorList;
  }

  function getPassword2Errors(): string[] {
    const errorList = [];

    // Both passwords same
    if (password !== password2) {
      errorList.push("Both passwords must match!");
    }
    return errorList;
  }
  async function register() {
    const usernameErrors = getUsernameErrors();
    const passwordErrors = getPasswordErrors();
    const password2Errors = getPassword2Errors();
    setUsernameErrorMessage(usernameErrors[0]);
    setPasswordErrorMessage(passwordErrors[0]);
    setPassword2ErrorMessage(password2Errors[0]);
    if (
      usernameErrors.length > 1 ||
      passwordErrors.length > 1 ||
      password2Errors.length > 1
    ) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await registerAPI(username, password, role);
      if (response.success) {
        navigate("/home");
      } else {
        setErrorMessage("Server error occurred, please try again!");
      }
    } catch (error) {
      console.log("error occurred during register: ", error);
      setErrorMessage("Server error occurred, please try again!");
    }

    setIsLoading(false);
  }

  return (
    <FullPageCenteredBoxLayout width={600} height={600}>
      <Container
        header={
          <Header
            actions={
              <Button
                onClick={() => {
                  navigate("/login");
                }}
              >
                Login
              </Button>
            }
          >
            Register
          </Header>
        }
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <Form
            errorText={errorMessage}
            actions={
              <SpaceBetween direction="horizontal" size="xs">
                {isLoading ? <Spinner /> : null}
                <Button
                  variant="primary"
                  onClick={() => {
                    register();
                  }}
                >
                  Register
                </Button>
              </SpaceBetween>
            }
          >
            <SpaceBetween direction="vertical" size="l">
              <FormField label="Username" errorText={usernameErrorMessage}>
                <Input
                  value={username}
                  onChange={({ detail }) => {
                    setUsername(detail.value);
                    setUsernameErrorMessage("");
                  }}
                />
              </FormField>
              <FormField label="Password" errorText={passwordErrorMessage}>
                <Grid gridDefinition={[{ colspan: 11 }, { colspan: 1 }]}>
                  <Input
                    value={password}
                    onChange={({ detail }) => {
                      setPassword(detail.value);
                      setPasswordErrorMessage("");
                    }}
                    type={isPasswordVisible ? undefined : "password"}
                  />
                  <button
                    className="passwordButton"
                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  >
                    <img
                      className="passwordVisibleImage"
                      src={`../../../../${
                        isPasswordVisible
                          ? "PasswordNotVisibleIcon"
                          : "PasswordVisibleIcon"
                      }.png`}
                    ></img>
                  </button>
                </Grid>
              </FormField>
              <FormField
                label="Re-enter your Password"
                errorText={password2ErrorMessage}
              >
                <Grid gridDefinition={[{ colspan: 11 }, { colspan: 1 }]}>
                  <Input
                    value={password2}
                    onChange={({ detail }) => {
                      setPassword2(detail.value);
                      setPassword2ErrorMessage("");
                    }}
                    type={isPasswordVisible ? undefined : "password"}
                  />
                  <button
                    className="passwordButton"
                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  >
                    <img
                      className="passwordVisibleImage"
                      src={`../../../../${
                        isPasswordVisible
                          ? "PasswordNotVisibleIcon"
                          : "PasswordVisibleIcon"
                      }.png`}
                    ></img>
                  </button>
                </Grid>
              </FormField>

              <FormField label="Role">
                <RadioGroup
                  value={role}
                  items={[
                    {
                      value: "User",
                      label: "Standard User",
                      description: "Create and edit your own boards, and view boards shared by others",
                    },
                    { value: "Admin", label: "Administrator", description: "Full access: Create, edit, and manage all boards, plus user management capabilities." },
                  ]}
                  onChange={({ detail }) => {
                    console.log(detail);
                    setRole(detail.value);
                  }}
                ></RadioGroup>
              </FormField>
            </SpaceBetween>
          </Form>
        </form>
      </Container>
    </FullPageCenteredBoxLayout>
  );
}

export default Register;
