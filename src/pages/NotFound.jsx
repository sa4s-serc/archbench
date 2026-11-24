import { Link } from "react-router-dom";
import { Container } from "../components/ui";

export default function NotFound() {
  return (
    <Container className="py-24">
      <p className="num text-[14px] text-base-content/60">404</p>
      <h1 className="font-bold mt-2 text-3xl font-extrabold leading-tight">This page does not exist</h1>
      <p className="mt-3 max-w-[60ch] text-[16px] text-base-content/75">
        The link may point to an older version of the site. Every leaderboard now has its own page.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link to="/" className="rounded-md bg-base-content px-4 py-2 text-[14px] text-base-100">Home</Link>
        <Link to="/leaderboard/adr" className="rounded-md border border-base-300 px-4 py-2 text-[14px] hover:bg-base-200">Leaderboards</Link>
      </div>
    </Container>
  );
}
