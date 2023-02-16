/** @jsx h */
import sitemap from "./sitemap_gen.ts";
import {
  h,
  ComponentChildren,
  config,
  getSiteTitle,
  documentation,
} from "./cita.tsx";

export function Space() {
  return <span>&nbsp;</span>;
}

export type LayoutProps = {
  title?: string;
  children: ComponentChildren;
};

export function Layout({ title, children }: LayoutProps) {
  return (
    <html>
      <head>
        <title>{getSiteTitle(title)}</title>
        <link rel="stylesheet" href={"assets/style.css"} />
      </head>
      <body>
        <div className="flex-row">
          <h1>cita.tsx</h1>
          <Space />
          <small>single-file static site generator</small>
          <nav className="site-nav">
            <ul>
              <li>
                <a href={sitemap.index.path}>home</a>
              </li>
              <li>
                <a href={"https://github.com/nvlled/cita.tsx"}>source</a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="contents">
          <div>{children}</div>
        </div>
        <footer />
      </body>
    </html>
  );
}

export type Link = { path: string; title: string };
export function NexPrevLinks({ prev, next }: { prev?: Link; next?: Link }) {
  return (
    <div className="flex-row">
      {prev ? <a href={prev.path}>⇦ {prev.title}</a> : <div />}
      {next ? <a href={next.path}>{next.title} ⇨</a> : <div />}
    </div>
  );
}
