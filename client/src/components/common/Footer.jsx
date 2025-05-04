import React from "react";
import { Layout, Row, Col, Typography } from "antd";

const { Footer: AntFooter } = Layout;
const { Text, Link: AntLink } = Typography;

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <AntFooter style={{ padding: "24px", background: "#f0f2f5" }}>
      <Row justify="space-between">
        <Col>
          <Text>Employee Management System © {currentYear}</Text>
        </Col>
        <Col>
          <Row gutter={16}>
            <Col>
              <AntLink href="/help">Help</AntLink>
            </Col>
            <Col>
              <AntLink href="/privacy">Privacy Policy</AntLink>
            </Col>
            <Col>
              <AntLink href="/terms">Terms of Service</AntLink>
            </Col>
          </Row>
        </Col>
      </Row>
    </AntFooter>
  );
};

export default Footer;
