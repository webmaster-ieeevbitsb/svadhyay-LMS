import { Metadata } from "next";
import LoginPageContent from "./login-client";

export const metadata: Metadata = {
  robots: {
    index: true,
    follow: true,
  },
};

export default function LoginPage() {
  return <LoginPageContent />;
}
