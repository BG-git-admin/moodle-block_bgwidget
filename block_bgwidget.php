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
 * Block bgwidget is defined here.
 *
 * @package     block_bgwidget
 * @copyright   2024 Franco Muzzio <franco.muzzio@botgenes.com>
 * @license     https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class block_bgwidget extends block_base {

    const BOT_ID_DEFAULT = 'BG0003';
    const BOT_NAME_DEFAULT = 'ChatBot';
    const ENV_DEFAULT = 'test';
    const API_BASE_URL_DEFAULT = 'http://192.168.1.183';
    /**
     * Initializes class member variables.
     */
    public function init() {
        $this->title = ""; //get_string('pluginname', 'block_bgwidget');
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

        // Obtener variables de configuración y cargar scripts
        $this->load_block_scripts();
        $bot_id = $this->get_bot_id();
        $env = $this->get_env();
        $bot_name = $this->get_bot_name();
        $api_base_url = $this->get_api_base_url();
        $username = $USER->firstname;

        // Generar contenido del bloque
        $this->content = new stdClass();
        $this->content->text = $this->generate_block_content($bot_id, $bot_name, $env, $username, $api_base_url);

        return $this->content;
    }

    /**
     * Defines configuration data.
     *
     * The function is called immediately after init().
     */
    public function specialization() {
        $this->title = "";//$this->get_block_title();
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

    // Habilitar la configuración del bloque
    public function instance_allow_config() {
        return true;
    }

    // Guardar la configuración del bloque
    public function instance_config_save($data, $nolongerused = false) {
        $data->title = $this->get_string_or_default($data->title, 'pluginname');
        return parent::instance_config_save($data, $nolongerused);
    }

    /**
     * Cargar los scripts necesarios para el bloque.
     */
    private function load_block_scripts() {
        global $PAGE;
        $PAGE->requires->strings_for_js(
            ['success_connection_message', 'connection_failure_message', 'send_message_failure_message'],
            'block_bgwidget'
        );
        $PAGE->requires->jquery();
        $PAGE->requires->js_call_amd('block_bgwidget/bgwidget', 'init');
    }

    /**
     * Obtener el bot_id de la configuración del bloque.
     *
     * @return string El bot_id configurado o el valor por defecto.
     */
    private function get_bot_id() {
        return isset($this->config->bot_id) ? $this->config->bot_id : self::BOT_ID_DEFAULT;
    }

    /**
     * Obtener el entorno (env) de la configuración del bloque.
     *
     * @return string El entorno configurado o el valor por defecto.
     */
    private function get_env() {
        return isset($this->config->env) ? $this->config->env : self::ENV_DEFAULT;
    }

    /**
     * Obtener el nombre del bot de la configuración del bloque.
     *
     * @return string El entorno configurado o el valor por defecto.
     */
    private function get_bot_name() {
        return isset($this->config->bot_name) ? $this->config->bot_name : self::BOT_NAME_DEFAULT;
    }

    /**
     * Obtener el nombre del bot de la configuración del bloque.
     *
     * @return string El entorno configurado o el valor por defecto.
     */
    private function get_api_base_url() {
        return isset($this->config->api_base_url) ? $this->config->api_base_url : self::API_BASE_URL_DEFAULT;
    }

    /**
     * Generar el contenido HTML del bloque.
     *
     * @param string $bot_id
     * @param string $env
     * @return string El HTML generado usando la plantilla Mustache.
     */
    private function generate_block_content($bot_id, $bot_name, $env, $username, $api_base_url) {
        global $OUTPUT;
        // Contexto que pasará los mensajes a la plantilla Mustache.
        $templatecontext = [
            'bot_id' => $bot_id,
            'env' => $env,
            'user_name' => $username,
            'bot_name' => $bot_name,
            'api_base_url' => $api_base_url,
        ];

        // Renderizar la plantilla Mustache y retornar el contenido.
        return $OUTPUT->render_from_template('block_bgwidget/widget_name', $templatecontext);
    }

    /**
     * Obtener el título configurado del bloque.
     *
     * @return string El título configurado o el valor por defecto.
     */
    private function get_block_title() {
        return empty($this->config->title) ? get_string('pluginname', 'block_bgwidget') : $this->config->title;
    }

    /**
     * Obtener una cadena o usar un valor por defecto si está vacía.
     *
     * @param string $value La cadena a evaluar.
     * @param string $default_key La clave del valor por defecto.
     * @return string El valor de la cadena o el valor por defecto.
     */
    private function get_string_or_default($value, $default_key) {
        return empty($value) ? get_string($default_key, 'block_bgwidget') : $value;
    }
}
