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
  /**
   * Initializes the chat widget.
   */
  function initialize() {
    var bot_id = $("#chat-widget").data("bot_id");
    var env = $("#chat-widget").data("env");
    var api_token = $("#chat-widget").data("api_token");
    var user_name = $("#chat-widget").data("user_name");
    var bot_name = $("#chat-widget").data("bot_name");
    var api_base_url = $("#chat-widget").data("api_base_url");

    const SUCCESS_CONECTION_MESSAGE = M.util.get_string(
      "success_connection_message",
      "block_bgwidget"
    );
    const CONECTION_FAILURE_MESSAGE = M.util.get_string(
      "connection_failure_message",
      "block_bgwidget"
    );
    const SEND_MESSAGE_FAILURE_MESSAGE = M.util.get_string(
      "send_message_failure_message",
      "block_bgwidget"
    );
    const CHANNEL_ACRONYM = "MO";

    var tokenKey = "chatToken_" + bot_id;
    var messagesKey = "chatMessages_" + bot_id;
    var token = sessionStorage.getItem(tokenKey) || "";
    var messages = JSON.parse(sessionStorage.getItem(messagesKey)) || [];
    let isPinned = true;

    // Save the original size of the widget to restore it later
    var originalSize = {
      width: $("#chat-widget").width(),
      height: $("#chat-widget").height(),
    };

    // Get the saved size or use the original size
    var initialWidth =
      sessionStorage.getItem("widgetWidth") || originalSize.width;
    var initialHeight =
      sessionStorage.getItem("widgetHeight") || originalSize.height;

    // Make the widget draggable when unpinned
    $("#chat-move-toggle").on("click", function () {
      isPinned = !isPinned;

      // Toggle the expanded class
      $("#chat-widget").toggleClass("expanded", !isPinned);

      if (!isPinned) {
        // Show the unpinned message
        $("#unpinned-message").show();

        // Restore saved position and size
        var savedPosition = JSON.parse(sessionStorage.getItem("widgetPosition"));
        var savedWidth = sessionStorage.getItem("widgetWidth") || initialWidth;
        var savedHeight = sessionStorage.getItem("widgetHeight") || initialHeight;

        if (!savedPosition) {
          // Calculate the central position if no saved position
          var windowWidth = $(window).width();
          var windowHeight = $(window).height();
          savedPosition = {
            top: (windowHeight - savedHeight) / 2,
            left: (windowWidth - savedWidth) / 2
          };
        }

        // Make it draggable if unpinned
        $("#chat-widget").draggable({
          containment: "window",
          scroll: false,
          stop: function (event, ui) {
            sessionStorage.setItem("widgetPosition", JSON.stringify(ui.position));
          }
        });

        // Make it resizable if unpinned
        $("#chat-widget").resizable({
          handles: "n, e, s, w, ne, se, sw, nw",
          stop: function (event, ui) {
            sessionStorage.setItem("widgetWidth", ui.size.width);
            sessionStorage.setItem("widgetHeight", ui.size.height);
          }
        });

        $("#chat-widget").css({
          position: "fixed",
          width: savedWidth,
          height: savedHeight,
          top: savedPosition.top,
          left: savedPosition.left,
          maxHeight: "90vh"
        });

        $(this).find("i").removeClass("pinned").addClass("unpinned");
      } else {
        // Hide the unpinned message
        $("#unpinned-message").hide();

        // Save the current size before pinning
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

        $(this).find("i").removeClass("unpinned").addClass("pinned");
      }
    });

    loadPreviousMessages();
    if (!token) {
      initializeChat();
    }
    setupEventListeners();

    /**
     * Loads previous messages from session storage.
     */
    function loadPreviousMessages() {
      if (messages.length > 0) {
        messages.forEach(function (message) {
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
    }

    /**
     * Initializes the chat by connecting to the server.
     */
    function initializeChat() {
      var data = {
        bot_id: bot_id,
        env: env,
        channel: CHANNEL_ACRONYM,
        username: stringToHex(user_name),
      };
      sendPostRequest(
        api_base_url + "/secure/api/connect",
        data,
        handleChatConnectSuccess,
        function () {
          showError(CONECTION_FAILURE_MESSAGE);
        },
        api_token
      );
    }

    /**
     * Handles successful chat connection.
     * @param {Object} connectResponse - The response from the server.
     */
    function handleChatConnectSuccess(connectResponse) {
      token = connectResponse.data["token"];
      sessionStorage.setItem(tokenKey, token);
      var initialMessage =
        connectResponse.data["initial_response"] || SUCCESS_CONECTION_MESSAGE;
      $("#loading-icon").css("display", "none");
      addMessage(bot_name, initialMessage, false);
      storeMessage(bot_name, initialMessage, false);
    }

    /**
     * Handles sending a message.
     */
    function handleSendMessage() {
      var userMessage = $("#chat-input").val().trim();
      if (userMessage === "") {
        return;
      }

      addMessage(user_name, userMessage, true);
      storeMessage(user_name, userMessage, true);

      var data = {
        user_input: userMessage,
        env: env,
      };

      sendPostRequest(
        api_base_url + "/secure/api/message",
        data,
        function (botResponse) {
          addMessage(bot_name, botResponse.data.text, false);
          storeMessage(bot_name, botResponse.data.text, false);
        },
        function () {
          showError(SEND_MESSAGE_FAILURE_MESSAGE);
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

      sessionStorage.removeItem(tokenKey);
      sessionStorage.removeItem(messagesKey);
      token = "";
      messages = [];
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
          'Authorization': authToken ? 'Bearer ' + authToken : 'Bearer ' + token
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
      messages.push({ sender: sender, content: content, isUser: isUser });
      sessionStorage.setItem(messagesKey, JSON.stringify(messages));
    }

    /**
     * Displays an error message in the chat.
     * @param {string} errorMessage - The error message to display.
     */
    function showError(errorMessage) {
      addMessage(bot_name, errorMessage, false);
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

    $(document).ready(function() {
        $("#element").tooltip(); // Inicializa el tooltip
    });

  }

  return {
    init: initialize,
  };
});


