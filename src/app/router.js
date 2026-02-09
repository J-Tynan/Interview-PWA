export function createRouter(onRoute) {
  function parseRoute() {
    const hash = window.location.hash.replace('#', '') || '/';
    const segments = hash.split('/').filter(Boolean);
    const path = segments[0] || 'dashboard';
    const params = segments.slice(1);

    return { path, params };
  }

  function handleRoute() {
    onRoute(parseRoute());
  }

  window.addEventListener('hashchange', handleRoute);

  return {
    start: handleRoute,
    navigate: (to) => {
      const next = `#${to}`;
      if (window.location.hash !== next) {
        window.location.hash = next;
      } else {
        handleRoute();
      }
    }
  };
}
