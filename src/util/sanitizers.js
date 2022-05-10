module.exports = {
  sanitizeInput: input => {
    try {
      const url = new URL(input);

      /* This attempts to rip out the video id
        if the input param is an actual YouTube link */
      try {
        return url.searchParams.get('v');
      } catch (e) {
        return input;
      }
    } catch (e) {
      return input;
    }
  },
};
