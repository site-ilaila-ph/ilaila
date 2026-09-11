import { Navbar, NavLink } from "../navbar";

export default function LandingNav() {
  return (
    <Navbar>
      <NavLink href="/auth/sign-up-or-login?mode=login">Mag Sign in</NavLink>
      <NavLink
        href="/auth/sign-up-or-login?mode=sign-up"
        className="border-transparent bg-primary text-primary-foreground hover:opacity-90"
      >
        Mag Sign up
      </NavLink>
    </Navbar>
  );
}