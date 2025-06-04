import {
  Button,
  Container,
  Form,
  FormField,
  Header,
  Input,
  SpaceBetween,
  Spinner,
} from "@cloudscape-design/components";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLoginResponse } from "../api/api";
import { FullPageCenteredBoxLayout } from "../components/FullPageCenteredBoxLayout";
import { LoginSuccess } from "../api/auto-generated-client";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  async function signIn() {
    if (username.length === 0) {
      setErrorMessage("Username cannot be blank!");
      return;
    }
    if (password.length === 0) {
      setErrorMessage("Password cannot be blank!");
      return;
    }
    setIsLoading(true);
    try {
      const { response } = await getLoginResponse(username, password);
      if (response.isValid) {
        const responseSuccess = response as LoginSuccess;
        localStorage.setItem("userId", responseSuccess.userId);
        localStorage.setItem("username", responseSuccess.username);
        localStorage.setItem("password", password);
        localStorage.setItem("role", responseSuccess.role);
        navigate(`/home/${responseSuccess.userId}`);
      } else {
        setErrorMessage("Incorrect Username or password!");
      }
    } catch (error) {
      console.log("error occurred during login: ", error);
      setErrorMessage("Internal Server error occurred!");
    }

    setIsLoading(false);
  }

  return (
    <FullPageCenteredBoxLayout width={400} height={400}>
      <Container
        header={
          <Header
            actions={
              <Button
                onClick={() => {
                  navigate("/register");
                }}
              >
                Register
              </Button>
            }
          >
            Login
          </Header>
        }
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <Form
            actions={
              <SpaceBetween direction="horizontal" size="xs">
                {isLoading ? <Spinner /> : null}

                <Button formAction="none" variant="link">
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    signIn();
                  }}
                >
                  Submit
                </Button>
              </SpaceBetween>
            }
            errorText={errorMessage}
          >
            <SpaceBetween direction="vertical" size="l">
              <FormField label="Username">
                <Input
                  value={username}
                  onChange={({ detail }) => {
                    setUsername(detail.value);
                    setErrorMessage("");
                  }}
                />
              </FormField>
              <FormField label="Password">
                <Input
                  value={password}
                  onChange={({ detail }) => {
                    setPassword(detail.value);
                    setErrorMessage("");
                  }}
                  type="password"
                />
              </FormField>
            </SpaceBetween>
          </Form>
        </form>
      </Container>
    </FullPageCenteredBoxLayout>
  );
}

export default Login;
