export function createRouter(onRoute) {
  function parseRoute() {
    const hash = window.location.hash.replace('#', '') || '/';
    if (hash.startsWith('q=')) {
      const id = decodeURIComponent(hash.slice(2));
      return { path: 'question', params: [id] };
    }

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
    },
    navigateTo: (path, params = {}) => {
      if (path === 'question' && params.id) {
        const id = encodeURIComponent(params.id);
        const next = `#q=${id}`;
        if (window.location.hash !== next) {
          window.location.hash = next;
        } else {
          handleRoute();
        }
        return;
      }
      const nextPath = params.id ? `/${path}/${params.id}` : `/${path}`;
      const next = `#${nextPath}`;
      if (window.location.hash !== next) {
        window.location.hash = next;
      } else {
        handleRoute();
      }
    }
  };
}
