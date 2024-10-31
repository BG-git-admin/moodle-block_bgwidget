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

namespace bgwidget;

// Incluye la configuración de Moodle para cargar el contexto.
require_once(__DIR__ . '/../../../config.php');

// Incluye la clase base de bloques de Moodle.
require_once(__DIR__ . '/../../moodleblock.class.php');

// Incluye la clase del bloque.
require_once(__DIR__ . '/../block_bgwidget.php');

/**
 * Mock class to represent the requires object.
 */
class MockRequires
{
    public $strings_for_js_called = false;
    public $jquery_called = false;
    public $js_call_amd_called = false;

    public function strings_for_js($strings, $component)
    {
        // Registrar que el método fue llamado.
        $this->strings_for_js_called = true;

        // Puedes verificar si los argumentos son correctos.
        if ($strings !== ['success_connection_message', 'connection_failure_message', 'send_message_failure_message'] || $component !== 'block_bgwidget') {
            throw new \Exception('Incorrect arguments passed to strings_for_js.');
        }
    }

    public function jquery()
    {
        // Registrar que el método fue llamado.
        $this->jquery_called = true;
    }

    public function js_call_amd($module, $function)
    {
        // Registrar que el método fue llamado.
        $this->js_call_amd_called = true;

        // Verificar que los argumentos sean correctos.
        if ($module !== 'block_bgwidget/bgwidget' || $function !== 'init') {
            throw new \Exception('Incorrect arguments passed to js_call_amd.');
        }
    }
}


