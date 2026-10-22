<?php

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

// The plugin is not loaded during uninstall, so the option and cache names are repeated here.
function moon_blocks_delete_site_data(): void {
	global $wpdb;

	delete_option( 'moon_blocks_settings' );

	// The TOC cache has one transient per post, so the rows are found by their prefix.
	// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
	$wpdb->query(
		$wpdb->prepare(
			"DELETE FROM {$wpdb->options} WHERE option_name LIKE %s OR option_name LIKE %s",
			$wpdb->esc_like( '_transient_moon_blocks_toc_' ) . '%',
			$wpdb->esc_like( '_transient_timeout_moon_blocks_toc_' ) . '%'
		)
	);
}

if ( is_multisite() ) {
	// WordPress runs this file once per network, and the data is stored per site.
	$moon_blocks_site_ids = get_sites(
		array(
			'fields' => 'ids',
			'number' => 0,
		)
	);

	foreach ( $moon_blocks_site_ids as $moon_blocks_site_id ) {
		switch_to_blog( $moon_blocks_site_id );
		moon_blocks_delete_site_data();
		restore_current_blog();
	}
} else {
	moon_blocks_delete_site_data();
}
