export function resolveLegacyLinks() {
  var legacyDestinations = {
    how: '/how-we-work/',
    contact: '/contact/#contact',
    'post-job': '/contact/#post-job',
    roles: '/roles/',
    cv: '/submit-cv/#cv',
    'ai-matching': '/how-we-work/',
    insights: '/blogs/',
    returners: '/careers/#returners-program',
  };
  if (
    (location.pathname === '/' || location.pathname === '/index.html') &&
    legacyDestinations[location.hash.slice(1)]
  ) {
    location.replace(legacyDestinations[location.hash.slice(1)]);
  }
}
