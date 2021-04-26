type Fn = (...args: any[]) => Promise<any>;

export class BufferedSend {
  private sendId = 0;
  private timeoutLength = 500;
  private isSending = false;

  private toSend: Fn[] = [];

  public async send(fn: Fn) {
    if (this.isSending) {
      this.toSend.push(fn);
      return;
    }
    this.sendId++;
    const cursor = this.sendId;
    await new Promise((r) => setTimeout(r, this.timeoutLength));
    if (this.sendId !== cursor) {
      return;
    }

    try {
      await fn();
    } catch (err) {
      console.error(err);
    }
    this.isSending = false;
  }
}
