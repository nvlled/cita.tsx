/** @jsx h */
import { h, PageData, PageRender, documentation, md } from "../cita.tsx";
import { Layout } from "../components.tsx";
import sitemap from "../sitemap_gen.ts";

export const data: PageData = {
  title: "Building",
};

export const render: PageRender = () => {
  const doc = documentation.$building;
  const contents = sitemap.contents;

  return (
    <Layout>
      <h2>{data.title}</h2>
      <div dangerouslySetInnerHTML={{ __html: md(doc) }} />

      <br />
      <div className="flex-row">
        <a href={contents.development_and_workflow.path}>
          previous: {contents.development_and_workflow.title}
        </a>
        <a href={contents.configuring_and_extension.path}>
          next: {contents.configuring_and_extension.title}
        </a>
      </div>
    </Layout>
  );
};
