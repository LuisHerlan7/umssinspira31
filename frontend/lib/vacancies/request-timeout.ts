export const VACANCY_REQUEST_TIMEOUT_MS = 15_000;

/** Bounds HU8 list reads without changing the API client used by other stories. */
export function withVacancyRequestTimeout<T>(
  request: (signal: AbortSignal) => Promise<T>,
  parentSignal?: AbortSignal,
  timeoutMs = VACANCY_REQUEST_TIMEOUT_MS,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    if (parentSignal?.aborted) {
      reject(parentSignal.reason ?? new DOMException('Consulta cancelada', 'AbortError'));
      return;
    }
    const controller = new AbortController();
    const cleanup = () => {
      clearTimeout(timer);
      parentSignal?.removeEventListener('abort', abort);
    };
    const abort = () => {
      cleanup();
      reject(parentSignal?.reason ?? new DOMException('Consulta cancelada', 'AbortError'));
      controller.abort(parentSignal?.reason);
    };
    const timer = setTimeout(() => {
      cleanup();
      // Reject before aborting the fetch so the deadline is an error state,
      // while navigation/unmount cancellation remains silent in the view.
      reject(new DOMException('Se agotó el tiempo de espera al consultar las vacantes.', 'TimeoutError'));
      controller.abort();
    }, timeoutMs);
    parentSignal?.addEventListener('abort', abort, { once: true });

    Promise.resolve().then(() => {
      controller.signal.throwIfAborted();
      return request(controller.signal);
    }).then((value) => {
      cleanup();
      resolve(value);
    }, (error: unknown) => {
      cleanup();
      reject(error);
    });
  });
}
