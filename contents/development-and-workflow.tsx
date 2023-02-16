/** @jsx h */
import { h, PageData, PageRender, documentation, md } from "../cita.tsx";
import { Layout } from "../components.tsx";
import sitemap from "../sitemap_gen.ts";

export const data: PageData = {
  title: "Development and workflow",
};

export const render: PageRender = () => {
  const doc = documentation.$development_and_work_flow;
  const contents = sitemap.contents;

  return (
    <Layout>
      <h2>{data.title}</h2>
      <ol>
        {documentation.getSteps(doc).map((line) => (
          <li dangerouslySetInnerHTML={{ __html: line }} />
        ))}
      </ol>
      <div dangerouslySetInnerHTML={{ __html: md(doc.mapping) }} />
      <div dangerouslySetInnerHTML={{ __html: md(doc.NOTE) }} />
      <br />
      <div className="flex-row">
        <a href={contents.getting_started.path}>
          previous: {contents.getting_started.title}
        </a>
        <a href={contents.building.path}>next: {contents.building.title}</a>
      </div>
    </Layout>
  );
};
