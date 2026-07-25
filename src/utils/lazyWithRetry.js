import { lazy } from 'react';

/**
 * Wraps React.lazy to handle chunk loading failures caused by fresh deployment asset hashes.
 * If fetching a dynamic module fails, it automatically reloads the page once to load the latest build assets.
 */
export const lazyWithRetry = (componentImport) =>
  lazy(async () => {
    const pageHasAlreadyBeenReloaded = sessionStorage.getItem('page_reloaded_for_chunk');
    try {
      const component = await componentImport();
      sessionStorage.removeItem('page_reloaded_for_chunk');
      return component;
    } catch (error) {
      if (!pageHasAlreadyBeenReloaded) {
        sessionStorage.setItem('page_reloaded_for_chunk', 'true');
        window.location.reload();
        return new Promise(() => {}); // prevent further uncaught promise errors while reloading
      }
      throw error;
    }
  });

export default lazyWithRetry;
