export default {
  re: [/https?:\/\/[a-zA-Z0-9]*\.?h5p\.com/i],
  mixins: ["*"],

  getLinks: function (url, meta) {
    console.log("> plugin called getLinks");
    console.log(JSON.stringify({ url, meta }, null, 2));
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
