import React from "react";
import { Layout } from "antd";
import Navbar from "./Navbar";
import Footer from "./Footer";

const { Content } = Layout;

const MainLayout = ({ children }) => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Navbar />
      <Content style={{ padding: "0 50px", marginTop: 24 }}>
        <div style={{ background: "#fff", padding: 24, minHeight: "80vh" }}>
          {children}
        </div>
      </Content>
      <Footer />
    </Layout>
  );
};

export default MainLayout;
