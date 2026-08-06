<?php
/**
 * Fires when the plugin is deleted from the Plugins screen. Not
 * loaded on plain deactivation, only on uninstall.
 *
 * @package Lunar\Blocks
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

delete_option( 'lunar_blocks_disabled_blocks' );