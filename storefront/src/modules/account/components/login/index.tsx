"use client"
import { MouseEventHandler, useActionState } from "react"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import { Checkbox, Text } from "@medusajs/ui"
import Input from "@modules/common/components/input"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import { login } from "@lib/data/customer"
import Button from "@modules/common/components/button"
import { Google } from "@medusajs/icons"
import { signIn, useSession } from "next-auth/react"
import { sdk } from "@lib/config"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Login = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(login, null)
  const loginWithGoogle = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault()
    try {
      const result = await sdk.auth.login("customer", "google", {})

      if (typeof result === "object" && result.location) {
        // redirect to Google for authentication
        window.location.href = result.location

        return
      }

      if (typeof result !== "string") {
        // result failed, show an error
        alert("Authentication failed")
        return
      }
    } catch (error) {
      console.error("Error during login with Google:", error)
    }
  }

  return (
    <div
      className="max-w-sm w-full h-full flex flex-col justify-center gap-6 my-auto"
      data-testid="login-page"
    >
      <Text className="text-4xl text-neutral-950 text-left">
        Log in for faster
        <br />
        checkout.
      </Text>
      <form className="w-full" action={formAction}>
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label="Email"
            name="email"
            type="email"
            title="Enter a valid email address."
            autoComplete="email"
            required
            data-testid="email-input"
          />
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            data-testid="password-input"
          />
          <div className="flex flex-col w-full border-b border-neutral-200 my-6" />
          <div className="flex items-center gap-2">
            <Checkbox name="remember_me" data-testid="remember-me-checkbox" />
            <Text className="text-neutral-950 text-base-regular">
              Remember me
            </Text>
          </div>
        </div>
        <ErrorMessage error={message} data-testid="login-error-message" />
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <SubmitButton data-testid="sign-in-button" className="w-full mt-6">
              Log in
            </SubmitButton>
            <Button
              variant="secondary"
              onClick={loginWithGoogle}
              // onClick={() =>
              //   signIn("google", { callbackUrl: "/googleCallBack" })
              // }
              className="w-full h-10 relative overflow-hidden rounded-full bg-white text-black"
              data-testid="google-button"
            >
              <div className="flex items-center justify-center gap-2">
                Sign in with Google
                <Google />
              </div>
            </Button>
            <Button
              variant="secondary"
              onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
              className="w-full h-10"
              data-testid="register-button"
            >
              Register
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default Login
