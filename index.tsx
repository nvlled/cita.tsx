/** @jsx h */
import { h, PageData, PageRender, documentation, md } from "./cita.tsx";
import { Layout } from "./components.tsx";
import sitemap from "./sitemap_gen.ts";

export const data: PageData = {
  title: "Index",
};

export const render: PageRender = () => {
  return (
    <Layout>
      <h2>What's this</h2>
      <p
        dangerouslySetInnerHTML={{ __html: md(documentation.$what_is_this) }}
      />
      <ul>
        <li>
          <a href={sitemap.contents.getting_started.path}>getting started</a>
        </li>
        <li>
          <a href={sitemap.contents.development_and_workflow.path}>
            development workflow
          </a>
        </li>
        <li>
          <a href={sitemap.contents.building.path}>building</a>
        </li>
        <li>
          <a href={sitemap.contents.configuring_and_extension.path}>
            configuring and extension
          </a>
        </li>
      </ul>
    </Layout>
  );
};
