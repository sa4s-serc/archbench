import { Link } from "react-router-dom";
import { Page } from "../components/ui";

const NotFound = () => (
  <Page>
    <div className="flex max-w-xl flex-col gap-4 py-24">
      <p className="num text-sm font-medium text-ink-3">404</p>
      <h1 className="text-[32px] font-semibold leading-tight tracking-[-0.022em]">This page does not exist</h1>
      <p className="text-[17px] leading-relaxed text-ink-2">
        The link may be from an older version of the site. The results now live on the overview and on each task&apos;s page.
      </p>
      <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm">
        <Link to="/" className="link">Go to the overview</Link>
        <Link to="/tasks" className="link">Browse tasks</Link>
      </div>
    </div>
  </Page>
);

export default NotFound;
