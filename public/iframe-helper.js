const MutationObserver =
  window.MutationObserver || window.WebKitMutationObserver;

function reportSize() {
  const target =
    document.body.firstElementChild || document.querySelector("body");
  const dimensions = target.getBoundingClientRect();
  const minHeight = Math.round(dimensions.top + dimensions.bottom);
  const data = JSON.stringify({
    id: embedId,
    height: minHeight,
    width: Math.round(dimensions.left + dimensions.right),
  });
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(data);
  } else {
    window.parent.postMessage(data, "*");
  }
}

var observer = new MutationObserver(reportSize);
observer.observe(document, {
  subtree: true,
  attributes: true,
});

window.parent.addEventListener("load", reportSize);
setTimeout(reportSize, 3000); // backup
