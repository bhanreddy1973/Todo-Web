import { defineConfig } from 'eslint-define-config';
import eslintPluginReact from 'eslint-plugin-react';

export default defineConfig({
    languageOptions: {
        globals: {
            browser: true,
            Node: true,
        },
        parserOptions: {
            ecmaFeatures: {
                jsx: true,
            },
            ecmaVersion: 12,
            sourceType: 'module',
        },
    },

    plugins: {
        react: require('eslint-plugin-react'),
    },


    rules: {
        'no-undef': 'error',
        'react/react-in-jsx-scope': 'off', // Disable this rule if using React 17+
        'react/prop-types': 'off', // Disable prop-types as we use TypeScript

    },
});
