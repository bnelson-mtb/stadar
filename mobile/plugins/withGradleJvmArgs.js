// Config plugin: adds --enable-native-access=ALL-UNNAMED to the Gradle JVM.
// On JDK 24+ (Android Studio now bundles JDK 25) the native C++ (CMake) steps
// otherwise fail on the "A restricted method in java.lang.System has been
// called" warning. Harmless on older JDKs.
const { withGradleProperties } = require('expo/config-plugins')

const FLAG = '--enable-native-access=ALL-UNNAMED'

module.exports = function withGradleJvmArgs(config) {
  return withGradleProperties(config, cfg => {
    const entry = cfg.modResults.find(item => item.type === 'property' && item.key === 'org.gradle.jvmargs')
    if (entry) {
      if (!entry.value.includes(FLAG)) entry.value = `${entry.value} ${FLAG}`
    } else {
      cfg.modResults.push({ type: 'property', key: 'org.gradle.jvmargs', value: `-Xmx4096m -XX:MaxMetaspaceSize=1024m ${FLAG}` })
    }
    return cfg
  })
}
