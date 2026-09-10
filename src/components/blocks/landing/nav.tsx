import { Navbar, NavLink } from "../navbar";

export default function LandingNav() {
  return (
    <Navbar>
      <NavLink href="/auth/sign-up-or-login?mode=login">Sign In</NavLink>
      <NavLink
        href="/auth/sign-up-or-login?mode=sign-up"
        className="border-transparent bg-primary text-primary-foreground hover:opacity-90"
      >
        Sign Up
      </NavLink>
    </Navbar>
  );
}