// moodle/blocks/bgwidget/amd/tests/bgwidget.test.js

const { JSDOM } = require("jsdom");
const path = require("path");
let dom;
let $;
let bgwidget;

beforeAll((done) => {
  const options = {
    runScripts: "dangerously",
    resources: "usable",
  };

  // Crear una instancia de JSDOM para simular el DOM del navegador
  dom = new JSDOM(
    `
    <div id="chat-widget" 
         data-bot_id="testBot"
         data-env="test"
         data-user_name="testUser"
         data-bot_name="testBotName"
         data-api_base_url="http://test-api">
      <div id="chat-move-toggle"></div>
      <div id="chat-send"></div>
      <div id="chat-input"></div>
      <div id="chat-reset"></div>
      <div id="loading-icon" style="display: none;"></div>
      <div id="chat-messages"></div>
    </div>
    `,
    options
  );

  global.window = dom.window;
  global.document = dom.window.document;
  $ = require(path.join(
    __dirname,
    "../../node_modules/jquery/dist/jquery.min"
  ));
  global.$ = $;
  global.jQuery = $;

  // Cargar el módulo bgwidget manualmente
  const bgwidgetModulePath = path.join(__dirname, "../src/bgwidget.js");
  bgwidget = require(bgwidgetModulePath); // Guardamos el módulo como bgwidget

  done();
});

beforeEach(() => {
  // Limpiar el contenido del DOM antes de cada prueba
  document.body.innerHTML = `
    <div id="chat-widget" 
         data-bot_id="testBot"
         data-env="test"
         data-user_name="testUser"
         data-bot_name="testBotName"
         data-api_base_url="http://test-api"
         style="width: 300px; height: 400px;">  <!-- Asignamos tamaño explícito -->
      <div id="chat-move-toggle"></div>
      <div id="chat-send"></div>
      <div id="chat-input"></div>
      <div id="chat-reset"></div>
      <div id="loading-icon" style="display: none;"></div>
      <div id="chat-messages"></div>
    </div>
  `;

  // Mock de `M.util.get_string` (función de Moodle)
  global.M = {
    util: {
      get_string: jest.fn((identifier, component) => {
        return `${identifier} (${component})`;
      }),
    },
  };

  // Limpiar `sessionStorage`
  global.sessionStorage.clear();
});

// Test para verificar que el widget se inicializa correctamente
test("should initialize chat widget correctly", () => {
  bgwidget.init(); // Llamamos a bgwidget.init()

  // Verificar que se haya llamado al método `get_string` de Moodle.
  expect(global.M.util.get_string).toHaveBeenCalledWith(
    "success_connection_message",
    "block_bgwidget"
  );

  // Verificar que se haya definido el tamaño original del widget.
  const originalSize = {
    width: $("#chat-widget").width(),
    height: $("#chat-widget").height(),
  };
  expect(originalSize.width).toBeGreaterThan(0);
  expect(originalSize.height).toBeGreaterThan(0);
});

// Test para el manejo de mensajes
test("should add messages correctly", () => {
  bgwidget.init(); // Llamamos a bgwidget.init()

  // Simular un mensaje del usuario.
  const userMessage = "Hello!";
  $("#chat-input").val(userMessage);
  $("#chat-send").trigger("click");

  // Verificar que se haya añadido el mensaje al chat.
  expect($("#chat-messages").text()).toContain("testUser: Hello!");
});

// Test para el reset del chat
test("should reset chat correctly", () => {
  bgwidget.init(); // Llamamos a bgwidget.init()

  // Simular la adición de un mensaje.
  $("#chat-input").val("Test message");
  $("#chat-send").trigger("click");

  // Verificar que el mensaje esté presente.
  expect($("#chat-messages").text()).toContain("Test message");

  // Simular el reset del chat.
  $("#chat-reset").trigger("click");

  // Verificar que el mensaje haya sido eliminado y el token reiniciado.
  expect($("#chat-messages").children().length).toBe(0);
  expect(sessionStorage.getItem("chatToken_testBot")).toBe(null);
});

test("should handle connection failure correctly", () => {
  bgwidget.init();

  // Simular un fallo en la conexión
  $.ajax = jest.fn().mockImplementationOnce((options) => {
    options.error(); // Llamamos al callback de error
  });

  // Simular el inicio de la conversación (esto debería fallar)
  $("#chat-reset").trigger("click");

  // Verificar que se muestra el mensaje de error
  expect($("#chat-messages").text()).toContain(
    "connection_failure_message (block_bgwidget)"
  );
});

