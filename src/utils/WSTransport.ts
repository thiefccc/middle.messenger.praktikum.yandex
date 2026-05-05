const PING_INTERVAL_MS = 30000;

/**
 * WebSocket transport aka HTTP one
 */
export class WSTransport {
  public onOpen: (() => void) | null = null;
  public onClose: ((event: CloseEvent) => void) | null = null;
  public onError: ((event: Event) => void) | null = null;
  public onMessage: ((data: unknown) => void) | null = null;

  private socket: WebSocket | null = null;
  private pingTimer: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly url: string) {}

  public connect(): Promise<void> {
    if (this.socket) {
      return Promise.reject(new Error('WSTransport: socket is already open'));
    }

    const socket = new WebSocket(this.url);
    this.socket = socket;

    socket.addEventListener('close', (event) => {
      this.stopPing();
      this.onClose?.(event);
    });

    socket.addEventListener('message', (event) => {
      this.handleMessage(event as MessageEvent);
    });

    return new Promise<void>((resolve, reject) => {
      const onOpenOnce = (): void => {
        socket.removeEventListener('open', onOpenOnce);
        socket.removeEventListener('error', onErrorOnce);

        // Errors that happen AFTER the handshake are dispatched to onError.
        // Errors BEFORE the handshake reject connect() — see onErroronErrorOnceOnce.
        socket.addEventListener('error', (event) => {
          this.onError?.(event);
        });

        this.startPing();
        this.onOpen?.();
        resolve();
      };

      const onErrorOnce = (event: Event): void => {
        socket.removeEventListener('open', onOpenOnce);
        socket.removeEventListener('error', onErrorOnce);
        reject(event);
      };

      socket.addEventListener('open', onOpenOnce);
      socket.addEventListener('error', onErrorOnce);
    });
  }

  public send(payload: unknown): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('WSTransport: socket is not open');
    }
    const data =
      typeof payload === 'string' ? payload : JSON.stringify(payload);
    this.socket.send(data);
  }

  public close(): void {
    this.stopPing();
    this.socket?.close();
    this.socket = null;
  }

  public isOpen(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  private handleMessage(event: MessageEvent): void {
    const raw = event.data;
    let parsed: unknown;
    try {
      parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch {
      return;
    }

    if (
      parsed &&
      typeof parsed === 'object' &&
      (parsed as { type?: string }).type === 'pong'
    ) {
      return;
    }

    this.onMessage?.(parsed);
  }

  private startPing(): void {
    this.stopPing();
    this.pingTimer = setInterval(() => {
      if (this.socket?.readyState !== WebSocket.OPEN) {
        return;
      }
      try {
        this.socket.send(JSON.stringify({ type: 'ping' }));
      } catch {
        // socket might have closed mid-tick
      }
    }, PING_INTERVAL_MS);
  }

  private stopPing(): void {
    if (this.pingTimer !== null) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }
}

export default WSTransport;
