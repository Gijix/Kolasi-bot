export const cache = new (class {
  private data: Record<string, any> = {}

  get<T extends any>(key: string): T | undefined {
    return this.data[key]
  }

  set (key: string, value: any) {
    this.data[key] = value
  }

  ensure<T>(key: string, defaultValue: T): T {
    let value = this.get<T>(key)
    if (value === undefined) {
      value = defaultValue
      this.set(key, value)
    }
    return value
  }
})