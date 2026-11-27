// Messages from the embedded lab to whatever is showing it. The app receives
// them in the WebView's onMessage; a web page receives them from an iframe.
//   { "source": "anveshya-lab", "type": "ready" | "close", "lab": "<slug>" }
export function postToHost(type, lab) {
  const message = JSON.stringify({ source: "anveshya-lab", type, lab });
  if (window.ReactNativeWebView?.postMessage) {
    window.ReactNativeWebView.postMessage(message);
    return true;
  }
  if (window.parent !== window) {
    window.parent.postMessage(message, "*");
    return true;
  }
  return false;
}
