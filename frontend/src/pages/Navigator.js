import React from 'react';
import { Menu } from 'semantic-ui-react';

const Navigator = () => {
  return (
    <Menu pointing secondary>
      <Menu.Item name="Personal Information" />
      <Menu.Item name="Visa Status" />
      <Menu.Menu position="right">
        <Menu.Item name="Logout" />
      </Menu.Menu>
    </Menu>
  );
};

export default Navigator;