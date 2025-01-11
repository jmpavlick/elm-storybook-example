import React from 'react';
import { useParameter } from '@storybook/manager-api';
import { PrismLight } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import elm from 'react-syntax-highlighter/dist/esm/languages/prism/elm';

PrismLight.registerLanguage('elm', elm);

export const StoryPanel = () => {
  const elmSource = useParameter('elmSource', null);

  return elmSource
    ? <PrismLight
        language='elm'
        style={oneLight}
        customStyle={{ margin: 0 }}
        showLineNumbers={true}
      >
        {elmSource}
      </PrismLight>
    : null;
};