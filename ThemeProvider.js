import React, { createContext } from 'react';

import theme from './ThemeStyle';

export const ThemeContext = createContext(theme);

export default (props) => {
    const themeConfig = props.value || theme;

    return (
        <ThemeContext.Provider value={themeConfig}>
            {props.children}
        </ThemeContext.Provider>
    );
}
