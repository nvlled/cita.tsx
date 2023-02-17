/** @jsx h */
import { h, PageData, PageRender, documentation, md } from "./cita.tsx";
import { Layout, Link } from "./components.tsx";
import sitemap from "./sitemap_gen.ts";

export const data: PageData = {
  title: "Home",
  created: "2023-02-17",
  $lastModified: "2023-02-17",
};

type LinkData = { title: string; path: string };
function Link({ data }: { data: LinkData }) {
  return <a href={data.path}>{data.title}</a>;
}

export const render: PageRender = () => {
  const { contents } = sitemap;
  return (
    <Layout title={data.title}>
      <h2>What's this</h2>
      <p
        dangerouslySetInnerHTML={{ __html: md(documentation.$what_is_this) }}
      />
      <ul>
        <li>
          <Link data={contents.getting_started} />
        </li>
        <li>
          <Link data={contents.development_and_workflow} />
        </li>
        <li>
          <Link data={contents.building} />
        </li>
        <li>
          <Link data={contents.configuring_and_extension} />
        </li>
      </ul>
    </Layout>
  );
};
