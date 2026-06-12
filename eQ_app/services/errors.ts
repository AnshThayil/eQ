import axios from 'axios';

/**
 * Converts any thrown value into a safe, user-facing message.
 * Never exposes raw error messages, stack traces, or backend details.
 */
export function getErrorMessage(err: unknown): string {
  if (!axios.isAxiosError(err)) {
    return 'Something went wrong. Please try again.';
  }

  // Network error (no response received)
  if (!err.response) {
    return 'Check your internet connection and try again.';
  }

  const status = err.response.status;

  if (status === 401) return 'Your session has expired. Please log in again.';
  if (status === 403) return "You don't have permission to do that.";
  if (status === 404) return "That couldn't be found.";
  if (status === 408 || err.code === 'ECONNABORTED') return 'The request timed out. Please try again.';
  if (status >= 500) return 'Something went wrong on our end. Try again shortly.';

  return 'Something went wrong. Please try again.';
}
