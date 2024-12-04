define('jquery-ui', ['jquery'], function ($) {
    require(['/blocks/bgwidget/lib/jquery-ui-1.14.1.custom/jquery-ui.min.js'], function() {
        console.log('Custom jQuery UI loaded');
    });
    return $;
});