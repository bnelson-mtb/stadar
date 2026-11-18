// Metro config. The app imports packages/shared (@stadar/shared) through a
// file: link, so Metro has to watch that folder. Shared code imports `react`,
// which from packages/shared would resolve to the web client's React at the
// repo root; React Native needs exactly one React, so those imports are sent
// to the copy in mobile/node_modules.
const path = require('path')
const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')

const fs = require('fs')

const projectRoot = __dirname
// The shared package as seen from here, and where its node_modules link
// really points. They differ when the repo is opened through a mapped drive
// (subst, used for Windows' path-length limit), and Metro must watch both.
const sharedRoots = [
  ...new Set(
    [path.resolve(projectRoot, '../packages/shared'), path.join(projectRoot, 'node_modules/@stadar/shared')]
      .filter(p => fs.existsSync(p))
      .map(p => fs.realpathSync(p))
      .concat(path.resolve(projectRoot, '../packages/shared')),
  ),
]

const config = getDefaultConfig(projectRoot)
config.watchFolders = [...(config.watchFolders ?? []), ...sharedRoots]

const SINGLETONS = ['react', 'react-dom', 'react-native', 'react-native-web']
const isSingleton = name => SINGLETONS.some(pkg => name === pkg || name.startsWith(`${pkg}/`))
const appAnchor = path.join(projectRoot, 'package.json')

const upstream = config.resolver.resolveRequest
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const resolve = upstream ?? context.resolveRequest
  if (isSingleton(moduleName) && sharedRoots.some(root => context.originModulePath.startsWith(root))) {
    return resolve({ ...context, originModulePath: appAnchor }, moduleName, platform)
  }
  return resolve(context, moduleName, platform)
}

module.exports = withNativeWind(config, { input: './global.css' })
