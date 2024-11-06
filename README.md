# BG Widget

BG Widget is a Moodle plugin that allows users to communicate with BotGenes bots directly from a block on their Moodle site. This plugin is ideal for educational institutions and organizations looking to integrate chatbot capabilities into their learning platform.

## Description

The BG Widget plugin seamlessly integrates into Moodle and provides an interactive chat interface that allows users to send messages and receive responses from BotGenes bots. The bots can assist users with frequently asked questions, provide technical or educational support, and much more.

### Subscription Requirements

To use the BG Widget, an active subscription with BotGenes is required. This subscription provides access to the chatbot services and the API necessary for communication between Moodle and the bots. For more information about subscriptions, please visit [BotGenes](https://www.botgenes.com).

## Installation

### Installation via ZIP file

1. Log in to your Moodle site as an admin and go to _Site administration > Plugins > Install plugins_.
2. Upload the ZIP file with the plugin code. You will only be prompted to add additional details if the plugin type is not automatically detected.
3. Review the plugin validation report and complete the installation.

### Manual Installation

The plugin can also be installed by placing the contents of this directory in:

    {your/moodle/dirroot}/blocks/bgwidget

Then log in to your Moodle site as an admin and go to _Site administration > Notifications_ to complete the installation.

Alternatively, you can run:

    $ php admin/cli/upgrade.php

to complete the installation from the command line.
