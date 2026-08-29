/**
 * Minimal event-emitter core shared by the node/net shims. Unlike the
 * vendored node:events implementation (events-impl.ts), which follows Node
 * and propagates listener errors, this core catches and logs listener
 * exceptions: shim event sources are fire-and-forget callbacks (sockets,
 * workers, watchers) where a throwing consumer must not break the pump.
 *
 * @param label - log prefix identifying the shim, e.g. `[stream]`.
 */
export class ShimEmitter {
  private readonly listeners = new Map<string, Set<(...args: unknown[]) => void>>()

  constructor(private readonly label: string) {}

  on(event: string, listener: (...args: unknown[]) => void): this {
    let set = this.listeners.get(event)
    if (set === undefined) {
      set = new Set()
      this.listeners.set(event, set)
    }
    set.add(listener)
    return this
  }

  addListener(event: string, listener: (...args: unknown[]) => void): this {
    return this.on(event, listener)
  }

  once(event: string, listener: (...args: unknown[]) => void): this {
    const wrapper = (...args: unknown[]): void => {
      this.off(event, wrapper)
      listener(...args)
    }
    return this.on(event, wrapper)
  }

  off(event: string, listener: (...args: unknown[]) => void): this {
    this.listeners.get(event)?.delete(listener)
    return this
  }

  removeListener(event: string, listener: (...args: unknown[]) => void): this {
    return this.off(event, listener)
  }

  removeAllListeners(event?: string): this {
    if (event === undefined) this.listeners.clear()
    else this.listeners.delete(event)
    return this
  }

  listenerCount(event: string): number {
    return this.listeners.get(event)?.size ?? 0
  }

  /** Emit to the event's listeners; returns whether any ran. */
  emit(event: string, ...args: unknown[]): boolean {
    const set = this.listeners.get(event)
    if (set === undefined || set.size === 0) return false
    for (const listener of [...set]) {
      try {
        listener(...args)
      } catch (error) {
        console.error(`[${this.label}] ${event} listener threw:`, error)
      }
    }
    return true
  }

  /** Void-returning emit for fire-and-forget call sites. */
  fire(event: string, ...args: unknown[]): void {
    this.emit(event, ...args)
  }
}
