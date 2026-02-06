/**
 * Reconnection Manager with Exponential Backoff
 * 
 * Handles automatic reconnection attempts with increasing delays.
 * Prevents connection storms and respects max retry limits.
 */

export class ReconnectionManager {
  constructor({
    initialDelay = 1000,      // Start with 1 second
    maxDelay = 30000,         // Cap at 30 seconds
    maxRetries = 10,          // Stop after 10 attempts
    backoffMultiplier = 1.5,  // Exponential growth factor
  } = {}) {
    this.initialDelay = initialDelay;
    this.maxDelay = maxDelay;
    this.maxRetries = maxRetries;
    this.backoffMultiplier = backoffMultiplier;

    // State
    this.retryCount = 0;
    this.currentDelay = initialDelay;
    this.reconnectTimeout = null;
    this.isReconnecting = false;
  }

  /**
   * Calculate next retry delay with exponential backoff + jitter
   */
  getNextDelay() {
    // Exponential backoff
    const exponentialDelay = this.initialDelay * Math.pow(
      this.backoffMultiplier,
      this.retryCount
    );

    // Add jitter (±20%) to prevent thundering herd
    const jitter = exponentialDelay * 0.2 * (Math.random() - 0.5);
    const delayWithJitter = exponentialDelay + jitter;

    // Cap at max delay
    return Math.min(delayWithJitter, this.maxDelay);
  }

  /**
   * Schedule reconnection attempt
   * 
   * @param {Function} reconnectFn - Function to call for reconnection
   * @returns {boolean} - True if scheduled, false if max retries exceeded
   */
  scheduleReconnect(reconnectFn) {
    // Check if max retries exceeded
    if (this.retryCount >= this.maxRetries) {
      console.error("Max reconnection attempts exceeded");
      this.isReconnecting = false;
      return false;
    }

    // Clear any existing timeout
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.isReconnecting = true;
    this.currentDelay = this.getNextDelay();

    console.log(
      `Scheduling reconnect attempt ${this.retryCount + 1}/${this.maxRetries} ` +
      `in ${Math.round(this.currentDelay / 1000)}s`
    );

    this.reconnectTimeout = setTimeout(() => {
      this.retryCount++;
      reconnectFn();
    }, this.currentDelay);

    return true;
  }

  /**
   * Reset state after successful connection
   */
  reset() {
    console.log("Reconnection successful - resetting backoff");
    this.retryCount = 0;
    this.currentDelay = this.initialDelay;
    this.isReconnecting = false;

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  /**
   * Cancel pending reconnection
   */
  cancel() {
    console.log("Reconnection cancelled");
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.isReconnecting = false;
  }

  /**
   * Check if currently attempting reconnection
   */
  isActive() {
    return this.isReconnecting;
  }

  /**
   * Get current retry attempt number
   */
  getRetryCount() {
    return this.retryCount;
  }
}
