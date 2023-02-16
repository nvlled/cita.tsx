/** @jsx h */
import { h, PageData, PageRender } from "./cita.tsx";
import { Layout } from "./components.tsx";

export const data: PageData = {
  title: "Test images",
};

export const render: PageRender = () => {
  return (
    <Layout>
      <style>
        {`img {
          width: 350px;
        }`}
      </style>
      <h1>{data.title}</h1>
      <div className="flex-row">
        <img src="/assets/shot-3.gif" />
        <img src="/assets/shot-7.gif" />
        <img src="/assets/shot-10.gif" />
      </div>
    </Layout>
  );
};
