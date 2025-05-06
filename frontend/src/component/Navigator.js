import React from 'react';
import { Menu } from 'semantic-ui-react';
import { useNavigate } from 'react-router-dom';

const Navigator = () => {
  const navigate = useNavigate();

  return (
    <Menu pointing secondary>
      <Menu.Item
        name="Personal Information"
        onClick={() => navigate('/profile')}
      />
      <Menu.Item
        name="Visa Status"
        onClick={() => navigate('/management')}
      />
      <Menu.Item
        name="Logout"
        onClick={() => {
          localStorage.removeItem('token'); 
          navigate('/login');
        }}
      />
    </Menu>
  );
};

export default Navigator;