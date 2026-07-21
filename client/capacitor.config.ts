import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.salescoach.app',
  appName: '销售AI陪练',
  webDir: 'dist',
  server: {
    url: 'https://run-kentucky-rna-counsel.trycloudflare.com',
    cleartext: false,
  },
  android: {
    allowMixedContent: true,
  },
}

export default config