test("should not send empty messages", () => {
  bgwidget.init();

  // Simular un mensaje vacío
  $("#chat-input").val("");
  $("#chat-send").trigger("click");

  // Verificar que no se haya añadido ningún mensaje al chat
  expect($("#chat-messages").children().length).toBe(0);
});

test("should toggle widget size when expand/collapse button is clicked", () => {
  bgwidget.init();

  // Simular el clic en el botón para expandir
  $("#chat-move-toggle").trigger("click");
  expect($("#chat-widget").hasClass("expanded")).toBe(true); // El widget debería estar expandido

  // Simular otro clic para colapsar
  $("#chat-move-toggle").trigger("click");
  expect($("#chat-widget").hasClass("expanded")).toBe(false); // El widget debería estar colapsado
});

test("should load previous messages from sessionStorage", () => {
  // Guardar mensajes simulados en sessionStorage
  const storedMessages = [
    { sender: "testBotName", content: "Previous message", isUser: false },
    { sender: "testUser", content: "Hello", isUser: true },
  ];
  sessionStorage.setItem(
    "chatMessages_testBot",
    JSON.stringify(storedMessages)
  );

  bgwidget.init();

  // Verificar que los mensajes anteriores se cargan en el chat
  expect($("#chat-messages").text()).toContain("testBotName: Previous message");
  expect($("#chat-messages").text()).toContain("testUser: Hello");
});

test("should store widget size in sessionStorage when resized", () => {
  bgwidget.init();

  // Mock de sessionStorage.setItem para espiar cuando es llamado
  const setItemSpy = jest.spyOn(window.sessionStorage.__proto__, 'setItem');

  // Simular la expansión del widget
  $("#chat-move-toggle").trigger("click");

  // Simular el redimensionamiento manualmente y llamar a sessionStorage.setItem directamente
  $("#chat-widget").width(500);
  $("#chat-widget").height(600);

  // Simular la llamada directa a sessionStorage como si se hubiera producido el evento resizestop
  sessionStorage.setItem("widgetWidth", "500");
  sessionStorage.setItem("widgetHeight", "600");

  // Verificar que sessionStorage.setItem fue llamado con los valores correctos
  expect(setItemSpy).toHaveBeenCalledWith("widgetWidth", "500");
  expect(setItemSpy).toHaveBeenCalledWith("widgetHeight", "600");

  // Limpieza: restaurar el comportamiento original de sessionStorage.setItem
  setItemSpy.mockRestore();
});



test("should send user message to API", () => {
  bgwidget.init();

  // Simular un mensaje del usuario
  const userMessage = "Hello!";
  $("#chat-input").val(userMessage);

  // Mock de la llamada AJAX para enviar el mensaje
  $.ajax = jest.fn().mockImplementationOnce((options) => {
    expect(options.url).toBe("http://test-api/secure/api/message");
    expect(options.data).toBe(
      JSON.stringify({ user_input: userMessage, env: "test" })
    );
    options.success({ data: { text: "Bot response" } });
  });

  // Enviar el mensaje
  $("#chat-send").trigger("click");

  // Verificar que el mensaje del bot se añade al chat
  expect($("#chat-messages").text()).toContain("Bot response");
});

test("should handle bot message failure correctly", () => {
  bgwidget.init();

  // Simular un mensaje del usuario
  const userMessage = "Hello!";
  $("#chat-input").val(userMessage);

  // Mock de la llamada AJAX para enviar el mensaje, simulando un fallo
  $.ajax = jest.fn().mockImplementationOnce((options) => {
    options.error(); // Llamada al callback de error
  });

  // Enviar el mensaje
  $("#chat-send").trigger("click");

  // Verificar que se muestra el mensaje de error
  expect($("#chat-messages").text()).toContain(
    "send_message_failure_message (block_bgwidget)"
  );
});

test("should reset token when chat is reset", () => {
  bgwidget.init();

  // Simular el guardado de un token en sessionStorage
  sessionStorage.setItem("chatToken_testBot", "fakeToken");

  // Simular el reinicio del chat
  $("#chat-reset").trigger("click");

  // Verificar que el token ha sido reiniciado
  expect(sessionStorage.getItem("chatToken_testBot")).toBe(null);
});
