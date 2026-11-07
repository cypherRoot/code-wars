import { Link } from 'react-router';
import page from './page.module.css';

export function NotFound() {
  return (
    <div className={`${page.page} ${page.narrow}`}>
      <header className={page.head}>
        <p className="label">404</p>
        <h1>No rows returned.</h1>
        <p className={page.lede}>That page doesn’t exist — maybe a lesson was renamed.</p>
      </header>
      <div>
        <Link to="/" className="btn btn-primary">
          Back to Today
        </Link>
      </div>
    </div>
  );
}
