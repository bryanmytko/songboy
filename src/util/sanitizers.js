module.exports = {
  sanitizeParams: (params) => {
    try {
      const input = new URL(params);

      /* This attempts to rip out the video id
        if the input param is an actual YouTube link */
      try {
        return input.searchParams.get('v');
      } catch (e) {
        return params;
      }
    } catch (e) {
      return params;
    }
  },
};
