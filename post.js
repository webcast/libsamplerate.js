// libmad function wrappers

var isNode = typeof process === "object" && typeof require === "function";

Mad = {};

if (isNode) {
  module.exports = Mad;
}

return Mad;

}).call(context)})();
