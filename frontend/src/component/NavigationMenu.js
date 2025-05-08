import React from "react";
import { useNavigate } from "react-router-dom";
import { Menu } from "semantic-ui-react";

const NavigationMenu = ({ userRole, activePath }) => {
  const navigate = useNavigate();

  // Navigation helper
  const handleNavigate = (path) => {
    navigate(path);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  return (
    <Menu pointing secondary>
      {userRole === "hr" ? (
        // HR Navigation Items
        <>
          <Menu.Item
            name="Dashboard"
            active={activePath === "/dashboard"}
            onClick={() => handleNavigate("/dashboard")}
          />
          <Menu.Item
            name="Employee Profiles"
            active={activePath === "/profiles"}
            onClick={() => handleNavigate("/profiles")}
          />
          <Menu.Item
            name="Visa Management"
            active={activePath === "/visa-management"}
            onClick={() => handleNavigate("/visa-management")}
          />
          <Menu.Item
            name="Hiring Management"
            active={activePath === "/hiring-management"}
            onClick={() => handleNavigate("/hiring-management")}
          />
        </>
      ) : (
        // Employee Navigation Items
        <>
          <Menu.Item
            name="Dashboard"
            active={activePath === "/dashboard"}
            onClick={() => handleNavigate("/dashboard")}
          />
          <Menu.Item
            name="Onboarding"
            active={activePath === "/onboarding"}
            onClick={() => handleNavigate("/onboarding")}
          />
          <Menu.Item
            name="Personal Information"
            active={activePath === "/profile"}
            onClick={() => handleNavigate("/profile")}
          />
          <Menu.Item
            name="Visa Status"
            active={activePath === "/management"}
            onClick={() => handleNavigate("/management")}
          />
        </>
      )}

      <Menu.Menu position="right">
        <Menu.Item name="Logout" onClick={handleLogout} />
      </Menu.Menu>
    </Menu>
  );
};

export default NavigationMenu;
