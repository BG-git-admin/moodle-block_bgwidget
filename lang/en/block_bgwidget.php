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
 * Plugin strings are defined here.
 *
 * @package     block_bgwidget
 * @category    string
 * @copyright   2024 Franco Muzzio <franco.muzzio@botgenes.com>
 * @license     https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

$string['apiconnectionerror'] = 'Unable to connect to the API. Please check your connection.';
$string['bgwidget:edit'] = 'Edit chat settings';
$string['bgwidget:sendmessage'] = 'Send messages in chat';
$string['bgwidget:view'] = 'View chat';
$string['block_bgwidget:addinstance'] = 'Add a new BG Widget block';
$string['block_bgwidget:myaddinstance'] = 'Add a new BG Widget block to my page';
$string['botmessage'] = 'Bot: {$a->message}';
$string['bot_id'] = 'Bot ID';
$string['bot_name'] = 'Bot Name';
$string['api_base_url'] = 'API Base URL';
$string['api_token'] = 'API Token';
$string['botresponse'] = 'Bot\'s response:';
$string['chatmessagehistory'] = 'Chat history';
$string['chatwindowtitle'] = 'Chat with the Bot';
$string['clearhistorybutton'] = 'Clear chat history';
$string['connection_failure_message'] = 'Error connecting to the API. Please verify that your settings (Bot ID, API Token and API Base URL) match the credentials provided by BotGenes. If the problem persists, please try again later.';
$string['env'] = 'Environment (env)';
$string['messageerror'] = 'There was an error sending your message. Please try again.';
$string['messageprovider:expiry'] = 'Expiry message';
$string['messageprovider:submission'] = 'Submission message';
$string['placeholdertext'] = 'Type your message...';
$string['pluginadministration'] = 'Chat plugin administration';
$string['pluginname'] = 'BG Widget';
$string['privacy:metadata:db:chatmessages'] = 'Stores chat messages sent by users.';
$string['privacy:metadata:db:chatmessages:message'] = 'The content of the chat message.';
$string['privacy:metadata:db:chatmessages:timecreated'] = 'The time when the chat message was created.';
$string['privacy:metadata:db:chatmessages:userid'] = 'The ID of the user who sent the chat message.';
$string['privacy:metadata:external:bg-api'] = 'The external system bg-api is used to send and receive messages from the BotGenes service.';
$string['send_message_failure_message'] = 'Error sending message. Please try again.';
$string['sendbuttonlabel'] = 'Send';
$string['settingsdescription'] = 'Configure the settings for the chat plugin.';
$string['success_connection_message'] = 'Connection established.';
$string['usermessage'] = 'You: {$a->message}';
$string['widget_unpinned_message'] = 'Widget unpinned, to pin it back press ';
