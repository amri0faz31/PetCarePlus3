import { Link } from "react-router-dom";

export default function Breadcrumbs({
  items,
}: {
  items: Array<{ label: string; to?: string }>;
}) {
  return (
    <nav className="text-sm text-gray-500 mb-4" aria-label="Breadcrumb">
      <ol className="flex items-center gap-2">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-2">
            {it.to ? (
              <Link to={it.to} className="hover:text-gray-900">
                {it.label}
              </Link>
            ) : (
              <span className="text-gray-900">{it.label}</span>
            )}
            {i < items.length - 1 && <span className="text-gray-300">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
