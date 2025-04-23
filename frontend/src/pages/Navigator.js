import React from 'react';
import { Menu } from 'semantic-ui-react';
import { useNavigate } from 'react-router-dom';

const Navigator = () => {
  const navigate = useNavigate();

  return (
    <Menu pointing secondary>
      <Menu.Item
        name="Personal Information"
        onClick={() => navigate('/information')}
      />
      <Menu.Item
        name="Visa Status"
        onClick={() => navigate('/management')}
      />
      <Menu.Menu position="right">
        <Menu.Item
          name="Logout"
          onClick={() => navigate('/login')}
        />
      </Menu.Menu>
    </Menu>
  );
};

export default Navigator;