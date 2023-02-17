/** @jsx h */
import { h, PageData, PageRender, documentation, md } from "../cita.tsx";
import { Layout, NexPrevLinks } from "../components.tsx";
import sitemap from "../sitemap_gen.ts";

export const data: PageData = {
  title: "Building",
};

export const render: PageRender = () => {
  const doc = documentation.$building;
  const contents = sitemap.contents;

  return (
    <Layout title={data.title}>
      <h2>{data.title}</h2>
      <div dangerouslySetInnerHTML={{ __html: md(doc) }} />

      <br />
      <NexPrevLinks
        prev={contents.development_and_workflow}
        next={contents.configuring_and_extension}
      />
    </Layout>
  );
};
