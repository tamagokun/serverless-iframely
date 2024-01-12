export function prepareUri(uri?: string) {
  if (!uri) return uri;

  uri = uri.replace(/[\u200B-\u200D\uFEFF]/g, "");

  if (uri.match(/^\/\//i)) {
    return "http:" + uri;
  }

  if (!uri.match(/^https?:\/\//i)) {
    return "http://" + uri;
  }

  return uri;
}
