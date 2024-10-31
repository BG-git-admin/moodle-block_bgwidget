define([], function () {
  window.requirejs.config({
    paths: {
      jqueryui: M.cfg.wwwroot + "/lib/jquery/ui-1.13.2/jquery-ui.min",
      'jquery-ui-dist': M.cfg.wwwroot + "/lib/jquery/ui-1.13.2/jquery-ui.min"
    },
    shim: {
      jqueryui: { exports: "jqueryui" },
    },
  });
});
