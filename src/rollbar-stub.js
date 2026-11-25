// personal-fork: no error reporting service; app code still calls window.Rollbar, so it gets no-op methods
window.Rollbar = {
  configure: function () {},
  error: function () {},
  warning: function () {},
  info: function () {},
  log: function () {},
  debug: function () {},
  critical: function () {},
};
