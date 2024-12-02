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
 * @category    block
 * @copyright   2024 Franco Muzzio <franco.muzzio@botgenes.com>
 * @license     https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class block_bgwidget extends block_base {

    const BOT_ID_DEFAULT = 'BG0003';
    const BOT_NAME_DEFAULT = 'ChatBot';
    const ENV_DEFAULT = 'test';
    const API_TOKEN_DEFAULT = '';
    const API_BASE_URL_DEFAULT = 'http://192.168.1.183';
    /**
     * Initializes class member variables.
     */
    public function init() {
        $this->title = get_string('pluginname', 'block_bgwidget');
    }

    /**
     * Returns the block contents.
     *
     * @return stdClass The block contents.
     */
    public function get_content() {
        global $USER;
        if ($this->content !== null) {
            return $this->content;
        }

        // Get configuration variables and load scripts
        $this->load_block_scripts();
        $bot_id = $this->get_bot_id();
        $api_token = $this->get_api_token();
        $env = $this->get_env();
        $bot_name = $this->get_bot_name();
        $api_base_url = $this->get_api_base_url();
        $username = $USER->firstname;

        // Generate block content
        $this->content = new stdClass();
        $this->content->text = $this->generate_block_content($bot_id, $bot_name, $env, $api_token, $username, $api_base_url);

        return $this->content;
    }

    /**
     * Defines configuration data.
     *
     * The function is called immediately after init().
     */
    public function specialization() {
        $this->title = $this->get_block_title();
    }

    /**
     * Enables global configuration of the block in settings.php.
     *
     * @return bool True if the global configuration is enabled.
     */
    public function has_config() {
        return true;
    }

    /**
     * Sets the applicable formats for the block.
     *
     * @return string[] Array of pages and permissions.
     */
    public function applicable_formats() {
        return array(
            'all' => true,
        );
    }

    // Enable block configuration
    public function instance_allow_config() {
        return true;
    }

    // Save block configuration
    public function instance_config_save($data, $nolongerused = false) {
        $data->title = $this->get_string_or_default($data->title, 'pluginname');
        return parent::instance_config_save($data, $nolongerused);
    }

    /**
     * Load necessary scripts for the block.
     */
    private function load_block_scripts() {
        global $PAGE;
        $PAGE->requires->strings_for_js(
            ['success_connection_message', 'connection_failure_message', 'send_message_failure_message'],
            'block_bgwidget'
        );
        $PAGE->requires->jquery();
        $PAGE->requires->jquery_plugin('ui');
        $PAGE->requires->js_call_amd('block_bgwidget/bgwidget', 'init');
    }

    /**
     * Get the bot_id from the block configuration.
     *
     * @return string The configured bot_id or the default value.
     */
    private function get_bot_id() {
        return isset($this->config->bot_id) ? $this->config->bot_id : self::BOT_ID_DEFAULT;
    }

    /**
     * Get the environment (env) from the block configuration.
     *
     * @return string The configured environment or the default value.
     */
    private function get_env() {
        return isset($this->config->env) ? $this->config->env : self::ENV_DEFAULT;
    }

    /**
     * Get the api_token from the block configuration.
     *
     * @return string The configured api_token or the default value.
     */
    private function get_api_token() {
        return isset($this->config->api_token) ? $this->config->api_token : self::API_TOKEN_DEFAULT;
    }

    /**
     * Get the bot name from the block configuration.
     *
     * @return string The configured bot name or the default value.
     */
    private function get_bot_name() {
        return isset($this->config->bot_name) ? $this->config->bot_name : self::BOT_NAME_DEFAULT;
    }

    /**
     * Get the API base URL from the block configuration.
     *
     * @return string The configured API base URL or the default value.
     */
    private function get_api_base_url() {
        return isset($this->config->api_base_url) ? $this->config->api_base_url : self::API_BASE_URL_DEFAULT;
    }

    /**
     * Generate the HTML content of the block.
     *
     * @param string $bot_id
     * @param string $bot_name
     * @param string $env
     * @param string $api_token
     * @param string $username
     * @param string $api_base_url
     * @return string The HTML generated using the Mustache template.
     */
    private function generate_block_content($bot_id, $bot_name, $env, $api_token, $username, $api_base_url) {
        global $OUTPUT;
        // Context that will pass messages to the Mustache template.
        $templatecontext = [
            'bot_id' => $bot_id,
            'env' => $env,
            'api_token' => $api_token,
            'user_name' => $username,
            'bot_name' => $bot_name,
            'api_base_url' => $api_base_url,
        ];

        // Render the Mustache template and return the content.
        return $OUTPUT->render_from_template('block_bgwidget/widget_name', $templatecontext);
    }

    /**
     * Get the configured block title.
     *
     * @return string The configured title or the default value.
     */
    private function get_block_title() {
        return empty($this->config->title) ? get_string('pluginname', 'block_bgwidget') : $this->config->title;
    }

    /**
     * Get a string or use a default value if it is empty.
     *
     * @param string $value The string to evaluate.
     * @param string $default_key The key of the default value.
     * @return string The value of the string or the default value.
     */
    private function get_string_or_default($value, $default_key) {
        return empty($value) ? get_string($default_key, 'block_bgwidget') : $value;
    }
}
