<?php

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

// The plugin is not loaded during uninstall, so the option and cache names are repeated here.
function lunar_blocks_delete_site_data(): void {
	global $wpdb;

	delete_option( 'lunar_blocks_settings' );

	// The TOC cache has one transient per post, so the rows are found by their prefix.
	// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
	$wpdb->query(
		$wpdb->prepare(
			"DELETE FROM {$wpdb->options} WHERE option_name LIKE %s OR option_name LIKE %s",
			$wpdb->esc_like( '_transient_lunar_blocks_toc_' ) . '%',
			$wpdb->esc_like( '_transient_timeout_lunar_blocks_toc_' ) . '%'
		)
	);
}

if ( is_multisite() ) {
	// WordPress runs this file once per network, and the data is stored per site.
	$lunar_blocks_site_ids = get_sites(
		array(
			'fields' => 'ids',
			'number' => 0,
		)
	);

	foreach ( $lunar_blocks_site_ids as $lunar_blocks_site_id ) {
		switch_to_blog( $lunar_blocks_site_id );
		lunar_blocks_delete_site_data();
		restore_current_blog();
	}
} else {
	lunar_blocks_delete_site_data();
}
