export default {
  re: [/https?:\/\/[a-zA-Z0-9]*\.?h5p\.com/i],
  mixins: ["*"],

  getLinks(url, meta) {
    return {
      template_context: {
        iframe_src: url,
        title: meta["html-title"],
        height: 400,
      },
      rel: [CONFIG.R.html5],
      type: CONFIG.T.text_html,
    };
  },
};
