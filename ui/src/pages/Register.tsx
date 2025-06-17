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
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerAPI } from "../api/api";
import { FullPageCenteredBoxLayout } from "../components/FullPageCenteredBoxLayout";
import "../helper/signIn.css";
import { toast } from "react-toastify";

function Register() {
  const [firstname, setFirstname] = useState("");
  const [firstnameErrorMessage, setFirstnameErrorMessage] = useState("");
  const [lastname, setLastname] = useState("");
  const [lastnameErrorMessage, setLastnameErrorMessage] = useState("");
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

  function getNameErrors(
    text: string,
    firstOrLast: "First" | "Last"
  ): string[] {
    const errorList = [];

    // Check if first name is entered
    if (text.length === 0) {
      errorList.push(`${firstOrLast} name cannot be blank!`);
    }

    // Check Length (assuming reasonable name length limits)
    if (text.length > 50) {
      errorList.push(`${firstOrLast} name cannot exceed 50 characters!`);
    }

    // Check for valid characters (letters, spaces, hyphens, and apostrophes for names like O'Connor or Mary-Jane)
    const allowedCharsRegex = /^[a-zA-Z\s'-]+$/;
    if (!allowedCharsRegex.test(text)) {
      errorList.push(
        `${firstOrLast} name can only contain letters, spaces, hyphens, and apostrophes`
      );
    }

    // Check if first name starts with a letter
    if (!/^[a-zA-Z]/.test(text)) {
      errorList.push(`${firstOrLast} name must start with a letter`);
    }

    // Check for minimum length (assuming 2 characters minimum)
    if (text.length < 2) {
      errorList.push(`${firstOrLast} name must be at least 2 characters long`);
    }

    return errorList;
  }

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
    const firstnameErrors = getNameErrors(firstname, "First");
    const lastnameErrors = getNameErrors(lastname, "Last");
    const usernameErrors = getUsernameErrors();
    const passwordErrors = getPasswordErrors();
    const password2Errors = getPassword2Errors();
    setFirstnameErrorMessage(firstnameErrors[0]);
    setLastnameErrorMessage(lastnameErrors[0]);
    setUsernameErrorMessage(usernameErrors[0]);
    setPasswordErrorMessage(passwordErrors[0]);
    setPassword2ErrorMessage(password2Errors[0]);
    if (
      firstnameErrors.length > 0 ||
      lastnameErrors.length > 0 ||
      usernameErrors.length > 0 ||
      passwordErrors.length > 0 ||
      password2Errors.length > 0
    ) {
      console.log("There was at least one error");
      return;
    }

    setIsLoading(true);
    const loadingToast = toast("Creating your account ..", { type: "success" });
    try {
      const response = await registerAPI(
        firstname,
        lastname,
        username,
        password,
        role
      );
      if (response.success) {
        toast.update(loadingToast, {
          render: "Registration Successful!",
          type: "success",
          isLoading: false,
          autoClose: 2000,
        });
        toast("Registration Successful!", { type: "success" });
        navigate("/login");
      } else {
        toast.update(loadingToast, {
          render: "Registration Failed!",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
        setErrorMessage("Server error occurred, please try again!");
      }
    } catch (error) {
      toast.update(loadingToast, {
        render: `Registration Failed! Error: ${error}`, // Show first error
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
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
                {isLoading ? <Spinner size={"large"} /> : null}
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
              <FormField label="First Name" errorText={firstnameErrorMessage}>
                <Input
                  value={firstname}
                  onChange={({ detail }) => {
                    setFirstname(detail.value);
                    setFirstnameErrorMessage("");
                  }}
                />
              </FormField>
              <FormField label="Last Name" errorText={lastnameErrorMessage}>
                <Input
                  value={lastname}
                  onChange={({ detail }) => {
                    setLastname(detail.value);
                    setLastnameErrorMessage("");
                  }}
                />
              </FormField>

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
                      description:
                        "Create and edit your own boards, and view boards shared by others",
                    },
                    {
                      value: "Admin",
                      label: "Administrator",
                      description:
                        "Full access: Create, edit, and manage all boards, plus user management capabilities.",
                    },
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
