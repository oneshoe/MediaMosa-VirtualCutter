Requirements:
- A Drupal 7 installation. (http://drupal.org/start)
- The mediamosa_connector module from the mediamosa_sdk. (https://github.com/mediamosa/mediamosa-sdk/zipball/7.x-1.0)
- Valid login details for a mediamosa server.
- [optional] the Fideo module (https://github.com/oneshoe/MediaMosa-Player/zipball/master)

Installation:
- Copy the weblectures_mm folder to your Drupal installation in sites/all/modules/ or one of its sub-folders.
- Log in as administrator to your Drupal installation.
- Navigate to http://yoursite/admin/config/media/mediamosa/connector and enter your mediamosa server connection details.
- Go to http://yoursite/admin/modules and enable the "Web lectures (MediaMosa)" module.
- Navigate to http://yoursite/admin/config/media/weblectures_mm and enable the transcoding profiles to request from mediamosa for each mediatype
* make sure you set the correct profiles here. Choosing a profile for which no media is present at mediamosa will result in empty video or errors.

To be able to see anything you also need a front-end or media player. This module is already prepared to make use of the Fideo module:
- Extract the fideo folder to your sites/all/modules/ folder or one of its sub-folders.
- Go to http://yoursite/admin/modules and enable the "Web lectures UI" module this will also enable the Fideo module.

Usage:

Using the Web lectures UI module with Fideo:
- Navigate to http://yoursite/mm-browse to get an overview of the assets that your mediamosa account has access to.

Using your own code and player:

These two functions are probably the most useful if you want to use your own player for a presentation or a video.

/**
 * Create a presentation from an asset_id.
 * @param string $asset_id Asset identifier.
 * @return object $presentation A presentation object.
 */
function weblectures_mm_asset_to_presentation($asset_id)

/**
 * Get a download url for a video.
 * If only mediafile_id is specified it returns a url to that specific mediafile.
 * If only a profile id is specified it returns a url to a video transcoded with that profile.
 * If both mediafile id and profile id are specified is returns a url to the video transcoded
 * with that profile with the mediafile as source.
 * @param string $asset_id Asset ID.
 * @param string $mediafile_id [optional] mediafile ID
 * @param int $profile [optional] transcoding profile ID
 * @param string $type [optional] what type of url to request. Defaults to 'plain'.
 */
function weblectures_mm_get_video_url($asset_id, $mediafile_id = NULL, $profile = NULL, $type = 'plain')
