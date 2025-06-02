import { useState } from "react";
import { FullPageCenteredBoxLayout } from "../components/FullPageCenteredBoxLayout";
import {
  Button,
  Container,
  Form,
  FormField,
  Header,
  Input,
  SpaceBetween,
} from "@cloudscape-design/components";
import { Navigate, useNavigate } from "react-router-dom";
import { registerAPI } from "../api/api";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const navigate = useNavigate();

  async function register() {
    const response = await registerAPI(username, password);
    console.log(response);
  }

  return (
    <FullPageCenteredBoxLayout>
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
            actions={
              <SpaceBetween direction="horizontal" size="xs">
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
              <FormField label="Username">
                <Input
                  value={username}
                  onChange={({ detail }) => setUsername(detail.value)}
                />
              </FormField>
              <FormField label="Password">
                <Input
                  value={password}
                  onChange={({ detail }) => setPassword(detail.value)}
                  type="password"
                />
              </FormField>
              <FormField label="Re-enter your Password">
                <Input
                  value={password2}
                  onChange={({ detail }) => setPassword2(detail.value)}
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

export default Register;
