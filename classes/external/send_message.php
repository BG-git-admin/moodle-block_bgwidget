<?php
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
 * @package     block_bgwidget
 * @category    external
 * @copyright   2024 Franco Muzzio <franco.muzzio@botgenes.com>
 * @license     https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace block_bgwidget\external;

use external_api;
use external_description;
use external_function_parameters;
use external_multiple_structure;
use external_single_structure;
use external_value;

defined('MOODLE_INTERNAL') || die();

require_once($CFG->libdir . '/externallib.php');

/**
 * External function 'block_bgwidget_send_message' implementation.
 *
 * @package     block_bgwidget
 * @category    external
 * @copyright   2024 Franco Muzzio <franco.muzzio@botgenes.com>
 * @license     https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class send_message extends external_api {

    /**
     * Describes parameters of the {@see self::execute()} method.
     *
     * @return external_function_parameters
     */
    public static function execute_parameters(): external_function_parameters {

        return new external_function_parameters([
            'message' => new external_value(PARAM_TEXT, 'Message to send to the bot'),
        ]);
    }

    /**
     * TODO describe what the function actually does.
     *
     * @param string $message
     * @return mixed TODO document
     */
    public static function execute(string $message) {

        // Re-validate parameters in rare case this method was called directly.
        [
            'message' => $message,
        ] = self::validate_parameters(self::execute_parameters(), [
            'message' => $message,
        ]);

        // Set up and validate appropriate context.
        // TODO Check and eventually replace system context with a different one as needed.
        $context = \context_system::instance();
        self::validate_context($context);

        // Check capabilities.
        require_capability('block/bgwidget:example', $context);

        // TODO Implement the function and return the expected value.
    }

    /**
     * Describes the return value of the {@see self::execute()} method.
     *
     * @return external_description
     */
    public static function execute_returns(): external_description {

        return new external_value(PARAM_RAW, 'Response from the bot');
    }
}
