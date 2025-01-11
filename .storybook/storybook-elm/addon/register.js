import React from 'react';
import { addons, types } from '@storybook/manager-api';
import { StoryPanel } from './StoryPanel.js';

const ADDON_ID = "ryannhg/elm-source";
const PANEL_ID = `${ADDON_ID}/panel`;

addons.register(ADDON_ID, () => {
  addons.add(PANEL_ID, {
    type: types.PANEL,
    title: "Source",
    match: ({ viewMode }) => viewMode === 'story',
    render: ({ active, key }) => 
      active ? <StoryPanel className="banana" key={key} /> : null
  });
});