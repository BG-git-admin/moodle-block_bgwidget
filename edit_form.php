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
 * @category    admin
 * @copyright   2024 Franco Muzzio <franco.muzzio@botgenes.com>
 * @license     https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require_once($CFG->dirroot.'/blocks/edit_form.php');

class block_bgwidget_edit_form extends block_edit_form {

    protected function specific_definition($mform) {
        $mform->addElement('text', 'config_bot_id', get_string('bot_id', 'block_bgwidget'));
        $mform->setType('config_bot_id', PARAM_TEXT);
        $mform->setDefault('config_bot_id', 'BG0003');

        $mform->addElement('text', 'config_bot_name', get_string('bot_name', 'block_bgwidget'));
        $mform->setType('config_bot_name', PARAM_TEXT);
        $mform->setDefault('config_bot_name', 'ChatBot');

        $mform->addElement('text', 'config_api_base_url', get_string('api_base_url', 'block_bgwidget'));
        $mform->setType('config_api_base_url', PARAM_TEXT);
        $mform->setDefault('config_api_base_url', 'http://192.168.1.183');

        $mform->addElement('text', 'config_api_token', get_string('api_token', 'block_bgwidget'));
        $mform->setType('config_api_token', PARAM_TEXT);
        $mform->setDefault('config_api_token', '');
    }
}
