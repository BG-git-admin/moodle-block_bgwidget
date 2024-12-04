require.config({
    paths: {
        'jquery-ui': '/blocks/bgwidget/lib/jquery-ui-1.14.1.custom/jquery-ui-wrapper',
        'chatConfig': '/blocks/bgwidget/amd/src/chatConfig'
    },
    shim: {
        'jquery-ui': {
            deps: ['jquery'],
            exports: 'jQuery.ui'
        }
    }
});

define('bgwidget', ['jquery', 'jquery-ui', 'chatConfig'], function($, ui, chatConfigModule) {
  const chatConfig = chatConfigModule.chatConfig;

  /**
   * Initializes the chat widget.
   */
  function initialize() {
    chatConfigModule.setChatConfig();
    setMessages();
    setupWidget();
    loadPreviousMessages();
    if (!chatConfig.token) {
      initializeChat();
    }
    setupEventListeners();
  }

  /**
   * Sets chat messages from sessionStorage.
   */
  function setMessages() {
    chatConfig.token = sessionStorage.getItem(chatConfig.tokenKey) || "";
    chatConfig.messages = JSON.parse(sessionStorage.getItem(chatConfig.messagesKey)) || [];
  }

  /**
   * Sets up the chat widget, including size and toggle functionality.
   */
  function setupWidget() {
    const unpinnedWidth = getUnpinnedWidth();
    const unpinnedHeight = getUnpinnedHeight();
    setupWidgetToggle(unpinnedWidth, unpinnedHeight);
  }

  /**
   * Gets the initial width of the chat widget.
   * @returns {number} The initial width of the widget.
   */
  function getUnpinnedWidth() {
    return sessionStorage.getItem("widgetWidth") || chatConfig.DEFAULT_WIDGET_DIMENSIONS.WIDTH;
  }

  /**
   * Gets the initial height of the chat widget.
   * @returns {number} The initial height of the widget.
   */
  function getUnpinnedHeight() {
    return sessionStorage.getItem("widgetHeight") || chatConfig.DEFAULT_WIDGET_DIMENSIONS.HEIGHT;
  }

  /**
   * Sets up the toggle functionality for the chat widget.
   * @param {number} unpinnedWidth - The initial width of the widget.
   * @param {number} unpinnedHeight - The initial height of the widget.
   */
  function setupWidgetToggle(unpinnedWidth, unpinnedHeight) {
    $("#chat-move-toggle").on("click", function () {
      chatConfig.isPinned = !chatConfig.isPinned;
      if (!chatConfig.isPinned) {
        handleUnpin(unpinnedWidth, unpinnedHeight);
      } else {
        handlePin();
      }
    });
  }

  /**
   * Handles the unpinning of the chat widget.
   * @param {number} unpinnedWidth - The initial width of the widget.
   * @param {number} unpinnedHeight - The initial height of the widget.
   */
  function handleUnpin(unpinnedWidth, unpinnedHeight) {
    $("#unpinned-message").show();
    let savedPosition = JSON.parse(sessionStorage.getItem("widgetPosition"));
    const savedWidth = sessionStorage.getItem("widgetWidth") || unpinnedWidth;
    const savedHeight = sessionStorage.getItem("widgetHeight") || unpinnedHeight;

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
      maxHeight: chatConfig.DEFAULT_WIDGET_DIMENSIONS.MAX_HEIGHT_UNPINNED
    });

    $("#chat-move-toggle").find("i").removeClass("pinned").addClass("unpinned");
  }

  /**
   * Handles the pinning of the chat widget.
   */
  function handlePin() {
    $("#unpinned-message").hide();
    $("#chat-widget").draggable("destroy");
    $("#chat-widget").resizable("destroy");
    $("#chat-widget").css({
      position: "static",
      maxHeight: chatConfig.DEFAULT_WIDGET_DIMENSIONS.MAX_HEIGHT_PINNED,
      height: "100%",
      width: "100%",
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
    const windowWidth = $(window).width();
    const windowHeight = $(window).height();

    const width = parseFloat(savedWidth) || 0;
    const height = parseFloat(savedHeight) || 0;

    return {
        top: (windowHeight / 2) - (height / 2),
        left: (windowWidth / 2) - (width / 2)
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
   * Loads previous chat messages from sessionStorage.
   */
  function loadPreviousMessages() {
    if (chatConfig.messages.length > 0) {
      chatConfig.messages.forEach(function (message) {
        addMessage(message.sender, message.content, message.isUser);
      });
    }
  }

  /**
   * Sets up event listeners for chat interactions.
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

    $('#theme_boost-drawers-blocks').on('click', '.icon.fa-xmark', function () {
      if (!chatConfig.isPinned) {
        handlePin();
        chatConfig.isPinned = true;
      }
    });
  }

  /**
   * Initializes the chat connection with the server.
   */
  function initializeChat() {
    const data = {
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
    const initialMessage =
      connectResponse.data["initial_response"] || chatConfig.SUCCESS_CONECTION_MESSAGE;
    $("#loading-icon").css("display", "none");
    addMessage(chatConfig.bot_name, initialMessage, false);
    storeMessage(chatConfig.bot_name, initialMessage, false);
  }

  /**
   * Handles sending a message to the server.
   */
  function handleSendMessage() {
    const userMessage = $("#chat-input").val().trim();
    if (userMessage === "") {
      return;
    }

    addMessage(chatConfig.user_name, userMessage, true);
    storeMessage(chatConfig.user_name, userMessage, true);

    const data = {
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
   * @param {string} [authToken] - Optional authorization token.
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
    const messageDiv = $("<div></div>")
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
   * Stores a message in sessionStorage.
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


