define('chatConfig', ['jquery'], function($) {
  /**
   * Object that stores the chat configuration.
   * @type {Object}
   */
  const chatConfig = {
    bot_id: null,
    env: null,
    api_token: null,
    user_name: null,
    bot_name: null,
    api_base_url: null,
    SUCCESS_CONECTION_MESSAGE: null,
    CONECTION_FAILURE_MESSAGE: null,
    SEND_MESSAGE_FAILURE_MESSAGE: null,
    DEFAULT_WIDGET_DIMENSIONS: null,
    CHANNEL_ACRONYM: "MO",
    tokenKey: null,
    messagesKey: null,
    token: "",
    messages: [],
    isPinned: true
  };

  // Constants for sessionStorage keys
  const SESSION_STORAGE_KEYS = {
    TOKEN: "chatToken_",
    MESSAGES: "chatMessages_"
  };

  // Constants for message keys
  const MESSAGE_KEYS = {
    SUCCESS: "success_connection_message",
    FAILURE: "connection_failure_message",
    SEND_FAILURE: "send_message_failure_message"
  };

  /**
   * Sets the chat configuration variables from DOM data.
   */
  function setChatConfig() {
    chatConfig.bot_id = getDataAttribute("#chat-widget", "bot_id");
    chatConfig.env = getDataAttribute("#chat-widget", "env");
    chatConfig.api_token = getDataAttribute("#chat-widget", "api_token");
    chatConfig.user_name = getDataAttribute("#chat-widget", "user_name");
    chatConfig.bot_name = getDataAttribute("#chat-widget", "bot_name");
    chatConfig.api_base_url = getDataAttribute("#chat-widget", "api_base_url");

    chatConfig.SUCCESS_CONECTION_MESSAGE = M.util.get_string(
      MESSAGE_KEYS.SUCCESS,
      "block_bgwidget"
    );
    chatConfig.CONECTION_FAILURE_MESSAGE = M.util.get_string(
      MESSAGE_KEYS.FAILURE,
      "block_bgwidget"
    );
    chatConfig.SEND_MESSAGE_FAILURE_MESSAGE = M.util.get_string(
      MESSAGE_KEYS.SEND_FAILURE,
      "block_bgwidget"
    );

    chatConfig.tokenKey = SESSION_STORAGE_KEYS.TOKEN + chatConfig.bot_id;
    chatConfig.messagesKey = SESSION_STORAGE_KEYS.MESSAGES + chatConfig.bot_id;
    chatConfig.DEFAULT_WIDGET_DIMENSIONS = {
      WIDTH: "40%",
      HEIGHT: "50%",
      MAX_HEIGHT_UNPINNED: "90vh",
      MAX_HEIGHT_PINNED: "45vh"
    };
  }

  /**
   * Retrieves a data attribute from a DOM element.
   * @param {string} selector - The selector for the DOM element.
   * @param {string} attribute - The data attribute to retrieve.
   * @returns {string|null} The value of the data attribute or null if not found.
   */
  function getDataAttribute(selector, attribute) {
    const value = $(selector).data(attribute);
    return value !== undefined ? value : null;
  }

  return {
    chatConfig: chatConfig,
    setChatConfig: setChatConfig
  };
});