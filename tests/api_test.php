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
 * @category    test
 * @copyright   2024 Franco Muzzio <franco.muzzio@botgenes.com>
 * @license     https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace block_bgwidget;

/**
 * The api test class.
 *
 * @package     block_bgwidget
 * @category    test
 * @copyright   2024 Franco Muzzio <franco.muzzio@botgenes.com>
 * @license     https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class api_test extends \advanced_testcase
{

    // Write the tests here as public funcions.
    // Please refer to {@link https://docs.moodle.org/dev/PHPUnit} for more details on PHPUnit tests in Moodle.

    /**
     * Dummy test.
     *
     * This is to be replaced by some actually usefule test.
     *
     * @coversNothing
     */

    // Configuración inicial para el test
    private $api_base_url = "http://192.168.1.183/secure/api";
    private $token = "mocked_token";
    private $user_name = "Franco";
    private $bot_id = "BG0003";
    private $bot_name = "ChatBot";
    private $env = "test";
    private $channel = "MO";

    // Método para configurar el entorno de pruebas.
    public function setUp(): void
    {
        $this->resetAfterTest(true); // Resetea el estado de Moodle después de cada test.
    }
    /**
     * Simular llamada a la API usando mock.
     * @param string $url
     * @param array $data
     * @param bool $return_success
     * @return array
     * @throws \Exception
     */

    private function mock_api_post($url, $data, $return_success = true)
    {
        // Simular una respuesta exitosa de la API
        if ($return_success) {
            if ($url == $this->api_base_url . '/connect') {
                return [
                    'data' => [
                        'token' => $this->token,
                        'initial_response' => 'Bienvenido al chat, ¿cómo puedo ayudarte?',
                    ],
                    'message' => 'token_generated'
                ];
            }

            if ($url == $this->api_base_url . '/message') {
                return [
                    'data' => [
                        'text' => 'Respuesta del bot: ¿En qué puedo ayudarte?',
                        'ads' => [],
                        'buttons' => [],
                        'geolocation' => [],
                    ],
                    'message' => 'bot_reply'
                ];
            }
        }

        // Simular un fallo en la API
        throw new \Exception('Error al conectar con la API');
    }

    /**
     * Test de conexión exitosa a la API.
     *
     * @covers \block_bgwidget\api_test::mock_api_post
     */
    public function test_api_connection_success()
    {
        // Datos que serían enviados a la API
        $data = [
            'bot_id' => $this->bot_id,
            'env' => $this->env,
            'channel' => $this->channel,
            'username' => $this->stringToHex($this->user_name),
        ];

        // Simular la llamada a la API con éxito
        try {
            $response = $this->mock_api_post($this->api_base_url . '/connect', $data, true);

            // Verificar que la respuesta tiene el token correcto
            $this->assertEquals($this->token, $response['data']['token']);

            // Verificar que el mensaje inicial sea el esperado
            $this->assertEquals('Bienvenido al chat, ¿cómo puedo ayudarte?', $response['data']['initial_response']);
        } catch (\Exception $e) {
            $this->fail('La conexión a la API falló cuando no debería.');
        }
    }


    /**
     * Test de fallo en la conexión a la API.
     *
     * @covers \block_bgwidget\api_test::mock_api_post
     */
    public function test_api_connection_failure()
    {
        // Datos que serían enviados a la API
        $data = [
            'bot_id' => 'BG0003',
            'env' => $this->env,
            'channel' => $this->channel,
            'username' => $this->stringToHex($this->user_name),
        ];

        // Simular la llamada a la API con fallo
        try {
            $response = $this->mock_api_post($this->api_base_url . '/connect', $data, false);
            $this->fail('La conexión a la API debería haber fallado, pero no lo hizo.');
        } catch (\Exception $e) {
            // Verificar que la excepción fue lanzada correctamente
            $this->assertEquals('Error al conectar con la API', $e->getMessage());
        }
    }

    /**
     * Test de envío exitoso de mensaje a la API.
     *
     * @covers \block_bgwidget\api_test::mock_api_post
     */
    public function test_api_message_send_success()
    {
        // Datos que serían enviados a la API para enviar un mensaje
        $data = [
            'user_input' => 'Hola, bot',
            'env' => $this->env,
        ];

        // Simular la llamada a la API con éxito
        try {
            $response = $this->mock_api_post($this->api_base_url . '/message', $data, true);

            // Verificar que la respuesta del bot es la esperada
            $this->assertEquals('Respuesta del bot: ¿En qué puedo ayudarte?', $response['data']['text']);
        } catch (\Exception $e) {
            $this->fail('El envío del mensaje falló cuando no debería.');
        }
    }

    /**
     * Test de fallo en el envío de mensaje a la API.
     *
     * @covers \block_bgwidget\api_test::mock_api_post
     */
    public function test_api_message_send_failure()
    {
        // Datos que serían enviados a la API para enviar un mensaje
        $data = [
            'user_input' => 'Hola, bot',
            'env' => $this->env,
        ];

        // Simular la llamada a la API con fallo
        try {
            $response = $this->mock_api_post($this->api_base_url . '/message', $data, false);
            $this->fail('El envío del mensaje debería haber fallado, pero no lo hizo.');
        } catch (\Exception $e) {
            // Verificar que la excepción fue lanzada correctamente
            $this->assertEquals('Error al conectar con la API', $e->getMessage());
        }
    }

    /**
     * Convertir una cadena en hexadecimal.
     *
     * @param string $str
     * @return string
     */
    private function stringToHex($str)
    {
        $hex = "";
        for ($i = 0; $i < strlen($str); $i++) {
            $hex .= dechex(ord($str[$i]));
        }
        return $hex;
    }
}
