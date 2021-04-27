type Fn = (...args: any[]) => Promise<any>;

/**
 * With this you can spam a request and it will wait for a bit before sending it
 * only sending the last request made. If a request is currently in flight
 * it will buffer incoming requests until response has been given.
 *
 * In this way only the latest data is able to get through. Good for
 * frequently changes data that needs to be sent
 */
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
    while (this.toSend.length > 0) {
      const current = this.toSend[0];
      this.toSend.splice(0, 1);
      await this.send(current);
    }
  }
}
