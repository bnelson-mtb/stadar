// Metro config. The app imports packages/shared (@stadar/shared) through a
// file: link, so Metro has to watch that folder. Shared code imports `react`,
// which from packages/shared would resolve to the web client's React at the
// repo root; React Native needs exactly one React, so those imports are sent
// to the copy in mobile/node_modules.
const path = require('path')
const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')

const projectRoot = __dirname
const sharedRoot = path.resolve(projectRoot, '../packages/shared')

const config = getDefaultConfig(projectRoot)
config.watchFolders = [...(config.watchFolders ?? []), sharedRoot]

const SINGLETONS = ['react', 'react-dom', 'react-native', 'react-native-web']
const isSingleton = name => SINGLETONS.some(pkg => name === pkg || name.startsWith(`${pkg}/`))
const appAnchor = path.join(projectRoot, 'package.json')

const upstream = config.resolver.resolveRequest
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const resolve = upstream ?? context.resolveRequest
  if (isSingleton(moduleName) && context.originModulePath.startsWith(sharedRoot)) {
    return resolve({ ...context, originModulePath: appAnchor }, moduleName, platform)
  }
  return resolve(context, moduleName, platform)
}

module.exports = withNativeWind(config, { input: './global.css' })
