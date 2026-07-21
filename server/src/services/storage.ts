import fs from 'node:fs'
import path from 'node:path'

const DATA_DIR = process.env.DATA_DIR || path.resolve(__dirname, '..', 'data')

export function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

export function readJSON<T>(filename: string): T {
  const filepath = path.join(DATA_DIR, filename)
  ensureDir(DATA_DIR)
  if (!fs.existsSync(filepath)) {
    writeJSON(filename, [])
    return [] as T
  }
  const raw = fs.readFileSync(filepath, 'utf-8')
  return JSON.parse(raw) as T
}

export function writeJSON<T>(filename: string, data: T): void {
  ensureDir(DATA_DIR)
  const filepath = path.join(DATA_DIR, filename)
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8')
}

export function initData() {
  ensureDir(DATA_DIR)

  const defaults: Record<string, unknown> = {
    'mistakes.json': [],
    'products.json': [
      { id: 'p1', name: 'CRM系统', category: 'SaaS', points: ['客户管理', '销售漏斗', '数据分析'] },
      { id: 'p2', name: '企业微信', category: '通讯', points: ['客户触达', '群运营', '应用集成'] },
      { id: 'p3', name: '数据分析平台', category: '数据', points: ['BI报表', '实时监控', '预测分析'] },
    ],
    'scenarios.json': [
      { id: 's1', title: '初次拜访客户', role: '销售代表', description: '你是一家SaaS公司的销售代表，需要拜访一位从未接触过的潜在客户' },
      { id: 's2', title: '处理价格异议', role: '销售经理', description: '客户认为你的产品价格过高，需要你进行价格谈判' },
      { id: 's3', title: '挽回流失客户', role: '客户成功', description: '一位重要客户表示考虑更换供应商，你需要挽留' },
    ],
  }

  for (const [filename, defaultData] of Object.entries(defaults)) {
    const filepath = path.join(DATA_DIR, filename)
    if (!fs.existsSync(filepath)) {
      writeJSON(filename, defaultData)
    }
  }
}
