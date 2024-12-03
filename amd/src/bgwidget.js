require.config({
    paths: {
        'jquery-ui': '/blocks/bgwidget/lib/jquery-ui-1.14.1.custom/jquery-ui-wrapper'
    },
    shim: {
        'jquery-ui': {
            deps: ['jquery'],
            exports: 'jQuery.ui'
        }
    }
});

define('bgwidget', ['jquery', 'jquery-ui'], function($) {
  // Encapsular variables globales en un objeto
  var chatConfig = {
    bot_id: null,
    env: null,
    api_token: null,
    user_name: null,
    bot_name: null,
    api_base_url: null,
    SUCCESS_CONECTION_MESSAGE: null,
    CONECTION_FAILURE_MESSAGE: null,
    SEND_MESSAGE_FAILURE_MESSAGE: null,
    CHANNEL_ACRONYM: "MO",
    tokenKey: null,
    messagesKey: null,
    token: "",
    messages: [],
    isPinned: true
  };

  /**
   * Inicializa el widget de chat.
   */
  function initialize() {
    setChatConfig();
    setMessages();
    setupWidget();
    loadPreviousMessages();
    if (!chatConfig.token) {
      initializeChat();
    }
    setupEventListeners();
  }

  /**
   * Configura las variables del chat.
   */
  function setChatConfig() {
    chatConfig.bot_id = $("#chat-widget").data("bot_id");
    chatConfig.env = $("#chat-widget").data("env");
    chatConfig.api_token = $("#chat-widget").data("api_token");
    chatConfig.user_name = $("#chat-widget").data("user_name");
    chatConfig.bot_name = $("#chat-widget").data("bot_name");
    chatConfig.api_base_url = $("#chat-widget").data("api_base_url");

    chatConfig.SUCCESS_CONECTION_MESSAGE = M.util.get_string(
      "success_connection_message",
      "block_bgwidget"
    );
    chatConfig.CONECTION_FAILURE_MESSAGE = M.util.get_string(
      "connection_failure_message",
      "block_bgwidget"
    );
    chatConfig.SEND_MESSAGE_FAILURE_MESSAGE = M.util.get_string(
      "send_message_failure_message",
      "block_bgwidget"
    );

    chatConfig.tokenKey = "chatToken_" + chatConfig.bot_id;
    chatConfig.messagesKey = "chatMessages_" + chatConfig.bot_id;
  }

  /**
   * Configura los mensajes del chat.
   */
  function setMessages() {
    chatConfig.token = sessionStorage.getItem(chatConfig.tokenKey) || "";
    chatConfig.messages = JSON.parse(sessionStorage.getItem(chatConfig.messagesKey)) || [];
  }

  /**
   * Configura el widget de chat.
   */
  function setupWidget() {
    var originalSize = getOriginalSize();
    var initialWidth = getInitialWidth(originalSize);
    var initialHeight = getInitialHeight(originalSize);
    setupWidgetToggle(originalSize, initialWidth, initialHeight);
  }

  /**
   * Gets the original size of the chat widget.
   * @returns {Object} An object containing the width and height of the widget.
   */
  function getOriginalSize() {
    return {
      width: $("#chat-widget").width(),
      height: $("#chat-widget").height(),
    };
  }

  /**
   * Gets the initial width of the chat widget.
   * @param {Object} originalSize - The original size of the widget.
   * @returns {number} The initial width of the widget.
   */
  function getInitialWidth(originalSize) {
    return sessionStorage.getItem("widgetWidth") || originalSize.width;
  }

  /**
   * Gets the initial height of the chat widget.
   * @param {Object} originalSize - The original size of the widget.
   * @returns {number} The initial height of the widget.
   */
  function getInitialHeight(originalSize) {
    return sessionStorage.getItem("widgetHeight") || originalSize.height;
  }

  /**
   * Sets up the toggle functionality for the chat widget.
   * @param {Object} originalSize - The original size of the widget.
   * @param {number} initialWidth - The initial width of the widget.
   * @param {number} initialHeight - The initial height of the widget.
   */
  function setupWidgetToggle(originalSize, initialWidth, initialHeight) {
    $("#chat-move-toggle").on("click", function () {
      chatConfig.isPinned = !chatConfig.isPinned;
      $("#chat-widget").toggleClass("expanded", !chatConfig.isPinned);

      if (!chatConfig.isPinned) {
        handleUnpin(initialWidth, initialHeight);
      } else {
        handlePin(originalSize);
      }
    });
  }

  /**
   * Handles the unpinning of the chat widget.
   * @param {number} initialWidth - The initial width of the widget.
   * @param {number} initialHeight - The initial height of the widget.
   */
  function handleUnpin(initialWidth, initialHeight) {
    $("#unpinned-message").show();
    var savedPosition = JSON.parse(sessionStorage.getItem("widgetPosition"));
    var savedWidth = sessionStorage.getItem("widgetWidth") || initialWidth;
    var savedHeight = sessionStorage.getItem("widgetHeight") || initialHeight;

    if (!savedPosition) {
      savedPosition = calculateCentralPosition(savedWidth, savedHeight);
    }

    makeWidgetDraggable();
    makeWidgetResizable();

    $("#chat-widget").css({
      position: "fixed",
      width: savedWidth,
      height: savedHeight,
      top: savedPosition.top,
      left: savedPosition.left,
      maxHeight: "90vh"
    });

    $("#chat-move-toggle").find("i").removeClass("pinned").addClass("unpinned");
  }

  /**
   * Handles the pinning of the chat widget.
   * @param {Object} originalSize - The original size of the widget.
   */
  function handlePin(originalSize) {
    $("#unpinned-message").hide();
    var currentWidth = $("#chat-widget").width();
    var currentHeight = $("#chat-widget").height();

    sessionStorage.setItem("widgetWidth", currentWidth);
    sessionStorage.setItem("widgetHeight", currentHeight);

    $("#chat-widget").draggable("destroy");
    $("#chat-widget").resizable("destroy");
    $("#chat-widget").css({
      position: "static",
      width: originalSize.width,
      height: originalSize.height,
      maxHeight: "45vh"
    });

    $("#chat-move-toggle").find("i").removeClass("unpinned").addClass("pinned");
  }

  /**
   * Calculates the central position for the chat widget.
   * @param {number} savedWidth - The saved width of the widget.
   * @param {number} savedHeight - The saved height of the widget.
   * @returns {Object} An object containing the top and left position.
   */
  function calculateCentralPosition(savedWidth, savedHeight) {
    var windowWidth = $(window).width();
    var windowHeight = $(window).height();
    return {
      top: (windowHeight - savedHeight) / 2,
      left: (windowWidth - savedWidth) / 2
    };
  }

  /**
   * Makes the chat widget draggable.
   */
  function makeWidgetDraggable() {
    $("#chat-widget").draggable({
      containment: "window",
      scroll: false,
      stop: function (event, ui) {
        sessionStorage.setItem("widgetPosition", JSON.stringify(ui.position));
      }
    });
  }

  /**
   * Makes the chat widget resizable.
   */
  function makeWidgetResizable() {
    $("#chat-widget").resizable({
      handles: "n, e, s, w, ne, se, sw, nw",
      stop: function (event, ui) {
        sessionStorage.setItem("widgetWidth", ui.size.width);
        sessionStorage.setItem("widgetHeight", ui.size.height);
      }
    });
  }

  /**
   * Loads previous messages from session storage.
   */
  function loadPreviousMessages() {
    if (chatConfig.messages.length > 0) {
      chatConfig.messages.forEach(function (message) {
        addMessage(message.sender, message.content, message.isUser);
      });
    }
  }

  /**
   * Sets up event listeners for the widget.
   */
  function setupEventListeners() {
    $("#chat-send").on("click", function () {
      handleSendMessage();
    });

    $("#chat-input").on("keypress", function (e) {
      if (e.which === 13) {
        handleSendMessage();
      }
    });

    $("#chat-reset").on("click", function () {
      resetChat();
    });

    // Detect the drawer close event specifically for the close icon
    $('#theme_boost-drawers-blocks').on('click', '.icon.fa-xmark', function () {
      if (!chatConfig.isPinned) {
        handlePin(getOriginalSize());
        chatConfig.isPinned = true;
      }
    });
  }

  /**
   * Initializes the chat by connecting to the server.
   */
  function initializeChat() {
    var data = {
      bot_id: chatConfig.bot_id,
      env: chatConfig.env,
      channel: chatConfig.CHANNEL_ACRONYM,
      username: stringToHex(chatConfig.user_name),
    };
    sendPostRequest(
      chatConfig.api_base_url + "/secure/api/connect",
      data,
      handleChatConnectSuccess,
      function () {
        showError(chatConfig.CONECTION_FAILURE_MESSAGE);
      },
      chatConfig.api_token
    );
  }

  /**
   * Handles successful chat connection.
   * @param {Object} connectResponse - The response from the server.
   */
  function handleChatConnectSuccess(connectResponse) {
    chatConfig.token = connectResponse.data["token"];
    sessionStorage.setItem(chatConfig.tokenKey, chatConfig.token);
    var initialMessage =
      connectResponse.data["initial_response"] || chatConfig.SUCCESS_CONECTION_MESSAGE;
    $("#loading-icon").css("display", "none");
    addMessage(chatConfig.bot_name, initialMessage, false);
    storeMessage(chatConfig.bot_name, initialMessage, false);
  }

  /**
   * Handles sending a message.
   */
  function handleSendMessage() {
    var userMessage = $("#chat-input").val().trim();
    if (userMessage === "") {
      return;
    }

    addMessage(chatConfig.user_name, userMessage, true);
    storeMessage(chatConfig.user_name, userMessage, true);

    var data = {
      user_input: userMessage,
      env: chatConfig.env,
    };

    sendPostRequest(
      chatConfig.api_base_url + "/secure/api/message",
      data,
      function (botResponse) {
        addMessage(chatConfig.bot_name, botResponse.data.text, false);
        storeMessage(chatConfig.bot_name, botResponse.data.text, false);
      },
      function () {
        showError(chatConfig.SEND_MESSAGE_FAILURE_MESSAGE);
      }
    );

    $("#chat-input").val("");
  }

  /**
   * Resets the chat to its initial state.
   */
  function resetChat() {
    $("#chat-messages .message").remove();
    $("#loading-icon").css("display", "block");

    sessionStorage.removeItem(chatConfig.tokenKey);
    sessionStorage.removeItem(chatConfig.messagesKey);
    chatConfig.token = "";
    chatConfig.messages = [];
    initializeChat();
  }

  /**
   * Sends a POST request to the server.
   * @param {string} url - The URL to send the request to.
   * @param {Object} data - The data to send in the request.
   * @param {Function} onSuccess - Callback for successful response.
   * @param {Function} onError - Callback for error response.
   * @param {string} authToken - The authentication token to use for the request.
   */
  function sendPostRequest(url, data, onSuccess, onError, authToken) {
    $.ajax({
      url: url,
      type: "POST",
      contentType: "application/json",
      headers: {
        'Authorization': authToken ? 'Bearer ' + authToken : 'Bearer ' + chatConfig.token
      },
      data: JSON.stringify(data),
      success: function (response) {
        if (onSuccess) {
          onSuccess(response);
        }
      },
      error: function () {
        if (onError) {
          onError();
        }
      },
    });
  }

  /**
   * Adds a message to the chat interface.
   * @param {string} sender - The sender of the message.
   * @param {string} content - The content of the message.
   * @param {boolean} isUser - Whether the message is from the user.
   */
  function addMessage(sender, content, isUser) {
    var messageDiv = $("<div></div>")
      .addClass("message p-2 mb-2 rounded")
      .html("<strong>" + sender + ":</strong> " + content);

    if (isUser) {
      messageDiv.addClass("bg-primary text-white");
    } else {
      messageDiv.addClass("bg-light text-dark");
    }

    $("#chat-messages").append(messageDiv);
    $("#chat-messages").scrollTop($("#chat-messages")[0].scrollHeight);
  }

  /**
   * Stores a message in session storage.
   * @param {string} sender - The sender of the message.
   * @param {string} content - The content of the message.
   * @param {boolean} isUser - Whether the message is from the user.
   */
  function storeMessage(sender, content, isUser) {
    chatConfig.messages.push({ sender: sender, content: content, isUser: isUser });
    sessionStorage.setItem(chatConfig.messagesKey, JSON.stringify(chatConfig.messages));
  }

  /**
   * Displays an error message in the chat.
   * @param {string} errorMessage - The error message to display.
   */
  function showError(errorMessage) {
    addMessage(chatConfig.bot_name, errorMessage, false);
  }

  /**
   * Converts a string to its hexadecimal representation.
   * @param {string} str - The string to convert.
   * @returns {string} The hexadecimal representation of the string.
   */
  function stringToHex(str) {
    if (!str) {
      return "";
    }

    let hex = "";
    for (let i = 0; i < str.length; i++) {
      hex += str.charCodeAt(i).toString(16);
    }
    return hex;
  }
  return {
    init: initialize,
  };
});


