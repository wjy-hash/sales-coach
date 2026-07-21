import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.salescoach.app',
  appName: '销售AI陪练',
  webDir: 'client/dist',
  server: {
    // Set to your cloud backend URL when deployed
    url: process.env.CLOUD_URL || '',
    cleartext: true,
  },
  ios: {
    contentInset: 'always',
  },
  android: {
    allowMixedContent: true,
  },
}

export default config
