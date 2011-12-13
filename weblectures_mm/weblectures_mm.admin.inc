<?php
// $Id: weblectures_mm.admin.inc 285 2011-12-13 12:50:01Z thijs $

/**
 * @file
 * Administration function for weblectures_mm
 */

/**
 * Form definition for weblectures admin form.
 */
function weblectures_mm_admin_form($form_id, $form_state) {
  $form = array('#tree' => TRUE);

  $form['weblectures_mm_profiles'] = array(
    '#type' => 'fieldset',
    '#title' => t('Transcoding profiles'),
    '#description' => t('Select the transcoding profiles that should be used by front end applications to provide HTML5 media to users. When an asset has a transcoding that matches your selection, the first selected will be used.'),
  );

  $available_profiles = weblectures_mm_get_profiles();

  if (!empty($available_profiles)) {
    krsort($available_profiles);  // Sort newest first by default.

    $current_profiles = variable_get('weblectures_mm_profiles', array());

    $media_types = variable_get('weblectures_mm_media_types', array(
      'video/mp4',
      'video/webm',
      'video/ogg',
    ));

    foreach ($media_types as $media_type) {
      $form['weblectures_mm_profiles'][$media_type] = array(
        '#type' => 'checkboxes',
        '#title' => t('Profile used for @type', array('@type' => $media_type)),
        '#default_value' => isset($current_profiles[$media_type]) ? $current_profiles[$media_type] : array(),
        '#options' => $available_profiles,
      );
    }
  }
  else {
    $form['weblectures_mm_profiles']['#value'] = '<p class="empty-text">' . t('No transcoding profiles found. Please check the MediaMosa configuration.') . '</p>';
  }

  return system_settings_form($form);
}
