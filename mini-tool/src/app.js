(function () {
  "use strict";

  var root = document.getElementById("main");
  if (!root) return;

  if (!window.__MINI_TOOL_DATA__) {
    root.innerHTML = '<p role="status">内容正在准备中，请稍后再试。</p>';
  }
}());
