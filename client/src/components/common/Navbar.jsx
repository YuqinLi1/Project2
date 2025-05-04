import React, { useState } from "react";
import { Layout, Menu, Avatar, Dropdown, Badge } from "antd";
import {
  UserOutlined,
  BellOutlined,
  SettingOutlined,
  LogoutOutlined,
  HomeOutlined,
  FileTextOutlined,
  IdcardOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const { Header } = Layout;

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [notificationCount] = useState(0);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        <Link
          to={user?.role === "hr" ? "/hr/profile" : "/employee/personal-info"}
        >
          Profile
        </Link>
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingOutlined />}>
        <Link to="/settings">Settings</Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  const notificationMenu = (
    <Menu>
      <Menu.Item key="no-notifications" disabled>
        No new notifications
      </Menu.Item>
    </Menu>
  );

  const getNavItems = () => {
    if (user?.role === "hr") {
      return [
        { key: "/hr", icon: <HomeOutlined />, label: "Dashboard", link: "/hr" },
        {
          key: "/hr/employees",
          icon: <UserOutlined />,
          label: "Employees",
          link: "/hr/employees",
        },
        {
          key: "/hr/hiring",
          icon: <IdcardOutlined />,
          label: "Hiring",
          link: "/hr/hiring",
        },
        {
          key: "/hr/visa",
          icon: <GlobalOutlined />,
          label: "Visa Management",
          link: "/hr/visa",
        },
      ];
    } else {
      return [
        {
          key: "/employee",
          icon: <HomeOutlined />,
          label: "Dashboard",
          link: "/employee",
        },
        {
          key: "/employee/personal-info",
          icon: <UserOutlined />,
          label: "Profile",
          link: "/employee/personal-info",
        },
        {
          key: "/employee/documents",
          icon: <FileTextOutlined />,
          label: "Documents",
          link: "/employee/documents",
        },
        {
          key: "/employee/visa",
          icon: <GlobalOutlined />,
          label: "Visa Status",
          link: "/employee/visa",
        },
      ];
    }
  };

  return (
    <Header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        background: "#fff",
        boxShadow: "0 1px 4px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div className="logo" style={{ display: "flex", alignItems: "center" }}>
        <Link to={user?.role === "hr" ? "/hr" : "/employee"}>
          <h1 style={{ margin: 0, fontSize: "20px", fontWeight: "bold" }}>
            Employee Portal
          </h1>
        </Link>
      </div>

      <Menu
        mode="horizontal"
        selectedKeys={[location.pathname]}
        style={{ flex: 1, justifyContent: "center", border: "none" }}
      >
        {getNavItems().map((item) => (
          <Menu.Item key={item.key} icon={item.icon}>
            <Link to={item.link}>{item.label}</Link>
          </Menu.Item>
        ))}
      </Menu>

      <div style={{ display: "flex", alignItems: "center" }}>
        <Dropdown overlay={notificationMenu} placement="bottomRight">
          <Badge count={notificationCount} style={{ marginRight: 24 }}>
            <BellOutlined style={{ fontSize: "20px", cursor: "pointer" }} />
          </Badge>
        </Dropdown>

        <Dropdown overlay={userMenu} placement="bottomRight">
          <div
            style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
          >
            <Avatar icon={<UserOutlined />} src={user?.profilePicture} />
            <span style={{ marginLeft: 8 }}>{user?.username}</span>
          </div>
        </Dropdown>
      </div>
    </Header>
  );
};

export default Navbar;
