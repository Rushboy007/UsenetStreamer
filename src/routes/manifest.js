const specialMetadata = require('../services/specialMetadata');

module.exports = function createManifestHandler(getConfig) {
  return function manifestHandler(req, res) {
    const {
      STREAMING_MODE,
      ADDON_NAME,
      DEFAULT_ADDON_NAME,
      ADDON_BASE_URL,
      ADDON_VERSION,
      NZBDAV_HISTORY_CATALOG_LIMIT,
    } = getConfig();

    if (!ADDON_BASE_URL) {
      throw new Error('ADDON_BASE_URL is not configured');
    }

    const description = STREAMING_MODE === 'native'
      ? 'Native Usenet streaming for Stremio v5 (Windows) - NZB sources via direct Newznab indexers'
      : 'Usenet-powered instant streams for Stremio via Prowlarr/NZBHydra and NZBDav';

    const catalogs = [];
    const resources = ['stream'];
    const idPrefixes = ['tt', 'tvdb', 'tmdb', 'kitsu', 'mal', 'anilist', 'pt', specialMetadata.SPECIAL_ID_PREFIX];
    if (STREAMING_MODE !== 'native' && NZBDAV_HISTORY_CATALOG_LIMIT > 0) {
      const catalogName = ADDON_NAME || DEFAULT_ADDON_NAME;
      catalogs.push(
        { type: 'movie', id: 'nzbdav_completed', name: catalogName, pageSize: 20, extra: [{ name: 'skip' }] },
        { type: 'series', id: 'nzbdav_completed', name: catalogName, pageSize: 20, extra: [{ name: 'skip' }] }
      );
      resources.push('catalog', 'meta');
      idPrefixes.push('nzbdav');
    }

    res.json({
      id: STREAMING_MODE === 'native' ? 'com.usenet.streamer.native' : 'com.usenet.streamer',
      version: ADDON_VERSION,
      name: ADDON_NAME,
      description,
      logo: `${ADDON_BASE_URL.replace(/\/$/, '')}/assets/icon.png`,
      resources,
      types: ['movie', 'series', 'channel', 'tv'],
      catalogs,
      idPrefixes
    });
  };
};
