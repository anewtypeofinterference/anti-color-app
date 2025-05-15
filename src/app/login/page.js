import { getCsrfToken } from "next-auth/react";
import SignInForm from "./SignInForm";

export default async function SignInPage() {
  return (
    <>
      <SignInForm />
    </>
  );
}