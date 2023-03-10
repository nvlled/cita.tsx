/** @jsx h */
import { h, PageData, PageRender, documentation } from "../cita.tsx";
import { Layout, NexPrevLinks } from "../components.tsx";
import sitemap from "../sitemap_gen.ts";

export const data: PageData = {
  title: "Getting started",
  created: "2023-02-17",
  $lastModified: "2023-02-17",
};

export const render: PageRender = () => {
  const doc = documentation.$getting_started;
  const contents = sitemap.contents;

  return (
    <Layout title={data.title}>
      <h2>{data.title}</h2>
      <ol>
        {documentation.getSteps(doc).map((line) => (
          <li dangerouslySetInnerHTML={{ __html: line }} />
        ))}
      </ol>

      <h3>Setup dino</h3>
      <ol>
        {documentation.getSteps(doc.$$setup_dino).map((line) => (
          <li dangerouslySetInnerHTML={{ __html: line }} />
        ))}
      </ol>

      <h3>Setup cita.tsx</h3>
      <ol>
        {documentation.getSteps(doc.$$setup_cita).map((line) => (
          <li dangerouslySetInnerHTML={{ __html: line }} />
        ))}
      </ol>

      <br />
      <NexPrevLinks next={contents.development_and_workflow} />
    </Layout>
  );
};
