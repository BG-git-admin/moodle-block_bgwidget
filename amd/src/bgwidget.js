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
 * @category    module
 * @copyright   2024 Franco Muzzio <franco.muzzio@botgenes.com>
 * @license     https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
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
  
  function initialize() {
    var bot_id = $("#chat-widget").data("bot_id");
    var env = $("#chat-widget").data("env");
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

    // Guardar el tamaño original del widget para restaurarlo después
    var originalSize = {
      width: $("#chat-widget").width(),
      height: $("#chat-widget").height(),
    };

    // Obtener el tamaño guardado o usar el tamaño original
    var initialWidth =
      sessionStorage.getItem("widgetWidth") || originalSize.width;
    var initialHeight =
      sessionStorage.getItem("widgetHeight") || originalSize.height;

    // Hacer que el widget sea draggable cuando esté expandido
    $("#chat-move-toggle").on("click", function () {
      isExpanded = !isExpanded;

      // Cambiar la clase expanded
      $("#chat-widget").toggleClass("expanded", isExpanded);

      if (isExpanded) {
        // Hacerlo draggable si está expandido
        $("#chat-widget").draggable({
          containment: "window",
          scroll: false,
        });

        // Hacerlo resizable si está expandido
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
        });

        $(this).find("i").removeClass("fa-expand").addClass("fa-compress");
      } else {
        $("#chat-widget").draggable("destroy");
        $("#chat-widget").resizable("destroy");
        $("#chat-widget").width(originalSize.width);
        $("#chat-widget").height(originalSize.height);
        $("#chat-widget").css({
          position: "static",
        });

        $(this).find("i").removeClass("fa-compress").addClass("fa-expand");
      }
    });

    loadPreviousMessages();
    if (!token) {
      initializeChat();
    }
    setupEventListeners();

    function loadPreviousMessages() {
      if (messages.length > 0) {
        messages.forEach(function (message) {
          addMessage(message.sender, message.content, message.isUser);
        });
      }
    }

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
        }
      );
    }

    function handleChatConnectSuccess(connectResponse) {
      token = connectResponse.data["token"];
      sessionStorage.setItem(tokenKey, token);
      var initialMessage =
        connectResponse.data["initial_response"] || SUCCESS_CONECTION_MESSAGE;
      $("#loading-icon").css("display", "none");
      addMessage(bot_name, initialMessage, false);
      storeMessage(bot_name, initialMessage, false);
    }

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

    function resetChat() {
      $("#chat-messages .message").remove();
      $("#loading-icon").css("display", "block");

      sessionStorage.removeItem(tokenKey);
      sessionStorage.removeItem(messagesKey);
      token = "";
      messages = [];
      initializeChat();
    }

    function sendPostRequest(url, data, onSuccess, onError) {
      $.ajax({
        url: url,
        type: "POST",
        contentType: "application/json",
        headers: {
          Authorization: "Bearer " + token,
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

    function storeMessage(sender, content, isUser) {
      messages.push({ sender: sender, content: content, isUser: isUser });
      sessionStorage.setItem(messagesKey, JSON.stringify(messages));
    }

    function showError(errorMessage) {
      addMessage(bot_name, errorMessage, false);
    }

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
