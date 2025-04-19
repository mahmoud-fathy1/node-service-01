export default [
    {
        ignores: ["node_modules/**", "dist/**", "public/**", "./app.js"],
    },
    {
        languageOptions: {
            ecmaVersion: 2021,
            sourceType: "module",
        },
        rules: {
            "no-console": "error", // Set to error to automatically remove
            "no-warning-comments": "error", // Set to error to handle TODO, FIXME
        },
    },
];
