module.exports = {
  packagerConfig: {
    name: 'Toddler Typing',
    executableName: 'toddler-typing',
    icon: './src/toddler_typing/web/assets/dino_character',
    asar: true,
    ignore: [
      /^\/android/,
      /^\/docs/,
      /^\/tests/,
      /^\/\.git/,
      /^\/\.github/,
      /^\/\.vscode/,
      /^\/node_modules\/\.cache/,
      /\.md$/,
      /\.gitignore$/
    ]
  },
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'ToddlerTyping',
        description: 'A child-friendly educational app for learning letters, numbers, colors, and shapes'
      }
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin', 'linux', 'win32']
    }
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'Gaskony-Home',
          name: 'toddler-typing'
        },
        prerelease: false
      }
    }
  ]
};
