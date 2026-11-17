// Metro: the app reuses the web frontend's pure TypeScript modules (types, strings,
// spread geometry, history) and its card images instead of copying them.
const path = require("path")
const { getDefaultConfig } = require("expo/metro-config")

const config = getDefaultConfig(__dirname)
const frontend = path.resolve(__dirname, "../frontend")

config.watchFolders = [path.join(frontend, "app/lib"), path.join(frontend, "public/cards")]

module.exports = config