/**
 * Unit tests for block_bgwidget class.
 *
 * @package     bgwidget
 * @category    test
 * @copyright   2024 Franco Muzzio
 * @license     https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class bgwidget_test extends \advanced_testcase
{
    /**
     * Set up method to reset environment before each test.
     */
    protected function setUp(): void
    {
        $this->resetAfterTest(true);
    }

    /**
     * Helper function to invoke private methods.
     *
     * @param object $object The object containing the private method.
     * @param string $methodName The name of the private method to access.
     * @param array $parameters The parameters to pass to the method (default: []).
     * @return mixed The return value of the method.
     */
    private function invoke_private_method($object, $methodName, $parameters = [])
    {
        $reflection = new \ReflectionClass($object);
        $method = $reflection->getMethod($methodName);
        $method->setAccessible(true);
        return $method->invokeArgs($object, $parameters);
    }

    /**
     * Test that the block initializes correctly.
     */
    public function test_init()
    {
        $block = new \block_bgwidget();
        $block->init();
        $this->assertEquals('', $block->title, 'Block title should be empty by default.');
    }

    /**
     * Test that the block content is generated correctly.
     *
     * This test ensures that the content of the block includes all relevant
     * information like the user's first name, bot ID, bot name, environment, 
     * and API base URL.
     */
    public function test_get_content()
    {
        global $USER;
        $USER->firstname = 'TestUser';

        // Crear instancia del bloque.
        $block = new \block_bgwidget();
        $content = $block->get_content();

        // Validar que el contenido no sea nulo.
        $this->assertNotNull($content, 'Block content should not be null.');

        // Validar que el contenido contiene el nombre de usuario.
        $this->assertStringContainsString('TestUser', $content->text, 'Block content should contain the user name.');

        // Validar que el contenido contiene el ID de bot por defecto.
        $this->assertStringContainsString(\block_bgwidget::BOT_ID_DEFAULT, $content->text, 'Block content should contain the default bot ID.');

        // Validar que el contenido contiene el nombre del bot por defecto.
        $this->assertStringContainsString(\block_bgwidget::BOT_NAME_DEFAULT, $content->text, 'Block content should contain the default bot name.');

        // Validar que el contenido contiene el entorno por defecto.
        $this->assertStringContainsString(\block_bgwidget::ENV_DEFAULT, $content->text, 'Block content should contain the default environment.');

        // Validar que el contenido contiene la URL base de la API por defecto.
        $this->assertStringContainsString(\block_bgwidget::API_BASE_URL_DEFAULT, $content->text, 'Block content should contain the default API base URL.');
    }


    /**
     * Test that the block has global configuration enabled.
     */
    public function test_has_config()
    {
        $block = new \block_bgwidget();
        $this->assertTrue($block->has_config(), 'The block should have global configuration enabled.');
    }

    /**
     * Test that the block is applicable to all page formats.
     */
    public function test_applicable_formats()
    {
        $block = new \block_bgwidget();
        $formats = $block->applicable_formats();
        $this->assertArrayHasKey('all', $formats, 'Block should be applicable to all formats.');
        $this->assertTrue($formats['all'], 'Block should be allowed in all formats.');
    }

    /**
     * Test that the block allows instance configuration.
     */
    public function test_instance_allow_config()
    {
        $block = new \block_bgwidget();
        $this->assertTrue($block->instance_allow_config(), 'The block should allow instance configuration.');
    }

    /**
     * Test that instance configuration is saved correctly.
     *
     * This test creates a mock block instance with all necessary fields and
     * verifies that calling instance_config_save correctly stores the instance
     * configuration in the database, ensuring the data is properly serialized.
     */
    public function test_instance_config_save()
    {
        global $DB;

        // Crear un bloque simulado.
        $block = new \block_bgwidget();

        // Crear una instancia de bloque ficticia con campos completos.
        $block->instance = new \stdClass();
        $block->instance->blockname = 'bgwidget';
        $block->instance->parentcontextid = 1; // Contexto válido ficticio.
        $block->instance->showinsubcontexts = 0;
        $block->instance->pagetypepattern = '*';
        $block->instance->subpagepattern = null;
        $block->instance->defaultregion = 'side-pre';
        $block->instance->defaultweight = 0;
        $block->instance->configdata = null; // Configuración inicial vacía.
        $block->instance->timecreated = time();
        $block->instance->timemodified = time();

        // Insertar la instancia ficticia en la base de datos.
        $block->instance->id = $DB->insert_record('block_instances', $block->instance);

        // Crear datos ficticios para el test de configuración.
        $data = new \stdClass();
        $data->title = ''; // Emula un escenario donde el título no está proporcionado.

        // Llamar al método a testear.
        $block->instance_config_save($data);

        // Verificar que la instancia de bloque se guardó correctamente en la base de datos.
        $savedData = $DB->get_record('block_instances', ['id' => $block->instance->id]);
        $this->assertNotEmpty($savedData, 'The block instance should be saved in the database.');

        // Validar que los datos se serializan y guardan correctamente.
        $this->assertEquals(base64_encode(serialize($data)), $savedData->configdata, 'The configdata should be correctly serialized and stored.');
    }

    /**
     * Test that the block's default configurations are returned correctly.
     */
    public function test_default_configurations()
    {
        $block = new \block_bgwidget();

        // Using the helper method to test private methods.
        $botId = $this->invoke_private_method($block, 'get_bot_id');
        $env = $this->invoke_private_method($block, 'get_env');
        $botName = $this->invoke_private_method($block, 'get_bot_name');
        $apiBaseUrl = $this->invoke_private_method($block, 'get_api_base_url');

        $this->assertEquals(\block_bgwidget::BOT_ID_DEFAULT, $botId, 'The bot_id should default to BOT_ID_DEFAULT.');
        $this->assertEquals(\block_bgwidget::ENV_DEFAULT, $env, 'The environment should default to ENV_DEFAULT.');
        $this->assertEquals(\block_bgwidget::BOT_NAME_DEFAULT, $botName, 'The bot name should default to BOT_NAME_DEFAULT.');
        $this->assertEquals(\block_bgwidget::API_BASE_URL_DEFAULT, $apiBaseUrl, 'The API base URL should default to API_BASE_URL_DEFAULT.');
    }

    /**
     * Test that the block loads the required scripts.
     *
     * This test uses a mock object for the $PAGE->requires property to verify 
     * that load_block_scripts() correctly calls the necessary methods to load 
     * JavaScript and related resources.
     */
    public function test_load_block_scripts_private()
    {
        global $PAGE;

        // Crear instancia de MockRequires para verificar llamadas a $PAGE->requires.
        $requiresMock = new MockRequires();
        $PAGE = new \stdClass();
        $PAGE->requires = $requiresMock;

        // Crear el bloque y llamar al método privado para cargar scripts.
        $block = new \block_bgwidget();
        $this->invoke_private_method($block, 'load_block_scripts');

        // Aserciones para validar que los métodos fueron llamados.
        $this->assertTrue($requiresMock->strings_for_js_called, 'The strings_for_js method should be called.');
        $this->assertTrue($requiresMock->jquery_called, 'The jquery method should be called.');
        $this->assertTrue($requiresMock->js_call_amd_called, 'The js_call_amd method should be called.');
    }
}
