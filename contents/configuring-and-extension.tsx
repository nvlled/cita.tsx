/** @jsx h */
import { h, PageData, PageRender, documentation } from "../cita.tsx";
import { Layout, NexPrevLinks } from "../components.tsx";
import sitemap from "../sitemap_gen.ts";

export const data: PageData = {
  title: "Configuring and extension",
};

export const render: PageRender = () => {
  const doc = documentation.$configuring_and_extension;
  const contents = sitemap.contents;

  return (
    <Layout>
      <h2>{data.title}</h2>
      <div dangerouslySetInnerHTML={{ __html: doc }} />
      <br />
      <NexPrevLinks prev={contents.building} />
    </Layout>
  );
};
