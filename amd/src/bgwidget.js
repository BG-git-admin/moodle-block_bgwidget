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
 * @category    module
 * @copyright   2024 Franco Muzzio <franco.muzzio@botgenes.com>
 * @license     https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/* global module */

/**
 * Initializes the bgwidget module.
 * @param {Object} root - The root object, typically `window` or `self`.
 * @param {Function} factory - The factory function to create the module.
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery', 'jqueryui'], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('jquery'), require('jquery-ui-dist'));
  } else {
    root.bgwidget = factory(root.jQuery);
  }
}(typeof self !== 'undefined' ? self : this, function ($) {
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
    let isExpanded = false;

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

    // Make the widget draggable when expanded
    $("#chat-move-toggle").on("click", function () {
      isExpanded = !isExpanded;

      // Toggle the expanded class
      $("#chat-widget").toggleClass("expanded", isExpanded);

      if (isExpanded) {
        // Make it draggable if expanded
        $("#chat-widget").draggable({
          containment: "window",
          scroll: false,
        });

        // Make it resizable if expanded
        $("#chat-widget").resizable({
          handles: "n, e, s, w, ne, se, sw, nw",
          stop: function (event, ui) {
            sessionStorage.setItem("widgetWidth", ui.size.width);
            sessionStorage.setItem("widgetHeight", ui.size.height);
          },
        });

        $("#chat-widget").css({
          position: "fixed",
          width: initialWidth,
          height: initialHeight,
          maxHeight: "90vh"
        });

        $(this).find("i").removeClass("pinned").addClass("unpinned");
      } else {
        $("#chat-widget").draggable("destroy");
        $("#chat-widget").resizable("destroy");
        $("#chat-widget").width(originalSize.width);
        $("#chat-widget").height(originalSize.height);
        $("#chat-widget").css({
          position: "static",
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

  }

  return {
    init: initialize,
  };
}));


