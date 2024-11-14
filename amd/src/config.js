
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <https://www.gnu.org/licenses/>.

/**
 * Description of what this file does.
 *
 * @category    module
 * @copyright   2024 Franco Muzzio <franco.muzzio@botgenes.com>
 * @license     https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
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
