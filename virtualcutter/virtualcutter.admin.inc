<?php
// $Id: virtualcutter.admin.inc 267 2011-12-01 16:37:37Z thijs $

/**
 * @file
 * Administrational functionality.
 */

/**
 * Form declaration for Virtual cutter configuration options.
 */
function virtualcutter_configure_form() {
  $form['virtualcutter_playback_url'] = array(
    '#type' => 'textarea',
    '#required' => TRUE,
    '#title' => t('Playback player URL'),
    '#description' => t('Enter a full URL (starting with http:// or https://) pointing to a web based playback environment which supports Media Fragment timecodes (#t=10,20 appended to the URL) in a video player. You may use tokens that will be replaced with actual values:') .
      t('<ul>' .
        '<li><strong>{%asset_id%}</strong> - The MediaMosa asset ID</li>' .
        '<li><strong>{%timecode%}</strong> - Start and/or end timecode, for example 10,20 or 10</li>' .
        '</ul>'
      ),
    '#default_value' => variable_get('virtualcutter_playback_url', ''),
    '#rows' => 1,
  );

  $form['virtualcutter_embed_code'] = array(
    '#type' => 'textarea',
    '#required' => TRUE,
    '#title' => t('Embed code'),
    '#description' => t('Use this field for configuration of the embed code. This code will have all containing tokens replaced before the embed code is presented to the user. You may use tokens that will be replaced with actual values:') .
      t('<ul>' .
        '<li><strong>{%playback_url%}</strong> - The playback URL as configured in the previous field</li>' .
        '<li><strong>{%asset_id%}</strong> - The MediaMosa asset ID</li>' .
        '<li><strong>{%asset_title%}</strong> - The MediaMosa asset title</li>' .
        '<li><strong>{%timecode%}</strong> - Start and/or end timecode, for example 10,20 or 10</li>' .
        '</ul>'
      ),
    '#default_value' => variable_get('virtualcutter_embed_code', VIRTUALCUTTER_DEFAULT_EMBED),
    '#rows' => 5,
  );

  $form['advanced'] = array(
    '#type' => 'fieldset',
    '#title' => t('Advanced settings'),
    '#collapsible' => TRUE,
    '#collapsed' => TRUE,
  );


  return system_settings_form($form);
}
