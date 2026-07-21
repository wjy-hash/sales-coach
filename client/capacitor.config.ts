import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.salescoach.app',
  appName: '销售AI陪练',
  webDir: 'dist',
  server: {
    // Cloud backend URL — change this when deploying to your own server
    url: 'https://ellen-andrea-establishment-cover.trycloudflare.com',
    cleartext: false,
  },
  android: {
    allowMixedContent: true,
  },
}

export default config
