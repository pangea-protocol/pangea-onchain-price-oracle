module.exports = {
    singleQuote: false,
    semi: true,
    overrides: [
        {
            files: '*.sol',
            options: {
                printWidth: 140,
                tabWidth: 4,
                singleQuote: false,
                bracketSpacing: false,
                explicitTypes: 'always',
                endOfLine: 'lf',
            },
        },
    ],
}
