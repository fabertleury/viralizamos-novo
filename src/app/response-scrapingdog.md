# API EXAMPLE

PARAMETER | TYPE | DESCRIPTION
--- | --- | ---
api_key | string | Your personal API key. Available on your dashboard.
username | string | This is the Instagram username. 


const axios = require('axios');

const apiUrl = 'https://api.scrapingdog.com/instagram';
const apiKey = '5eaa61a6e562fc52fe763tr516e4653';
const username = "instagram"

// Set up the parameters
const params = { api_key: apiKey, username: username };

// Make the HTTP GET request
axios.get(apiUrl, { params })
  .then(response => {
    // Check if the request was successful (status code 200)
    if (response.status === 200) {
      // Parse the JSON content
      const jsonResponse = response.data;

      console.log('JSON Response:');
      console.log(JSON.stringify(jsonResponse, null, 2)); // Pretty print the JSON
    } else {
      console.error(`Error: ${response.status}`);
      console.error(response.data);
    }
  })
  .catch(error => {
    console.error('Error making the request:', error.message);
  });





# RESPONSE 

{
    "data": {
        "user": {
            "ai_agent_type": null,
            "biography": "Discover what's new on Instagram 🔎✨",
            "bio_links": [
                {
                    "title": "",
                    "lynx_url": "https://l.instagram.com/?u=https%3A%2F%2Fabout.fb.com%2Fnews%2F2024%2F09%2Finstagram-teen-accounts%2F&e=AT2pfCsR_3UWgdNGdyt-jvm5fJkAqXjju8sclDNTLgLz44v-ta2LhPDPeZuMu-r7R0T7fF1eMm4-BDqqIY_v0VFUWFJk-ARw",
                    "url": "https://about.fb.com/news/2024/09/instagram-teen-accounts/",
                    "link_type": "external"
                }
            ],
            "fb_profile_biolink": null,
            "biography_with_entities": {
                "raw_text": "Discover what's new on Instagram 🔎✨",
                "entities": []
            },
            "blocked_by_viewer": false,
            "restricted_by_viewer": null,
            "country_block": false,
            "eimu_id": "117943452927407",
            "external_url": "https://about.fb.com/news/2024/09/instagram-teen-accounts/",
            "external_url_linkshimmed": "https://l.instagram.com/?u=https%3A%2F%2Fabout.fb.com%2Fnews%2F2024%2F09%2Finstagram-teen-accounts%2F&e=AT22e3BlmBLZeolMDJhfP_PjlKZul7P6iAaLliyqMtERLqyueQOESlW1La37xTASIQhpQpEEFI8pzNAT21QpoTm81A4Dt0gC",
            "edge_followed_by": {
                "count": 681740829
            },
            "fbid": "17841400039600391",
            "followed_by_viewer": false,
            "edge_follow": {
                "count": 131
            },
            "follows_viewer": false,
            "full_name": "Instagram",
            "group_metadata": null,
            "has_ar_effects": false,
            "has_clips": true,
            "has_guides": false,
            "has_channel": false,
            "has_blocked_viewer": false,
            "highlight_reel_count": 14,
            "has_onboarded_to_text_post_app": true,
            "has_requested_viewer": false,
            "hide_like_and_view_counts": false,
            "id": "25025320",
            "is_business_account": false,
            "is_professional_account": true,
            "is_supervision_enabled": false,
            "is_guardian_of_viewer": false,
            "is_supervised_by_viewer": false,
            "is_supervised_user": false,
            "is_embeds_disabled": false,
            "is_joined_recently": false,
            "guardian_id": null,
            "business_address_json": null,
            "business_contact_method": "UNKNOWN",
            "business_email": null,
            "business_phone_number": null,
            "business_category_name": null,
            "overall_category_name": null,
            "category_enum": null,
            "category_name": "Digital creator",
            "is_private": false,
            "is_verified": true,
            "is_verified_by_mv4b": false,
            "is_regulated_c18": false,
            "edge_mutual_followed_by": {
                "count": 0,
                "edges": []
            },
            "pinned_channels_list_count": 0,
            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/281440578_1088265838702675_6233856337905829714_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=ltsxH1EMlEcQ7kNvgHjZ5T9&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYC-xs2f-m-yIER0YGqrMbOi4XVEGVbbpUi87ClLVwPrVw&oe=675490D8&_nc_sid=8b3546",
            "profile_pic_url_hd": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/281440578_1088265838702675_6233856337905829714_n.jpg?stp=dst-jpg_s320x320_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=ltsxH1EMlEcQ7kNvgHjZ5T9&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYCngKidU9ARZ8PQsMdHbCaK3MqvIXyvZbIJNxhZlatBLQ&oe=675490D8&_nc_sid=8b3546",
            "requested_by_viewer": false,
            "should_show_category": false,
            "should_show_public_contacts": false,
            "show_account_transparency_details": true,
            "show_text_post_app_badge": true,
            "remove_message_entrypoint": false,
            "transparency_label": null,
            "transparency_product": null,
            "username": "instagram",
            "connected_fb_page": null,
            "pronouns": [],
            "edge_felix_video_timeline": {
                "count": 273,
                "page_info": {
                    "has_next_page": true,
                    "end_cursor": "QVFDZXJxaU1JQ0hHSnFJMXlPU21HY2syQTRNaWY4TEVDQVRzRmk5TktZb1dOdVhpS1BzQ2VhTl8yN3ZMRlRtdWpLeHpkekV2ZnRpeDI2UXNfck8tczU1Qw=="
                },
                "edges": [
                    {
                        "node": {
                            "__typename": "GraphVideo",
                            "id": "2917172418798642453",
                            "shortcode": "Ch74NvrD2UV",
                            "dimensions": {
                                "height": 1920,
                                "width": 1080
                            },
                            "display_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/304875880_565550785254435_4996738343671315080_n.jpg?stp=dst-jpg_e35_p1080x1080_sh0.08_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=103&_nc_ohc=Axb6ibs_jQIQ7kNvgHOBdQW&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDAV3P4xSRURl8MvG213KTD4rmnMX3SMucd4B0A9C_TjQ&oe=6754BADB&_nc_sid=8b3546",
                            "edge_media_to_tagged_user": {
                                "edges": [
                                    {
                                        "node": {
                                            "user": {
                                                "full_name": "Mr. boris becker",
                                                "followed_by_viewer": false,
                                                "id": "1707886044",
                                                "is_verified": true,
                                                "profile_pic_url": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-19/469003423_472757239163704_2720860878872016566_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=104&_nc_ohc=j89phKetyccQ7kNvgFNWsSS&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDEc3W-D2k1yzVtxt5ofwdyyLsvMltIzhq_6EQ1zCsNuA&oe=67549BB5&_nc_sid=8b3546",
                                                "username": "mr_boris_becker"
                                            },
                                            "x": 0,
                                            "y": 0
                                        }
                                    },
                                    {
                                        "node": {
                                            "user": {
                                                "full_name": "Jenybsg",
                                                "followed_by_viewer": false,
                                                "id": "993900794",
                                                "is_verified": true,
                                                "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/447641823_446129108282400_4853968020532428722_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=100&_nc_ohc=ICwC3iXTtZIQ7kNvgE9Ise1&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYD42EZaHXWlKsPAnFb5ZEX8aHGwje6hLbOUD7aMp4qLnw&oe=67549781&_nc_sid=8b3546",
                                                "username": "jenybsg"
                                            },
                                            "x": 0,
                                            "y": 0
                                        }
                                    },
                                    {
                                        "node": {
                                            "user": {
                                                "full_name": "IMPULSTAR",
                                                "followed_by_viewer": false,
                                                "id": "6107591796",
                                                "is_verified": true,
                                                "profile_pic_url": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-19/418648536_1449356052283264_7269225785482180898_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=104&_nc_ohc=k05a7UzG3eUQ7kNvgFdmIys&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYCGu6zGlBy8IF7V4nTgD86lsOLn-G4ICD66qi0AGpoyOg&oe=67549F71&_nc_sid=8b3546",
                                                "username": "impulstar"
                                            },
                                            "x": 0,
                                            "y": 0
                                        }
                                    }
                                ]
                            },
                            "fact_check_overall_rating": null,
                            "fact_check_information": null,
                            "gating_info": null,
                            "sharing_friction_info": {
                                "should_have_sharing_friction": false,
                                "bloks_app_url": null
                            },
                            "media_overlay_info": null,
                            "media_preview": "ABgqmzRmm1XjWWaQlT8iY6Y9O/fntiix6UpKO5O3JopaKqxRGzYUk9ADVfSgGlfBONoHPcehqV8FSD0IIrNtlJXHcMenXoMUMxqK8l8zWJ5opooq7GxE54qFFAPFSt0pgq0jVJFgGikooJP/2Q==",
                            "owner": {
                                "id": "25025320",
                                "username": "instagram"
                            },
                            "is_video": true,
                            "has_upcoming_event": false,
                            "accessibility_caption": null,
                            "dash_info": {
                                "is_dash_eligible": true,
                                "video_dash_manifest": "<?xml version=\"1.0\"?>\n<MPD xmlns=\"urn:mpeg:dash:schema:mpd:2011\" minBufferTime=\"PT1.500S\" type=\"static\" mediaPresentationDuration=\"PT0H2M58.210S\" maxSegmentDuration=\"PT0H0M5.000S\" profiles=\"urn:mpeg:dash:profile:isoff-on-demand:2011,http://dashif.org/guidelines/dash264\" FBManifestIdentifier=\"FgAYDGlnX2Rhc2hfaGlnaBl2yJj47e6SsgGs/LHXir7RAYTdxqH5/fwBnrLiuPey3QL6h4GuwoLqAoLqqsr4uqIE5uni743lhAUiGBNkYXNoX2Jhc2VsaW5lX2F1ZGlvAA==\"><Period duration=\"PT0H2M58.210S\"><AdaptationSet segmentAlignment=\"true\" maxWidth=\"720\" maxHeight=\"1280\" maxFrameRate=\"30\" par=\"396:704\" lang=\"und\" subsegmentAlignment=\"true\" subsegmentStartsWithSAP=\"1\" FBUnifiedUploadResolutionMos=\"360:78.6\" id=\"0\"><Representation id=\"1201679314016897(mpd_qe=UNKNOWN)vd\" mimeType=\"video/mp4\" codecs=\"avc1.64001F\" width=\"720\" height=\"1280\" frameRate=\"30\" sar=\"1:1\" startWithSAP=\"1\" bandwidth=\"2901068\" FBEncodingTag=\"dash_high_1_v1\" FBContentLength=\"64621291\" FBPlaybackResolutionMos=\"0:100,360:91.2,480:87.4,720:76.1\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:96.8,480:95.7,720:90.5\" FBAbrPolicyTags=\"\" FBDefaultQuality=\"1\" FBQualityClass=\"hd\" FBQualityLabel=\"720p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQNCHEDvENE-yoyCf0mvftRvWNAX-1uDrXImWU1uT7Fh5IkGvmRQuykph8ZhOnUNt-UTBC4gxQUpHuFl4A2FfoVF.mp4?strext=1&amp;_nc_cat=101&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=8iuPDPvB06QQ7kNvgH44gCm&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9oaWdoXzFfdjEiLCJ2aWRlb19pZCI6bnVsbCwiY2xpZW50X25hbWUiOiJpZyIsIm9pbF91cmxnZW5fYXBwX2lkIjo5MzY2MTk3NDMzOTI0NTksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&amp;ccb=9-4&amp;oh=00_AYAuZf5v9dB-9WllOnDMDZymHji_mUHc-p8Me1B1YSangw&amp;oe=6754A192</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"845-1320\" FBFirstSegmentRange=\"1321-959814\" FBFirstSegmentDuration=\"2000\" FBSecondSegmentRange=\"959815-1620204\" FBPrefetchSegmentRange=\"1321-1620204\" FBPrefetchSegmentDuration=\"4000\"><Initialization range=\"0-844\"/></SegmentBase></Representation><Representation id=\"1417908005395059(mpd_qe=UNKNOWN)v\" mimeType=\"video/mp4\" codecs=\"avc1.64001F\" width=\"720\" height=\"1280\" frameRate=\"30\" sar=\"1:1\" startWithSAP=\"1\" bandwidth=\"1773233\" FBEncodingTag=\"dash_high_2_v1\" FBContentLength=\"39498785\" FBPlaybackResolutionMos=\"0:100,360:83.5,480:77,720:64.1\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:94.4,480:91.3,720:79.2\" FBAbrPolicyTags=\"\" FBQualityClass=\"hd\" FBQualityLabel=\"640p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQNSyb1iL0LI2gzZgRfBcM8R78ZEPC6mdqU2Xl5qBIGqumI_LWioNIQ0pZqhHqEFr54vvl8YwDxqM-CYfBINP-gb.mp4?strext=1&amp;_nc_cat=100&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=fkyxFtexGoIQ7kNvgEiPK-H&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9oaWdoXzJfdjEiLCJ2aWRlb19pZCI6bnVsbCwiY2xpZW50X25hbWUiOiJpZyIsIm9pbF91cmxnZW5fYXBwX2lkIjo5MzY2MTk3NDMzOTI0NTksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&amp;ccb=9-4&amp;oh=00_AYBFNoiTjWglgc_Z-FvZABrteNNus89Ori4-m94GDjAPCw&amp;oe=67549475</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"845-1320\" FBFirstSegmentRange=\"1321-601698\" FBFirstSegmentDuration=\"2000\" FBSecondSegmentRange=\"601699-1014741\" FBPrefetchSegmentRange=\"1321-1014741\" FBPrefetchSegmentDuration=\"4000\"><Initialization range=\"0-844\"/></SegmentBase></Representation><Representation id=\"460662446112534(mpd_qe=UNKNOWN)v\" mimeType=\"video/mp4\" codecs=\"avc1.64001F\" width=\"720\" height=\"1280\" frameRate=\"30\" sar=\"1:1\" startWithSAP=\"1\" bandwidth=\"1025986\" FBEncodingTag=\"dash_high_3_v1\" FBContentLength=\"22853853\" FBPlaybackResolutionMos=\"0:100,360:69.2,480:61.3,720:45.4\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:84,480:76.6,720:60.4\" FBAbrPolicyTags=\"\" FBQualityClass=\"hd\" FBQualityLabel=\"540p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQPBnXlvY2H6-YBsoJDV530iISLI8Twam6rOSupJE9qsHi52hfrwuY22gr5lbGxguiFB2DCEcTowc4RNftAksmCi.mp4?strext=1&amp;_nc_cat=107&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=tu8SwjoIIoUQ7kNvgEFP9Eh&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9oaWdoXzNfdjEiLCJ2aWRlb19pZCI6bnVsbCwiY2xpZW50X25hbWUiOiJpZyIsIm9pbF91cmxnZW5fYXBwX2lkIjo5MzY2MTk3NDMzOTI0NTksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&amp;ccb=9-4&amp;oh=00_AYCvdOBl-OWSMJB0JZHyVns0b7R-KVZ0OFT0Upar_Be2Ow&amp;oe=6754AE04</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"845-1320\" FBFirstSegmentRange=\"1321-344839\" FBFirstSegmentDuration=\"2000\" FBSecondSegmentRange=\"344840-584422\" FBPrefetchSegmentRange=\"1321-584422\" FBPrefetchSegmentDuration=\"4000\"><Initialization range=\"0-844\"/></SegmentBase></Representation><Representation id=\"796089684861437(mpd_qe=UNKNOWN)v\" mimeType=\"video/mp4\" codecs=\"avc1.64001F\" width=\"630\" height=\"1120\" frameRate=\"30\" sar=\"1:1\" startWithSAP=\"1\" bandwidth=\"549661\" FBEncodingTag=\"dash_high_4_v1\" FBContentLength=\"12243712\" FBPlaybackResolutionMos=\"0:100,360:47.2,480:38.8,720:27.7\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:62,480:52.7,720:37.8\" FBAbrPolicyTags=\"\" FBQualityClass=\"sd\" FBQualityLabel=\"480p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQNpgvqwDbhrOBYtbNM8WG-xhzDjX5zyYn9pj5Lka6YG1tJzfbHifzOmhRBNAxW04MvvpuMmPmZh5-xU9ftsgyte.mp4?strext=1&amp;_nc_cat=111&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=X3uSmBbrIZYQ7kNvgFO86RI&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9oaWdoXzRfdjEiLCJ2aWRlb19pZCI6bnVsbCwiY2xpZW50X25hbWUiOiJpZyIsIm9pbF91cmxnZW5fYXBwX2lkIjo5MzY2MTk3NDMzOTI0NTksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&amp;ccb=9-4&amp;oh=00_AYBFqkiv8g87ybb9JEIdq4tBfPhBGNTxrkTFxZc1UTGZrw&amp;oe=6754C00C</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"846-1321\" FBFirstSegmentRange=\"1322-178904\" FBFirstSegmentDuration=\"2000\" FBSecondSegmentRange=\"178905-305550\" FBPrefetchSegmentRange=\"1322-305550\" FBPrefetchSegmentDuration=\"4000\"><Initialization range=\"0-845\"/></SegmentBase></Representation><Representation id=\"556317619574594(mpd_qe=UNKNOWN)v\" mimeType=\"video/mp4\" codecs=\"avc1.64001F\" width=\"396\" height=\"704\" frameRate=\"30\" sar=\"1:1\" startWithSAP=\"1\" bandwidth=\"247761\" FBEncodingTag=\"dash_high_5_v1\" FBContentLength=\"5518877\" FBPlaybackResolutionMos=\"0:100,360:30,480:23.6,720:17.7\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:41,480:32.4,720:22.3\" FBAbrPolicyTags=\"\" FBQualityClass=\"sd\" FBQualityLabel=\"360p\"><BaseURL>https://scontent-atl3-3.cdninstagram.com/o1/v/t16/f2/m69/AQN2cO2kzgQ7SxFdsWj-ZA036os-joF4ydFtEpoYc4ToQrzht5XEiEXfgfy6sIzU0YLVvAnut9SvYzB5kZG5uoet.mp4?strext=1&amp;_nc_cat=109&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-3.cdninstagram.com&amp;_nc_ohc=9TTu7d8MGzYQ7kNvgHPhyoF&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9oaWdoXzVfdjEiLCJ2aWRlb19pZCI6bnVsbCwiY2xpZW50X25hbWUiOiJpZyIsIm9pbF91cmxnZW5fYXBwX2lkIjo5MzY2MTk3NDMzOTI0NTksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&amp;ccb=9-4&amp;oh=00_AYDOoWFhKQ-9WNdJnNUs9KMTRXTv0T_Whmw85guR3O89Mg&amp;oe=6754C4B6</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"846-1321\" FBFirstSegmentRange=\"1322-79459\" FBFirstSegmentDuration=\"2000\" FBSecondSegmentRange=\"79460-136615\" FBPrefetchSegmentRange=\"1322-136615\" FBPrefetchSegmentDuration=\"4000\"><Initialization range=\"0-845\"/></SegmentBase></Representation><Representation id=\"768334141082767(mpd_qe=UNKNOWN)v\" mimeType=\"video/mp4\" codecs=\"avc1.64001F\" width=\"244\" height=\"434\" frameRate=\"30\" sar=\"1:1\" startWithSAP=\"1\" bandwidth=\"116775\" FBEncodingTag=\"dash_high_6_v1\" FBContentLength=\"2601175\" FBPlaybackResolutionMos=\"0:100,360:16.7,480:14.9,720:12.8\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:20.9,480:16.4,720:13.3\" FBAbrPolicyTags=\"\" FBQualityClass=\"sd\" FBQualityLabel=\"240p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQPBsHvuZdXyJpkdjkIBGmB4iAz1qM6qtWXEC0xKzFq_AU2DocIJkGXOQCG7KnMuNSPFp2X5oUHTz_h0I71agbG9.mp4?strext=1&amp;_nc_cat=106&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=1qctTPDhJ6gQ7kNvgHSJ2oL&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9oaWdoXzZfdjEiLCJ2aWRlb19pZCI6bnVsbCwiY2xpZW50X25hbWUiOiJpZyIsIm9pbF91cmxnZW5fYXBwX2lkIjo5MzY2MTk3NDMzOTI0NTksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&amp;ccb=9-4&amp;oh=00_AYCWsREZIjRChE1o6Po4Gcdi5y9AmSYBzcNfYs8I4YR8Lw&amp;oe=6754B58F</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"846-1321\" FBFirstSegmentRange=\"1322-36669\" FBFirstSegmentDuration=\"2000\" FBSecondSegmentRange=\"36670-62737\" FBPrefetchSegmentRange=\"1322-62737\" FBPrefetchSegmentDuration=\"4000\"><Initialization range=\"0-845\"/></SegmentBase></Representation></AdaptationSet><AdaptationSet segmentAlignment=\"true\" subsegmentAlignment=\"true\" subsegmentStartsWithSAP=\"1\" id=\"1\"><Representation id=\"391750256363044ad\" mimeType=\"audio/mp4\" codecs=\"mp4a.40.5\" audioSamplingRate=\"44100\" startWithSAP=\"1\" bandwidth=\"93254\" FBEncodingTag=\"dash_baseline_audio_v1\" FBContentLength=\"2078726\" FBAbrPolicyTags=\"\" FBDefaultQuality=\"1\"><AudioChannelConfiguration schemeIdUri=\"urn:mpeg:dash:23003:3:audio_channel_configuration:2011\" value=\"2\"/><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQPzc3R1rppX7VVDoaU6EcaZiErANHbFX98Fho8CQBkfZnGTszZxxgoRn1JM1QNZOzM_dEfQdvYmiWUHjP2N5vlw.mp4?strext=1&amp;_nc_cat=107&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=Y-tyJU5rGQwQ7kNvgHY31xg&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9iYXNlbGluZV9hdWRpb192MSIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYCdjutHzf5oyXIqJuSTDx1yHuDh-Ss26y74yE7g2GM7xA&amp;oe=6754C674</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"783-1894\" FBFirstSegmentRange=\"1895-22178\" FBFirstSegmentDuration=\"1880\" FBSecondSegmentRange=\"22179-42827\" FBPrefetchSegmentRange=\"1895-42827\" FBPrefetchSegmentDuration=\"3876\"><Initialization range=\"0-782\"/></SegmentBase></Representation></AdaptationSet></Period></MPD>\n",
                                "number_of_qualities": 6
                            },
                            "has_audio": true,
                            "tracking_token": "eyJ2ZXJzaW9uIjo1LCJwYXlsb2FkIjp7ImlzX2FuYWx5dGljc190cmFja2VkIjp0cnVlLCJ1dWlkIjoiYmM1MmYwZDVhMzU1NDI1Y2ExODI0ZWFjOGNmZTRlNzUyOTE3MTcyNDE4Nzk4NjQyNDUzIn0sInNpZ25hdHVyZSI6IiJ9",
                            "video_url": "https://scontent-atl3-3.cdninstagram.com/o1/v/t16/f2/m69/AQM-pg-2pmxkyfGeb4NuKSaG_nBh229so7miesisj4o1DCd_9rZnP4m6mGmDOmozQ4PaSwvXP6fN82mERg25cbJl.mp4?stp=dst-mp4&efg=eyJxZV9ncm91cHMiOiJbXCJpZ193ZWJfZGVsaXZlcnlfdnRzX290ZlwiXSIsInZlbmNvZGVfdGFnIjoidnRzX3ZvZF91cmxnZW4uaWd0di5jMi43MjAuYmFzZWxpbmUifQ&_nc_cat=109&vs=3216269681961893_1347413100&_nc_vs=HBksFQIYOnBhc3N0aHJvdWdoX2V2ZXJzdG9yZS9HSUNXbUFDekJMallwQ3NDQVBjVHhRWm93b1ZtYnZWQkFBQUYVAALIAQAVAhg6cGFzc3Rocm91Z2hfZXZlcnN0b3JlL0dQaXE3aEc4Nm15Z3NMb0FBT3VXYkUyUmEwUUJidlZCQUFBRhUCAsgBACgAGAAbAYgHdXNlX29pbAExFQAAJryu96qrhIhAFQIoAkMzLBdAZkZmZmZmZhgSZGFzaF9iYXNlbGluZV8xX3YxEQB17AcA&ccb=9-4&oh=00_AYDAXmnhXLsa6ArPId_PI8V-YFuoy5EgY9hjEsCVIMiFWg&oe=6750AE8C&_nc_sid=8b3546",
                            "video_view_count": 5601221,
                            "edge_media_to_caption": {
                                "edges": [
                                    {
                                        "node": {
                                            "text": "“Laissez-nous rêver.” ✨💭✨\n\nLet us dream. That’s the message of France’s @impulstar (Impulstar) Finale, which just celebrated its 11th year.\n\nThe annual street football event gives 14- to 16-year-olds from the suburbs the opportunity to have an audience of some of the country’s leading names in sports, music, dance and content, making way for those dreams to become a reality.\n\nJoin creators @mr_boris_becker (Boris Becker) and @jenybsg (Jeny Bonsenge) as they go head-to-head to see who should host. Then learn more and see highlights from the Impulstar Finale on today’s story. ⚽️ 💫"
                                        }
                                    }
                                ]
                            },
                            "edge_media_to_comment": {
                                "count": 7124
                            },
                            "comments_disabled": false,
                            "taken_at_timestamp": 1661974267,
                            "edge_liked_by": {
                                "count": 329776
                            },
                            "edge_media_preview_like": {
                                "count": 329776
                            },
                            "location": null,
                            "nft_asset_info": null,
                            "thumbnail_src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/304875880_565550785254435_4996738343671315080_n.jpg?stp=c0.881.2266.2266a_dst-jpg_e35_s640x640_sh0.08_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=103&_nc_ohc=Axb6ibs_jQIQ7kNvgHOBdQW&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYCy94N1iYnqmScuFCcSiKXYkdUVStfUHB72xfZD0CPs_w&oe=6754BADB&_nc_sid=8b3546",
                            "thumbnail_resources": [
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/304875880_565550785254435_4996738343671315080_n.jpg?stp=dst-jpg_e15_p150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4yMjY2eDQwMjkuc2RyLmYzNjMyOS5kZWZhdWx0X2NvdmVyX2ZyYW1lIn0&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=103&_nc_ohc=Axb6ibs_jQIQ7kNvgHOBdQW&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDAKvUxvFX3NlkEUmJ5knrGacYz-4k-2byOVdKOIchakg&oe=6754BADB&_nc_sid=8b3546",
                                    "config_width": 150,
                                    "config_height": 266
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/304875880_565550785254435_4996738343671315080_n.jpg?stp=dst-jpg_e15_p240x240_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4yMjY2eDQwMjkuc2RyLmYzNjMyOS5kZWZhdWx0X2NvdmVyX2ZyYW1lIn0&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=103&_nc_ohc=Axb6ibs_jQIQ7kNvgHOBdQW&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYCu7IoN4xQIPZNFBBmLRmUdzxAHjJWgIlAymrVh9u0a5g&oe=6754BADB&_nc_sid=8b3546",
                                    "config_width": 240,
                                    "config_height": 426
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/304875880_565550785254435_4996738343671315080_n.jpg?stp=dst-jpg_e15_p320x320_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4yMjY2eDQwMjkuc2RyLmYzNjMyOS5kZWZhdWx0X2NvdmVyX2ZyYW1lIn0&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=103&_nc_ohc=Axb6ibs_jQIQ7kNvgHOBdQW&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBN8HCzTdF5ub2-yyEKqOw2F3I0BDUtwoFxt6JSv8nh9Q&oe=6754BADB&_nc_sid=8b3546",
                                    "config_width": 320,
                                    "config_height": 568
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/304875880_565550785254435_4996738343671315080_n.jpg?stp=dst-jpg_e15_p480x480_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4yMjY2eDQwMjkuc2RyLmYzNjMyOS5kZWZhdWx0X2NvdmVyX2ZyYW1lIn0&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=103&_nc_ohc=Axb6ibs_jQIQ7kNvgHOBdQW&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDoYQEfUqUunpozE2u3X9i-_-1jtUI7Cb15Te7fvWLJuw&oe=6754BADB&_nc_sid=8b3546",
                                    "config_width": 480,
                                    "config_height": 853
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/304875880_565550785254435_4996738343671315080_n.jpg?stp=dst-jpg_e35_p640x640_sh0.08_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4yMjY2eDQwMjkuc2RyLmYzNjMyOS5kZWZhdWx0X2NvdmVyX2ZyYW1lIn0&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=103&_nc_ohc=Axb6ibs_jQIQ7kNvgHOBdQW&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYB_x_CTU7w_cViKuz_3KxTVUNMl4X49Vrh2gnZKJHokAg&oe=6754BADB&_nc_sid=8b3546",
                                    "config_width": 640,
                                    "config_height": 1137
                                }
                            ],
                            "felix_profile_grid_crop": {
                                "crop_left": 0,
                                "crop_right": 1,
                                "crop_top": 0.21884057971014495,
                                "crop_bottom": 0.7811594202898551
                            },
                            "coauthor_producers": [],
                            "pinned_for_users": [],
                            "viewer_can_reshare": true,
                            "like_and_view_counts_disabled": false,
                            "encoding_status": null,
                            "is_published": true,
                            "product_type": "igtv",
                            "title": "",
                            "video_duration": 178.2
                        }
                    },
                    {
                        "node": {
                            "__typename": "GraphVideo",
                            "id": "2904079817712666768",
                            "shortcode": "ChNXTUuJQiQ",
                            "dimensions": {
                                "height": 1920,
                                "width": 1080
                            },
                            "display_url": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-15/298712095_5490600104332931_2649600310217213440_n.jpg?stp=dst-jpg_e15_fr_p1080x1080_tt6&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=111&_nc_ohc=LJlyKNiEOXEQ7kNvgFrMI6E&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAd104-Dy7P9Z8ZLqqsWvktf2MJ_UX2AN7lzAUXL1g_dQ&oe=6754ACB9&_nc_sid=8b3546",
                            "edge_media_to_tagged_user": {
                                "edges": [
                                    {
                                        "node": {
                                            "user": {
                                                "full_name": "Netflix US",
                                                "followed_by_viewer": false,
                                                "id": "207587378",
                                                "is_verified": true,
                                                "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/445228843_464184932809581_498846190505065593_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=8IB0Ou_L0T0Q7kNvgGxa2E2&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYC4rubsIQsZmeNeO8yVYeK0YZgTQqoom8Lyh-CkTkJumQ&oe=675493CB&_nc_sid=8b3546",
                                                "username": "netflix"
                                            },
                                            "x": 0,
                                            "y": 0
                                        }
                                    },
                                    {
                                        "node": {
                                            "user": {
                                                "full_name": "Maitreyi Ramakrishnan",
                                                "followed_by_viewer": false,
                                                "id": "2316489743",
                                                "is_verified": true,
                                                "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/414469249_1317214025656451_4082985597869996291_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=QWK5ibJMgG4Q7kNvgFsBQX1&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAt0yzpnWbgq9eDUEWPiEMMYLLTZ6RSqo8HUgsNQdJ9ww&oe=6754B852&_nc_sid=8b3546",
                                                "username": "maitreyiramakrishnan"
                                            },
                                            "x": 0,
                                            "y": 0
                                        }
                                    },
                                    {
                                        "node": {
                                            "user": {
                                                "full_name": "Never Have I Ever",
                                                "followed_by_viewer": false,
                                                "id": "30360129075",
                                                "is_verified": true,
                                                "profile_pic_url": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-19/209584818_1802159276633207_1586845987566332366_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=111&_nc_ohc=pgwDgiHUjK8Q7kNvgEqMdVW&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYASTOwB2_lIuhsUuvtXnxoXY5jWX27HD6xtkYdhmn41Sw&oe=6754AD21&_nc_sid=8b3546",
                                                "username": "neverhaveiever"
                                            },
                                            "x": 0,
                                            "y": 0
                                        }
                                    }
                                ]
                            },
                            "fact_check_overall_rating": null,
                            "fact_check_information": null,
                            "gating_info": null,
                            "sharing_friction_info": {
                                "should_have_sharing_friction": false,
                                "bloks_app_url": null
                            },
                            "media_overlay_info": null,
                            "media_preview": "ABgqlaQqetBuYz8oYZ78iqF/cBV2Dljx9B61XtLUS438A8j/ABz6VjbS7NPJG08nyg0VWg2tGUz/AKtiufUdv0opAZ9xZuz8sCenpV5C1sqxk5JyR6cf55qQqz5HTpjPf/OKqOTPIMH7n4/jWtSNvQcfLcS2DGMk9XYmirKxMqCJfmbBwTwM56fliilvqtUyXpuTqjTjOcBh1xjAPYev1NIumvCcxHk9d3/1q0m6mpk+6KuT5txbFOCB1O6Qgt2x2oqSXrRUoGf/2Q==",
                            "owner": {
                                "id": "25025320",
                                "username": "instagram"
                            },
                            "is_video": true,
                            "has_upcoming_event": false,
                            "accessibility_caption": null,
                            "dash_info": {
                                "is_dash_eligible": true,
                                "video_dash_manifest": "<?xml version=\"1.0\"?>\n<MPD xmlns=\"urn:mpeg:dash:schema:mpd:2011\" minBufferTime=\"PT1.500S\" type=\"static\" mediaPresentationDuration=\"PT0H2M12.049S\" maxSegmentDuration=\"PT0H0M5.000S\" profiles=\"urn:mpeg:dash:profile:isoff-on-demand:2011,http://dashif.org/guidelines/dash264\" FBManifestIdentifier=\"FgAYDGlnX2Rhc2hfaGlnaBlmkorHk+vfpQKU3caL4/nsA4zN6PrEraEEwJHSj+SB8wSiqofipa2tBaqa7cu+s9cLIhgTZGFzaF9iYXNlbGluZV9hdWRpbwA=\"><Period duration=\"PT0H2M12.049S\"><AdaptationSet segmentAlignment=\"true\" maxWidth=\"720\" maxHeight=\"1280\" maxFrameRate=\"30\" par=\"720:1280\" lang=\"und\" subsegmentAlignment=\"true\" subsegmentStartsWithSAP=\"1\" FBUnifiedUploadResolutionMos=\"360:80.2\" id=\"0\"><Representation id=\"1199250023977798(mpd_qe=UNKNOWN)vd\" mimeType=\"video/mp4\" codecs=\"avc1.64001F\" width=\"720\" height=\"1280\" frameRate=\"30\" sar=\"1:1\" startWithSAP=\"1\" bandwidth=\"3606878\" FBEncodingTag=\"dash_high_1_v1\" FBContentLength=\"59528531\" FBPlaybackResolutionMos=\"0:100,360:94.9,480:92,720:82\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:98.31,480:97,720:93.9\" FBAbrPolicyTags=\"avoid_on_cellular,avoid_on_cellular_intentional\" FBDefaultQuality=\"1\" FBQualityClass=\"hd\" FBQualityLabel=\"720p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQOXNB0hBessNSRz_w5FaokTdXtOc-ColClQS02QRNGlOMtYzicH_5_dubCrZNfT8fGppaK-BTFYXfglukbv-l24.mp4?strext=1&amp;_nc_cat=111&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=lNvM7VtV6z8Q7kNvgHL8Q7b&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9oaWdoXzFfdjEiLCJ2aWRlb19pZCI6bnVsbCwiY2xpZW50X25hbWUiOiJpZyIsIm9pbF91cmxnZW5fYXBwX2lkIjo5MzY2MTk3NDMzOTI0NTksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&amp;ccb=9-4&amp;oh=00_AYCrb3tnuz7_S5Fhi1G_6Gt7NkjihTZXYFYzoHtwbVYK2A&amp;oe=6754C0B0</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"845-1212\" FBFirstSegmentRange=\"1213-1065839\" FBFirstSegmentDuration=\"2000\" FBSecondSegmentRange=\"1065840-2427574\" FBPrefetchSegmentRange=\"1213-2427574\" FBPrefetchSegmentDuration=\"4000\"><Initialization range=\"0-844\"/></SegmentBase></Representation><Representation id=\"1378818199274592(mpd_qe=UNKNOWN)v\" mimeType=\"video/mp4\" codecs=\"avc1.64001F\" width=\"720\" height=\"1280\" frameRate=\"30\" sar=\"1:1\" startWithSAP=\"1\" bandwidth=\"2172044\" FBEncodingTag=\"dash_high_2_v1\" FBContentLength=\"35847782\" FBPlaybackResolutionMos=\"0:100,360:90.4,480:85.3,720:72.1\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:96.6,480:95,720:86.7\" FBAbrPolicyTags=\"\" FBQualityClass=\"hd\" FBQualityLabel=\"640p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQM3RwUBeEmj4e3Chvy5I4nLetfQS97IXFmQmXoz60Vxni2j5-vsZEr8IVv_j5FD9wG5ajCk8r4zoHeg4ZFjfN3s.mp4?strext=1&amp;_nc_cat=111&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=dbuvKk08Y20Q7kNvgH6coZn&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9oaWdoXzJfdjEiLCJ2aWRlb19pZCI6bnVsbCwiY2xpZW50X25hbWUiOiJpZyIsIm9pbF91cmxnZW5fYXBwX2lkIjo5MzY2MTk3NDMzOTI0NTksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&amp;ccb=9-4&amp;oh=00_AYDBghKFetmvTvJHn4Vx8DmazdoJezQvNNER0RbV3N8eWw&amp;oe=6754BA78</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"845-1212\" FBFirstSegmentRange=\"1213-632142\" FBFirstSegmentDuration=\"2000\" FBSecondSegmentRange=\"632143-1447884\" FBPrefetchSegmentRange=\"1213-1447884\" FBPrefetchSegmentDuration=\"4000\"><Initialization range=\"0-844\"/></SegmentBase></Representation><Representation id=\"645960283251337(mpd_qe=UNKNOWN)v\" mimeType=\"video/mp4\" codecs=\"avc1.64001F\" width=\"720\" height=\"1280\" frameRate=\"30\" sar=\"1:1\" startWithSAP=\"1\" bandwidth=\"1222733\" FBEncodingTag=\"dash_high_3_v1\" FBContentLength=\"20180205\" FBPlaybackResolutionMos=\"0:100,360:79.6,480:72.4,720:55.8\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:92.9,480:87,720:70.9\" FBAbrPolicyTags=\"\" FBQualityClass=\"hd\" FBQualityLabel=\"540p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQPb62NyCef6CNCAZu1m4cTlZvRwXckxxNhPxijJIySdqL90tYBv9gNeCsAqXtcXjzPZzpiUqJ_fdjez7mXa10cX.mp4?strext=1&amp;_nc_cat=104&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=ndhq1VXQKeQQ7kNvgG6vqy6&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9oaWdoXzNfdjEiLCJ2aWRlb19pZCI6bnVsbCwiY2xpZW50X25hbWUiOiJpZyIsIm9pbF91cmxnZW5fYXBwX2lkIjo5MzY2MTk3NDMzOTI0NTksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&amp;ccb=9-4&amp;oh=00_AYAfWggMCqNA_QD3ysg0LSMARvpei9BLs4pxGLeHcPIQxA&amp;oe=6754AC29</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"845-1212\" FBFirstSegmentRange=\"1213-359070\" FBFirstSegmentDuration=\"2000\" FBSecondSegmentRange=\"359071-802334\" FBPrefetchSegmentRange=\"1213-802334\" FBPrefetchSegmentDuration=\"4000\"><Initialization range=\"0-844\"/></SegmentBase></Representation><Representation id=\"3288424341415573(mpd_qe=UNKNOWN)v\" mimeType=\"video/mp4\" codecs=\"avc1.64001F\" width=\"720\" height=\"1280\" frameRate=\"30\" sar=\"1:1\" startWithSAP=\"1\" bandwidth=\"636906\" FBEncodingTag=\"dash_high_4_v1\" FBContentLength=\"10511608\" FBPlaybackResolutionMos=\"0:100,360:59.3,480:49.1,720:32.8\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:74.6,480:64,720:45\" FBAbrPolicyTags=\"\" FBQualityClass=\"hd\" FBQualityLabel=\"480p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQMqF3bzzaYV5gMaduHVwGN8YMmt7927MROCAYzpXc92zbL6PhZQWiiEDekneT9SP_KOgX_Dal4T8TJOa432PpoJ.mp4?strext=1&amp;_nc_cat=111&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=T-FtFPLHwNsQ7kNvgGtzMLk&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9oaWdoXzRfdjEiLCJ2aWRlb19pZCI6bnVsbCwiY2xpZW50X25hbWUiOiJpZyIsIm9pbF91cmxnZW5fYXBwX2lkIjo5MzY2MTk3NDMzOTI0NTksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&amp;ccb=9-4&amp;oh=00_AYDIaPFTGx6czLDyJ2KYuxz5bNA_veDcoNfk8D3h-dk3gA&amp;oe=67549B28</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"845-1212\" FBFirstSegmentRange=\"1213-195472\" FBFirstSegmentDuration=\"2000\" FBSecondSegmentRange=\"195473-405648\" FBPrefetchSegmentRange=\"1213-405648\" FBPrefetchSegmentDuration=\"4000\"><Initialization range=\"0-844\"/></SegmentBase></Representation><Representation id=\"1507109093042833(mpd_qe=UNKNOWN)v\" mimeType=\"video/mp4\" codecs=\"avc1.64001F\" width=\"648\" height=\"1152\" frameRate=\"30\" sar=\"1:1\" startWithSAP=\"1\" bandwidth=\"301111\" FBEncodingTag=\"dash_high_5_v1\" FBContentLength=\"4969589\" FBPlaybackResolutionMos=\"0:100,360:28.2,480:21.5,720:15.1\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:38.5,480:28.5,720:16.9\" FBAbrPolicyTags=\"\" FBQualityClass=\"sd\" FBQualityLabel=\"360p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQNulaGNJMFUwuErAghxLURqEaUUK0KwIeFbZtCl1huuTCm2zQKHPp87qwXZiwWjVlX7XHYjRwTf4dGvFn2bTDjS.mp4?strext=1&amp;_nc_cat=111&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=2E9aKP9AFn0Q7kNvgFS393n&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9oaWdoXzVfdjEiLCJ2aWRlb19pZCI6bnVsbCwiY2xpZW50X25hbWUiOiJpZyIsIm9pbF91cmxnZW5fYXBwX2lkIjo5MzY2MTk3NDMzOTI0NTksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&amp;ccb=9-4&amp;oh=00_AYDtaPtIq-bK8X7ShTZBbYvyjwt01vdfh2BQqbl2DFizVA&amp;oe=6754C784</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"846-1213\" FBFirstSegmentRange=\"1214-97676\" FBFirstSegmentDuration=\"2000\" FBSecondSegmentRange=\"97677-183649\" FBPrefetchSegmentRange=\"1214-183649\" FBPrefetchSegmentDuration=\"4000\"><Initialization range=\"0-845\"/></SegmentBase></Representation></AdaptationSet><AdaptationSet segmentAlignment=\"true\" subsegmentAlignment=\"true\" subsegmentStartsWithSAP=\"1\" id=\"1\"><Representation id=\"1084011505571658ad\" mimeType=\"audio/mp4\" codecs=\"mp4a.40.5\" audioSamplingRate=\"44100\" startWithSAP=\"1\" bandwidth=\"66486\" FBEncodingTag=\"dash_baseline_audio_v1\" FBContentLength=\"1098406\" FBAbrPolicyTags=\"\" FBDefaultQuality=\"1\"><AudioChannelConfiguration schemeIdUri=\"urn:mpeg:dash:23003:3:audio_channel_configuration:2011\" value=\"2\"/><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQM4f0wwqT5_rl3_QS_2iy63KHMD4APALaVrhhSP3_xoNr_cgrD2UaT1hJooBjKY3_LCHQd4K7GuuUq71-uBDC97.mp4?strext=1&amp;_nc_cat=101&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=AwXh4uwl8GMQ7kNvgFZmXsx&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9iYXNlbGluZV9hdWRpb192MSIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYADRoIqZfqdOYilBSoeDS-EH2KMbbBMlFYwV4cJxqclGw&amp;oe=6754B76E</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"783-1618\" FBFirstSegmentRange=\"1619-15741\" FBFirstSegmentDuration=\"1880\" FBSecondSegmentRange=\"15742-30571\" FBPrefetchSegmentRange=\"1619-30571\" FBPrefetchSegmentDuration=\"3876\"><Initialization range=\"0-782\"/></SegmentBase></Representation></AdaptationSet></Period></MPD>\n",
                                "number_of_qualities": 5
                            },
                            "has_audio": true,
                            "tracking_token": "eyJ2ZXJzaW9uIjo1LCJwYXlsb2FkIjp7ImlzX2FuYWx5dGljc190cmFja2VkIjp0cnVlLCJ1dWlkIjoiYmM1MmYwZDVhMzU1NDI1Y2ExODI0ZWFjOGNmZTRlNzUyOTA0MDc5ODE3NzEyNjY2NzY4In0sInNpZ25hdHVyZSI6IiJ9",
                            "video_url": "https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQNGIV1PwvMKJc8mhlOjfUvp55ELwgIHFMc-yTSMEqy0_OmIO81AC_ksKlJdAQvYfOTebDjMtdxxhImPBTuRGJD1.mp4?stp=dst-mp4&efg=eyJxZV9ncm91cHMiOiJbXCJpZ193ZWJfZGVsaXZlcnlfdnRzX290ZlwiXSIsInZlbmNvZGVfdGFnIjoidnRzX3ZvZF91cmxnZW4uaWd0di5jMi43MjAuYmFzZWxpbmUifQ&_nc_cat=101&vs=1143341263061993_2271786104&_nc_vs=HBksFQIYOnBhc3N0aHJvdWdoX2V2ZXJzdG9yZS9HSUNXbUFBZFZkZmwzTEFDQUxaRjhDbFRiTGNKYnZWQkFBQUYVAALIAQAVAhg6cGFzc3Rocm91Z2hfZXZlcnN0b3JlL0dOS1h6aEhVeXdnM200QUFBQm5Qd0JZa2htQklidlZCQUFBRhUCAsgBACgAGAAbAYgHdXNlX29pbAExFQAAJqC%2F3s%2BJwvE%2FFQIoAkMzLBdAYIEOVgQYkxgSZGFzaF9iYXNlbGluZV8xX3YxEQB17AcA&ccb=9-4&oh=00_AYC7mIeqUizYSfgLsZ-YzKXxQaGY77nPDIuHyqtsZU0Wng&oe=6750B701&_nc_sid=8b3546",
                            "video_view_count": 13431580,
                            "edge_media_to_caption": {
                                "edges": [
                                    {
                                        "node": {
                                            "text": "“I know my nails are going to turn a little yellow after this — but the food is good.” ❤️💛 \n \nMeet @maitreyiramakrishnan (Maitreyi Ramakrishnan), star of the @netflix series “Never Have I Ever.” To celebrate the premiere of season three, which explores experiences surrounding the South Asian diaspora, Maitreyi spent a day in NYC on an epic food tour. \n \n“This is a very heartwarming moment for me because everyone is appreciating food that I’ve grown up with my entire life,” says Maitreyi as she samples a dosa from a busy food cart. “This is Tamil pride right here. This makes me so happy. It’s not just people in the film industry, it’s all different industries in all different ways, and that to me is cultural appreciation — because that line is really diverse.” \n \nFollow Maitreyi as she tastes foods (and some very spicy spices 😂) from Sri Lanka, Nepal and Malaysia. 🔥❤️✨ \n \nMusic by @tesherrrr"
                                        }
                                    }
                                ]
                            },
                            "edge_media_to_comment": {
                                "count": 9797
                            },
                            "comments_disabled": false,
                            "taken_at_timestamp": 1660413382,
                            "edge_liked_by": {
                                "count": 804620
                            },
                            "edge_media_preview_like": {
                                "count": 804620
                            },
                            "location": null,
                            "nft_asset_info": null,
                            "thumbnail_src": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-15/298712095_5490600104332931_2649600310217213440_n.jpg?stp=c0.420.1080.1080a_dst-jpg_e35_s640x640_sh0.08_tt6&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=111&_nc_ohc=LJlyKNiEOXEQ7kNvgFrMI6E&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAtl3TZtML1Dyybx5x5bfkQkqVPUHUbyD2B6vAmQSC5sA&oe=6754ACB9&_nc_sid=8b3546",
                            "thumbnail_resources": [
                                {
                                    "src": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-15/298712095_5490600104332931_2649600310217213440_n.jpg?stp=dst-jpg_e15_p150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xMDgweDE5MjAuc2RyLmYzNjMyOS5kZWZhdWx0X2NvdmVyX2ZyYW1lIn0&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=111&_nc_ohc=LJlyKNiEOXEQ7kNvgFrMI6E&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYB2OvD-a8DcLonaeg1dc46HIRIJowZ8SIXN6xFnRTUchA&oe=6754ACB9&_nc_sid=8b3546",
                                    "config_width": 150,
                                    "config_height": 266
                                },
                                {
                                    "src": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-15/298712095_5490600104332931_2649600310217213440_n.jpg?stp=dst-jpg_e15_p240x240_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xMDgweDE5MjAuc2RyLmYzNjMyOS5kZWZhdWx0X2NvdmVyX2ZyYW1lIn0&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=111&_nc_ohc=LJlyKNiEOXEQ7kNvgFrMI6E&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDS4vvVuyRq2hA3hRAZKBmsOQ6s5MYUoaqlXwoL8RHbxQ&oe=6754ACB9&_nc_sid=8b3546",
                                    "config_width": 240,
                                    "config_height": 426
                                },
                                {
                                    "src": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-15/298712095_5490600104332931_2649600310217213440_n.jpg?stp=dst-jpg_e15_p320x320_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xMDgweDE5MjAuc2RyLmYzNjMyOS5kZWZhdWx0X2NvdmVyX2ZyYW1lIn0&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=111&_nc_ohc=LJlyKNiEOXEQ7kNvgFrMI6E&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYC-KLUCXrolvVZW-DMYoxsHOMUBnJp7kvhvn5xHs5LCjA&oe=6754ACB9&_nc_sid=8b3546",
                                    "config_width": 320,
                                    "config_height": 568
                                },
                                {
                                    "src": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-15/298712095_5490600104332931_2649600310217213440_n.jpg?stp=dst-jpg_e15_p480x480_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xMDgweDE5MjAuc2RyLmYzNjMyOS5kZWZhdWx0X2NvdmVyX2ZyYW1lIn0&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=111&_nc_ohc=LJlyKNiEOXEQ7kNvgFrMI6E&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBRyoEnztrYXUv37ozpZzP9-eVdRbO_OjLb_cIsmK7RBg&oe=6754ACB9&_nc_sid=8b3546",
                                    "config_width": 480,
                                    "config_height": 853
                                },
                                {
                                    "src": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-15/298712095_5490600104332931_2649600310217213440_n.jpg?stp=dst-jpg_e35_p640x640_sh0.08_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xMDgweDE5MjAuc2RyLmYzNjMyOS5kZWZhdWx0X2NvdmVyX2ZyYW1lIn0&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=111&_nc_ohc=LJlyKNiEOXEQ7kNvgFrMI6E&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDOYCMJfIWI5ZAiyR8E_lXzYWcUVBMN7XhjQRR39Aw7zg&oe=6754ACB9&_nc_sid=8b3546",
                                    "config_width": 640,
                                    "config_height": 1137
                                }
                            ],
                            "felix_profile_grid_crop": null,
                            "coauthor_producers": [
                                {
                                    "id": "2316489743",
                                    "is_verified": true,
                                    "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/414469249_1317214025656451_4082985597869996291_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=QWK5ibJMgG4Q7kNvgFsBQX1&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAt0yzpnWbgq9eDUEWPiEMMYLLTZ6RSqo8HUgsNQdJ9ww&oe=6754B852&_nc_sid=8b3546",
                                    "username": "maitreyiramakrishnan"
                                }
                            ],
                            "pinned_for_users": [],
                            "viewer_can_reshare": true,
                            "like_and_view_counts_disabled": false,
                            "encoding_status": null,
                            "is_published": true,
                            "product_type": "igtv",
                            "title": "",
                            "video_duration": 132.033
                        }
                    },
                    {
                        "node": {
                            "__typename": "GraphVideo",
                            "id": "2876689839410868573",
                            "shortcode": "CfsDirnD3Fd",
                            "dimensions": {
                                "height": 1920,
                                "width": 1080
                            },
                            "display_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/292007387_125537016840874_5703479192159894357_n.jpg?stp=dst-jpg_e35_p1080x1080_sh0.08_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=110&_nc_ohc=tinPN_kGDEMQ7kNvgEV45dk&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBCDeqrF1C7jDIrarWgE60D8iGIBLCqicxur_csGhsr2g&oe=6754B3DC&_nc_sid=8b3546",
                            "edge_media_to_tagged_user": {
                                "edges": [
                                    {
                                        "node": {
                                            "user": {
                                                "full_name": "Anitta 🎤",
                                                "followed_by_viewer": false,
                                                "id": "26633036",
                                                "is_verified": true,
                                                "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/437146266_1089500008951891_7547538446815817761_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=JnPrjXxKquYQ7kNvgGMQzlp&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBVplFAMUM9OHdCSluRY182EeZIkeUCX54J4Z1WPLwTwA&oe=6754B713&_nc_sid=8b3546",
                                                "username": "anitta"
                                            },
                                            "x": 0,
                                            "y": 0
                                        }
                                    },
                                    {
                                        "node": {
                                            "user": {
                                                "full_name": "Becky G",
                                                "followed_by_viewer": false,
                                                "id": "16754881",
                                                "is_verified": true,
                                                "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/456150537_864911708424990_1954413364509698998_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=a240TjJIiT8Q7kNvgHrXHZ7&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYB-az_MGtZWJuKvdtHLINv1XNnPng-sY10fRt9-rGFp9g&oe=67549492&_nc_sid=8b3546",
                                                "username": "iambeckyg"
                                            },
                                            "x": 0,
                                            "y": 0
                                        }
                                    },
                                    {
                                        "node": {
                                            "user": {
                                                "full_name": "tini",
                                                "followed_by_viewer": false,
                                                "id": "324735270",
                                                "is_verified": true,
                                                "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/468481226_9766575540033469_7423934667173365418_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=DtkyNfsTLLcQ7kNvgEqoZMu&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAvBv1KpeGvExsgJwnKrhKmPc0OxZmBte9DyBwmViDEJA&oe=6754C5DD&_nc_sid=8b3546",
                                                "username": "tinistoessel"
                                            },
                                            "x": 0,
                                            "y": 0
                                        }
                                    }
                                ]
                            },
                            "fact_check_overall_rating": null,
                            "fact_check_information": null,
                            "gating_info": null,
                            "sharing_friction_info": {
                                "should_have_sharing_friction": false,
                                "bloks_app_url": null
                            },
                            "media_overlay_info": null,
                            "media_preview": "ABgqtNDgZ7/TNRKyocHn6f1qvLO5U5IwjBSe/POc+2RiiZ1wCvVuAAeMjAz/AFOT3rK3fc1uXJgvY5x+lFZr3DQjkfN05/mPXpRVKIrlyCARZZvn35J9AADjioo5R5ZkfnrjOKjMhDhc54I/Qj9aSRQYguMFUz/KknfULW0L5ii2fvBuBPU+hPHPtRVEBxbh/fb/AFoqrjtcYyiaQt9M/wBaeGzISejcfh7VkzsRIQDx/wDWFInJpJEmzLJHHGIQRuQ/NnjJ/wD1UVm3nMzfh/KinYD/2Q==",
                            "owner": {
                                "id": "25025320",
                                "username": "instagram"
                            },
                            "is_video": true,
                            "has_upcoming_event": false,
                            "accessibility_caption": null,
                            "dash_info": {
                                "is_dash_eligible": true,
                                "video_dash_manifest": "<?xml version=\"1.0\"?>\n<MPD xmlns=\"urn:mpeg:dash:schema:mpd:2011\" minBufferTime=\"PT1.500S\" type=\"static\" mediaPresentationDuration=\"PT0H3M13.373S\" maxSegmentDuration=\"PT0H0M5.000S\" profiles=\"urn:mpeg:dash:profile:isoff-on-demand:2011,http://dashif.org/guidelines/dash264\" FBManifestIdentifier=\"FgAYDGlnX2Rhc2hfaGlnaBlmuKO80+vGywHMm6Pe1auBAqDPyLiskr4CwsrOosrO8QSo9tuyr5OPE9z14bjdqbUcIhgTZGFzaF9iYXNlbGluZV9hdWRpbwA=\"><Period duration=\"PT0H3M13.373S\"><AdaptationSet segmentAlignment=\"true\" maxWidth=\"720\" maxHeight=\"1280\" maxFrameRate=\"30\" par=\"440:782\" lang=\"und\" subsegmentAlignment=\"true\" subsegmentStartsWithSAP=\"1\" FBUnifiedUploadResolutionMos=\"360:75.9\" id=\"0\"><Representation id=\"565899218413286(mpd_qe=UNKNOWN)vd\" mimeType=\"video/mp4\" codecs=\"avc1.64001F\" width=\"720\" height=\"1280\" frameRate=\"30\" sar=\"1:1\" startWithSAP=\"1\" bandwidth=\"1376661\" FBEncodingTag=\"dash_high_1_v1\" FBContentLength=\"33275056\" FBPlaybackResolutionMos=\"0:100,360:90.3,480:86.7,720:77.1\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:96.6,480:95.5,720:91.4\" FBAbrPolicyTags=\"\" FBDefaultQuality=\"1\" FBQualityClass=\"hd\" FBQualityLabel=\"720p\"><BaseURL>https://scontent-atl3-3.cdninstagram.com/o1/v/t16/f2/m69/AQPBvCKsZQCSkXPHIH8x0x_iJqovc8ow7RAhhQ5w_sDoNeoZX5gUlFZOkL22NNOvGKYr17qHLS5wxHq41XewtEtk.mp4?strext=1&amp;_nc_cat=109&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-3.cdninstagram.com&amp;_nc_ohc=21rgI9Yees8Q7kNvgGYmayQ&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9oaWdoXzFfdjEiLCJ2aWRlb19pZCI6bnVsbCwiY2xpZW50X25hbWUiOiJpZyIsIm9pbF91cmxnZW5fYXBwX2lkIjo5MzY2MTk3NDMzOTI0NTksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&amp;ccb=9-4&amp;oh=00_AYDDWHzb-XT72aTvxuSJgQa1IMO1jyrst970Ix7fqumshw&amp;oe=675497D2</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"845-1356\" FBFirstSegmentRange=\"1357-695409\" FBFirstSegmentDuration=\"2000\" FBSecondSegmentRange=\"695410-1186027\" FBPrefetchSegmentRange=\"1357-1186027\" FBPrefetchSegmentDuration=\"4000\"><Initialization range=\"0-844\"/></SegmentBase></Representation><Representation id=\"1375739532923553(mpd_qe=UNKNOWN)v\" mimeType=\"video/mp4\" codecs=\"avc1.64001F\" width=\"720\" height=\"1280\" frameRate=\"30\" sar=\"1:1\" startWithSAP=\"1\" bandwidth=\"830873\" FBEncodingTag=\"dash_high_2_v1\" FBContentLength=\"20082895\" FBPlaybackResolutionMos=\"0:100,360:83.2,480:77.6,720:68.3\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:94.4,480:91.9,720:83.1\" FBAbrPolicyTags=\"\" FBQualityClass=\"hd\" FBQualityLabel=\"640p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQO8T3Jod7Fp86HFAY17UJdTJfCXAO5yzrnXatMq7v8aQ1RlftnrfME_UbAdz5otIfNFgFAQObysAOOt0HBx4FZn.mp4?strext=1&amp;_nc_cat=105&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=AiMJpu6N8pgQ7kNvgHhpf-n&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9oaWdoXzJfdjEiLCJ2aWRlb19pZCI6bnVsbCwiY2xpZW50X25hbWUiOiJpZyIsIm9pbF91cmxnZW5fYXBwX2lkIjo5MzY2MTk3NDMzOTI0NTksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&amp;ccb=9-4&amp;oh=00_AYClpBY3cKcrZCEkmyP14UeiLMRJurBlWoUi8y5hAplmog&amp;oe=6754B566</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"845-1356\" FBFirstSegmentRange=\"1357-406758\" FBFirstSegmentDuration=\"2000\" FBSecondSegmentRange=\"406759-705631\" FBPrefetchSegmentRange=\"1357-705631\" FBPrefetchSegmentDuration=\"4000\"><Initialization range=\"0-844\"/></SegmentBase></Representation><Representation id=\"5381342685265300(mpd_qe=UNKNOWN)v\" mimeType=\"video/mp4\" codecs=\"avc1.64001F\" width=\"606\" height=\"1078\" frameRate=\"30\" sar=\"1:1\" startWithSAP=\"1\" bandwidth=\"502872\" FBEncodingTag=\"dash_high_3_v1\" FBContentLength=\"12154848\" FBPlaybackResolutionMos=\"0:100,360:74.5,480:69,720:57.6\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:89,480:83.8,720:73\" FBAbrPolicyTags=\"\" FBQualityClass=\"sd\" FBQualityLabel=\"540p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQPvVf6wF48dZhAMeWFOrEh-OHqs4wuMRAIGGi_k-d8tNIKdlHKlQHivI4ABD9LluwzE6yApbGLnj7WcZspWlC_-.mp4?strext=1&amp;_nc_cat=105&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=LUEP8Vg_iJ4Q7kNvgGx40QY&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9oaWdoXzNfdjEiLCJ2aWRlb19pZCI6bnVsbCwiY2xpZW50X25hbWUiOiJpZyIsIm9pbF91cmxnZW5fYXBwX2lkIjo5MzY2MTk3NDMzOTI0NTksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&amp;ccb=9-4&amp;oh=00_AYBIz3sMYiw1mz64V9XJ9CyTNn7JcGDEbfrmmjaqDAS6jw&amp;oe=6754BE56</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"847-1358\" FBFirstSegmentRange=\"1359-235084\" FBFirstSegmentDuration=\"2000\" FBSecondSegmentRange=\"235085-415823\" FBPrefetchSegmentRange=\"1359-415823\" FBPrefetchSegmentDuration=\"4000\"><Initialization range=\"0-846\"/></SegmentBase></Representation><Representation id=\"447618760542428(mpd_qe=UNKNOWN)v\" mimeType=\"video/mp4\" codecs=\"avc1.64001F\" width=\"440\" height=\"782\" frameRate=\"30\" sar=\"1:1\" startWithSAP=\"1\" bandwidth=\"305875\" FBEncodingTag=\"dash_high_4_v1\" FBContentLength=\"7393271\" FBPlaybackResolutionMos=\"0:100,360:66.4,480:59.5,720:48.3\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:81.3,480:74.8,720:63.2\" FBAbrPolicyTags=\"\" FBQualityClass=\"sd\" FBQualityLabel=\"480p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQMq4Bz3G7l0thG0xaCT33ejBkYcN00UqN2-g0dkWa1snHF3wKBoP5QlUMrKDAzQ7ncuH8LZqwC0Fq3PHOg8J6TX.mp4?strext=1&amp;_nc_cat=105&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=LLaHPan3bVYQ7kNvgFyIcyu&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9oaWdoXzRfdjEiLCJ2aWRlb19pZCI6bnVsbCwiY2xpZW50X25hbWUiOiJpZyIsIm9pbF91cmxnZW5fYXBwX2lkIjo5MzY2MTk3NDMzOTI0NTksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&amp;ccb=9-4&amp;oh=00_AYBDdkDA4uBB6kN13oIxkbs-tcrQshUNI0FLuho7-5tjJQ&amp;oe=67549B76</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"847-1358\" FBFirstSegmentRange=\"1359-139465\" FBFirstSegmentDuration=\"2000\" FBSecondSegmentRange=\"139466-249880\" FBPrefetchSegmentRange=\"1359-249880\" FBPrefetchSegmentDuration=\"4000\"><Initialization range=\"0-846\"/></SegmentBase></Representation><Representation id=\"699604597806032(mpd_qe=UNKNOWN)v\" mimeType=\"video/mp4\" codecs=\"avc1.64001F\" width=\"240\" height=\"426\" frameRate=\"30\" sar=\"1:1\" startWithSAP=\"1\" bandwidth=\"119984\" FBEncodingTag=\"dash_high_5_v1\" FBContentLength=\"2900131\" FBPlaybackResolutionMos=\"0:100,360:44,480:38.4,720:32.5\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:58.7,480:52.2,720:44.5\" FBAbrPolicyTags=\"\" FBQualityClass=\"sd\" FBQualityLabel=\"240p\"><BaseURL>https://scontent-atl3-3.cdninstagram.com/o1/v/t16/f2/m69/AQNl75wFYzIFULuJflhGZkZ7mKzQswcpKZkdYZ5EW0SfA1GPNpHdnO6z4njOSebN-byphPi2iA1ptzTgzlWZh1jl.mp4?strext=1&amp;_nc_cat=109&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-3.cdninstagram.com&amp;_nc_ohc=-jBt2lyZ4YsQ7kNvgFN5Ze8&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9oaWdoXzVfdjEiLCJ2aWRlb19pZCI6bnVsbCwiY2xpZW50X25hbWUiOiJpZyIsIm9pbF91cmxnZW5fYXBwX2lkIjo5MzY2MTk3NDMzOTI0NTksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&amp;ccb=9-4&amp;oh=00_AYBELQ2zWRJ0oxDWNqSk9iMte4n-XnDayO096eFJ_Smf7w&amp;oe=6754A5F6</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"845-1356\" FBFirstSegmentRange=\"1357-37541\" FBFirstSegmentDuration=\"2000\" FBSecondSegmentRange=\"37542-65496\" FBPrefetchSegmentRange=\"1357-65496\" FBPrefetchSegmentDuration=\"4000\"><Initialization range=\"0-844\"/></SegmentBase></Representation></AdaptationSet><AdaptationSet segmentAlignment=\"true\" subsegmentAlignment=\"true\" subsegmentStartsWithSAP=\"1\" id=\"1\"><Representation id=\"7998564496850286ad\" mimeType=\"audio/mp4\" codecs=\"mp4a.40.5\" audioSamplingRate=\"44100\" startWithSAP=\"1\" bandwidth=\"88798\" FBEncodingTag=\"dash_baseline_audio_v1\" FBContentLength=\"2147701\" FBAbrPolicyTags=\"\" FBDefaultQuality=\"1\"><AudioChannelConfiguration schemeIdUri=\"urn:mpeg:dash:23003:3:audio_channel_configuration:2011\" value=\"2\"/><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQNT-m8S2VdgokpKV6IgNGEVIHWdWInAvwbvukQuQuS13ArMgkgX11pSGVKdykleTl-nU-4z7b_wd8AxLhxiqx0B.mp4?strext=1&amp;_nc_cat=100&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=bfICkMpuvisQ7kNvgGOx3jD&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9iYXNlbGluZV9hdWRpb192MSIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYCC_p5OJ4E3a7mt1xc-h2O2pBqXezkT_nbwsAC71-_HTA&amp;oe=6754C1D9</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"783-1978\" FBFirstSegmentRange=\"1979-25806\" FBFirstSegmentDuration=\"1880\" FBSecondSegmentRange=\"25807-51585\" FBPrefetchSegmentRange=\"1979-51585\" FBPrefetchSegmentDuration=\"3876\"><Initialization range=\"0-782\"/></SegmentBase></Representation></AdaptationSet></Period></MPD>\n",
                                "number_of_qualities": 5
                            },
                            "has_audio": true,
                            "tracking_token": "eyJ2ZXJzaW9uIjo1LCJwYXlsb2FkIjp7ImlzX2FuYWx5dGljc190cmFja2VkIjp0cnVlLCJ1dWlkIjoiYmM1MmYwZDVhMzU1NDI1Y2ExODI0ZWFjOGNmZTRlNzUyODc2Njg5ODM5NDEwODY4NTczIn0sInNpZ25hdHVyZSI6IiJ9",
                            "video_url": "https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQOKCF-DbcjwrB1JsXm1CpLt_5CA_btUt3QdbPVolUT9iqaFTr0_9YOzraKzKC-qEVOKVxyw0ze6mCkTEW6OWhnN.mp4?stp=dst-mp4&efg=eyJxZV9ncm91cHMiOiJbXCJpZ193ZWJfZGVsaXZlcnlfdnRzX290ZlwiXSIsInZlbmNvZGVfdGFnIjoidnRzX3ZvZF91cmxnZW4uaWd0di5jMi43MjAuYmFzZWxpbmUifQ&_nc_cat=111&vs=403471691758244_309187728&_nc_vs=HBksFQIYOnBhc3N0aHJvdWdoX2V2ZXJzdG9yZS9HSUNXbUFDemdaRUIwd3dDQUhwVWhPSHMtYWhVYnZWQkFBQUYVAALIAQAVAhg6cGFzc3Rocm91Z2hfZXZlcnN0b3JlL0dKLVRhaEVpUXA0M3RCQUNBSVdUeGNDTk8ycHFidlZCQUFBRhUCAsgBACgAGAAbAYgHdXNlX29pbAExFQAAJqC%2FitvvlfhAFQIoAkMzLBdAaCu2RaHKwRgSZGFzaF9iYXNlbGluZV8xX3YxEQB17AcA&ccb=9-4&oh=00_AYC9xLeWLgNSDkm2MBQQ1Xpf-l-2B1DKwKa8-ou_fr40iw&oe=6750D331&_nc_sid=8b3546",
                            "video_view_count": 16591652,
                            "edge_media_to_caption": {
                                "edges": [
                                    {
                                        "node": {
                                            "text": "🎰 We’re on set for the “La Loto” music video with @tinistoessel (Tini), @iambeckyg (Becky G) and @anitta (Anitta).\n\nLearn more about these amazing women and their collab.\n\n❤️‍🔥❤️‍🔥❤️‍🔥"
                                        }
                                    }
                                ]
                            },
                            "edge_media_to_comment": {
                                "count": 13946
                            },
                            "comments_disabled": false,
                            "taken_at_timestamp": 1657148383,
                            "edge_liked_by": {
                                "count": 858799
                            },
                            "edge_media_preview_like": {
                                "count": 858799
                            },
                            "location": null,
                            "nft_asset_info": null,
                            "thumbnail_src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/292007387_125537016840874_5703479192159894357_n.jpg?stp=c0.630.1620.1620a_dst-jpg_e35_s640x640_sh0.08_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=110&_nc_ohc=tinPN_kGDEMQ7kNvgEV45dk&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDC-M_BVvzrB8nJWNurDfOoTwOddB0uuRt1X9OTstfZyw&oe=6754B3DC&_nc_sid=8b3546",
                            "thumbnail_resources": [
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/292007387_125537016840874_5703479192159894357_n.jpg?stp=dst-jpg_e15_p150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xNjIweDI4ODAuc2RyLmYzNjMyOS5kZWZhdWx0X2NvdmVyX2ZyYW1lIn0&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=110&_nc_ohc=tinPN_kGDEMQ7kNvgEV45dk&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDCBwbAg967Ts1QJ9g2bdAj_RQgdXQstoxWvv2oZBqFtQ&oe=6754B3DC&_nc_sid=8b3546",
                                    "config_width": 150,
                                    "config_height": 266
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/292007387_125537016840874_5703479192159894357_n.jpg?stp=dst-jpg_e15_p240x240_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xNjIweDI4ODAuc2RyLmYzNjMyOS5kZWZhdWx0X2NvdmVyX2ZyYW1lIn0&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=110&_nc_ohc=tinPN_kGDEMQ7kNvgEV45dk&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYA2T1Nupk2P8fv2GcLa6es_fQlLtRhJpJK4S80A4AJWqg&oe=6754B3DC&_nc_sid=8b3546",
                                    "config_width": 240,
                                    "config_height": 426
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/292007387_125537016840874_5703479192159894357_n.jpg?stp=dst-jpg_e15_p320x320_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xNjIweDI4ODAuc2RyLmYzNjMyOS5kZWZhdWx0X2NvdmVyX2ZyYW1lIn0&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=110&_nc_ohc=tinPN_kGDEMQ7kNvgEV45dk&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBzLApxZt-6qh5UjcRs2YaKZHSBLxblbK0ErAj2aepxrA&oe=6754B3DC&_nc_sid=8b3546",
                                    "config_width": 320,
                                    "config_height": 568
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/292007387_125537016840874_5703479192159894357_n.jpg?stp=dst-jpg_e15_p480x480_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xNjIweDI4ODAuc2RyLmYzNjMyOS5kZWZhdWx0X2NvdmVyX2ZyYW1lIn0&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=110&_nc_ohc=tinPN_kGDEMQ7kNvgEV45dk&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYCQSnWuc-nMDNfgFC38dxSttg_PNxmDAH_aww6fADs7pA&oe=6754B3DC&_nc_sid=8b3546",
                                    "config_width": 480,
                                    "config_height": 853
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/292007387_125537016840874_5703479192159894357_n.jpg?stp=dst-jpg_e35_p640x640_sh0.08_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xNjIweDI4ODAuc2RyLmYzNjMyOS5kZWZhdWx0X2NvdmVyX2ZyYW1lIn0&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=110&_nc_ohc=tinPN_kGDEMQ7kNvgEV45dk&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAnnGw_4F-CiP12gqysRAXlC4sF_4O8HYjAagu9oT9fdQ&oe=6754B3DC&_nc_sid=8b3546",
                                    "config_width": 640,
                                    "config_height": 1137
                                }
                            ],
                            "felix_profile_grid_crop": {
                                "crop_left": 0,
                                "crop_right": 1,
                                "crop_top": 0.21884057971014495,
                                "crop_bottom": 0.7811594202898551
                            },
                            "coauthor_producers": [],
                            "pinned_for_users": [],
                            "viewer_can_reshare": true,
                            "like_and_view_counts_disabled": false,
                            "encoding_status": null,
                            "is_published": true,
                            "product_type": "igtv",
                            "title": "",
                            "video_duration": 193.366
                        }
                    },
                    {
                        "node": {
                            "__typename": "GraphVideo",
                            "id": "2845435360535439726",
                            "shortcode": "Cd9BGJ4DOlu",
                            "dimensions": {
                                "height": 847,
                                "width": 480
                            },
                            "display_url": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-15/283677069_149531614277929_7816477878436524107_n.jpg?stp=dst-jpg_e15&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=101&_nc_ohc=xgJzjtC7bH4Q7kNvgG7zo6o&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBBFkf2KRrB5Fx435eKNuAUMxkVRiuGmA-mr48fOB1Mjg&oe=6754AF5D&_nc_sid=8b3546",
                            "edge_media_to_tagged_user": {
                                "edges": [
                                    {
                                        "node": {
                                            "user": {
                                                "full_name": "Alec West",
                                                "followed_by_viewer": false,
                                                "id": "290696878",
                                                "is_verified": false,
                                                "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/434893670_1108093510412876_4641824133683605315_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=108&_nc_ohc=6v3emoC7l-EQ7kNvgG2Hc09&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDIyI6KUx4M3aqieyQqoD4hEKjlA99PVBip--WHl68DSw&oe=6754C130&_nc_sid=8b3546",
                                                "username": "alec.fbx"
                                            },
                                            "x": 0,
                                            "y": 0
                                        }
                                    }
                                ]
                            },
                            "fact_check_overall_rating": null,
                            "fact_check_information": null,
                            "gating_info": null,
                            "sharing_friction_info": {
                                "should_have_sharing_friction": false,
                                "bloks_app_url": null
                            },
                            "media_overlay_info": null,
                            "media_preview": "ABgqtuPMGf4v6jv+IpU3kYx+NRpKCMn5fUe/binrKI0JHOPw656VSZNiG4dWkOOSc8+3pRVdcyHd0x1991FMC1DI/mBSTtJweh49KluI1UErnHQZ/HNRQh3G7GAD/n35q1LCzKT1YnPf06elSMyE3HD5wAcYoqf7K+eQA3Xb/hjr+GcUUXt0YjTljEQH95jjk/5FWY8lB7ipXUMMEA/WkoAhki85eeCOhHUGipY+/wBaKAP/2Q==",
                            "owner": {
                                "id": "25025320",
                                "username": "instagram"
                            },
                            "is_video": true,
                            "has_upcoming_event": false,
                            "accessibility_caption": null,
                            "dash_info": {
                                "is_dash_eligible": true,
                                "video_dash_manifest": "<?xml version=\"1.0\"?>\n<MPD xmlns=\"urn:mpeg:dash:schema:mpd:2011\" minBufferTime=\"PT1.500S\" type=\"static\" mediaPresentationDuration=\"PT0H1M0.100S\" maxSegmentDuration=\"PT0H0M5.000S\" profiles=\"urn:mpeg:dash:profile:isoff-on-demand:2011,http://dashif.org/guidelines/dash264\" FBManifestIdentifier=\"FgAYDGlnX2Rhc2hfaGlnaBl25Kzz1IDwhQKSjf6D6P/UAsT8lKyd4NUC0PL8hLq+hwX6gNjg3KPzBpzNg+nDkLsQoL38/fTGphMiGBNkYXNoX2Jhc2VsaW5lX2F1ZGlvAA==\"><Period duration=\"PT0H1M0.100S\"><AdaptationSet segmentAlignment=\"true\" maxWidth=\"720\" maxHeight=\"720\" maxFrameRate=\"30\" par=\"1:1\" lang=\"und\" subsegmentAlignment=\"true\" subsegmentStartsWithSAP=\"1\" FBUnifiedUploadResolutionMos=\"360:73.9\" id=\"0\"><Representation id=\"5432805733404496(mpd_qe=UNKNOWN)vd\" mimeType=\"video/mp4\" codecs=\"avc1.64001F\" width=\"720\" height=\"720\" frameRate=\"30\" sar=\"1:1\" startWithSAP=\"1\" bandwidth=\"1512640\" FBEncodingTag=\"dash_high_1_v1\" FBContentLength=\"11363710\" FBPlaybackResolutionMos=\"0:100,360:92.4,480:88.5,720:76.7\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:97.2,480:96,720:91\" FBAbrPolicyTags=\"\" FBDefaultQuality=\"1\" FBQualityClass=\"hd\" FBQualityLabel=\"720p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQNiziqPGb2yRtWiNSWKuvnuUv3x4puX4xaUfv1-qHqob5-1WDoHXQRbBoO9cx9dc2om74Z3nWgX3ICZIXe077Sn.mp4?strext=1&amp;_nc_cat=105&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=c-N_zhH_aCcQ7kNvgHs0kX7&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9oaWdoXzFfdjEiLCJ2aWRlb19pZCI6bnVsbCwiY2xpZW50X25hbWUiOiJpZyIsIm9pbF91cmxnZW5fYXBwX2lkIjo5MzY2MTk3NDMzOTI0NTksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&amp;ccb=9-4&amp;oh=00_AYCr7bXr3MAyMmaRyNCqLzZ7wFjmkRL6kkF1aSjIoh0APw&amp;oe=6754C732</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"846-1045\" FBFirstSegmentRange=\"1046-348697\" FBFirstSegmentDuration=\"2000\" FBSecondSegmentRange=\"348698-826361\" FBPrefetchSegmentRange=\"1046-826361\" FBPrefetchSegmentDuration=\"4000\"><Initialization range=\"0-845\"/></SegmentBase></Representation><Representation id=\"575869304073010(mpd_qe=UNKNOWN)v\" mimeType=\"video/mp4\" codecs=\"avc1.64001F\" width=\"720\" height=\"720\" frameRate=\"30\" sar=\"1:1\" startWithSAP=\"1\" bandwidth=\"930454\" FBEncodingTag=\"dash_high_2_v1\" FBContentLength=\"6990042\" FBPlaybackResolutionMos=\"0:100,360:85.9,480:79.7,720:66.6\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:95.2,480:92.9,720:81.6\" FBAbrPolicyTags=\"\" FBQualityClass=\"hd\" FBQualityLabel=\"640p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQN_2X6MauUuMJskacK5Ec0kmu7PAv-aH0RlUGK-4rPof1ut7TzEUSYZdsOS2wHQy59Vpy3icq_6KZnqIqv6A3z-.mp4?strext=1&amp;_nc_cat=102&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=vkGsHHAkCTkQ7kNvgFl-YwG&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9oaWdoXzJfdjEiLCJ2aWRlb19pZCI6bnVsbCwiY2xpZW50X25hbWUiOiJpZyIsIm9pbF91cmxnZW5fYXBwX2lkIjo5MzY2MTk3NDMzOTI0NTksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&amp;ccb=9-4&amp;oh=00_AYC6XiOsfxLuLhcKlX-A0YI52rsvzTeM3aWeOMhdnXrujw&amp;oe=6754B67B</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"846-1045\" FBFirstSegmentRange=\"1046-201620\" FBFirstSegmentDuration=\"2000\" FBSecondSegmentRange=\"201621-493159\" FBPrefetchSegmentRange=\"1046-493159\" FBPrefetchSegmentDuration=\"4000\"><Initialization range=\"0-845\"/></SegmentBase></Representation><Representation id=\"751520136208162(mpd_qe=UNKNOWN)v\" mimeType=\"video/mp4\" codecs=\"avc1.64001F\" width=\"720\" height=\"720\" frameRate=\"30\" sar=\"1:1\" startWithSAP=\"1\" bandwidth=\"570461\" FBEncodingTag=\"dash_high_3_v1\" FBContentLength=\"4285589\" FBPlaybackResolutionMos=\"0:100,360:74.3,480:67.5,720:52.5\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:88.8,480:82.4,720:67.3\" FBAbrPolicyTags=\"\" FBQualityClass=\"hd\" FBQualityLabel=\"540p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQPkbn8_HCHKPZ7qtvN0CIUTmK_e76y0CWInlKBK6LUEQTasAUi4ynKbK6S_zJU5vjnrL_t_Q7rUhr4wNzPVB-sU.mp4?strext=1&amp;_nc_cat=111&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=N3TpqDMLUEYQ7kNvgGTCAHS&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9oaWdoXzNfdjEiLCJ2aWRlb19pZCI6bnVsbCwiY2xpZW50X25hbWUiOiJpZyIsIm9pbF91cmxnZW5fYXBwX2lkIjo5MzY2MTk3NDMzOTI0NTksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&amp;ccb=9-4&amp;oh=00_AYA7zNaOPP4q3x9BUyxjE8X360GhYYiVR1nxq76RMt4ILA&amp;oe=6754913C</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"846-1045\" FBFirstSegmentRange=\"1046-119438\" FBFirstSegmentDuration=\"2000\" FBSecondSegmentRange=\"119439-303102\" FBPrefetchSegmentRange=\"1046-303102\" FBPrefetchSegmentDuration=\"4000\"><Initialization range=\"0-845\"/></SegmentBase></Representation><Representation id=\"749863713096521(mpd_qe=UNKNOWN)v\" mimeType=\"video/mp4\" codecs=\"avc1.64001F\" width=\"620\" height=\"620\" frameRate=\"30\" sar=\"1:1\" startWithSAP=\"1\" bandwidth=\"338251\" FBEncodingTag=\"dash_high_4_v1\" FBContentLength=\"2541111\" FBPlaybackResolutionMos=\"0:100,360:59.7,480:51.6,720:36.9\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:75,480:66.4,720:50.6\" FBAbrPolicyTags=\"\" FBQualityClass=\"sd\" FBQualityLabel=\"480p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQPdslw3uA9ilSEMTSdhHgOvFMxa93uyaUKdehJlr2EbUUBZ9R_ZYwqlMaBNoiT8o9U-9PPW7mDkLpQwVFgsQRKA.mp4?strext=1&amp;_nc_cat=106&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=yy1OTot4dsQQ7kNvgGJguoL&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9oaWdoXzRfdjEiLCJ2aWRlb19pZCI6bnVsbCwiY2xpZW50X25hbWUiOiJpZyIsIm9pbF91cmxnZW5fYXBwX2lkIjo5MzY2MTk3NDMzOTI0NTksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&amp;ccb=9-4&amp;oh=00_AYDkSQYuQWu318z1zsOkEQfIrZdwnjFx0LEg1DV5JI1EJA&amp;oe=6754BE8F</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"847-1046\" FBFirstSegmentRange=\"1047-71698\" FBFirstSegmentDuration=\"2000\" FBSecondSegmentRange=\"71699-185969\" FBPrefetchSegmentRange=\"1047-185969\" FBPrefetchSegmentDuration=\"4000\"><Initialization range=\"0-846\"/></SegmentBase></Representation><Representation id=\"1423840988077224(mpd_qe=UNKNOWN)v\" mimeType=\"video/mp4\" codecs=\"avc1.64001F\" width=\"442\" height=\"442\" frameRate=\"30\" sar=\"1:1\" startWithSAP=\"1\" bandwidth=\"198308\" FBEncodingTag=\"dash_high_5_v1\" FBContentLength=\"1489796\" FBPlaybackResolutionMos=\"0:100,360:45.8,480:37.9,720:27.9\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:60.8,480:51.7,720:38.1\" FBAbrPolicyTags=\"\" FBQualityClass=\"sd\" FBQualityLabel=\"360p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQOQIYxCibvCs8rbEPiOKxH1ecYcb3AUiz1jFNQlCPhKLg6hP01_BW7amEBmUoFVGS6mLKnTTzRdm4VZFc3w1LZY.mp4?strext=1&amp;_nc_cat=107&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=rq9j-BlXqCcQ7kNvgFeZfiz&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9oaWdoXzVfdjEiLCJ2aWRlb19pZCI6bnVsbCwiY2xpZW50X25hbWUiOiJpZyIsIm9pbF91cmxnZW5fYXBwX2lkIjo5MzY2MTk3NDMzOTI0NTksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&amp;ccb=9-4&amp;oh=00_AYCGEfATzGP_XvMZENXPR39tHvluPGLNoQMltlL128jgVQ&amp;oe=6754BFB4</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"847-1046\" FBFirstSegmentRange=\"1047-43747\" FBFirstSegmentDuration=\"2000\" FBSecondSegmentRange=\"43748-111037\" FBPrefetchSegmentRange=\"1047-111037\" FBPrefetchSegmentDuration=\"4000\"><Initialization range=\"0-846\"/></SegmentBase></Representation><Representation id=\"1942351279489085(mpd_qe=UNKNOWN)v\" mimeType=\"video/mp4\" codecs=\"avc1.64001F\" width=\"316\" height=\"316\" frameRate=\"30\" sar=\"1:1\" startWithSAP=\"1\" bandwidth=\"114448\" FBEncodingTag=\"dash_high_6_v1\" FBContentLength=\"859791\" FBPlaybackResolutionMos=\"0:100,360:32.5,480:26.7,720:20.3\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:44.6,480:36.5,720:26.4\" FBAbrPolicyTags=\"\" FBQualityClass=\"sd\" FBQualityLabel=\"270p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQO92TTyQTrcH2I_wRuAwKJI5Pdo8DK6Tg_H-07Kx2_Q53UjMAC9oNZ6B-bWQWyrBz-yWp2LNjkYALFUn0YCKnSR.mp4?strext=1&amp;_nc_cat=100&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=vkjUALVqghcQ7kNvgHDsKeZ&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9oaWdoXzZfdjEiLCJ2aWRlb19pZCI6bnVsbCwiY2xpZW50X25hbWUiOiJpZyIsIm9pbF91cmxnZW5fYXBwX2lkIjo5MzY2MTk3NDMzOTI0NTksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&amp;ccb=9-4&amp;oh=00_AYBE2E-FdoGjAv9JywRX2YmT0yM-IUcvzGZxLx1N0A7D5w&amp;oe=6754B2F9</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"846-1045\" FBFirstSegmentRange=\"1046-25556\" FBFirstSegmentDuration=\"2000\" FBSecondSegmentRange=\"25557-65893\" FBPrefetchSegmentRange=\"1046-65893\" FBPrefetchSegmentDuration=\"4000\"><Initialization range=\"0-845\"/></SegmentBase></Representation></AdaptationSet><AdaptationSet segmentAlignment=\"true\" subsegmentAlignment=\"true\" subsegmentStartsWithSAP=\"1\" id=\"1\"><Representation id=\"4633625980072782ad\" mimeType=\"audio/mp4\" codecs=\"mp4a.40.5\" audioSamplingRate=\"44100\" startWithSAP=\"1\" bandwidth=\"94513\" FBEncodingTag=\"dash_baseline_audio_v1\" FBContentLength=\"711288\" FBAbrPolicyTags=\"\" FBDefaultQuality=\"1\"><AudioChannelConfiguration schemeIdUri=\"urn:mpeg:dash:23003:3:audio_channel_configuration:2011\" value=\"2\"/><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQOFScKAcqsNbmIlnU87irKzayNiLqq5viSlDzVMeilDpww8vF94jJJa9iASqm6Zlq19FyMl7l-Z4egw1xpaw8s7.mp4?strext=1&amp;_nc_cat=104&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=JF9VNh0kingQ7kNvgFiKoXb&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9iYXNlbGluZV9hdWRpb192MSIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYBl3yLS8vYvUFqfAWUbz8NUUWGxDWtJfUUUECkdmda_-w&amp;oe=6754BEED</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"783-1186\" FBFirstSegmentRange=\"1187-25474\" FBFirstSegmentDuration=\"1880\" FBSecondSegmentRange=\"25475-51013\" FBPrefetchSegmentRange=\"1187-51013\" FBPrefetchSegmentDuration=\"3876\"><Initialization range=\"0-782\"/></SegmentBase></Representation></AdaptationSet></Period></MPD>\n",
                                "number_of_qualities": 6
                            },
                            "has_audio": true,
                            "tracking_token": "eyJ2ZXJzaW9uIjo1LCJwYXlsb2FkIjp7ImlzX2FuYWx5dGljc190cmFja2VkIjp0cnVlLCJ1dWlkIjoiYmM1MmYwZDVhMzU1NDI1Y2ExODI0ZWFjOGNmZTRlNzUyODQ1NDM1MzYwNTM1NDM5NzI2In0sInNpZ25hdHVyZSI6IiJ9",
                            "video_url": "https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQPoTIEMM_Wwxp_dY6o5KlBwPn99bpsjYQl0u6O01YvdwcKrPq8BYgjMj02FlgxI9fEYHOfz7ZtI2FQlmoQdNegz.mp4?stp=dst-mp4&efg=eyJxZV9ncm91cHMiOiJbXCJpZ193ZWJfZGVsaXZlcnlfdnRzX290ZlwiXSIsInZlbmNvZGVfdGFnIjoidnRzX3ZvZF91cmxnZW4uaWd0di5jMi43MjAuYmFzZWxpbmUifQ&_nc_cat=108&vs=1885548734989750_1230502652&_nc_vs=HBksFQIYOnBhc3N0aHJvdWdoX2V2ZXJzdG9yZS9HSUNXbUFEekNQbm9tTElEQUZvWGtPbkNKbEFyYnZWQkFBQUYVAALIAQAVAhg6cGFzc3Rocm91Z2hfZXZlcnN0b3JlL0dFbm41QkRQREk3dVhHd0JBTjZTYllZcy02bGJidlZCQUFBRhUCAsgBACgAGAAbAYgHdXNlX29pbAExFQAAJoK71qSw0No%2FFQIoAkMzLBdATgzMzMzMzRgSZGFzaF9iYXNlbGluZV8xX3YxEQB17AcA&ccb=9-4&oh=00_AYA6EEn38UbZj3gj-98b6sl0qrQxjZ1BUJWNuNyO_BxMqg&oe=6750ACB1&_nc_sid=8b3546",
                            "video_view_count": 8597306,
                            "edge_media_to_caption": {
                                "edges": [
                                    {
                                        "node": {
                                            "text": "#HelloWorld.\n\n“My work is simply to be enjoyed. I considered it escapism, something to indulge in and forget about the bullsh*t.” Alec West’s (@alec.fbx) colorful lo-fi renderings throw back to gaming’s early years. “I make animations that mainly just capture a moment in an ever-growing world, each video being another piece in the puzzle. All my life I have been creating art. In middle school, I would go on websites and watch pivot stick fighter animations all day. I would attempt my own crude versions at home downloading pre-made assets.”\n\nAlec developed his pixelated world and original character Tri-Tails using free open-source software. “The work that took a team of 40-plus people 20 years ago, I can do in my room alone today. I am excited to see where these tools will take us and what will be made. I am in a server with extremely talented artists, ranging across many different forms of digital art and software. I don’t know what I would do without this community. Having people to reach out to for help and just general questions is something I won’t ever take for granted. This is something anyone should be able to do if they want. It’s our goal to not only inspire but help them achieve that goal.”\n\nVideo by @alec.fbx\nMusic by @goreshit.sucks"
                                        }
                                    }
                                ]
                            },
                            "edge_media_to_comment": {
                                "count": 11877
                            },
                            "comments_disabled": false,
                            "taken_at_timestamp": 1653423756,
                            "edge_liked_by": {
                                "count": 471265
                            },
                            "edge_media_preview_like": {
                                "count": 471265
                            },
                            "location": null,
                            "nft_asset_info": null,
                            "thumbnail_src": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-15/283677069_149531614277929_7816477878436524107_n.jpg?stp=c0.156.408.408a_dst-jpg_e15&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=101&_nc_ohc=xgJzjtC7bH4Q7kNvgG7zo6o&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYCfT2VL0b0NNQVn4THdAOJBSZRN2iXN_7KntFs3h1KwbA&oe=6754AF5D&_nc_sid=8b3546",
                            "thumbnail_resources": [
                                {
                                    "src": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-15/283677069_149531614277929_7816477878436524107_n.jpg?stp=dst-jpg_e15_p150x150&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi40MDh4NzIwLnNkci5mMzYzMjkuZGVmYXVsdF9jb3Zlcl9mcmFtZSJ9&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=101&_nc_ohc=xgJzjtC7bH4Q7kNvgG7zo6o&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDnu2MiiNcYptOyCVen9JKp9VnmmLHLzaSdMzOVmI84DQ&oe=6754AF5D&_nc_sid=8b3546",
                                    "config_width": 150,
                                    "config_height": 264
                                },
                                {
                                    "src": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-15/283677069_149531614277929_7816477878436524107_n.jpg?stp=dst-jpg_e15_p240x240&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi40MDh4NzIwLnNkci5mMzYzMjkuZGVmYXVsdF9jb3Zlcl9mcmFtZSJ9&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=101&_nc_ohc=xgJzjtC7bH4Q7kNvgG7zo6o&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAZx7KrzKOE54A5UuAHDb4-Gz5zpCP8zsaOw2HgBQwhZw&oe=6754AF5D&_nc_sid=8b3546",
                                    "config_width": 240,
                                    "config_height": 423
                                },
                                {
                                    "src": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-15/283677069_149531614277929_7816477878436524107_n.jpg?stp=dst-jpg_e15_p320x320&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi40MDh4NzIwLnNkci5mMzYzMjkuZGVmYXVsdF9jb3Zlcl9mcmFtZSJ9&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=101&_nc_ohc=xgJzjtC7bH4Q7kNvgG7zo6o&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAvsW5s7evZOqpEKySK6aGTNBJU9SbyAA_AHyjBdvZxKA&oe=6754AF5D&_nc_sid=8b3546",
                                    "config_width": 320,
                                    "config_height": 564
                                },
                                {
                                    "src": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-15/283677069_149531614277929_7816477878436524107_n.jpg?stp=dst-jpg_e15&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi40MDh4NzIwLnNkci5mMzYzMjkuZGVmYXVsdF9jb3Zlcl9mcmFtZSJ9&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=101&_nc_ohc=xgJzjtC7bH4Q7kNvgG7zo6o&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBBFkf2KRrB5Fx435eKNuAUMxkVRiuGmA-mr48fOB1Mjg&oe=6754AF5D&_nc_sid=8b3546",
                                    "config_width": 480,
                                    "config_height": 847
                                },
                                {
                                    "src": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-15/283677069_149531614277929_7816477878436524107_n.jpg?stp=dst-jpg_e15&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi40MDh4NzIwLnNkci5mMzYzMjkuZGVmYXVsdF9jb3Zlcl9mcmFtZSJ9&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=101&_nc_ohc=xgJzjtC7bH4Q7kNvgG7zo6o&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBBFkf2KRrB5Fx435eKNuAUMxkVRiuGmA-mr48fOB1Mjg&oe=6754AF5D&_nc_sid=8b3546",
                                    "config_width": 640,
                                    "config_height": 1129
                                }
                            ],
                            "felix_profile_grid_crop": null,
                            "coauthor_producers": [],
                            "pinned_for_users": [],
                            "viewer_can_reshare": true,
                            "like_and_view_counts_disabled": false,
                            "encoding_status": null,
                            "is_published": true,
                            "product_type": "igtv",
                            "title": "",
                            "video_duration": 60.1
                        }
                    },
                    {
                        "node": {
                            "__typename": "GraphVideo",
                            "id": "2844742175790393738",
                            "shortcode": "Cd6je_RjumK",
                            "dimensions": {
                                "height": 937,
                                "width": 750
                            },
                            "display_url": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-15/283416178_286759093572172_6692138349915508233_n.jpg?stp=dst-jpg_e15&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=104&_nc_ohc=yRhm_OlFHTUQ7kNvgFppXOb&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYD7OMoqtZVzP6oNwAUQ9dvLfCFK_ALEIkSfMDCuaD8EHQ&oe=6754B780&_nc_sid=8b3546",
                            "edge_media_to_tagged_user": {
                                "edges": [
                                    {
                                        "node": {
                                            "user": {
                                                "full_name": "ʏ𝒆 𝔲l ḛ̸̡̛͔̘͚̲͚̓͆̔̉̄̇̐",
                                                "followed_by_viewer": false,
                                                "id": "572694484",
                                                "is_verified": true,
                                                "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/462700397_1078179170525196_5457924060042410799_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=100&_nc_ohc=su9Aw4uVmYwQ7kNvgHonlIL&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDeaqvRxNjRCkkvpJ-Hmftlb3ZyfuKn9NPr0obVZWUylw&oe=6754BD3D&_nc_sid=8b3546",
                                                "username": "yeule"
                                            },
                                            "x": 0,
                                            "y": 0
                                        }
                                    }
                                ]
                            },
                            "fact_check_overall_rating": null,
                            "fact_check_information": null,
                            "gating_info": null,
                            "sharing_friction_info": {
                                "should_have_sharing_friction": false,
                                "bloks_app_url": null
                            },
                            "media_overlay_info": null,
                            "media_preview": "ACIq1JEOCPX8KxthfI/iDc+v41uxzAplz161iOSWYJyAevv70nLQSjdjym8cjnk8dv8AJ7UgtyHIbk4z+f8A+qmpM0b474q3Gpkk5OAUHI69eBz685oTuVKNisTg43CitX7Mvr/n8qKoixii6yuQf8+1OiB+YgZyP1oXTwh5JzgnpwatRq3Qj/635f1rnjZ6xNI6FKSMlsjjNTB/LJxk8ACpJIfM6c47+lEToreWevr16ZqmrR5ldvt5Ck23Z2sVzcNn+L9f8aK0tg9qKx9p5MViujtI2D+FTgmJTgEn+dVovvj/AD2q8TyP96ulLTQLjYpCVAPDGqFwAs2ePwqyv3z9BVK6/wBYfoP5CnbmT9CZaW82Sbj6/rRVSisOVDP/2Q==",
                            "owner": {
                                "id": "25025320",
                                "username": "instagram"
                            },
                            "is_video": true,
                            "has_upcoming_event": false,
                            "accessibility_caption": null,
                            "dash_info": {
                                "is_dash_eligible": true,
                                "video_dash_manifest": "<?xml version=\"1.0\"?>\n<MPD xmlns=\"urn:mpeg:dash:schema:mpd:2011\" minBufferTime=\"PT1.500S\" type=\"static\" mediaPresentationDuration=\"PT0H0M6.534S\" maxSegmentDuration=\"PT0H0M2.533S\" profiles=\"urn:mpeg:dash:profile:isoff-on-demand:2011,http://dashif.org/guidelines/dash264\" FBManifestIdentifier=\"FgAYDGlnX2Rhc2hfaGlnaBlWlov1qqmCwAGQuLS77o/AAZq0qeyLu+IDlqGUsb6OsASWoZnmseniESIYHmR1bW15X3RhZ3NldF9mb3JfZmFsbGJhY2tfbGlzdAA=\"><Period duration=\"PT0H0M6.534S\"><AdaptationSet segmentAlignment=\"true\" maxWidth=\"720\" maxHeight=\"900\" maxFrameRate=\"30\" par=\"720:900\" lang=\"und\" subsegmentAlignment=\"true\" subsegmentStartsWithSAP=\"1\" FBUnifiedUploadResolutionMos=\"360:74\" id=\"0\"><Representation id=\"1231701914323019(mpd_qe=UNKNOWN)vd\" mimeType=\"video/mp4\" codecs=\"avc1.64001F\" width=\"720\" height=\"900\" frameRate=\"30\" sar=\"1:1\" startWithSAP=\"1\" bandwidth=\"1143394\" FBEncodingTag=\"dash_high_1_v1\" FBContentLength=\"933772\" FBPlaybackResolutionMos=\"0:100,360:94.4,480:91.5,720:82.9\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:98.04,480:96.9,720:94.2\" FBAbrPolicyTags=\"avoid_on_cellular,avoid_on_cellular_intentional\" FBDefaultQuality=\"1\" FBQualityClass=\"hd\" FBQualityLabel=\"720p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQMa11tmATY_j1X9YNSEKD8ce5c7E_NeodnAzbvWz_25fVojLaNyxx7hCnNeMnwvplRvxA0ZGdtrLpn7IifZEnmh.mp4?strext=1&amp;_nc_cat=100&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=QNsS4rSddjcQ7kNvgFoA2i5&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9oaWdoXzFfdjEiLCJ2aWRlb19pZCI6bnVsbCwiY2xpZW50X25hbWUiOiJpZyIsIm9pbF91cmxnZW5fYXBwX2lkIjo5MzY2MTk3NDMzOTI0NTksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&amp;ccb=9-4&amp;oh=00_AYBXYj3h8tWXlr_BBgrAyuPWNMpdOLsor880aIXaAQVphQ&amp;oe=6754B761</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"847-914\" FBFirstSegmentRange=\"915-393536\" FBFirstSegmentDuration=\"2000\" FBSecondSegmentRange=\"393537-649837\" FBPrefetchSegmentRange=\"915-649837\" FBPrefetchSegmentDuration=\"4000\"><Initialization range=\"0-846\"/></SegmentBase></Representation><Representation id=\"422484989349384(mpd_qe=UNKNOWN)v\" mimeType=\"video/mp4\" codecs=\"avc1.64001F\" width=\"720\" height=\"900\" frameRate=\"30\" sar=\"1:1\" startWithSAP=\"1\" bandwidth=\"843889\" FBEncodingTag=\"dash_high_2_v1\" FBContentLength=\"689176\" FBPlaybackResolutionMos=\"0:100,360:89.7,480:85.2,720:74.5\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:96.4,480:95,720:89\" FBAbrPolicyTags=\"\" FBQualityClass=\"hd\" FBQualityLabel=\"640p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQPviwDdNgbx9oc4CKJhuAJTzf3KfiNzm1H-TVPC0LwpvrDvXm1LKEs-HRUlR8MkGyrrxwbgDYSnsGDpjGqRmEhO.mp4?strext=1&amp;_nc_cat=108&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=s1xLUino4fsQ7kNvgHdm9Gn&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9oaWdoXzJfdjEiLCJ2aWRlb19pZCI6bnVsbCwiY2xpZW50X25hbWUiOiJpZyIsIm9pbF91cmxnZW5fYXBwX2lkIjo5MzY2MTk3NDMzOTI0NTksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&amp;ccb=9-4&amp;oh=00_AYDPgW3CvzvaDQkkc27XaWTJTRN3otd39VkwC4tRE1ARLw&amp;oe=6754C2A5</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"847-914\" FBFirstSegmentRange=\"915-255013\" FBFirstSegmentDuration=\"2000\" FBSecondSegmentRange=\"255014-460993\" FBPrefetchSegmentRange=\"915-460993\" FBPrefetchSegmentDuration=\"4000\"><Initialization range=\"0-846\"/></SegmentBase></Representation><Representation id=\"422252372730571(mpd_qe=UNKNOWN)v\" mimeType=\"video/mp4\" codecs=\"avc1.64001F\" width=\"720\" height=\"900\" frameRate=\"30\" sar=\"1:1\" startWithSAP=\"1\" bandwidth=\"567728\" FBEncodingTag=\"dash_high_3_v1\" FBContentLength=\"463645\" FBPlaybackResolutionMos=\"0:100,360:78.2,480:72,720:58.7\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:92.2,480:86.7,720:74\" FBAbrPolicyTags=\"\" FBQualityClass=\"hd\" FBQualityLabel=\"540p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQNc7yaWchRt86D3G3ndjSIHjlB2Phr5Q9KfIe9GOQX3LbPrc1NnMSUTt4FUM0lkrsy_G9R2BTxNwj_VQcGtEdim.mp4?strext=1&amp;_nc_cat=101&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=SHtoNy9YLbUQ7kNvgHnMO33&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9oaWdoXzNfdjEiLCJ2aWRlb19pZCI6bnVsbCwiY2xpZW50X25hbWUiOiJpZyIsIm9pbF91cmxnZW5fYXBwX2lkIjo5MzY2MTk3NDMzOTI0NTksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&amp;ccb=9-4&amp;oh=00_AYD-Orv5pg-a7knVr393p_h2ItSLBdnbfI2q9u8QqSILzA&amp;oe=6754B3CA</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"847-914\" FBFirstSegmentRange=\"915-160453\" FBFirstSegmentDuration=\"2000\" FBSecondSegmentRange=\"160454-302736\" FBPrefetchSegmentRange=\"915-302736\" FBPrefetchSegmentDuration=\"4000\"><Initialization range=\"0-846\"/></SegmentBase></Representation><Representation id=\"1060944411438349(mpd_qe=UNKNOWN)v\" mimeType=\"video/mp4\" codecs=\"avc1.64001F\" width=\"720\" height=\"900\" frameRate=\"30\" sar=\"1:1\" startWithSAP=\"1\" bandwidth=\"322111\" FBEncodingTag=\"dash_high_4_v1\" FBContentLength=\"263058\" FBPlaybackResolutionMos=\"0:100,360:59.6,480:50.2,720:35\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:74.9,480:65,720:48.3\" FBAbrPolicyTags=\"\" FBQualityClass=\"hd\" FBQualityLabel=\"480p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQO58PUkEEnOKmpF7zm16HTWFupe_SoijKFoTK3TDwaU6GVoWnMrKAOpMiklTI756Wb8XNMB9p4PkND04QeTi1DW.mp4?strext=1&amp;_nc_cat=105&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=PHuFJUxLGBMQ7kNvgENf_lW&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9oaWdoXzRfdjEiLCJ2aWRlb19pZCI6bnVsbCwiY2xpZW50X25hbWUiOiJpZyIsIm9pbF91cmxnZW5fYXBwX2lkIjo5MzY2MTk3NDMzOTI0NTksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&amp;ccb=9-4&amp;oh=00_AYCqSQxzWhX3OQMqDUXDqgyjfhZDxOf4_HQFznMS6eqJnQ&amp;oe=6754AC52</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"847-914\" FBFirstSegmentRange=\"915-92141\" FBFirstSegmentDuration=\"2000\" FBSecondSegmentRange=\"92142-171421\" FBPrefetchSegmentRange=\"915-171421\" FBPrefetchSegmentDuration=\"4000\"><Initialization range=\"0-846\"/></SegmentBase></Representation><Representation id=\"5002389453219915(mpd_qe=UNKNOWN)v\" mimeType=\"video/mp4\" codecs=\"avc1.64001F\" width=\"544\" height=\"680\" frameRate=\"30\" sar=\"1:1\" startWithSAP=\"1\" bandwidth=\"171240\" FBEncodingTag=\"dash_high_5_v1\" FBContentLength=\"139846\" FBPlaybackResolutionMos=\"0:100,360:42.2,480:33,720:21.5\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:56.5,480:45.3,720:28.6\" FBAbrPolicyTags=\"\" FBQualityClass=\"sd\" FBQualityLabel=\"360p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQNEnCZQ1XeVTgeJPv28OydsXRTg5z2AIlXZx9KQcdYAevLFSO3rqJkIkh5EWuzzV5OvyLtl5uNgnuOtSQoM-eNi.mp4?strext=1&amp;_nc_cat=101&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=VP_ZQJiIi0sQ7kNvgGBuEWv&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9oaWdoXzVfdjEiLCJ2aWRlb19pZCI6bnVsbCwiY2xpZW50X25hbWUiOiJpZyIsIm9pbF91cmxnZW5fYXBwX2lkIjo5MzY2MTk3NDMzOTI0NTksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&amp;ccb=9-4&amp;oh=00_AYAzy47egS5HwP51F92uBmo4r1BMAafVDxdpK2kN94lLDQ&amp;oe=6754AA3A</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"847-914\" FBFirstSegmentRange=\"915-49391\" FBFirstSegmentDuration=\"2000\" FBSecondSegmentRange=\"49392-91729\" FBPrefetchSegmentRange=\"915-91729\" FBPrefetchSegmentDuration=\"4000\"><Initialization range=\"0-846\"/></SegmentBase></Representation></AdaptationSet></Period></MPD>\n",
                                "number_of_qualities": 5
                            },
                            "has_audio": false,
                            "tracking_token": "eyJ2ZXJzaW9uIjo1LCJwYXlsb2FkIjp7ImlzX2FuYWx5dGljc190cmFja2VkIjp0cnVlLCJ1dWlkIjoiYmM1MmYwZDVhMzU1NDI1Y2ExODI0ZWFjOGNmZTRlNzUyODQ0NzQyMTc1NzkwMzkzNzM4In0sInNpZ25hdHVyZSI6IiJ9",
                            "video_url": "https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQOXtVMo8kcI0C66PXDuYHodTFdQMBZB6PmzIVbe1pwrYyvp_c1A29w-WHPrfDeabLuqZnGhTsWXNX_ti8teUw2_.mp4?stp=dst-mp4&efg=eyJxZV9ncm91cHMiOiJbXCJpZ193ZWJfZGVsaXZlcnlfdnRzX290ZlwiXSIsInZlbmNvZGVfdGFnIjoidnRzX3ZvZF91cmxnZW4uaWd0di5jMi43MjAuYmFzZWxpbmUifQ&_nc_cat=110&vs=5086054614848289_803291590&_nc_vs=HBkcFQIYOnBhc3N0aHJvdWdoX2V2ZXJzdG9yZS9HSUdSNnhDTm5VWGppMnNEQUdDTkFfQzNaZndCYnZWQkFBQUYVAALIAQAoABgAGwGIB3VzZV9vaWwBMRUAACbMqJL1wanPPxUCKAJDMywXQBohysCDEm8YEmRhc2hfYmFzZWxpbmVfMV92MREAdewHAA%3D%3D&ccb=9-4&oh=00_AYBxcldnLlvGRyxPKDX1Lna57HMxgbK9qZwghywH2FYDRw&oe=6750A0DA&_nc_sid=8b3546",
                            "video_view_count": 12786222,
                            "edge_media_to_caption": {
                                "edges": [
                                    {
                                        "node": {
                                            "text": "“I like to bottle up auras only I can see, in the hopes other people can see them too,” says Nat Ćmiel, the visual artist and musician who is manifesting the otherworldly, ethereal enigma that is yeule (@yeule).\n\n“The yeule project is a sonic and visual time capsule that snapshots eras of my shape-shifting self and the experience of pathos. Musically, yeule lies somewhere between electronic nu-pop cy-earth music II and indie confessional emo.” Born in Singapore and based in London, the self-styled “glitch princess” was a quiet and introverted child before finding their sense of belonging online — drawing inspiration for yeule from the cyber dimension. “As a Singaporean artist, I feel proud of representing Southeast Asia in the electronic music scene. I stand for mental health awareness, trans rights and dedicate my work on this earth to the friends I lost, who couldn’t be seen the way they wanted to be.\n\nI want to hit that spot where it hurts so bad and burns so hot, but you can never take a picture or show anyone what it looked like. Songwriting starts from the dreams and memories that scar the most and end up in my journal in crumpled pieces of paper. I hope it sounds pretty, even though the contents are decaying inside. I won’t sing something I don’t mean, and I don’t play something I don’t really like. There must be a reason why I chip at this concrete so meticulously, right? To make it look as close as it can to what I have seen with my own eyes.”\n\nVideo by @yeule"
                                        }
                                    }
                                ]
                            },
                            "edge_media_to_comment": {
                                "count": 9319
                            },
                            "comments_disabled": false,
                            "taken_at_timestamp": 1653339877,
                            "edge_liked_by": {
                                "count": 559077
                            },
                            "edge_media_preview_like": {
                                "count": 559077
                            },
                            "location": null,
                            "nft_asset_info": null,
                            "thumbnail_src": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-15/283416178_286759093572172_6692138349915508233_n.jpg?stp=c0.90.720.720a_dst-jpg_e15_s640x640&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=104&_nc_ohc=yRhm_OlFHTUQ7kNvgFppXOb&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYCwmMHuvIIED-9aBEJeDaDIqHXz0EOWUDUEFTUBhoYM2g&oe=6754B780&_nc_sid=8b3546",
                            "thumbnail_resources": [
                                {
                                    "src": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-15/283416178_286759093572172_6692138349915508233_n.jpg?stp=dst-jpg_e15_p150x150&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi43MjB4OTAwLnNkci5mMzYzMjkuZGVmYXVsdF9jb3Zlcl9mcmFtZSJ9&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=104&_nc_ohc=yRhm_OlFHTUQ7kNvgFppXOb&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAzR57FAPgTx1cT_gM4EBjMLjZpC8GNwv3fsIugMYtiJQ&oe=6754B780&_nc_sid=8b3546",
                                    "config_width": 150,
                                    "config_height": 187
                                },
                                {
                                    "src": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-15/283416178_286759093572172_6692138349915508233_n.jpg?stp=dst-jpg_e15_p240x240&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi43MjB4OTAwLnNkci5mMzYzMjkuZGVmYXVsdF9jb3Zlcl9mcmFtZSJ9&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=104&_nc_ohc=yRhm_OlFHTUQ7kNvgFppXOb&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYD2arUwXjZ6L_9v0pK76hhkHh8qRRMgpacUkjvsNFL9Gw&oe=6754B780&_nc_sid=8b3546",
                                    "config_width": 240,
                                    "config_height": 300
                                },
                                {
                                    "src": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-15/283416178_286759093572172_6692138349915508233_n.jpg?stp=dst-jpg_e15_p320x320&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi43MjB4OTAwLnNkci5mMzYzMjkuZGVmYXVsdF9jb3Zlcl9mcmFtZSJ9&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=104&_nc_ohc=yRhm_OlFHTUQ7kNvgFppXOb&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYD327P4_mCloNcyGD7mwk66XoytmSt588JrjiRgZIVJfg&oe=6754B780&_nc_sid=8b3546",
                                    "config_width": 320,
                                    "config_height": 400
                                },
                                {
                                    "src": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-15/283416178_286759093572172_6692138349915508233_n.jpg?stp=dst-jpg_e15_p480x480&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi43MjB4OTAwLnNkci5mMzYzMjkuZGVmYXVsdF9jb3Zlcl9mcmFtZSJ9&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=104&_nc_ohc=yRhm_OlFHTUQ7kNvgFppXOb&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAtfZtGqN72otU2WIZ1bDVCB8Fpd0XK9W-MVLwJv07R3w&oe=6754B780&_nc_sid=8b3546",
                                    "config_width": 480,
                                    "config_height": 600
                                },
                                {
                                    "src": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-15/283416178_286759093572172_6692138349915508233_n.jpg?stp=dst-jpg_e15_p640x640&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi43MjB4OTAwLnNkci5mMzYzMjkuZGVmYXVsdF9jb3Zlcl9mcmFtZSJ9&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=104&_nc_ohc=yRhm_OlFHTUQ7kNvgFppXOb&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBe5J64NWWITBycxBY9feYGgJ1h2Aw449V3wGTplo5_fA&oe=6754B780&_nc_sid=8b3546",
                                    "config_width": 640,
                                    "config_height": 800
                                }
                            ],
                            "felix_profile_grid_crop": null,
                            "coauthor_producers": [],
                            "pinned_for_users": [],
                            "viewer_can_reshare": true,
                            "like_and_view_counts_disabled": false,
                            "encoding_status": null,
                            "is_published": true,
                            "product_type": "igtv",
                            "title": "",
                            "video_duration": 6.533
                        }
                    },
                    {
                        "node": {
                            "__typename": "GraphVideo",
                            "id": "2808373972251852441",
                            "shortcode": "Cb5WT-Uhj6Z",
                            "dimensions": {
                                "height": 1920,
                                "width": 1080
                            },
                            "display_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/277812341_390268372626874_8042984142522801912_n.jpg?stp=dst-jpg_e35_p1080x1080_sh0.08_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=110&_nc_ohc=jC6rN-7wSm4Q7kNvgGn_7rt&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDG5Aajns5jotyNWzj94Dhs_Gl_jXM0lqM1bpx3gYk0mQ&oe=6754C8E2&_nc_sid=8b3546",
                            "edge_media_to_tagged_user": {
                                "edges": [
                                    {
                                        "node": {
                                            "user": {
                                                "full_name": "Jon Batiste",
                                                "followed_by_viewer": false,
                                                "id": "21609352",
                                                "is_verified": true,
                                                "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/462486390_511166708395306_545186639607827672_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=110&_nc_ohc=wUkX0p8ChHwQ7kNvgHXHfro&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBm5N172dUXK4hS2o34Cobs0BbxDXElfRJFmNmCJroRbQ&oe=6754B50A&_nc_sid=8b3546",
                                                "username": "jonbatiste"
                                            },
                                            "x": 0,
                                            "y": 0
                                        }
                                    }
                                ]
                            },
                            "fact_check_overall_rating": null,
                            "fact_check_information": null,
                            "gating_info": null,
                            "sharing_friction_info": {
                                "should_have_sharing_friction": false,
                                "bloks_app_url": null
                            },
                            "media_overlay_info": null,
                            "media_preview": "ABgqy0gYqGwcHvTGBTpWta3oI2lRkf3eP06U25Ec5GzOR1GAOPqP8KVx2Mhs9cY78UVPKoDHj8B/KimBbSI2+XbBC9cEfSrUeZV3dcjIDYHfr3z7frWaWBjOeSSPyBJAq5ayDbtyFyMA1nLTUuOujLEMRUsXUDCnHAI/zxRWfJqBBZIzlenPfjBI9PUUU0mxOxXuEMT89O3uD7URThF3dSP59v8A9dO1A5K/Q1mjrT3Qr2ZftYEnyDkEc8fl/hRTbIkScHHBopMEf//Z",
                            "owner": {
                                "id": "25025320",
                                "username": "instagram"
                            },
                            "is_video": true,
                            "has_upcoming_event": false,
                            "accessibility_caption": null,
                            "dash_info": {
                                "is_dash_eligible": true,
                                "video_dash_manifest": "<?xml version=\"1.0\"?>\n<MPD xmlns=\"urn:mpeg:dash:schema:mpd:2011\" minBufferTime=\"PT1.500S\" type=\"static\" mediaPresentationDuration=\"PT0H2M1.067S\" maxSegmentDuration=\"PT0H0M5.000S\" profiles=\"urn:mpeg:dash:profile:isoff-on-demand:2011,http://dashif.org/guidelines/dash264\" FBManifestIdentifier=\"FgAYDGlnX2Rhc2hfaGlnaBl2zpnWosPvkgGC6N/gkpyZAZD0pND858UB3q/ct4io8wGQtKXG562oAujipsr4h/QDiti2gL/w5BIiGBNkYXNoX2Jhc2VsaW5lX2F1ZGlvAA==\"><Period duration=\"PT0H2M1.067S\"><AdaptationSet segmentAlignment=\"true\" maxWidth=\"720\" maxHeight=\"1280\" maxFrameRate=\"30\" par=\"532:946\" lang=\"und\" subsegmentAlignment=\"true\" subsegmentStartsWithSAP=\"1\" id=\"0\"><Representation id=\"336934111803905(mpd_qe=UNKNOWN)vd\" mimeType=\"video/mp4\" codecs=\"avc1.64001F\" width=\"720\" height=\"1280\" frameRate=\"30\" sar=\"1:1\" startWithSAP=\"1\" bandwidth=\"1776942\" FBEncodingTag=\"dash_high_1_v1\" FBContentLength=\"26891065\" FBPlaybackResolutionMos=\"0:100,360:88.8,480:85.3,720:77.4\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:96.1,480:95,720:91.7\" FBAbrPolicyTags=\"\" FBDefaultQuality=\"1\" FBQualityClass=\"hd\" FBQualityLabel=\"720p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQOiMHFaOU4NGQpqnmZIipTdB5BDvQz2JYiFIO9RfK-SiTivYnJq8TKzuk5IQcO0qCDEiTO_rTJbXdIV9tEF4KPZ.mp4?strext=1&amp;_nc_cat=103&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=2TP6hxUNuqQQ7kNvgHaVwGg&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9oaWdoXzFfdjEiLCJ2aWRlb19pZCI6bnVsbCwiY2xpZW50X25hbWUiOiJpZyIsIm9pbF91cmxnZW5fYXBwX2lkIjo5MzY2MTk3NDMzOTI0NTksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&amp;ccb=9-4&amp;oh=00_AYCVte7kkIOYI4b0yygBRST65VEWrDYqwy_AA4b843csvw&amp;oe=6754A8C4</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"845-1188\" FBFirstSegmentRange=\"1189-409710\" FBFirstSegmentDuration=\"2000\" FBSecondSegmentRange=\"409711-870598\" FBPrefetchSegmentRange=\"1189-870598\" FBPrefetchSegmentDuration=\"4000\"><Initialization range=\"0-844\"/></SegmentBase></Representation><Representation id=\"5288384507860485(mpd_qe=UNKNOWN)v\" mimeType=\"video/mp4\" codecs=\"avc1.64001F\" width=\"720\" height=\"1280\" frameRate=\"30\" sar=\"1:1\" startWithSAP=\"1\" bandwidth=\"1116202\" FBEncodingTag=\"dash_high_2_v1\" FBContentLength=\"16891863\" FBPlaybackResolutionMos=\"0:100,360:81.2,480:76.4,720:69.1\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:93.6,480:90.8,720:83.9\" FBAbrPolicyTags=\"\" FBQualityClass=\"hd\" FBQualityLabel=\"640p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQNxAvrwddF0XQ7CfrJqDbbCoSqAcZASwhMfHLdy28oolu1EDxmGwfNoD29s9Fe6RI_0Kk71wkPTfCx-FczMBTUW.mp4?strext=1&amp;_nc_cat=110&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=PrZqtTwsGn8Q7kNvgG9gn1w&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9oaWdoXzJfdjEiLCJ2aWRlb19pZCI6bnVsbCwiY2xpZW50X25hbWUiOiJpZyIsIm9pbF91cmxnZW5fYXBwX2lkIjo5MzY2MTk3NDMzOTI0NTksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&amp;ccb=9-4&amp;oh=00_AYCOZxgDMgwB6TvV_DWqMd9PhoTHDmuA9JCMPgstjzB2IQ&amp;oe=6754A6DB</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"845-1188\" FBFirstSegmentRange=\"1189-268828\" FBFirstSegmentDuration=\"2000\" FBSecondSegmentRange=\"268829-573442\" FBPrefetchSegmentRange=\"1189-573442\" FBPrefetchSegmentDuration=\"4000\"><Initialization range=\"0-844\"/></SegmentBase></Representation><Representation id=\"535050978036719(mpd_qe=UNKNOWN)v\" mimeType=\"video/mp4\" codecs=\"avc1.64001F\" width=\"532\" height=\"946\" frameRate=\"30\" sar=\"1:1\" startWithSAP=\"1\" bandwidth=\"691480\" FBEncodingTag=\"dash_high_3_v1\" FBContentLength=\"10464407\" FBPlaybackResolutionMos=\"0:100,360:73.6,480:68.3,720:59.2\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:88.1,480:83.1,720:74.5\" FBAbrPolicyTags=\"\" FBQualityClass=\"sd\" FBQualityLabel=\"540p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQN_k92XGhZ703ifn1mSOcP7RGdIX9PAUTjzpv7m-ii6U_GP09mirwqiloPCFuaHHpv4wiSWI6wIy_O1TlO78Emv.mp4?strext=1&amp;_nc_cat=111&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=GHQOY5Pl3hQQ7kNvgF3VIsg&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9oaWdoXzNfdjEiLCJ2aWRlb19pZCI6bnVsbCwiY2xpZW50X25hbWUiOiJpZyIsIm9pbF91cmxnZW5fYXBwX2lkIjo5MzY2MTk3NDMzOTI0NTksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&amp;ccb=9-4&amp;oh=00_AYB9MGmnbnSV7e7X2_HhecagcMR_4WUr1L8M8nflfoyrnw&amp;oe=6754B4A0</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"848-1191\" FBFirstSegmentRange=\"1192-169667\" FBFirstSegmentDuration=\"2000\" FBSecondSegmentRange=\"169668-367360\" FBPrefetchSegmentRange=\"1192-367360\" FBPrefetchSegmentDuration=\"4000\"><Initialization range=\"0-847\"/></SegmentBase></Representation><Representation id=\"651697875889416(mpd_qe=UNKNOWN)v\" mimeType=\"video/mp4\" codecs=\"avc1.64001F\" width=\"374\" height=\"664\" frameRate=\"30\" sar=\"1:1\" startWithSAP=\"1\" bandwidth=\"406283\" FBEncodingTag=\"dash_high_4_v1\" FBContentLength=\"6148425\" FBPlaybackResolutionMos=\"0:100,360:63.4,480:56.7,720:47.3\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:78.6,480:72,720:62.2\" FBAbrPolicyTags=\"\" FBQualityClass=\"sd\" FBQualityLabel=\"360p\"><BaseURL>https://scontent-atl3-3.cdninstagram.com/o1/v/t16/f2/m69/AQPXySWbOTQahQalNc9VyEgl55twxIDGDpPM3SMjaASEMKGZ9P0gT4oy0fce6CivjGdNF1sFyIE4Mpl7YMNOK7MF.mp4?strext=1&amp;_nc_cat=109&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-3.cdninstagram.com&amp;_nc_ohc=f6_1QkOVmcsQ7kNvgFHDEdG&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9oaWdoXzRfdjEiLCJ2aWRlb19pZCI6bnVsbCwiY2xpZW50X25hbWUiOiJpZyIsIm9pbF91cmxnZW5fYXBwX2lkIjo5MzY2MTk3NDMzOTI0NTksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&amp;ccb=9-4&amp;oh=00_AYC1nfZKgGQoLXpoAdZSCinWVg1bWbIqiX9aH222H08Agg&amp;oe=67549B02</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"846-1189\" FBFirstSegmentRange=\"1190-101985\" FBFirstSegmentDuration=\"2000\" FBSecondSegmentRange=\"101986-222330\" FBPrefetchSegmentRange=\"1190-222330\" FBPrefetchSegmentDuration=\"4000\"><Initialization range=\"0-845\"/></SegmentBase></Representation><Representation id=\"1099648070899892(mpd_qe=UNKNOWN)v\" mimeType=\"video/mp4\" codecs=\"avc1.64001F\" width=\"254\" height=\"452\" frameRate=\"30\" sar=\"1:1\" startWithSAP=\"1\" bandwidth=\"223883\" FBEncodingTag=\"dash_high_5_v1\" FBContentLength=\"3388101\" FBPlaybackResolutionMos=\"0:100,360:47.8,480:41.2,720:34.2\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:62.7,480:55.4,720:47.1\" FBAbrPolicyTags=\"\" FBQualityClass=\"sd\" FBQualityLabel=\"240p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQMwJvd02ZWJFhakWLKa-43Qt6Ex6V1jPMge6BRBseVgtPjaOdavoe-SyzX2Q-zrs_uL9miY_JqCkEXYDYZW9tE9.mp4?strext=1&amp;_nc_cat=111&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=BBCg722eAEoQ7kNvgE4Phhh&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9oaWdoXzVfdjEiLCJ2aWRlb19pZCI6bnVsbCwiY2xpZW50X25hbWUiOiJpZyIsIm9pbF91cmxnZW5fYXBwX2lkIjo5MzY2MTk3NDMzOTI0NTksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&amp;ccb=9-4&amp;oh=00_AYA7fHTLzObv7me7o9HkAYi_ZYOQSVrUGYd8o6rNYKwNEA&amp;oe=6754BE90</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"847-1190\" FBFirstSegmentRange=\"1191-58365\" FBFirstSegmentDuration=\"2000\" FBSecondSegmentRange=\"58366-127033\" FBPrefetchSegmentRange=\"1191-127033\" FBPrefetchSegmentDuration=\"4000\"><Initialization range=\"0-846\"/></SegmentBase></Representation><Representation id=\"322973389735527(mpd_qe=UNKNOWN)v\" mimeType=\"video/mp4\" codecs=\"avc1.64001F\" width=\"240\" height=\"426\" frameRate=\"30\" sar=\"1:1\" startWithSAP=\"1\" bandwidth=\"119282\" FBEncodingTag=\"dash_high_6_v1\" FBContentLength=\"1805139\" FBPlaybackResolutionMos=\"0:100,360:30,480:26.4,720:23.3\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:40.9,480:36,720:31.8\" FBAbrPolicyTags=\"\" FBQualityClass=\"sd\" FBQualityLabel=\"180p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQNkTmgoE46CiRI0vjL-BMxN8nsjTeccBmm-owAPP_rAfFHhi-Hbp_i3mIEj4oNe0qKuE4IiiFBpEwMXn3pvX98Y.mp4?strext=1&amp;_nc_cat=103&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=0G9HpWhFSwsQ7kNvgHfLlOa&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9oaWdoXzZfdjEiLCJ2aWRlb19pZCI6bnVsbCwiY2xpZW50X25hbWUiOiJpZyIsIm9pbF91cmxnZW5fYXBwX2lkIjo5MzY2MTk3NDMzOTI0NTksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&amp;ccb=9-4&amp;oh=00_AYCPVQ0cxMWFnpLUq9iQcD27k9acDSLU6QLF3UTkQvlahA&amp;oe=6754C600</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"845-1188\" FBFirstSegmentRange=\"1189-35403\" FBFirstSegmentDuration=\"2000\" FBSecondSegmentRange=\"35404-68856\" FBPrefetchSegmentRange=\"1189-68856\" FBPrefetchSegmentDuration=\"4000\"><Initialization range=\"0-844\"/></SegmentBase></Representation></AdaptationSet><AdaptationSet segmentAlignment=\"true\" subsegmentAlignment=\"true\" subsegmentStartsWithSAP=\"1\" id=\"1\"><Representation id=\"434993835056392ad\" mimeType=\"audio/mp4\" codecs=\"mp4a.40.5\" audioSamplingRate=\"44100\" startWithSAP=\"1\" bandwidth=\"90392\" FBEncodingTag=\"dash_baseline_audio_v1\" FBContentLength=\"1369245\" FBAbrPolicyTags=\"\" FBDefaultQuality=\"1\"><AudioChannelConfiguration schemeIdUri=\"urn:mpeg:dash:23003:3:audio_channel_configuration:2011\" value=\"2\"/><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQMUz-0dVAQIPsyhktPRH5mIjB3oV9m1rbKIBVAVWMwfguf-XhwdfRuofpr9UxKmLYts_iRv99lTKwyBwpxTYfHn.mp4?strext=1&amp;_nc_cat=105&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=GK3ZwQhTatUQ7kNvgHV6ghw&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9iYXNlbGluZV9hdWRpb192MSIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYASKfeEQkntFnAax_RwxJe0F-6ogKBhErIVjFK-fbx3pQ&amp;oe=6754A63A</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"783-1546\" FBFirstSegmentRange=\"1547-21799\" FBFirstSegmentDuration=\"1880\" FBSecondSegmentRange=\"21800-40955\" FBPrefetchSegmentRange=\"1547-40955\" FBPrefetchSegmentDuration=\"3876\"><Initialization range=\"0-782\"/></SegmentBase></Representation></AdaptationSet></Period></MPD>\n",
                                "number_of_qualities": 6
                            },
                            "has_audio": true,
                            "tracking_token": "eyJ2ZXJzaW9uIjo1LCJwYXlsb2FkIjp7ImlzX2FuYWx5dGljc190cmFja2VkIjp0cnVlLCJ1dWlkIjoiYmM1MmYwZDVhMzU1NDI1Y2ExODI0ZWFjOGNmZTRlNzUyODA4MzczOTcyMjUxODUyNDQxIn0sInNpZ25hdHVyZSI6IiJ9",
                            "video_url": "https://scontent-atl3-3.cdninstagram.com/o1/v/t16/f2/m69/AQMkgrelzoL7JeLUp5xSIYgriBbT0eVPJdEPw8vDQmNmdpGcLafAKuX4oh0VbdpuNeP6ts5XMAunjAue01VBdA-h.mp4?stp=dst-mp4&efg=eyJxZV9ncm91cHMiOiJbXCJpZ193ZWJfZGVsaXZlcnlfdnRzX290ZlwiXSIsInZlbmNvZGVfdGFnIjoidnRzX3ZvZF91cmxnZW4uaWd0di5jMi43MjAuYmFzZWxpbmUifQ&_nc_cat=109&vs=504049257765965_2892369620&_nc_vs=HBksFQIYOnBhc3N0aHJvdWdoX2V2ZXJzdG9yZS9HSUNXbUFBZGQ3d1F0dFlCQU56RjFTc0R0c2g5YnZWQkFBQUYVAALIAQAVAhg6cGFzc3Rocm91Z2hfZXZlcnN0b3JlL0dLQWhpUkFqWjNHamZEc0JBT3BTQmlJWFV0a1pidlZCQUFBRhUCAsgBACgAGAAbAYgHdXNlX29pbAExFQAAJrSUioDm2o1AFQIoAkMzLBdAXkQ5WBBiThgSZGFzaF9iYXNlbGluZV8xX3YxEQB17AcA&ccb=9-4&oh=00_AYB8YRE3Loos9bU9C59-3Lin0D0BqweykpajTPpLCKdiSA&oe=6750ABF6&_nc_sid=8b3546",
                            "video_view_count": 6230822,
                            "edge_media_to_caption": {
                                "edges": [
                                    {
                                        "node": {
                                            "text": "Artist Jon Batiste (@jonbatiste) is a whole vibe. 🎶 He’s heading to the Grammy Awards (@recordingacademy) with 11 different nominations — the most of any nominee this year. 🤯👏\n\nBut before Jon’s performance at the awards, he met up with friends in New York City for one of his self-proclaimed “love riots.”\n\n“Love riots are like chaotic, fun, impromptu musical parades. It started as something I would do in transit from one place to the next, whether on the way to the recording studio or to rehearsal or even just to the market,” says Jon. “It borrows from the second-line tradition of my hometown New Orleans, typically starting with a few people and gathering folks along the way. I love the feeling of ceremony and sense of community that it brings.”\n\nMeet Jon’s community and hear his soulful sound from the subway to the studio before tonight’s show in Las Vegas."
                                        }
                                    }
                                ]
                            },
                            "edge_media_to_comment": {
                                "count": 9591
                            },
                            "comments_disabled": false,
                            "taken_at_timestamp": 1649004405,
                            "edge_liked_by": {
                                "count": 378922
                            },
                            "edge_media_preview_like": {
                                "count": 378922
                            },
                            "location": null,
                            "nft_asset_info": null,
                            "thumbnail_src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/277812341_390268372626874_8042984142522801912_n.jpg?stp=c0.432.1112.1112a_dst-jpg_e35_s640x640_sh0.08_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=110&_nc_ohc=jC6rN-7wSm4Q7kNvgGn_7rt&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYCQpmLJYpZ1RywAlcs2J4OIkA2OFviA4My845g0F50ZpA&oe=6754C8E2&_nc_sid=8b3546",
                            "thumbnail_resources": [
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/277812341_390268372626874_8042984142522801912_n.jpg?stp=dst-jpg_e15_p150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xMTEyeDE5Nzcuc2RyLmYzNjMyOS5kZWZhdWx0X2NvdmVyX2ZyYW1lIn0&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=110&_nc_ohc=jC6rN-7wSm4Q7kNvgGn_7rt&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAWsdjpOuSFgIBVCcDP7W2FNc020K5Bh0XIBdgiT9-ESg&oe=6754C8E2&_nc_sid=8b3546",
                                    "config_width": 150,
                                    "config_height": 266
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/277812341_390268372626874_8042984142522801912_n.jpg?stp=dst-jpg_e15_p240x240_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xMTEyeDE5Nzcuc2RyLmYzNjMyOS5kZWZhdWx0X2NvdmVyX2ZyYW1lIn0&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=110&_nc_ohc=jC6rN-7wSm4Q7kNvgGn_7rt&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAVcq8J_uM5m4C21u4SgvgwIvz7krUxsiH7E0_KZXduEw&oe=6754C8E2&_nc_sid=8b3546",
                                    "config_width": 240,
                                    "config_height": 426
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/277812341_390268372626874_8042984142522801912_n.jpg?stp=dst-jpg_e15_p320x320_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xMTEyeDE5Nzcuc2RyLmYzNjMyOS5kZWZhdWx0X2NvdmVyX2ZyYW1lIn0&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=110&_nc_ohc=jC6rN-7wSm4Q7kNvgGn_7rt&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDwahStTd3CWLIX2Zk9r53TCQ1CvB5wPYyniCSejHCIRA&oe=6754C8E2&_nc_sid=8b3546",
                                    "config_width": 320,
                                    "config_height": 568
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/277812341_390268372626874_8042984142522801912_n.jpg?stp=dst-jpg_e15_p480x480_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xMTEyeDE5Nzcuc2RyLmYzNjMyOS5kZWZhdWx0X2NvdmVyX2ZyYW1lIn0&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=110&_nc_ohc=jC6rN-7wSm4Q7kNvgGn_7rt&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYCtAiGX16OqDjl21PpwMZWfbZrAJNb0_aXAXhjtDIvhjg&oe=6754C8E2&_nc_sid=8b3546",
                                    "config_width": 480,
                                    "config_height": 853
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/277812341_390268372626874_8042984142522801912_n.jpg?stp=dst-jpg_e35_p640x640_sh0.08_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xMTEyeDE5Nzcuc2RyLmYzNjMyOS5kZWZhdWx0X2NvdmVyX2ZyYW1lIn0&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=110&_nc_ohc=jC6rN-7wSm4Q7kNvgGn_7rt&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBoQZkycofiN2eIzg19_g3UWYyaBZxIV14waABMRffNvA&oe=6754C8E2&_nc_sid=8b3546",
                                    "config_width": 640,
                                    "config_height": 1137
                                }
                            ],
                            "felix_profile_grid_crop": null,
                            "coauthor_producers": [],
                            "pinned_for_users": [],
                            "viewer_can_reshare": true,
                            "like_and_view_counts_disabled": false,
                            "encoding_status": null,
                            "is_published": true,
                            "product_type": "igtv",
                            "title": "",
                            "video_duration": 121.066
                        }
                    },
                    {
                        "node": {
                            "__typename": "GraphVideo",
                            "id": "2806255304128717826",
                            "shortcode": "Cbx0lS3peQC",
                            "dimensions": {
                                "height": 981,
                                "width": 750
                            },
                            "display_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/277329722_366803785361496_5373712280755843476_n.jpg?stp=dst-jpg_e15_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=100&_nc_ohc=cP2LkTM-MFMQ7kNvgGrCgTC&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAV4dOtgQ71h5k4gdq2F9msKHIZtQgpG72yU6Ehl8llLQ&oe=6754B38D&_nc_sid=8b3546",
                            "edge_media_to_tagged_user": {
                                "edges": [
                                    {
                                        "node": {
                                            "user": {
                                                "full_name": "Devin Halbal",
                                                "followed_by_viewer": false,
                                                "id": "345017137",
                                                "is_verified": true,
                                                "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/468521437_804210398444366_823808918290223479_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=_siqyFIK-8wQ7kNvgG9rby2&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDC2PnvGwG_rj2XQwaqWszM8pxGQFB8z8vXvOJVAYOzOQ&oe=6754A7A5&_nc_sid=8b3546",
                                                "username": "devinhalbal"
                                            },
                                            "x": 0,
                                            "y": 0
                                        }
                                    }
                                ]
                            },
                            "fact_check_overall_rating": null,
                            "fact_check_information": null,
                            "gating_info": null,
                            "sharing_friction_info": {
                                "should_have_sharing_friction": false,
                                "bloks_app_url": null
                            },
                            "media_overlay_info": null,
                            "media_preview": "ACAqdnHzDApqzYX5hnn/ABpTaug3MQE/PFRLCHfZnIAye3PpWS0dmCVxzTZIODtzx/h/hSNMu3nLYP8AU5z+lS3Aby8cY/wqnHgNz0x9aTd9htWNSKfCZf8AhHQ1HbTRyyMp+QsO/Qnnoe2M8f5FLeINvy8Z7Vi5y4U+tXGHm9QvY2pYCsZ3Ab8gAZ46+vuMmp7axicZycdCMjIb6iq94xMCNk5x19wOv+FUNPnZXIHUqfzBpWsrvu/wG3c0b4HAAOAepqpBp4lO8seDx07Vcv8A7q/X+lNtj8n4mrbtsCV2JdYeBo15Mfbvx/nrVOxVI8SH7zZxnjH0+tX5OHyODk8/gtV4wDGM/wC1/wChGlbS39agz//Z",
                            "owner": {
                                "id": "25025320",
                                "username": "instagram"
                            },
                            "is_video": true,
                            "has_upcoming_event": false,
                            "accessibility_caption": null,
                            "dash_info": {
                                "is_dash_eligible": true,
                                "video_dash_manifest": "<?xml version=\"1.0\"?>\n<MPD xmlns=\"urn:mpeg:dash:schema:mpd:2011\" minBufferTime=\"PT1.500S\" type=\"static\" mediaPresentationDuration=\"PT0H0M11.865S\" maxSegmentDuration=\"PT0H0M5.000S\" profiles=\"urn:mpeg:dash:profile:isoff-on-demand:2011,http://dashif.org/guidelines/dash264\" FBManifestIdentifier=\"FgAYDGlnX2Rhc2hfaGlnaBl2xo/RgLSl6QGqyJ/hhpfuAeCUnKHQ0bYD7tqfjMmv0gOyqt7cnLCxBZLIpITOlvILnMD945zouBEiGBNkYXNoX2Jhc2VsaW5lX2F1ZGlvAA==\"><Period duration=\"PT0H0M11.865S\"><AdaptationSet segmentAlignment=\"true\" maxWidth=\"720\" maxHeight=\"942\" maxFrameRate=\"30\" par=\"720:942\" lang=\"und\" subsegmentAlignment=\"true\" subsegmentStartsWithSAP=\"1\" id=\"0\"><Representation id=\"4910010475720718(mpd_qe=UNKNOWN)vd\" mimeType=\"video/mp4\" codecs=\"avc1.64001F\" width=\"720\" height=\"942\" frameRate=\"30\" sar=\"1:1\" startWithSAP=\"1\" bandwidth=\"2061045\" FBEncodingTag=\"dash_high_1_v1\" FBContentLength=\"3048629\" FBPlaybackResolutionMos=\"0:100,360:92.7,480:88.8,720:79.5\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:97.3,480:96.1,720:92.8\" FBAbrPolicyTags=\"\" FBDefaultQuality=\"1\" FBQualityClass=\"hd\" FBQualityLabel=\"720p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQN1a1VzXIlSyBSDqpKggquOT8sXplKiGIw7kmwxZJb9Ay230HtwQrJVLMeonUT8DapRab2GTn16M4J8YlrvV5WV.mp4?strext=1&amp;_nc_cat=101&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=ejCsCrnkNMAQ7kNvgFHLHOQ&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9oaWdoXzFfdjEiLCJ2aWRlb19pZCI6bnVsbCwiY2xpZW50X25hbWUiOiJpZyIsIm9pbF91cmxnZW5fYXBwX2lkIjo5MzY2MTk3NDMzOTI0NTksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&amp;ccb=9-4&amp;oh=00_AYC9UKYzsIUFs5leoOExxEAlDG6kQHFi_M0HP5MtuxqPMg&amp;oe=6754BF36</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"847-926\" FBFirstSegmentRange=\"927-353481\" FBFirstSegmentDuration=\"2000\" FBSecondSegmentRange=\"353482-748755\" FBPrefetchSegmentRange=\"927-748755\" FBPrefetchSegmentDuration=\"4000\"><Initialization range=\"0-846\"/></SegmentBase></Representation><Representation id=\"523763579089429(mpd_qe=UNKNOWN)v\" mimeType=\"video/mp4\" codecs=\"avc1.64001F\" width=\"720\" height=\"942\" frameRate=\"30\" sar=\"1:1\" startWithSAP=\"1\" bandwidth=\"1328556\" FBEncodingTag=\"dash_high_2_v1\" FBContentLength=\"1965156\" FBPlaybackResolutionMos=\"0:100,360:84.1,480:77.2,720:66\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:94.7,480:91.5,720:81\" FBAbrPolicyTags=\"\" FBQualityClass=\"hd\" FBQualityLabel=\"640p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQN-zWl8JwQnl3_-vQ7b5jzYCG--tqU0szOIDljIpgDrcg98A58A3dqRiTmZySwTeaNXUKJ77uzqe-Fe7nUgoA6h.mp4?strext=1&amp;_nc_cat=111&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=wljsFjYmLjEQ7kNvgEp16Ry&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9oaWdoXzJfdjEiLCJ2aWRlb19pZCI6bnVsbCwiY2xpZW50X25hbWUiOiJpZyIsIm9pbF91cmxnZW5fYXBwX2lkIjo5MzY2MTk3NDMzOTI0NTksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&amp;ccb=9-4&amp;oh=00_AYDauix-pwfIoGbqYeEaR5v0RGQW_dW9zh_TXDLjIVCFTQ&amp;oe=6754AF80</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"847-926\" FBFirstSegmentRange=\"927-201906\" FBFirstSegmentDuration=\"2000\" FBSecondSegmentRange=\"201907-430864\" FBPrefetchSegmentRange=\"927-430864\" FBPrefetchSegmentDuration=\"4000\"><Initialization range=\"0-846\"/></SegmentBase></Representation><Representation id=\"513015053689827(mpd_qe=UNKNOWN)v\" mimeType=\"video/mp4\" codecs=\"avc1.64001F\" width=\"720\" height=\"942\" frameRate=\"30\" sar=\"1:1\" startWithSAP=\"1\" bandwidth=\"784376\" FBEncodingTag=\"dash_high_3_v1\" FBContentLength=\"1160223\" FBPlaybackResolutionMos=\"0:100,360:68.9,480:60.5,720:46.5\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:83.7,480:75.8,720:61.4\" FBAbrPolicyTags=\"\" FBQualityClass=\"hd\" FBQualityLabel=\"540p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQO7sTXoegl4vY17vbmKXPRcNmuBDQwgWWKYxyh5e2AvrZLEcBwH2V6xfKTg3nGPjgHvzZ8a2iedCk9zpFXZu6vP.mp4?strext=1&amp;_nc_cat=105&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=RTSYlwYET3cQ7kNvgG1CavQ&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9oaWdoXzNfdjEiLCJ2aWRlb19pZCI6bnVsbCwiY2xpZW50X25hbWUiOiJpZyIsIm9pbF91cmxnZW5fYXBwX2lkIjo5MzY2MTk3NDMzOTI0NTksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&amp;ccb=9-4&amp;oh=00_AYC9tLBj403DBsuyGSKhlrmjrW8ATcrbHp7Zla4HFOlBaw&amp;oe=6754B992</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"847-926\" FBFirstSegmentRange=\"927-111848\" FBFirstSegmentDuration=\"2000\" FBSecondSegmentRange=\"111849-240896\" FBPrefetchSegmentRange=\"927-240896\" FBPrefetchSegmentDuration=\"4000\"><Initialization range=\"0-846\"/></SegmentBase></Representation><Representation id=\"1515955512134297(mpd_qe=UNKNOWN)v\" mimeType=\"video/mp4\" codecs=\"avc1.64001F\" width=\"548\" height=\"716\" frameRate=\"30\" sar=\"1:1\" startWithSAP=\"1\" bandwidth=\"434422\" FBEncodingTag=\"dash_high_4_v1\" FBContentLength=\"642583\" FBPlaybackResolutionMos=\"0:100,360:51.2,480:41.5,720:30.5\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:66,480:55.8,720:41.7\" FBAbrPolicyTags=\"\" FBQualityClass=\"sd\" FBQualityLabel=\"480p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQMKC4fn301WujUWl4TUedu6v9DtAxtAuv_H5hswexm6rWyWfxiWFdsOz78mLM-a1ViAZtqWI5GAm4KTtHqJy3le.mp4?strext=1&amp;_nc_cat=103&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=TDnW8dfQ3IwQ7kNvgG3fz9l&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9oaWdoXzRfdjEiLCJ2aWRlb19pZCI6bnVsbCwiY2xpZW50X25hbWUiOiJpZyIsIm9pbF91cmxnZW5fYXBwX2lkIjo5MzY2MTk3NDMzOTI0NTksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&amp;ccb=9-4&amp;oh=00_AYDVPnNTet5oYUiiOzx2L7JwuUuKfEOH17efwv9FzNmabg&amp;oe=6754A7F0</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"846-925\" FBFirstSegmentRange=\"926-61307\" FBFirstSegmentDuration=\"2000\" FBSecondSegmentRange=\"61308-131654\" FBPrefetchSegmentRange=\"926-131654\" FBPrefetchSegmentDuration=\"4000\"><Initialization range=\"0-845\"/></SegmentBase></Representation><Representation id=\"964574527587632(mpd_qe=UNKNOWN)v\" mimeType=\"video/mp4\" codecs=\"avc1.64001F\" width=\"366\" height=\"478\" frameRate=\"30\" sar=\"1:1\" startWithSAP=\"1\" bandwidth=\"208374\" FBEncodingTag=\"dash_high_5_v1\" FBContentLength=\"308220\" FBPlaybackResolutionMos=\"0:100,360:33.6,480:26.5,720:19.5\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:46.2,480:36.2,720:24.9\" FBAbrPolicyTags=\"\" FBQualityClass=\"sd\" FBQualityLabel=\"360p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQNukNlGB23ove328tZ3AfJyFocVx2r1pO0QCdK8cdHs64sjuAMcNsyojZX7BMFoWUu8gNvpokrQ-uT1Ekw0UtOe.mp4?strext=1&amp;_nc_cat=103&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=BNToT0z9zfAQ7kNvgEyzRg4&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9oaWdoXzVfdjEiLCJ2aWRlb19pZCI6bnVsbCwiY2xpZW50X25hbWUiOiJpZyIsIm9pbF91cmxnZW5fYXBwX2lkIjo5MzY2MTk3NDMzOTI0NTksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&amp;ccb=9-4&amp;oh=00_AYDNMnobXuAMPMluC_73soA4gFZSr2M-xhp1LX-QS_eYag&amp;oe=6754C394</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"846-925\" FBFirstSegmentRange=\"926-29891\" FBFirstSegmentDuration=\"2000\" FBSecondSegmentRange=\"29892-64895\" FBPrefetchSegmentRange=\"926-64895\" FBPrefetchSegmentDuration=\"4000\"><Initialization range=\"0-845\"/></SegmentBase></Representation><Representation id=\"1025562101675703(mpd_qe=UNKNOWN)v\" mimeType=\"video/mp4\" codecs=\"avc1.64001F\" width=\"252\" height=\"330\" frameRate=\"30\" sar=\"1:1\" startWithSAP=\"1\" bandwidth=\"112762\" FBEncodingTag=\"dash_high_6_v1\" FBContentLength=\"166795\" FBPlaybackResolutionMos=\"0:100,360:20.9,480:16.5,720:13.8\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:27.4,480:20.4,720:13.6\" FBAbrPolicyTags=\"\" FBQualityClass=\"sd\" FBQualityLabel=\"240p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQPxEfXSNDYHcIzJOpyYswAjKT4c2jlc2Kb4TC7eQuE0fNpLTWjeg5NVWUinlQpqsViwJoMcnugWQm0UbGauMnO6.mp4?strext=1&amp;_nc_cat=110&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=CoXY_rZSgrEQ7kNvgHa2Taf&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9oaWdoXzZfdjEiLCJ2aWRlb19pZCI6bnVsbCwiY2xpZW50X25hbWUiOiJpZyIsIm9pbF91cmxnZW5fYXBwX2lkIjo5MzY2MTk3NDMzOTI0NTksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&amp;ccb=9-4&amp;oh=00_AYDMnEC54WNOUixf33-W3ABDAT-GNB0V4Vskc37WOUFzew&amp;oe=6754B9A7</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"847-926\" FBFirstSegmentRange=\"927-17193\" FBFirstSegmentDuration=\"2000\" FBSecondSegmentRange=\"17194-36962\" FBPrefetchSegmentRange=\"927-36962\" FBPrefetchSegmentDuration=\"4000\"><Initialization range=\"0-846\"/></SegmentBase></Representation></AdaptationSet><AdaptationSet segmentAlignment=\"true\" subsegmentAlignment=\"true\" subsegmentStartsWithSAP=\"1\" id=\"1\"><Representation id=\"3347301825548809ad\" mimeType=\"audio/mp4\" codecs=\"mp4a.40.5\" audioSamplingRate=\"44100\" startWithSAP=\"1\" bandwidth=\"98215\" FBEncodingTag=\"dash_baseline_audio_v1\" FBContentLength=\"145652\" FBAbrPolicyTags=\"\" FBDefaultQuality=\"1\"><AudioChannelConfiguration schemeIdUri=\"urn:mpeg:dash:23003:3:audio_channel_configuration:2011\" value=\"2\"/><BaseURL>https://scontent-atl3-3.cdninstagram.com/o1/v/t16/f2/m69/AQMXxUpOwFqbJuK-MvYHrmsxa0WCrUc8KucO7kA1wBkHnXYU05MWdElIg8Ft8hdxt6y_w2ZLFQ7clGwxse2h1g-3.mp4?strext=1&amp;_nc_cat=109&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-3.cdninstagram.com&amp;_nc_ohc=z2-spv-mjucQ7kNvgEo1qfS&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9iYXNlbGluZV9hdWRpb192MSIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYByyyfGiY0wMcrSS57Gd2t0Uv8PwsaoINO9uqLa_BRXhA&amp;oe=6754BCD6</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"795-898\" FBFirstSegmentRange=\"899-22771\" FBFirstSegmentDuration=\"1996\" FBSecondSegmentRange=\"22772-46036\" FBPrefetchSegmentRange=\"899-46036\" FBPrefetchSegmentDuration=\"3992\"><Initialization range=\"0-794\"/></SegmentBase></Representation></AdaptationSet></Period></MPD>\n",
                                "number_of_qualities": 6
                            },
                            "has_audio": true,
                            "tracking_token": "eyJ2ZXJzaW9uIjo1LCJwYXlsb2FkIjp7ImlzX2FuYWx5dGljc190cmFja2VkIjp0cnVlLCJ1dWlkIjoiYmM1MmYwZDVhMzU1NDI1Y2ExODI0ZWFjOGNmZTRlNzUyODA2MjU1MzA0MTI4NzE3ODI2In0sInNpZ25hdHVyZSI6IiJ9",
                            "video_url": "https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQPN1bCU71HhQv3EL8ZL7CKeMq0FesuDxyDRjgrdVTjFc0x_xYfeC8IACJbmWaLPE9-YZ8q73vEW6gnwE2NPsM2f.mp4?stp=dst-mp4&efg=eyJxZV9ncm91cHMiOiJbXCJpZ193ZWJfZGVsaXZlcnlfdnRzX290ZlwiXSIsInZlbmNvZGVfdGFnIjoidnRzX3ZvZF91cmxnZW4uaWd0di5jMi43MjAuYmFzZWxpbmUifQ&_nc_cat=101&vs=1130180501116159_2487035708&_nc_vs=HBksFQIYOnBhc3N0aHJvdWdoX2V2ZXJzdG9yZS9HS1llaHhCdmkzYUlLUFlBQVBsd19NVHQzck44YnZWQkFBQUYVAALIAQAVAhg6cGFzc3Rocm91Z2hfZXZlcnN0b3JlL0dGNjVoeEFaM0tSZmMyZ0JBUGRVQ21uS01rOUtidlZCQUFBRhUCAsgBACgAGAAbAYgHdXNlX29pbAExFQAAJoKvm6m11tY%2FFQIoAkMzLBdAJ6p%2B%2Bdsi0RgSZGFzaF9iYXNlbGluZV8xX3YxEQB17AcA&ccb=9-4&oh=00_AYAwxgzgf_6NKhlSn7q6MmEiyoKL-_GmA13crMN1fK7Vsw&oe=6750CDD6&_nc_sid=8b3546",
                            "video_view_count": 7222354,
                            "edge_media_to_caption": {
                                "edges": [
                                    {
                                        "node": {
                                            "text": "🤍🏳️‍⚧️ “Growing up, I never really saw anyone who truly represented me in mainstream media. Trans Day of Visibility is important because it reminds trans people that they are not alone. There are so many people within our community who are making the world a better place. This day represents being bold and thriving in a world that is not always the most welcoming or safe for us.” —Writer and creator Devin Halbal (@devinhalbal)\n\nVideo by @devinhalbal"
                                        }
                                    }
                                ]
                            },
                            "edge_media_to_comment": {
                                "count": 10913
                            },
                            "comments_disabled": false,
                            "taken_at_timestamp": 1648751785,
                            "edge_liked_by": {
                                "count": 424946
                            },
                            "edge_media_preview_like": {
                                "count": 424946
                            },
                            "location": null,
                            "nft_asset_info": null,
                            "thumbnail_src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/277329722_366803785361496_5373712280755843476_n.jpg?stp=c0.111.720.720a_dst-jpg_e15_s640x640_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=100&_nc_ohc=cP2LkTM-MFMQ7kNvgGrCgTC&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDEuW8qtDeAgojVTkOR1kfdZdXzysgaZkqPK9cUsT0HMQ&oe=6754B38D&_nc_sid=8b3546",
                            "thumbnail_resources": [
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/277329722_366803785361496_5373712280755843476_n.jpg?stp=dst-jpg_e15_p150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi43MjB4OTQyLnNkci5mMzYzMjkuZGVmYXVsdF9jb3Zlcl9mcmFtZSJ9&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=100&_nc_ohc=cP2LkTM-MFMQ7kNvgGrCgTC&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYCP7q2NfFFTeBEqgxKDE7kX7NDq3Og7ANZsYbvJkRX2dw&oe=6754B38D&_nc_sid=8b3546",
                                    "config_width": 150,
                                    "config_height": 196
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/277329722_366803785361496_5373712280755843476_n.jpg?stp=dst-jpg_e15_p240x240_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi43MjB4OTQyLnNkci5mMzYzMjkuZGVmYXVsdF9jb3Zlcl9mcmFtZSJ9&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=100&_nc_ohc=cP2LkTM-MFMQ7kNvgGrCgTC&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBxaP4araPQKUXSDHug4nS-oSN3ne00sbUSx5b6WW9PNQ&oe=6754B38D&_nc_sid=8b3546",
                                    "config_width": 240,
                                    "config_height": 314
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/277329722_366803785361496_5373712280755843476_n.jpg?stp=dst-jpg_e15_p320x320_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi43MjB4OTQyLnNkci5mMzYzMjkuZGVmYXVsdF9jb3Zlcl9mcmFtZSJ9&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=100&_nc_ohc=cP2LkTM-MFMQ7kNvgGrCgTC&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBB20a3VhAW99OHTfkLqTce7-hynSL7TpYOp0L-R80jXw&oe=6754B38D&_nc_sid=8b3546",
                                    "config_width": 320,
                                    "config_height": 418
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/277329722_366803785361496_5373712280755843476_n.jpg?stp=dst-jpg_e15_p480x480_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi43MjB4OTQyLnNkci5mMzYzMjkuZGVmYXVsdF9jb3Zlcl9mcmFtZSJ9&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=100&_nc_ohc=cP2LkTM-MFMQ7kNvgGrCgTC&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDROpY2SFCkoF2A_EMIT_1vP_mPKT6gVB5zWQRyy6SPHA&oe=6754B38D&_nc_sid=8b3546",
                                    "config_width": 480,
                                    "config_height": 628
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/277329722_366803785361496_5373712280755843476_n.jpg?stp=dst-jpg_e15_p640x640_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi43MjB4OTQyLnNkci5mMzYzMjkuZGVmYXVsdF9jb3Zlcl9mcmFtZSJ9&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=100&_nc_ohc=cP2LkTM-MFMQ7kNvgGrCgTC&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAeP1E1zD2SqxX4HsdNsTIKrCaIxyUEqLfR_MFmV2YjPA&oe=6754B38D&_nc_sid=8b3546",
                                    "config_width": 640,
                                    "config_height": 837
                                }
                            ],
                            "felix_profile_grid_crop": null,
                            "coauthor_producers": [],
                            "pinned_for_users": [],
                            "viewer_can_reshare": true,
                            "like_and_view_counts_disabled": false,
                            "encoding_status": null,
                            "is_published": true,
                            "product_type": "igtv",
                            "title": "",
                            "video_duration": 11.833
                        }
                    },
                    {
                        "node": {
                            "__typename": "GraphVideo",
                            "id": "2801826829257524574",
                            "shortcode": "CbiFqgQDcVe",
                            "dimensions": {
                                "height": 849,
                                "width": 480
                            },
                            "display_url": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-15/277283917_140160571877447_4801570599654599135_n.jpg?stp=dst-jpg_e15_tt6&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=111&_nc_ohc=A3yCHRGFre0Q7kNvgENmYbB&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAL24SSUerXy5pvu2GA8yJr-4zeludexvpUCKTaOEPZNw&oe=6754B318&_nc_sid=8b3546",
                            "edge_media_to_tagged_user": {
                                "edges": [
                                    {
                                        "node": {
                                            "user": {
                                                "full_name": "Bowie 👨🏻‍🎤⚡️| Travel | Influencer | California",
                                                "followed_by_viewer": false,
                                                "id": "29614170166",
                                                "is_verified": false,
                                                "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/90094171_216151176432000_579678361412960256_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=100&_nc_ohc=DIS2LgHEHFEQ7kNvgFC8A-s&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBQj-UT9kW25ZxbZi05sQiPXORATqEM9khMgSE_zPzYoA&oe=67549A0C&_nc_sid=8b3546",
                                                "username": "bowie_the_siberian"
                                            },
                                            "x": 0,
                                            "y": 0
                                        }
                                    }
                                ]
                            },
                            "fact_check_overall_rating": null,
                            "fact_check_information": null,
                            "gating_info": null,
                            "sharing_friction_info": {
                                "should_have_sharing_friction": false,
                                "bloks_app_url": null
                            },
                            "media_overlay_info": null,
                            "media_preview": "ABgq05ZWjU4544Pp9aypGml56/Vh/IVpLLvYpgjHc9D9KzQcHj1p7Dtca1nIF3SHA9B/9b1oqw7ZwD2OaKYWLhbAJ9qr7AB7+tU7TewIkbntkj+lPklNuRv28jtxz6/4ipuMmZcnJ7UVGl0HBwD07jj8D3opgX/KTrgZpkltHIQXGSPWpz92gdfyqRFYWqAcD8BRVnuaKAP/2Q==",
                            "owner": {
                                "id": "25025320",
                                "username": "instagram"
                            },
                            "is_video": true,
                            "has_upcoming_event": false,
                            "accessibility_caption": null,
                            "dash_info": {
                                "is_dash_eligible": true,
                                "video_dash_manifest": "<?xml version=\"1.0\"?>\n<MPD xmlns=\"urn:mpeg:dash:schema:mpd:2011\" minBufferTime=\"PT1.500S\" type=\"static\" mediaPresentationDuration=\"PT0H0M12.195S\" maxSegmentDuration=\"PT0H0M5.000S\" profiles=\"urn:mpeg:dash:profile:isoff-on-demand:2011,http://dashif.org/guidelines/dash264\" FBManifestIdentifier=\"FgAYDGlnX2Rhc2hfaGlnaBlWoIO9hIeVe7r2ioDbsoABzvul98HhmwGul5bAqaPmAeaRgIncyOcHIhgTZGFzaF9iYXNlbGluZV9hdWRpbwA=\"><Period duration=\"PT0H0M12.195S\"><AdaptationSet segmentAlignment=\"true\" maxWidth=\"720\" maxHeight=\"900\" maxFrameRate=\"30\" par=\"720:900\" lang=\"und\" subsegmentAlignment=\"true\" subsegmentStartsWithSAP=\"1\" id=\"0\"><Representation id=\"282346184072605(mpd_qe=UNKNOWN)vd\" mimeType=\"video/mp4\" codecs=\"avc1.64001F\" width=\"720\" height=\"900\" frameRate=\"30\" sar=\"1:1\" startWithSAP=\"1\" bandwidth=\"463198\" FBEncodingTag=\"dash_high_1_v1\" FBContentLength=\"704447\" FBPlaybackResolutionMos=\"0:100,360:96.1,480:94.3,720:88.8\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:98.85,480:98.03,720:96.1\" FBAbrPolicyTags=\"\" FBDefaultQuality=\"1\" FBQualityClass=\"hd\" FBQualityLabel=\"720p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQMNVyUN-VgwT2oEBBuvkYEcAINwOjARLdiiU8ouv4h4gdjP4cotqylXI4r3HrdaIFSb2dL9MswfinUA08Y1rqGZ.mp4?strext=1&amp;_nc_cat=104&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=UZT0Xply61oQ7kNvgGcG25A&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9oaWdoXzFfdjEiLCJ2aWRlb19pZCI6bnVsbCwiY2xpZW50X25hbWUiOiJpZyIsIm9pbF91cmxnZW5fYXBwX2lkIjo5MzY2MTk3NDMzOTI0NTksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&amp;ccb=9-4&amp;oh=00_AYCfwfM1Fb46ms1YJ4f3FR3qlmvnSlGvZf9dKSWrU70_uA&amp;oe=67549FF5</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"847-926\" FBFirstSegmentRange=\"927-127871\" FBFirstSegmentDuration=\"2000\" FBSecondSegmentRange=\"127872-244412\" FBPrefetchSegmentRange=\"927-244412\" FBPrefetchSegmentDuration=\"4000\"><Initialization range=\"0-846\"/></SegmentBase></Representation><Representation id=\"270841581904080(mpd_qe=UNKNOWN)v\" mimeType=\"video/mp4\" codecs=\"avc1.64001F\" width=\"720\" height=\"900\" frameRate=\"30\" sar=\"1:1\" startWithSAP=\"1\" bandwidth=\"361221\" FBEncodingTag=\"dash_high_2_v1\" FBContentLength=\"549357\" FBPlaybackResolutionMos=\"0:100,360:93.4,480:90.6,720:83\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:97.6,480:96.6,720:94.3\" FBAbrPolicyTags=\"\" FBQualityClass=\"hd\" FBQualityLabel=\"640p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQMtzsG4eOURuokLU42175wfEUmutQyGLdeXltKFVnIRpI7BxRVOzOGbPPI3VGGwFDa8LBVsGQM9OV5uhyKUrS2T.mp4?strext=1&amp;_nc_cat=101&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=t41UMd3ek98Q7kNvgE0OeMr&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9oaWdoXzJfdjEiLCJ2aWRlb19pZCI6bnVsbCwiY2xpZW50X25hbWUiOiJpZyIsIm9pbF91cmxnZW5fYXBwX2lkIjo5MzY2MTk3NDMzOTI0NTksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&amp;ccb=9-4&amp;oh=00_AYDrF8U8mQUty9VnPGYyXWIP67GOFlqpGJp3iUgfZfbMoA&amp;oe=675493A2</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"847-926\" FBFirstSegmentRange=\"927-92509\" FBFirstSegmentDuration=\"2000\" FBSecondSegmentRange=\"92510-187875\" FBPrefetchSegmentRange=\"927-187875\" FBPrefetchSegmentDuration=\"4000\"><Initialization range=\"0-846\"/></SegmentBase></Representation><Representation id=\"2198073540346995(mpd_qe=UNKNOWN)v\" mimeType=\"video/mp4\" codecs=\"avc1.64001F\" width=\"720\" height=\"900\" frameRate=\"30\" sar=\"1:1\" startWithSAP=\"1\" bandwidth=\"238085\" FBEncodingTag=\"dash_high_3_v1\" FBContentLength=\"362089\" FBPlaybackResolutionMos=\"0:100,360:86.7,480:81.6,720:70.3\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:95.5,480:93.7,720:85\" FBAbrPolicyTags=\"\" FBQualityClass=\"hd\" FBQualityLabel=\"540p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQPZbhyrr-hthe4JRdbI-36Ho-87Zwqt0iuLxCBC5IW36AyooKCxzKqRvlKi3p7YnjUj8nCIq5eY84u4jilGkKdC.mp4?strext=1&amp;_nc_cat=108&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=5XVLuQbQeVgQ7kNvgFNj9Pd&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9oaWdoXzNfdjEiLCJ2aWRlb19pZCI6bnVsbCwiY2xpZW50X25hbWUiOiJpZyIsIm9pbF91cmxnZW5fYXBwX2lkIjo5MzY2MTk3NDMzOTI0NTksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&amp;ccb=9-4&amp;oh=00_AYASbBql_wseMOaaRYwR_IsXvgOg3NtV1KF6Qyuj7039_w&amp;oe=6754A881</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"847-926\" FBFirstSegmentRange=\"927-54152\" FBFirstSegmentDuration=\"2000\" FBSecondSegmentRange=\"54153-117752\" FBPrefetchSegmentRange=\"927-117752\" FBPrefetchSegmentDuration=\"4000\"><Initialization range=\"0-846\"/></SegmentBase></Representation><Representation id=\"342523901165287(mpd_qe=UNKNOWN)v\" mimeType=\"video/mp4\" codecs=\"avc1.64001F\" width=\"522\" height=\"652\" frameRate=\"30\" sar=\"1:1\" startWithSAP=\"1\" bandwidth=\"102408\" FBEncodingTag=\"dash_high_4_v1\" FBContentLength=\"155747\" FBPlaybackResolutionMos=\"0:100,360:70.3,480:62,720:43.9\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:85,480:77.2,720:58.6\" FBAbrPolicyTags=\"\" FBQualityClass=\"sd\" FBQualityLabel=\"480p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQPur9hJPeTAjkiYtwIOy7DD4zbkkWnYYJcLUvDrndf2FJEekaeGiaAhBo6g2lovuAUjg6fgx6ohXB1ddpYNmhDW.mp4?strext=1&amp;_nc_cat=111&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=ExUU6IZbqkgQ7kNvgEaZjFf&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9oaWdoXzRfdjEiLCJ2aWRlb19pZCI6bnVsbCwiY2xpZW50X25hbWUiOiJpZyIsIm9pbF91cmxnZW5fYXBwX2lkIjo5MzY2MTk3NDMzOTI0NTksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&amp;ccb=9-4&amp;oh=00_AYAWhrpe5FZQseQPbIeVqK1VD0TRBXSJA_rX5w_dFW5mxA&amp;oe=6754BE00</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"846-925\" FBFirstSegmentRange=\"926-22279\" FBFirstSegmentDuration=\"2000\" FBSecondSegmentRange=\"22280-48670\" FBPrefetchSegmentRange=\"926-48670\" FBPrefetchSegmentDuration=\"4000\"><Initialization range=\"0-845\"/></SegmentBase></Representation></AdaptationSet><AdaptationSet segmentAlignment=\"true\" subsegmentAlignment=\"true\" subsegmentStartsWithSAP=\"1\" id=\"1\"><Representation id=\"506382214415831ad\" mimeType=\"audio/mp4\" codecs=\"mp4a.40.5\" audioSamplingRate=\"44100\" startWithSAP=\"1\" bandwidth=\"116977\" FBEncodingTag=\"dash_baseline_audio_v1\" FBContentLength=\"178951\" FBAbrPolicyTags=\"\" FBDefaultQuality=\"1\"><AudioChannelConfiguration schemeIdUri=\"urn:mpeg:dash:23003:3:audio_channel_configuration:2011\" value=\"2\"/><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQOMmNBEBbQIZaEtgcQbSwtG1rk0xUtCXX9uPkMpBsDoOUud_5-MOE6n1bo2JYAd_We9tp7fiGQN_9JdeMs6244d.mp4?strext=1&amp;_nc_cat=100&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=ecOCF9KObLAQ7kNvgHyTTDA&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9iYXNlbGluZV9hdWRpb192MSIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYChQLVu5bZ8bMM31JLYP8r9VohIJ8isQKfRnrU9_w3U2g&amp;oe=6754C8CD</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"783-898\" FBFirstSegmentRange=\"899-29719\" FBFirstSegmentDuration=\"1953\" FBSecondSegmentRange=\"29720-58814\" FBPrefetchSegmentRange=\"899-58814\" FBPrefetchSegmentDuration=\"3949\"><Initialization range=\"0-782\"/></SegmentBase></Representation></AdaptationSet></Period></MPD>\n",
                                "number_of_qualities": 4
                            },
                            "has_audio": true,
                            "tracking_token": "eyJ2ZXJzaW9uIjo1LCJwYXlsb2FkIjp7ImlzX2FuYWx5dGljc190cmFja2VkIjp0cnVlLCJ1dWlkIjoiYmM1MmYwZDVhMzU1NDI1Y2ExODI0ZWFjOGNmZTRlNzUyODAxODI2ODI5MjU3NTI0NTc0In0sInNpZ25hdHVyZSI6IiJ9",
                            "video_url": "https://scontent-atl3-3.cdninstagram.com/o1/v/t16/f2/m69/AQPZKxHGhG_Zn5RHywT6ZLrDeDbvmgGR0mLyW6JM5cU6vdb8Zco18OM3OSF1URyMVkUBipU___3zwG9UGlJugrgt.mp4?stp=dst-mp4&efg=eyJxZV9ncm91cHMiOiJbXCJpZ193ZWJfZGVsaXZlcnlfdnRzX290ZlwiXSIsInZlbmNvZGVfdGFnIjoidnRzX3ZvZF91cmxnZW4uaWd0di5jMi43MjAuYmFzZWxpbmUifQ&_nc_cat=109&vs=679365096639239_3798749308&_nc_vs=HBksFQIYOnBhc3N0aHJvdWdoX2V2ZXJzdG9yZS9HQU5TaGhCWXBubVZXdVVIQVBMTHBFMFJ5RDVxYnZWQkFBQUYVAALIAQAVAhg6cGFzc3Rocm91Z2hfZXZlcnN0b3JlL0dNbTloUkRhU3RSRlZHTVJBSTgxaEk1djBWMWRidlZCQUFBRhUCAsgBACgAGAAbAYgHdXNlX29pbAExFQAAJsDbzqKC4tg%2FFQIoAkMzLBdAKFT987ZFohgSZGFzaF9iYXNlbGluZV8xX3YxEQB17AcA&ccb=9-4&oh=00_AYDr71ou0mRPpJfY25XPxGAPoMCW4mfsmrsYxqvNm4_2Ow&oe=6750B12B&_nc_sid=8b3546",
                            "video_view_count": 6727865,
                            "edge_media_to_caption": {
                                "edges": [
                                    {
                                        "node": {
                                            "text": "Wait for it...\n\nPounce into the weekend with Bowie (@bowie_the_siberian), who loves a good game of hide-and-seek or a playful attack.\n\n#WeeklyFluff\n\nVideo by @bowie_the_siberian"
                                        }
                                    }
                                ]
                            },
                            "edge_media_to_comment": {
                                "count": 12398
                            },
                            "comments_disabled": false,
                            "taken_at_timestamp": 1648223965,
                            "edge_liked_by": {
                                "count": 525521
                            },
                            "edge_media_preview_like": {
                                "count": 525521
                            },
                            "location": null,
                            "nft_asset_info": null,
                            "thumbnail_src": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-15/277283917_140160571877447_4801570599654599135_n.jpg?stp=c0.174.452.452a_dst-jpg_e15_tt6&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=111&_nc_ohc=A3yCHRGFre0Q7kNvgENmYbB&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAFWphXCGU0S3AhE2lNVEcbcGbR9wuAgOCWcUq_syB1_Q&oe=6754B318&_nc_sid=8b3546",
                            "thumbnail_resources": [
                                {
                                    "src": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-15/277283917_140160571877447_4801570599654599135_n.jpg?stp=dst-jpg_e15_p150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi40NTJ4ODAwLnNkci5mMzYzMjkuZGVmYXVsdF9jb3Zlcl9mcmFtZSJ9&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=111&_nc_ohc=A3yCHRGFre0Q7kNvgENmYbB&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDlcOQM_Ou7GdJD4UNfGDT-GkQYvx5hKjrWEqwBHANq8g&oe=6754B318&_nc_sid=8b3546",
                                    "config_width": 150,
                                    "config_height": 265
                                },
                                {
                                    "src": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-15/277283917_140160571877447_4801570599654599135_n.jpg?stp=dst-jpg_e15_p240x240_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi40NTJ4ODAwLnNkci5mMzYzMjkuZGVmYXVsdF9jb3Zlcl9mcmFtZSJ9&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=111&_nc_ohc=A3yCHRGFre0Q7kNvgENmYbB&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAkbkK96QDDb16Pzcp9ps7IrsAtQGpV4BxYIhBa8mUf5g&oe=6754B318&_nc_sid=8b3546",
                                    "config_width": 240,
                                    "config_height": 424
                                },
                                {
                                    "src": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-15/277283917_140160571877447_4801570599654599135_n.jpg?stp=dst-jpg_e15_p320x320_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi40NTJ4ODAwLnNkci5mMzYzMjkuZGVmYXVsdF9jb3Zlcl9mcmFtZSJ9&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=111&_nc_ohc=A3yCHRGFre0Q7kNvgENmYbB&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDW5JTaA8Q2D9AEdknX6QVl-y6B__9WkOSd1jGRgIZdmg&oe=6754B318&_nc_sid=8b3546",
                                    "config_width": 320,
                                    "config_height": 566
                                },
                                {
                                    "src": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-15/277283917_140160571877447_4801570599654599135_n.jpg?stp=dst-jpg_e15_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi40NTJ4ODAwLnNkci5mMzYzMjkuZGVmYXVsdF9jb3Zlcl9mcmFtZSJ9&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=111&_nc_ohc=A3yCHRGFre0Q7kNvgENmYbB&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAL24SSUerXy5pvu2GA8yJr-4zeludexvpUCKTaOEPZNw&oe=6754B318&_nc_sid=8b3546",
                                    "config_width": 480,
                                    "config_height": 849
                                },
                                {
                                    "src": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-15/277283917_140160571877447_4801570599654599135_n.jpg?stp=dst-jpg_e15_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi40NTJ4ODAwLnNkci5mMzYzMjkuZGVmYXVsdF9jb3Zlcl9mcmFtZSJ9&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=111&_nc_ohc=A3yCHRGFre0Q7kNvgENmYbB&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAL24SSUerXy5pvu2GA8yJr-4zeludexvpUCKTaOEPZNw&oe=6754B318&_nc_sid=8b3546",
                                    "config_width": 640,
                                    "config_height": 1132
                                }
                            ],
                            "felix_profile_grid_crop": {
                                "crop_left": 0,
                                "crop_right": 1,
                                "crop_top": 0.2576419213973799,
                                "crop_bottom": 0.8224163027656477
                            },
                            "coauthor_producers": [],
                            "pinned_for_users": [],
                            "viewer_can_reshare": true,
                            "like_and_view_counts_disabled": false,
                            "encoding_status": null,
                            "is_published": true,
                            "product_type": "igtv",
                            "title": "",
                            "video_duration": 12.166
                        }
                    },
                    {
                        "node": {
                            "__typename": "GraphVideo",
                            "id": "2791712353358763308",
                            "shortcode": "Ca-J5ghBNUs",
                            "dimensions": {
                                "height": 1920,
                                "width": 1080
                            },
                            "display_url": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-15/275533190_388105496012654_8581408201359071212_n.jpg?stp=dst-jpg_e15_tt6&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=102&_nc_ohc=g6gkZ2c96sEQ7kNvgHg3GEb&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBvugZMUKWW1t35LL4fBmiQC_VdGmYbmY-EHS_R9S92IA&oe=6754AF37&_nc_sid=8b3546",
                            "edge_media_to_tagged_user": {
                                "edges": [
                                    {
                                        "node": {
                                            "user": {
                                                "full_name": "Vinny & Mortimer",
                                                "followed_by_viewer": false,
                                                "id": "3035330690",
                                                "is_verified": false,
                                                "profile_pic_url": "https://scontent-atl3-3.cdninstagram.com/v/t51.2885-19/457134366_893802225946173_7827983647357232822_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-3.cdninstagram.com&_nc_cat=109&_nc_ohc=gA2VOj6p2HYQ7kNvgFki2FM&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAOBYZxQA56-zuOd2qAWBsmxtNqGNxKg7mXtQ3MkUEH5w&oe=6754A148&_nc_sid=8b3546",
                                                "username": "vinny_the_blue_cat"
                                            },
                                            "x": 0,
                                            "y": 0
                                        }
                                    }
                                ]
                            },
                            "fact_check_overall_rating": null,
                            "fact_check_information": null,
                            "gating_info": null,
                            "sharing_friction_info": {
                                "should_have_sharing_friction": false,
                                "bloks_app_url": null
                            },
                            "media_overlay_info": null,
                            "media_preview": "ABgqfbxCRAWznpx7cVd2kDAohHlJg84yePf60f2isfEg2ge/J+lSMZEf3i/X+horJmviWzH8o7etFVYRsMm9CmSue46j865xxtJDZO04yeprfmnW3XL/AIDuayGhlu2L7Nit0PT8eeT9aoRQJzyKK0jprIhbIJUZwO/rRQBqbgz5OCV6d6eXpVAwaQihCK9xLiNhjORiimydaKTGj//Z",
                            "owner": {
                                "id": "25025320",
                                "username": "instagram"
                            },
                            "is_video": true,
                            "has_upcoming_event": false,
                            "accessibility_caption": null,
                            "dash_info": {
                                "is_dash_eligible": true,
                                "video_dash_manifest": "<?xml version=\"1.0\"?>\n<MPD xmlns=\"urn:mpeg:dash:schema:mpd:2011\" minBufferTime=\"PT1.500S\" type=\"static\" mediaPresentationDuration=\"PT0H0M29.400S\" maxSegmentDuration=\"PT0H0M5.000S\" profiles=\"urn:mpeg:dash:profile:isoff-on-demand:2011,http://dashif.org/guidelines/dash264\" FBManifestIdentifier=\"FgAYDGlnX2Rhc2hfaGlnaBk26N+Nhru/ngKQp8ms7JurApS4667SnIAEIhgeZHVtbXlfdGFnc2V0X2Zvcl9mYWxsYmFja19saXN0AA==\"><Period duration=\"PT0H0M29.400S\"><AdaptationSet segmentAlignment=\"true\" maxWidth=\"640\" maxHeight=\"800\" maxFrameRate=\"30\" par=\"640:800\" lang=\"und\" subsegmentAlignment=\"true\" subsegmentStartsWithSAP=\"1\" id=\"0\"><Representation id=\"657986352130504(mpd_qe=UNKNOWN)vd\" mimeType=\"video/mp4\" codecs=\"avc1.64001F\" width=\"640\" height=\"800\" frameRate=\"30\" sar=\"1:1\" startWithSAP=\"1\" bandwidth=\"586672\" FBEncodingTag=\"dash_high_1_v1\" FBContentLength=\"2156022\" FBPlaybackResolutionMos=\"0:100,360:87.8,480:84.6,640:76.8\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:95.8,480:94.8,640:91.2,720:91.2,1080:91.2\" FBAbrPolicyTags=\"\" FBDefaultQuality=\"1\" FBQualityClass=\"sd\" FBQualityLabel=\"640p\"><BaseURL>https://scontent-atl3-3.cdninstagram.com/o1/v/t16/f2/m69/AQMHgXsNL2UPQv2EbJ9eSWkNStOug2rfhuauFSet8-cKf_Dg3T4BfAq8S0D1UVAPi8kGTXm-0qWEFMnuBhzs98K_.mp4?strext=1&amp;_nc_cat=109&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-3.cdninstagram.com&amp;_nc_ohc=9qi__QC57sAQ7kNvgGR4IsA&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9oaWdoXzFfdjEiLCJ2aWRlb19pZCI6bnVsbCwiY2xpZW50X25hbWUiOiJpZyIsIm9pbF91cmxnZW5fYXBwX2lkIjo5MzY2MTk3NDMzOTI0NTksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&amp;ccb=9-4&amp;oh=00_AYCWta31XHlABrQiF4ZTyRTodhbfhXX3uqZ23qkINZ6xhg&amp;oe=67549ED2</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"846-973\" FBFirstSegmentRange=\"974-158156\" FBFirstSegmentDuration=\"2000\" FBSecondSegmentRange=\"158157-287835\" FBPrefetchSegmentRange=\"974-287835\" FBPrefetchSegmentDuration=\"4000\"><Initialization range=\"0-845\"/></SegmentBase></Representation><Representation id=\"630010908096500(mpd_qe=UNKNOWN)v\" mimeType=\"video/mp4\" codecs=\"avc1.64001F\" width=\"640\" height=\"800\" frameRate=\"30\" sar=\"1:1\" startWithSAP=\"1\" bandwidth=\"335798\" FBEncodingTag=\"dash_high_2_v1\" FBContentLength=\"1234059\" FBPlaybackResolutionMos=\"0:100,360:78.1,480:74.4,640:66.3\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:92.1,480:88.9,640:81.2,720:81.2,1080:81.2\" FBAbrPolicyTags=\"\" FBQualityClass=\"sd\" FBQualityLabel=\"540p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQPAUsBeXggRYgJOee5MGVf2IJXrZyfEyn7zrVe3lc1sxPO503ZJXTNrki1sxy7zymFunsMnYm4PnmUgOoHMQWdR.mp4?strext=1&amp;_nc_cat=101&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=bvFhHPXpsv4Q7kNvgFSbJ1Y&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9oaWdoXzJfdjEiLCJ2aWRlb19pZCI6bnVsbCwiY2xpZW50X25hbWUiOiJpZyIsIm9pbF91cmxnZW5fYXBwX2lkIjo5MzY2MTk3NDMzOTI0NTksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&amp;ccb=9-4&amp;oh=00_AYARw4p9tKhU3f5lT0aVKEM2z9UD2F3l_zN4mbIflKRn5w&amp;oe=6754A6D6</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"846-973\" FBFirstSegmentRange=\"974-99364\" FBFirstSegmentDuration=\"2000\" FBSecondSegmentRange=\"99365-174390\" FBPrefetchSegmentRange=\"974-174390\" FBPrefetchSegmentDuration=\"4000\"><Initialization range=\"0-845\"/></SegmentBase></Representation><Representation id=\"1126391998148106(mpd_qe=UNKNOWN)v\" mimeType=\"video/mp4\" codecs=\"avc1.64001F\" width=\"550\" height=\"688\" frameRate=\"30\" sar=\"1:1\" startWithSAP=\"1\" bandwidth=\"189503\" FBEncodingTag=\"dash_high_3_v1\" FBContentLength=\"696426\" FBPlaybackResolutionMos=\"0:100,360:67.8,480:62.9,640:53.5\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:82.7,480:78.2,640:68.5\" FBAbrPolicyTags=\"\" FBQualityClass=\"sd\" FBQualityLabel=\"480p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQNrTTjvz16X3YLjGzXxjOs81xlvj-1sfhYOhZEvmRk3Lp6JPQlwJyidXVvGJHTNIJ7VhuC3Kp-XXrnXCwCjxUxw.mp4?strext=1&amp;_nc_cat=100&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=wP9FcwFSxKIQ7kNvgFB0pij&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9oaWdoXzNfdjEiLCJ2aWRlb19pZCI6bnVsbCwiY2xpZW50X25hbWUiOiJpZyIsIm9pbF91cmxnZW5fYXBwX2lkIjo5MzY2MTk3NDMzOTI0NTksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&amp;ccb=9-4&amp;oh=00_AYCxethFPrPfUJw2SRf013I5CyqFr1lUF9zkGYZHrGmqQA&amp;oe=6754A041</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"847-974\" FBFirstSegmentRange=\"975-60883\" FBFirstSegmentDuration=\"2000\" FBSecondSegmentRange=\"60884-103305\" FBPrefetchSegmentRange=\"975-103305\" FBPrefetchSegmentDuration=\"4000\"><Initialization range=\"0-846\"/></SegmentBase></Representation></AdaptationSet></Period></MPD>\n",
                                "number_of_qualities": 3
                            },
                            "has_audio": false,
                            "tracking_token": "eyJ2ZXJzaW9uIjo1LCJwYXlsb2FkIjp7ImlzX2FuYWx5dGljc190cmFja2VkIjp0cnVlLCJ1dWlkIjoiYmM1MmYwZDVhMzU1NDI1Y2ExODI0ZWFjOGNmZTRlNzUyNzkxNzEyMzUzMzU4NzYzMzA4In0sInNpZ25hdHVyZSI6IiJ9",
                            "video_url": "https://scontent-atl3-3.cdninstagram.com/o1/v/t16/f2/m69/AQOB_PHH6Rhjn0RHhDfhz50dEd421jNlISzjIgbaG768FAOL2zPi73M3RHjrziSfy0MWzTsXqvIESoFKYUwTxjov.mp4?stp=dst-mp4&efg=eyJxZV9ncm91cHMiOiJbXCJpZ193ZWJfZGVsaXZlcnlfdnRzX290ZlwiXSIsInZlbmNvZGVfdGFnIjoidnRzX3ZvZF91cmxnZW4uaWd0di5jMi42NDAuYmFzZWxpbmUifQ&_nc_cat=109&vs=535926767896584_3033794696&_nc_vs=HBkcFQIYOnBhc3N0aHJvdWdoX2V2ZXJzdG9yZS9HRFRuYUJDS2ZOSUdQSE1BQUFvTWVfeWhkcTRsYnZWQkFBQUYVAALIAQAoABgAGwGIB3VzZV9vaWwBMRUAACa%2Bn%2F2ogfLaPxUCKAJDMywXQD1mZmZmZmYYEmRhc2hfYmFzZWxpbmVfMV92MREAdewHAA%3D%3D&ccb=9-4&oh=00_AYChFKStk7dcDRjr7C7z7_ETNcxxWGwltzveQdVRSq6_fw&oe=6750BB39&_nc_sid=8b3546",
                            "video_view_count": 18002064,
                            "edge_media_to_caption": {
                                "edges": [
                                    {
                                        "node": {
                                            "text": "Cat-puccino time.\n☕️☁️🖤\n\nVinny (@vinny_the_blue_cat), a British blue shorthair, loves frothy drinks made from special cat milk.\n\n#WeeklyFluff\n\nVideo by @vinny_the_blue_cat"
                                        }
                                    }
                                ]
                            },
                            "edge_media_to_comment": {
                                "count": 32811
                            },
                            "comments_disabled": false,
                            "taken_at_timestamp": 1647018267,
                            "edge_liked_by": {
                                "count": 1119281
                            },
                            "edge_media_preview_like": {
                                "count": 1119281
                            },
                            "location": null,
                            "nft_asset_info": null,
                            "thumbnail_src": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-15/275533190_388105496012654_8581408201359071212_n.jpg?stp=c0.350.900.900a_dst-jpg_e15_s640x640_tt6&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=102&_nc_ohc=g6gkZ2c96sEQ7kNvgHg3GEb&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBgOVjkpRWzACt245vrTSn3g2rfmBM6OruCE2veQ6o8xA&oe=6754AF37&_nc_sid=8b3546",
                            "thumbnail_resources": [
                                {
                                    "src": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-15/275533190_388105496012654_8581408201359071212_n.jpg?stp=dst-jpg_e15_p150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi45MDB4MTYwMC5zZHIuZjM2MzI5LmRlZmF1bHRfY292ZXJfZnJhbWUifQ&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=102&_nc_ohc=g6gkZ2c96sEQ7kNvgHg3GEb&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDuQo_NH-mkZrzy_VwXHo9YtswxGMm3-eIIRjZlL7ZShQ&oe=6754AF37&_nc_sid=8b3546",
                                    "config_width": 150,
                                    "config_height": 266
                                },
                                {
                                    "src": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-15/275533190_388105496012654_8581408201359071212_n.jpg?stp=dst-jpg_e15_p240x240_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi45MDB4MTYwMC5zZHIuZjM2MzI5LmRlZmF1bHRfY292ZXJfZnJhbWUifQ&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=102&_nc_ohc=g6gkZ2c96sEQ7kNvgHg3GEb&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAKm9ShORuE4CF3COeFogpM3tmg6tUOroY7bAK3rPZkPw&oe=6754AF37&_nc_sid=8b3546",
                                    "config_width": 240,
                                    "config_height": 426
                                },
                                {
                                    "src": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-15/275533190_388105496012654_8581408201359071212_n.jpg?stp=dst-jpg_e15_p320x320_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi45MDB4MTYwMC5zZHIuZjM2MzI5LmRlZmF1bHRfY292ZXJfZnJhbWUifQ&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=102&_nc_ohc=g6gkZ2c96sEQ7kNvgHg3GEb&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYANdCHCXudYgXsNtF0vms53xQ0c3auhgPT8NeqOl2FpzQ&oe=6754AF37&_nc_sid=8b3546",
                                    "config_width": 320,
                                    "config_height": 568
                                },
                                {
                                    "src": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-15/275533190_388105496012654_8581408201359071212_n.jpg?stp=dst-jpg_e15_p480x480_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi45MDB4MTYwMC5zZHIuZjM2MzI5LmRlZmF1bHRfY292ZXJfZnJhbWUifQ&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=102&_nc_ohc=g6gkZ2c96sEQ7kNvgHg3GEb&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDtpF5qeAWzWrs6tsrkoR4mypXfKvYIWeC0aklRuWP1hQ&oe=6754AF37&_nc_sid=8b3546",
                                    "config_width": 480,
                                    "config_height": 853
                                },
                                {
                                    "src": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-15/275533190_388105496012654_8581408201359071212_n.jpg?stp=dst-jpg_e15_p640x640_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi45MDB4MTYwMC5zZHIuZjM2MzI5LmRlZmF1bHRfY292ZXJfZnJhbWUifQ&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=102&_nc_ohc=g6gkZ2c96sEQ7kNvgHg3GEb&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDVTmv_ELKmvgxNGI85iKA_9WvD-NoWZB3iCWKSzLz7hg&oe=6754AF37&_nc_sid=8b3546",
                                    "config_width": 640,
                                    "config_height": 1137
                                }
                            ],
                            "felix_profile_grid_crop": {
                                "crop_left": 0,
                                "crop_right": 1,
                                "crop_top": 0.3173913043478261,
                                "crop_bottom": 0.8797101449275362
                            },
                            "coauthor_producers": [],
                            "pinned_for_users": [],
                            "viewer_can_reshare": true,
                            "like_and_view_counts_disabled": false,
                            "encoding_status": null,
                            "is_published": true,
                            "product_type": "igtv",
                            "title": "",
                            "video_duration": 29.4
                        }
                    },
                    {
                        "node": {
                            "__typename": "GraphVideo",
                            "id": "2786637779967423098",
                            "shortcode": "CasIEvwpDJ6",
                            "dimensions": {
                                "height": 1919,
                                "width": 1080
                            },
                            "display_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/275114976_488044549498110_4255198623202057535_n.jpg?stp=dst-jpg_e35_p1080x1080_sh0.08&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=106&_nc_ohc=PYXk1Z79BpwQ7kNvgGJlr4N&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYCSFucglmsg_aM0qUrhQ5HvwpZ8bpdRdI0GUnrsGi9KDg&oe=6754ACE3&_nc_sid=8b3546",
                            "edge_media_to_tagged_user": {
                                "edges": [
                                    {
                                        "node": {
                                            "user": {
                                                "full_name": "Justin Bieber",
                                                "followed_by_viewer": false,
                                                "id": "6860189",
                                                "is_verified": true,
                                                "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/464759654_2373923582944615_864489531494442281_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=CUB_2uYrpk0Q7kNvgFcuRHF&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYCxeXOAKp9UkFv7TgEE7N__SO55OU1qjqSwgNYG41l_4g&oe=6754BC8D&_nc_sid=8b3546",
                                                "username": "justinbieber"
                                            },
                                            "x": 0,
                                            "y": 0
                                        }
                                    },
                                    {
                                        "node": {
                                            "user": {
                                                "full_name": "SSIAH",
                                                "followed_by_viewer": false,
                                                "id": "5383521842",
                                                "is_verified": true,
                                                "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/449369307_26453090907670739_3171064082070302468_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=z5ZiGG8cK_MQ7kNvgFrP7A2&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAO1FKuuDX3TLJqKVGkD3GSWpV5JA1hnX2QMnquaki5Ow&oe=6754A0CD&_nc_sid=8b3546",
                                                "username": "omah_lay"
                                            },
                                            "x": 0,
                                            "y": 0
                                        }
                                    }
                                ]
                            },
                            "fact_check_overall_rating": null,
                            "fact_check_information": null,
                            "gating_info": null,
                            "sharing_friction_info": {
                                "should_have_sharing_friction": false,
                                "bloks_app_url": null
                            },
                            "media_overlay_info": null,
                            "media_preview": "ABgq5102H27UzGKuOoUYPPWnMkZCg5Jwf5ZH/wBaq5Td09bL+vIpBSxwO9FX4oh8vVsdP8/Wiq5e5cKSau7/ACsRM7FTnGDjr1yBSFXP3st0Geo56YPr7flTeqlfxrdiUtZnBCkbjz7f1IGKatv/AF1/4BL13/rcxMt5nI56en4UV0LgfYg2MggHnr1/T/CiplG7umvnc1g0r69ShG2w7gATggZ9+D0pzSsxIIAHY5wB7gDnOPU1GTxUUfIP4V2tK5vKKuizLOzqF4IHHBI6exBFFVuuaKhq2xDVtj//2Q==",
                            "owner": {
                                "id": "25025320",
                                "username": "instagram"
                            },
                            "is_video": true,
                            "has_upcoming_event": false,
                            "accessibility_caption": null,
                            "dash_info": {
                                "is_dash_eligible": true,
                                "video_dash_manifest": "<?xml version=\"1.0\"?>\n<MPD xmlns=\"urn:mpeg:dash:schema:mpd:2011\" minBufferTime=\"PT1.500S\" type=\"static\" mediaPresentationDuration=\"PT0H3M19.614S\" maxSegmentDuration=\"PT0H0M5.000S\" profiles=\"urn:mpeg:dash:profile:isoff-on-demand:2011,http://dashif.org/guidelines/dash264\" FBManifestIdentifier=\"FgAYDGlnX2Rhc2hfaGlnaBl2qM7S5/63ngHM0sWoy6itAaDN+NGiuq4Cqsfng/fk7AKujJDG2bXNA6jFp6/3htYD1JOb783G0BoiGBNkYXNoX2Jhc2VsaW5lX2F1ZGlvAA==\"><Period duration=\"PT0H3M19.614S\"><AdaptationSet segmentAlignment=\"true\" maxWidth=\"540\" maxHeight=\"960\" maxFrameRate=\"30\" par=\"540:960\" lang=\"und\" subsegmentAlignment=\"true\" subsegmentStartsWithSAP=\"1\" id=\"0\"><Representation id=\"381128326821030(mpd_qe=UNKNOWN)vd\" mimeType=\"video/mp4\" codecs=\"avc1.64001F\" width=\"540\" height=\"960\" frameRate=\"30\" sar=\"1:1\" startWithSAP=\"1\" bandwidth=\"1613504\" FBEncodingTag=\"dash_high_1_v1\" FBContentLength=\"40256930\" FBPlaybackResolutionMos=\"0:100,360:90.5,480:87,540:81.4\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:96.6,480:95.6,540:93.6,720:93.6,1080:93.6\" FBAbrPolicyTags=\"avoid_on_cellular,avoid_on_cellular_intentional\" FBDefaultQuality=\"1\" FBQualityClass=\"sd\" FBQualityLabel=\"540p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQMIRiYcIJ-tSm1DVpXt2nyJPDQ4ChfcpXXKtlggTf8Em7jvfmMIcTaksYvTrCYpTWtdlgefr7JBsagvSNTDk0bZ.mp4?strext=1&amp;_nc_cat=107&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=dT7ywg12cgsQ7kNvgF3ZbZf&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9oaWdoXzFfdjEiLCJ2aWRlb19pZCI6bnVsbCwiY2xpZW50X25hbWUiOiJpZyIsIm9pbF91cmxnZW5fYXBwX2lkIjo5MzY2MTk3NDMzOTI0NTksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&amp;ccb=9-4&amp;oh=00_AYAxnLrbt4qstLWvCPQthvS-qXDcNhYFF3ZoHxIcftJnKA&amp;oe=67549534</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"847-1382\" FBFirstSegmentRange=\"1383-840449\" FBFirstSegmentDuration=\"2000\" FBSecondSegmentRange=\"840450-1483421\" FBPrefetchSegmentRange=\"1383-1483421\" FBPrefetchSegmentDuration=\"4000\"><Initialization range=\"0-846\"/></SegmentBase></Representation><Representation id=\"802178427843029(mpd_qe=UNKNOWN)v\" mimeType=\"video/mp4\" codecs=\"avc1.64001F\" width=\"540\" height=\"960\" frameRate=\"30\" sar=\"1:1\" startWithSAP=\"1\" bandwidth=\"986241\" FBEncodingTag=\"dash_high_2_v1\" FBContentLength=\"24606736\" FBPlaybackResolutionMos=\"0:100,360:83.4,480:77.9,540:71.9\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:94.4,480:92,540:86.6,720:86.6,1080:86.6\" FBAbrPolicyTags=\"\" FBQualityClass=\"sd\" FBQualityLabel=\"480p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQN9DI-7Jkg_z4tHXXPYXWt7_gzMf7Wv1QId4xuEBCZc6KOKefIskuaNKbmlEvq0NPoxe-_5GGphdtOPDK8dmDBv.mp4?strext=1&amp;_nc_cat=108&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=6uDMCgNg5-sQ7kNvgFfDVKa&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9oaWdoXzJfdjEiLCJ2aWRlb19pZCI6bnVsbCwiY2xpZW50X25hbWUiOiJpZyIsIm9pbF91cmxnZW5fYXBwX2lkIjo5MzY2MTk3NDMzOTI0NTksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&amp;ccb=9-4&amp;oh=00_AYBMHPW9mkGspQvYOydjYW1c6KUivLkQv7vza4OPFCI0lA&amp;oe=67549865</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"846-1381\" FBFirstSegmentRange=\"1382-489264\" FBFirstSegmentDuration=\"2000\" FBSecondSegmentRange=\"489265-885522\" FBPrefetchSegmentRange=\"1382-885522\" FBPrefetchSegmentDuration=\"4000\"><Initialization range=\"0-845\"/></SegmentBase></Representation><Representation id=\"7495484297143530(mpd_qe=UNKNOWN)v\" mimeType=\"video/mp4\" codecs=\"avc1.64001F\" width=\"540\" height=\"960\" frameRate=\"30\" sar=\"1:1\" startWithSAP=\"1\" bandwidth=\"596535\" FBEncodingTag=\"dash_high_3_v1\" FBContentLength=\"14883561\" FBPlaybackResolutionMos=\"0:100,360:72.1,480:66.4,540:58.3\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:86.7,480:81.4,540:73.7,720:73.7,1080:73.7\" FBAbrPolicyTags=\"\" FBQualityClass=\"sd\" FBQualityLabel=\"360p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQNkUjLaJEm2RkqiID0DTqQOBB9PHWT-Y3Ua4jt_dYp-6FaCZf_o5kSVT31oevoHRmDx4WlfjF16rz84cQV6uwjr.mp4?strext=1&amp;_nc_cat=104&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=8r6KnzYckmMQ7kNvgFF8EDa&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9oaWdoXzNfdjEiLCJ2aWRlb19pZCI6bnVsbCwiY2xpZW50X25hbWUiOiJpZyIsIm9pbF91cmxnZW5fYXBwX2lkIjo5MzY2MTk3NDMzOTI0NTksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&amp;ccb=9-4&amp;oh=00_AYDsEiGNvtqajANkQHTz3oMisjIi2Na6fwV_nH_qMLMARA&amp;oe=6754C569</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"847-1382\" FBFirstSegmentRange=\"1383-275802\" FBFirstSegmentDuration=\"2000\" FBSecondSegmentRange=\"275803-514347\" FBPrefetchSegmentRange=\"1383-514347\" FBPrefetchSegmentDuration=\"4000\"><Initialization range=\"0-846\"/></SegmentBase></Representation><Representation id=\"1014672272786199(mpd_qe=UNKNOWN)v\" mimeType=\"video/mp4\" codecs=\"avc1.64001F\" width=\"540\" height=\"960\" frameRate=\"30\" sar=\"1:1\" startWithSAP=\"1\" bandwidth=\"359450\" FBEncodingTag=\"dash_high_4_v1\" FBContentLength=\"8968286\" FBPlaybackResolutionMos=\"0:100,360:55.7,480:49.3,540:41.5\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:70.8,480:64.1,540:55.7,720:55.7,1080:55.7\" FBAbrPolicyTags=\"\" FBQualityClass=\"sd\" FBQualityLabel=\"270p\"><BaseURL>https://scontent-atl3-3.cdninstagram.com/o1/v/t16/f2/m69/AQNQOPOz1FOeyx8yKXtKu-OLRY0w3FOJNy-vdjtXLqliFLqQDly054t_14dBoN-ptdAbvKxF0MB2QXNpwFBdhG0D.mp4?strext=1&amp;_nc_cat=109&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-3.cdninstagram.com&amp;_nc_ohc=GiA5jV4tjMQQ7kNvgGY28Qq&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9oaWdoXzRfdjEiLCJ2aWRlb19pZCI6bnVsbCwiY2xpZW50X25hbWUiOiJpZyIsIm9pbF91cmxnZW5fYXBwX2lkIjo5MzY2MTk3NDMzOTI0NTksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&amp;ccb=9-4&amp;oh=00_AYA-RtOVealFJ7zV2sJ49sK7heBut_cwN2ladx5MK8U3zA&amp;oe=6754A312</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"847-1382\" FBFirstSegmentRange=\"1383-146186\" FBFirstSegmentDuration=\"2000\" FBSecondSegmentRange=\"146187-284266\" FBPrefetchSegmentRange=\"1383-284266\" FBPrefetchSegmentDuration=\"4000\"><Initialization range=\"0-846\"/></SegmentBase></Representation><Representation id=\"665106104914768(mpd_qe=UNKNOWN)v\" mimeType=\"video/mp4\" codecs=\"avc1.64001F\" width=\"540\" height=\"960\" frameRate=\"30\" sar=\"1:1\" startWithSAP=\"1\" bandwidth=\"218764\" FBEncodingTag=\"dash_high_5_v1\" FBContentLength=\"5458169\" FBPlaybackResolutionMos=\"0:100,360:35,480:31.4,540:26.4\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:48.3,480:43,540:36.1,720:36.1,1080:36.1\" FBAbrPolicyTags=\"\" FBQualityClass=\"sd\" FBQualityLabel=\"240p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQOG7ixP5hwreqsfILL6R6qvSxQFlPSsySclllRbux6KYfZxzBFxG44qTC5wRji9pp0ksJx1oOuGjpSFAoGOLq25.mp4?strext=1&amp;_nc_cat=103&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=ycsRHDjw-VAQ7kNvgFQn4uc&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9oaWdoXzVfdjEiLCJ2aWRlb19pZCI6bnVsbCwiY2xpZW50X25hbWUiOiJpZyIsIm9pbF91cmxnZW5fYXBwX2lkIjo5MzY2MTk3NDMzOTI0NTksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&amp;ccb=9-4&amp;oh=00_AYD_d9Dyl38RnRH1Zy5MilCyPLLIXhtxXeaC1TYgdoRZbw&amp;oe=6754B44C</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"847-1382\" FBFirstSegmentRange=\"1383-71818\" FBFirstSegmentDuration=\"2000\" FBSecondSegmentRange=\"71819-148964\" FBPrefetchSegmentRange=\"1383-148964\" FBPrefetchSegmentDuration=\"4000\"><Initialization range=\"0-846\"/></SegmentBase></Representation><Representation id=\"348407587296148(mpd_qe=UNKNOWN)v\" mimeType=\"video/mp4\" codecs=\"avc1.64001F\" width=\"400\" height=\"712\" frameRate=\"30\" sar=\"1:1\" startWithSAP=\"1\" bandwidth=\"113537\" FBEncodingTag=\"dash_high_6_v1\" FBContentLength=\"2832751\" FBPlaybackResolutionMos=\"0:100,360:22.6,480:20.9,540:18.2\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:30.5,480:27.4,540:22.9\" FBAbrPolicyTags=\"\" FBQualityClass=\"sd\" FBQualityLabel=\"180p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQNwZkp8d40EufWMa_HmkmTSbh9cwMj6D_0BK6lD1PafNKxchmEFRsJ7taz4AtgZLU5SirF8P6ftl_ziP5Nwy8Dg.mp4?strext=1&amp;_nc_cat=100&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=KU1mvFqtcdgQ7kNvgEhXto1&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9oaWdoXzZfdjEiLCJ2aWRlb19pZCI6bnVsbCwiY2xpZW50X25hbWUiOiJpZyIsIm9pbF91cmxnZW5fYXBwX2lkIjo5MzY2MTk3NDMzOTI0NTksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&amp;ccb=9-4&amp;oh=00_AYBTuEPXu6fziNE2dKe5VX2ICVJ8BfxVSo3DBfOc4GE2QQ&amp;oe=675493ED</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"847-1382\" FBFirstSegmentRange=\"1383-31530\" FBFirstSegmentDuration=\"2000\" FBSecondSegmentRange=\"31531-68007\" FBPrefetchSegmentRange=\"1383-68007\" FBPrefetchSegmentDuration=\"4000\"><Initialization range=\"0-846\"/></SegmentBase></Representation></AdaptationSet><AdaptationSet segmentAlignment=\"true\" subsegmentAlignment=\"true\" subsegmentStartsWithSAP=\"1\" id=\"1\"><Representation id=\"1033660030841172ad\" mimeType=\"audio/mp4\" codecs=\"mp4a.40.5\" audioSamplingRate=\"48000\" startWithSAP=\"1\" bandwidth=\"93880\" FBEncodingTag=\"dash_baseline_audio_v1\" FBContentLength=\"2343723\" FBAbrPolicyTags=\"\" FBDefaultQuality=\"1\"><AudioChannelConfiguration schemeIdUri=\"urn:mpeg:dash:23003:3:audio_channel_configuration:2011\" value=\"2\"/><BaseURL>https://scontent-atl3-3.cdninstagram.com/o1/v/t16/f2/m69/AQNQD8coymyoU1bi0xEATYbRtMIx00YYk1bCA3Z7Fqtrhac57FU0CG7qOVeeQWBjUqs09ReugOJEEzQdp6_sxgHT.mp4?strext=1&amp;_nc_cat=109&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-3.cdninstagram.com&amp;_nc_ohc=eFxb7Qam8joQ7kNvgGc_IMO&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9iYXNlbGluZV9hdWRpb192MSIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYAsCYx9CRu56PIKtNAmW-46BMxnYFFi7s0dRs99F4KBQA&amp;oe=67549266</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"783-2014\" FBFirstSegmentRange=\"2015-17779\" FBFirstSegmentDuration=\"1855\" FBSecondSegmentRange=\"17780-34116\" FBPrefetchSegmentRange=\"2015-34116\" FBPrefetchSegmentDuration=\"3860\"><Initialization range=\"0-782\"/></SegmentBase></Representation></AdaptationSet></Period></MPD>\n",
                                "number_of_qualities": 6
                            },
                            "has_audio": true,
                            "tracking_token": "eyJ2ZXJzaW9uIjo1LCJwYXlsb2FkIjp7ImlzX2FuYWx5dGljc190cmFja2VkIjp0cnVlLCJ1dWlkIjoiYmM1MmYwZDVhMzU1NDI1Y2ExODI0ZWFjOGNmZTRlNzUyNzg2NjM3Nzc5OTY3NDIzMDk4In0sInNpZ25hdHVyZSI6IiJ9",
                            "video_url": "https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQNKy2UI_Zl9m9QZhmGtylJ0cgtcNVwZRUttLqCfTaCW16MEU2-0a8kmZD3Ggvvj6x7C-v7z3nMOs4uU8f0a6kVg.mp4?stp=dst-mp4&efg=eyJxZV9ncm91cHMiOiJbXCJpZ193ZWJfZGVsaXZlcnlfdnRzX290ZlwiXSIsInZlbmNvZGVfdGFnIjoidnRzX3ZvZF91cmxnZW4uaWd0di5jMi41NDAuYmFzZWxpbmUifQ&_nc_cat=106&vs=473420247786882_916785987&_nc_vs=HBksFQIYOnBhc3N0aHJvdWdoX2V2ZXJzdG9yZS9HSUNXbUFCaEt5eW1xNGdCQUNVTHBRemNQV1VkYnZWQkFBQUYVAALIAQAVAhg6cGFzc3Rocm91Z2hfZXZlcnN0b3JlL0dPamhhQkJ3TDNyX1FpNEJBT244ak1IZU9FQUJidlZCQUFBRhUCAsgBACgAGAAbAYgHdXNlX29pbAExFQAAJqKB4%2F7k5dI%2FFQIoAkMzLBdAaPMzMzMzMxgSZGFzaF9iYXNlbGluZV8xX3YxEQB17AcA&ccb=9-4&oh=00_AYAVqvmBWbbFBoBjw-xLgW0rgVcW4iLTdLKyBZKxQCVzTw&oe=6750A6CD&_nc_sid=8b3546",
                            "video_view_count": 5108474,
                            "edge_media_to_caption": {
                                "edges": [
                                    {
                                        "node": {
                                            "text": "🚨 Can we have your attention, please?\n\nWe're on set with Nigerian artist Omah Lay (@omah_lay) who teamed up with Justin Bieber (@justinbieber) for their new single, “Attention.”\n\n“One thing I hope people take away from this song especially is the emotion, the realness,” says Omah, known for his Afro-fusion beats. “It’s always about me telling a story.”"
                                        }
                                    }
                                ]
                            },
                            "edge_media_to_comment": {
                                "count": 7345
                            },
                            "comments_disabled": false,
                            "taken_at_timestamp": 1646413439,
                            "edge_liked_by": {
                                "count": 411439
                            },
                            "edge_media_preview_like": {
                                "count": 411439
                            },
                            "location": null,
                            "nft_asset_info": null,
                            "thumbnail_src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/275114976_488044549498110_4255198623202057535_n.jpg?stp=c0.800.2059.2059a_dst-jpg_e35_s640x640_sh0.08&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=106&_nc_ohc=PYXk1Z79BpwQ7kNvgGJlr4N&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAWHTBk4nbZhp-RgILJ4F1yLqnoykWU-rIUm63fpNcCeQ&oe=6754ACE3&_nc_sid=8b3546",
                            "thumbnail_resources": [
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/275114976_488044549498110_4255198623202057535_n.jpg?stp=dst-jpg_e15_p150x150&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4yMDU5eDM2NjAuc2RyLmYzNjMyOS5kZWZhdWx0X2NvdmVyX2ZyYW1lIn0&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=106&_nc_ohc=PYXk1Z79BpwQ7kNvgGJlr4N&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYD5Td7co8im7Lrz11hczjvLf3zYs_GmdHW_1w_BmW1LOw&oe=6754ACE3&_nc_sid=8b3546",
                                    "config_width": 150,
                                    "config_height": 266
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/275114976_488044549498110_4255198623202057535_n.jpg?stp=dst-jpg_e15_p240x240&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4yMDU5eDM2NjAuc2RyLmYzNjMyOS5kZWZhdWx0X2NvdmVyX2ZyYW1lIn0&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=106&_nc_ohc=PYXk1Z79BpwQ7kNvgGJlr4N&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYCtfLjkV4Rivl5wEVh4kTzfUiTS4oavv13QW8W8MTpbFA&oe=6754ACE3&_nc_sid=8b3546",
                                    "config_width": 240,
                                    "config_height": 426
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/275114976_488044549498110_4255198623202057535_n.jpg?stp=dst-jpg_e15_p320x320&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4yMDU5eDM2NjAuc2RyLmYzNjMyOS5kZWZhdWx0X2NvdmVyX2ZyYW1lIn0&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=106&_nc_ohc=PYXk1Z79BpwQ7kNvgGJlr4N&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAYTVXi7rbxcyNRVzty77OtB4FGBwKFcsbotvCuHunXqA&oe=6754ACE3&_nc_sid=8b3546",
                                    "config_width": 320,
                                    "config_height": 568
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/275114976_488044549498110_4255198623202057535_n.jpg?stp=dst-jpg_e15_p480x480&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4yMDU5eDM2NjAuc2RyLmYzNjMyOS5kZWZhdWx0X2NvdmVyX2ZyYW1lIn0&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=106&_nc_ohc=PYXk1Z79BpwQ7kNvgGJlr4N&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAUGZKmQfLxUG9MrmC7eImJnA_-giCTS2sboyaClco2XQ&oe=6754ACE3&_nc_sid=8b3546",
                                    "config_width": 480,
                                    "config_height": 853
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/275114976_488044549498110_4255198623202057535_n.jpg?stp=dst-jpg_e35_p640x640_sh0.08&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4yMDU5eDM2NjAuc2RyLmYzNjMyOS5kZWZhdWx0X2NvdmVyX2ZyYW1lIn0&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=106&_nc_ohc=PYXk1Z79BpwQ7kNvgGJlr4N&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAYAjudOXsvM-yqlV3-mJyZf137CrICG7DitMbQL-IrkA&oe=6754ACE3&_nc_sid=8b3546",
                                    "config_width": 640,
                                    "config_height": 1137
                                }
                            ],
                            "felix_profile_grid_crop": {
                                "crop_left": 0,
                                "crop_right": 1,
                                "crop_top": 0.21884057971014495,
                                "crop_bottom": 0.7811594202898551
                            },
                            "coauthor_producers": [],
                            "pinned_for_users": [],
                            "viewer_can_reshare": true,
                            "like_and_view_counts_disabled": false,
                            "encoding_status": null,
                            "is_published": true,
                            "product_type": "igtv",
                            "title": "",
                            "video_duration": 199.6
                        }
                    },
                    {
                        "node": {
                            "__typename": "GraphVideo",
                            "id": "2774316308631122336",
                            "shortcode": "CaAWfvWh_Gg",
                            "dimensions": {
                                "height": 1920,
                                "width": 1080
                            },
                            "display_url": "https://scontent-atl3-2.cdninstagram.com/v/t51.29350-15/273955940_4995876467168249_6651346928673719341_n.jpg?stp=dst-jpg_e35_p1080x1080&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=105&_nc_ohc=4neGZEiJ1ykQ7kNvgGcieU1&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAMg7DLThSw6XgldgL8EPAivSkZIkU9_Y6NZFaNH9fxwA&oe=6754AFA9&_nc_sid=8b3546",
                            "edge_media_to_tagged_user": {
                                "edges": [
                                    {
                                        "node": {
                                            "user": {
                                                "full_name": "lisa asano",
                                                "followed_by_viewer": false,
                                                "id": "8079974",
                                                "is_verified": false,
                                                "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/294001090_437202698297266_27346359599175617_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=110&_nc_ohc=MmlgiRlrcjkQ7kNvgHU3Bb6&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYCE125EQrgLhUkJlB_auMKGTBDnUdiRu8keh7ga6kNj6Q&oe=67549F6A&_nc_sid=8b3546",
                                                "username": "lisa_asano"
                                            },
                                            "x": 0,
                                            "y": 0
                                        }
                                    }
                                ]
                            },
                            "fact_check_overall_rating": null,
                            "fact_check_information": null,
                            "gating_info": null,
                            "sharing_friction_info": {
                                "should_have_sharing_friction": false,
                                "bloks_app_url": null
                            },
                            "media_overlay_info": null,
                            "media_preview": "ABgqerMpJbAHcd/r6A/ofXNRNPEj5HzEjsMkVG0QCu0mX8sgfhxniqqSuwaVCFCn7o9M/r1/GntuGj2109OiZdE0rk7F29M7j0/l2+tFSwjLP9R/6CKK2UE1dt9TFzs7JLp+RXMh8su/O7HHrznoO2BzTY8JGWUKCGAGfYZ/nVsBVj6fw8ADnnvk1QaKIxHbvBXoDg8/kDXMv1OhmtaL5ryH3X/0GiqSSmLJTgMAf06fhzRWim0ZOCbJmmIIDJ1OOeeM+varIRD2FQv98f7wqxLwvHv/ACqHok11KXXyIprcuCYQPVuoycYGD60VMjHpn0/mKKz1LR//2Q==",
                            "owner": {
                                "id": "25025320",
                                "username": "instagram"
                            },
                            "is_video": true,
                            "has_upcoming_event": false,
                            "accessibility_caption": null,
                            "dash_info": {
                                "is_dash_eligible": true,
                                "video_dash_manifest": "<?xml version=\"1.0\"?>\n<MPD xmlns=\"urn:mpeg:dash:schema:mpd:2011\" minBufferTime=\"PT1.500S\" type=\"static\" mediaPresentationDuration=\"PT0H1M27.350S\" maxSegmentDuration=\"PT0H0M5.000S\" profiles=\"urn:mpeg:dash:profile:isoff-on-demand:2011,http://dashif.org/guidelines/dash264\" FBManifestIdentifier=\"FgAYDGlnX2Rhc2hfaGlnaBlmpuPLyo6dbazk6fSMiqUBms7dncu33AGSppeAy+jhAfrbj7/DsLADotiFquS3qgQiGBNkYXNoX2Jhc2VsaW5lX2F1ZGlvAA==\"><Period duration=\"PT0H1M27.350S\"><AdaptationSet segmentAlignment=\"true\" maxWidth=\"720\" maxHeight=\"1280\" maxFrameRate=\"30\" par=\"556:988\" lang=\"und\" subsegmentAlignment=\"true\" subsegmentStartsWithSAP=\"1\" id=\"0\"><Representation id=\"950811738896125(mpd_qe=UNKNOWN)vd\" mimeType=\"video/mp4\" codecs=\"avc1.64001F\" width=\"720\" height=\"1280\" frameRate=\"30\" sar=\"1:1\" startWithSAP=\"1\" bandwidth=\"974195\" FBEncodingTag=\"dash_high_1_v1\" FBContentLength=\"10634971\" FBPlaybackResolutionMos=\"0:100,360:90.1,480:86.4,720:77.1\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:96.5,480:95.4,720:91.4\" FBAbrPolicyTags=\"\" FBDefaultQuality=\"1\" FBQualityClass=\"hd\" FBQualityLabel=\"720p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQNnMlMQ85dic5cFHuNhqrwdmbS2aodnWsmQmqPNDY2CgP4eqYIY9n2Zi1oGK-UnfJ3s_1IZozg4eJLMexkbvnbv.mp4?strext=1&amp;_nc_cat=104&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=i9bg0qUSZbUQ7kNvgHg_a60&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9oaWdoXzFfdjEiLCJ2aWRlb19pZCI6bnVsbCwiY2xpZW50X25hbWUiOiJpZyIsIm9pbF91cmxnZW5fYXBwX2lkIjo5MzY2MTk3NDMzOTI0NTksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&amp;ccb=9-4&amp;oh=00_AYB8Yh3fTWj7WXBL3v4nYmGZo6rCyB4NOAKPeMR3aYfkSg&amp;oe=6754C17D</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"845-1104\" FBFirstSegmentRange=\"1105-459512\" FBFirstSegmentDuration=\"2000\" FBSecondSegmentRange=\"459513-911837\" FBPrefetchSegmentRange=\"1105-911837\" FBPrefetchSegmentDuration=\"4000\"><Initialization range=\"0-844\"/></SegmentBase></Representation><Representation id=\"363012368972054(mpd_qe=UNKNOWN)v\" mimeType=\"video/mp4\" codecs=\"avc1.64001F\" width=\"720\" height=\"1280\" frameRate=\"30\" sar=\"1:1\" startWithSAP=\"1\" bandwidth=\"585903\" FBEncodingTag=\"dash_high_2_v1\" FBContentLength=\"6396110\" FBPlaybackResolutionMos=\"0:100,360:82.9,480:77.5,720:68.7\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:94.2,480:91.7,720:83.5\" FBAbrPolicyTags=\"\" FBQualityClass=\"hd\" FBQualityLabel=\"640p\"><BaseURL>https://scontent-atl3-3.cdninstagram.com/o1/v/t16/f2/m69/AQPoyn1asOUcrlBJUPOrtn2fUBT6i13zUSTR4JAEWOnF9d3VHR7_H0yjcjWEk5VP1i2PhuQgXCzho5rmbQJKwCb8.mp4?strext=1&amp;_nc_cat=109&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-3.cdninstagram.com&amp;_nc_ohc=gxRbDO2sETYQ7kNvgHlTqXE&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9oaWdoXzJfdjEiLCJ2aWRlb19pZCI6bnVsbCwiY2xpZW50X25hbWUiOiJpZyIsIm9pbF91cmxnZW5fYXBwX2lkIjo5MzY2MTk3NDMzOTI0NTksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&amp;ccb=9-4&amp;oh=00_AYDbQ1V1-ITZHmFaWUuzpsA-ezoK3jQdw8vvxcdRufwskw&amp;oe=6754BC8E</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"845-1104\" FBFirstSegmentRange=\"1105-272999\" FBFirstSegmentDuration=\"2000\" FBSecondSegmentRange=\"273000-544176\" FBPrefetchSegmentRange=\"1105-544176\" FBPrefetchSegmentDuration=\"4000\"><Initialization range=\"0-844\"/></SegmentBase></Representation><Representation id=\"484740106531725(mpd_qe=UNKNOWN)v\" mimeType=\"video/mp4\" codecs=\"avc1.64001F\" width=\"556\" height=\"988\" frameRate=\"30\" sar=\"1:1\" startWithSAP=\"1\" bandwidth=\"345790\" FBEncodingTag=\"dash_high_3_v1\" FBContentLength=\"3774884\" FBPlaybackResolutionMos=\"0:100,360:75.3,480:70,720:59.8\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:89.7,480:84.8,720:75.1\" FBAbrPolicyTags=\"\" FBQualityClass=\"sd\" FBQualityLabel=\"540p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQMdHkI7L1-J6tWz9b9hRa-CXFv8hG8J16WgxkrRCsNP71zAcFt-Q4Tcomd9-YZJrzKbNpx7t4B4ceBLU05lpaEN.mp4?strext=1&amp;_nc_cat=106&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=hRuZtE36LDYQ7kNvgFB0sSi&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9oaWdoXzNfdjEiLCJ2aWRlb19pZCI6bnVsbCwiY2xpZW50X25hbWUiOiJpZyIsIm9pbF91cmxnZW5fYXBwX2lkIjo5MzY2MTk3NDMzOTI0NTksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&amp;ccb=9-4&amp;oh=00_AYBfMnvTvHd1vrjck8H8n8iTA_OXJwzvnYODxKGyJx_xag&amp;oe=6754A733</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"847-1106\" FBFirstSegmentRange=\"1107-160686\" FBFirstSegmentDuration=\"2000\" FBSecondSegmentRange=\"160687-319851\" FBPrefetchSegmentRange=\"1107-319851\" FBPrefetchSegmentDuration=\"4000\"><Initialization range=\"0-846\"/></SegmentBase></Representation><Representation id=\"240193708325075(mpd_qe=UNKNOWN)v\" mimeType=\"video/mp4\" codecs=\"avc1.64001F\" width=\"394\" height=\"700\" frameRate=\"30\" sar=\"1:1\" startWithSAP=\"1\" bandwidth=\"204841\" FBEncodingTag=\"dash_high_4_v1\" FBContentLength=\"2236191\" FBPlaybackResolutionMos=\"0:100,360:67.5,480:61.2,720:51.3\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:82.4,480:76.5,720:66.2\" FBAbrPolicyTags=\"\" FBQualityClass=\"sd\" FBQualityLabel=\"360p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQNCSWKR487sYeqDFpVhivrsoIoYZzoBAvp9gxGWDANgo9sKk-GNEt3zSYyuaducLG5U6QTl-teCdJWnGfD2r8Jx.mp4?strext=1&amp;_nc_cat=104&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=bvw-PrRbIHEQ7kNvgHQz_pH&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9oaWdoXzRfdjEiLCJ2aWRlb19pZCI6bnVsbCwiY2xpZW50X25hbWUiOiJpZyIsIm9pbF91cmxnZW5fYXBwX2lkIjo5MzY2MTk3NDMzOTI0NTksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&amp;ccb=9-4&amp;oh=00_AYCyZERqxKCy7_5FNZ5DVjz4qPodXctvEYq96ja37tMAMg&amp;oe=6754AF3D</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"847-1106\" FBFirstSegmentRange=\"1107-93377\" FBFirstSegmentDuration=\"2000\" FBSecondSegmentRange=\"93378-185134\" FBPrefetchSegmentRange=\"1107-185134\" FBPrefetchSegmentDuration=\"4000\"><Initialization range=\"0-846\"/></SegmentBase></Representation><Representation id=\"496577005414793(mpd_qe=UNKNOWN)v\" mimeType=\"video/mp4\" codecs=\"avc1.64001F\" width=\"274\" height=\"488\" frameRate=\"30\" sar=\"1:1\" startWithSAP=\"1\" bandwidth=\"122427\" FBEncodingTag=\"dash_high_5_v1\" FBContentLength=\"1336504\" FBPlaybackResolutionMos=\"0:100,360:56.1,480:49.9,720:41.6\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:71.2,480:64.7,720:55.9\" FBAbrPolicyTags=\"\" FBQualityClass=\"sd\" FBQualityLabel=\"270p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQMXYyHwlNIkgrO9TMlkU-nhsAQii8bZNjaJZW9YdI0KmBIOYSR4HSGXaoK-yKUOeZZ9tkJnrRukxljoCRRxl_uD.mp4?strext=1&amp;_nc_cat=107&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=por9tA2Pg7UQ7kNvgH1DfC6&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9oaWdoXzVfdjEiLCJ2aWRlb19pZCI6bnVsbCwiY2xpZW50X25hbWUiOiJpZyIsIm9pbF91cmxnZW5fYXBwX2lkIjo5MzY2MTk3NDMzOTI0NTksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&amp;ccb=9-4&amp;oh=00_AYAr7VS1cLyr8yHtzvlVS5XOW6tSKM7URAezaaOU8wI3_w&amp;oe=6754B8F0</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"846-1105\" FBFirstSegmentRange=\"1106-54697\" FBFirstSegmentDuration=\"2000\" FBSecondSegmentRange=\"54698-107953\" FBPrefetchSegmentRange=\"1106-107953\" FBPrefetchSegmentDuration=\"4000\"><Initialization range=\"0-845\"/></SegmentBase></Representation></AdaptationSet><AdaptationSet segmentAlignment=\"true\" subsegmentAlignment=\"true\" subsegmentStartsWithSAP=\"1\" id=\"1\"><Representation id=\"1219217242240529ad\" mimeType=\"audio/mp4\" codecs=\"mp4a.40.5\" audioSamplingRate=\"44100\" startWithSAP=\"1\" bandwidth=\"93444\" FBEncodingTag=\"dash_baseline_audio_v1\" FBContentLength=\"1021655\" FBAbrPolicyTags=\"\" FBDefaultQuality=\"1\"><AudioChannelConfiguration schemeIdUri=\"urn:mpeg:dash:23003:3:audio_channel_configuration:2011\" value=\"2\"/><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQM3IbINkSR5jgzad9KbwbLSZpydFAE2Xpf43pCRvVU7T7BS-5RMUSn_SuRmo4qcP7vbdRHei5-wY_DcVwjKNn-M.mp4?strext=1&amp;_nc_cat=108&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=kI4fes8hbLcQ7kNvgEnwgbx&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9iYXNlbGluZV9hdWRpb192MSIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYACKC5jYEeD-gq6o0xxTezw7-j3iQtc0Zmt6jBOObT8Lg&amp;oe=6754C401</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"783-1342\" FBFirstSegmentRange=\"1343-18717\" FBFirstSegmentDuration=\"1880\" FBSecondSegmentRange=\"18718-44883\" FBPrefetchSegmentRange=\"1343-44883\" FBPrefetchSegmentDuration=\"3876\"><Initialization range=\"0-782\"/></SegmentBase></Representation></AdaptationSet></Period></MPD>\n",
                                "number_of_qualities": 5
                            },
                            "has_audio": true,
                            "tracking_token": "eyJ2ZXJzaW9uIjo1LCJwYXlsb2FkIjp7ImlzX2FuYWx5dGljc190cmFja2VkIjp0cnVlLCJ1dWlkIjoiYmM1MmYwZDVhMzU1NDI1Y2ExODI0ZWFjOGNmZTRlNzUyNzc0MzE2MzA4NjMxMTIyMzM2In0sInNpZ25hdHVyZSI6IiJ9",
                            "video_url": "https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQPVATTmLi_eiB2RiRwhDdae1ejrHr55OY-5MsacNhHCTj6hwbB7Obw-58zvXxAWRBiW6CfI8wblf3dwN_hpJAbx.mp4?stp=dst-mp4&efg=eyJxZV9ncm91cHMiOiJbXCJpZ193ZWJfZGVsaXZlcnlfdnRzX290ZlwiXSIsInZlbmNvZGVfdGFnIjoidnRzX3ZvZF91cmxnZW4uaWd0di5jMi43MjAuYmFzZWxpbmUifQ&_nc_cat=110&vs=1083367465578492_3231357618&_nc_vs=HBksFQIYOnBhc3N0aHJvdWdoX2V2ZXJzdG9yZS9HSUNXbUFCaFd3MlJ0c1VCQUVtMzFpYk9fTWhJYnZWQkFBQUYVAALIAQAVAhg6cGFzc3Rocm91Z2hfZXZlcnN0b3JlL0dCYi1WQkR2U19iZFVIMFJBQkd2SDEzWjdyMUxidlZCQUFBRhUCAsgBACgAGAAbAYgHdXNlX29pbAExFQAAJor%2Fg4XJk8c%2FFQIoAkMzLBdAVdVP3ztkWhgSZGFzaF9iYXNlbGluZV8xX3YxEQB17AcA&ccb=9-4&oh=00_AYC-2ABtB66CtHFknadYzcS7Wd7yzh2TdxmaeWa2zRO0_Q&oe=6750D39A&_nc_sid=8b3546",
                            "video_view_count": 6275729,
                            "edge_media_to_caption": {
                                "edges": [
                                    {
                                        "node": {
                                            "text": "For ceramicist Lisa Asano (@lisa_asano), every new vessel is a new journey. The creation process, the final product and what happens to a piece once it’s in someone’s hands — every step along its way is one worth celebrating.\n\n“Black joy to me is just the most contagious joy. I feel like it’s the most fulfilling and happiest joy that you could ever feel. I’m lucky to say that I’m able to experience that type of joy in my life.”\n\nThis Black History Month, we’re continuing to #ShareBlackStories and celebrate Black joy in all its glory.\n\nVideo by @lisa_asano"
                                        }
                                    }
                                ]
                            },
                            "edge_media_to_comment": {
                                "count": 12892
                            },
                            "comments_disabled": false,
                            "taken_at_timestamp": 1644944384,
                            "edge_liked_by": {
                                "count": 399926
                            },
                            "edge_media_preview_like": {
                                "count": 399926
                            },
                            "location": null,
                            "nft_asset_info": null,
                            "thumbnail_src": "https://scontent-atl3-2.cdninstagram.com/v/t51.29350-15/273955940_4995876467168249_6651346928673719341_n.jpg?stp=c0.882.2268.2268a_dst-jpg_e35_s640x640_sh0.08&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=105&_nc_ohc=4neGZEiJ1ykQ7kNvgGcieU1&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBnquhI_W1XlzaoSlexwJV-Lc3kjYr94vfeia-RF09kCA&oe=6754AFA9&_nc_sid=8b3546",
                            "thumbnail_resources": [
                                {
                                    "src": "https://scontent-atl3-2.cdninstagram.com/v/t51.29350-15/273955940_4995876467168249_6651346928673719341_n.jpg?stp=dst-jpg_e35_p150x150&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4yMjY4eDQwMzIuc2RyLmYyOTM1MC5kZWZhdWx0X2NvdmVyX2ZyYW1lIn0&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=105&_nc_ohc=4neGZEiJ1ykQ7kNvgGcieU1&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYArikkvuxfAFD944H6vWvoO9kt85Pzbp-otDWnrBiLqMg&oe=6754AFA9&_nc_sid=8b3546",
                                    "config_width": 150,
                                    "config_height": 266
                                },
                                {
                                    "src": "https://scontent-atl3-2.cdninstagram.com/v/t51.29350-15/273955940_4995876467168249_6651346928673719341_n.jpg?stp=dst-jpg_e35_p240x240&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4yMjY4eDQwMzIuc2RyLmYyOTM1MC5kZWZhdWx0X2NvdmVyX2ZyYW1lIn0&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=105&_nc_ohc=4neGZEiJ1ykQ7kNvgGcieU1&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYD9CdHq6zemZ_ycE7qV1TQ6yFS1TfVZ1WqcWjVuEovkwA&oe=6754AFA9&_nc_sid=8b3546",
                                    "config_width": 240,
                                    "config_height": 426
                                },
                                {
                                    "src": "https://scontent-atl3-2.cdninstagram.com/v/t51.29350-15/273955940_4995876467168249_6651346928673719341_n.jpg?stp=dst-jpg_e35_p320x320&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4yMjY4eDQwMzIuc2RyLmYyOTM1MC5kZWZhdWx0X2NvdmVyX2ZyYW1lIn0&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=105&_nc_ohc=4neGZEiJ1ykQ7kNvgGcieU1&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDJAoP_XYZBqLENwJU6MBeHRW_04oL1i_LoTzQswmGkxw&oe=6754AFA9&_nc_sid=8b3546",
                                    "config_width": 320,
                                    "config_height": 568
                                },
                                {
                                    "src": "https://scontent-atl3-2.cdninstagram.com/v/t51.29350-15/273955940_4995876467168249_6651346928673719341_n.jpg?stp=dst-jpg_e35_p480x480&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4yMjY4eDQwMzIuc2RyLmYyOTM1MC5kZWZhdWx0X2NvdmVyX2ZyYW1lIn0&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=105&_nc_ohc=4neGZEiJ1ykQ7kNvgGcieU1&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYCheizdV5aGdrXLpNvdt3YMOA9n1W3q4Jgs5L1Qv_K0Fw&oe=6754AFA9&_nc_sid=8b3546",
                                    "config_width": 480,
                                    "config_height": 853
                                },
                                {
                                    "src": "https://scontent-atl3-2.cdninstagram.com/v/t51.29350-15/273955940_4995876467168249_6651346928673719341_n.jpg?stp=dst-jpg_e35_p640x640_sh0.08&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4yMjY4eDQwMzIuc2RyLmYyOTM1MC5kZWZhdWx0X2NvdmVyX2ZyYW1lIn0&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=105&_nc_ohc=4neGZEiJ1ykQ7kNvgGcieU1&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYD5rifgNlnR0_xVlUYkLMysGzBGJ-PUvrWpo6GCg06kBw&oe=6754AFA9&_nc_sid=8b3546",
                                    "config_width": 640,
                                    "config_height": 1137
                                }
                            ],
                            "felix_profile_grid_crop": {
                                "crop_left": 0,
                                "crop_right": 1,
                                "crop_top": 0.20869565217391303,
                                "crop_bottom": 0.7710144927536232
                            },
                            "coauthor_producers": [],
                            "pinned_for_users": [],
                            "viewer_can_reshare": true,
                            "like_and_view_counts_disabled": false,
                            "encoding_status": null,
                            "is_published": true,
                            "product_type": "igtv",
                            "title": "",
                            "video_duration": 87.333
                        }
                    },
                    {
                        "node": {
                            "__typename": "GraphVideo",
                            "id": "2769243675172398879",
                            "shortcode": "CZuVHNTJecf",
                            "dimensions": {
                                "height": 1920,
                                "width": 1080
                            },
                            "display_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.29350-15/273504845_368900124638058_3606017815225838548_n.jpg?stp=dst-jpg_e35&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=106&_nc_ohc=XinigzNhG6oQ7kNvgEWfhQP&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDxX8YN5trob6TQTTPDFwii43Le55BWvpa6j-6yZNdVtA&oe=6754995C&_nc_sid=8b3546",
                            "edge_media_to_tagged_user": {
                                "edges": [
                                    {
                                        "node": {
                                            "user": {
                                                "full_name": "Blackbutterflyman",
                                                "followed_by_viewer": false,
                                                "id": "347686128",
                                                "is_verified": false,
                                                "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/459400223_1027046802079376_2240744905763904444_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=108&_nc_ohc=69UTeGdPZHMQ7kNvgHddx7u&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYCZQkzHOn4sweRquH-Bnk3s4l6PlQ3QHwKHg8HR4oTPPA&oe=6754B93B&_nc_sid=8b3546",
                                                "username": "jpcharisma"
                                            },
                                            "x": 0,
                                            "y": 0
                                        }
                                    }
                                ]
                            },
                            "fact_check_overall_rating": null,
                            "fact_check_information": null,
                            "gating_info": null,
                            "sharing_friction_info": {
                                "should_have_sharing_friction": false,
                                "bloks_app_url": null
                            },
                            "media_overlay_info": null,
                            "media_preview": "ABgqsyMqqWbgDv0/WqB1BM8Zx36f5/lUF5IzKq9v61Mm1VwV4GB0FTcpK5oRuHUMO/eis+3bZI6D7vGBzx7UUCI5ITKvHUcipgGHrn2p53EDjg09Y8daktKxDDiMkuDuY559PwoqR1BGc8j+lFFyXoVlkO0A9anE3HI5qiOtWBQdSimlclQhjg0VEv3x9KKRlNan/9k=",
                            "owner": {
                                "id": "25025320",
                                "username": "instagram"
                            },
                            "is_video": true,
                            "has_upcoming_event": false,
                            "accessibility_caption": null,
                            "dash_info": {
                                "is_dash_eligible": true,
                                "video_dash_manifest": "<?xml version=\"1.0\"?>\n<MPD xmlns=\"urn:mpeg:dash:schema:mpd:2011\" minBufferTime=\"PT1.500S\" type=\"static\" mediaPresentationDuration=\"PT0H1M17.993S\" maxSegmentDuration=\"PT0H0M5.000S\" profiles=\"urn:mpeg:dash:profile:isoff-on-demand:2011,http://dashif.org/guidelines/dash264\" FBManifestIdentifier=\"FgAYDGlnX2Rhc2hfaGlnaBl26sq75K6+pgG609+YvfjXAfDa8bHW3aUCiJ/L/YCevAPqp9fukdOHBPjrnJ7qmfIKjr6h+77ItxIiGBNkYXNoX2Jhc2VsaW5lX2F1ZGlvAA==\"><Period duration=\"PT0H1M17.993S\"><AdaptationSet segmentAlignment=\"true\" maxWidth=\"720\" maxHeight=\"1280\" maxFrameRate=\"30\" par=\"484:860\" lang=\"und\" subsegmentAlignment=\"true\" subsegmentStartsWithSAP=\"1\" id=\"0\"><Representation id=\"5188741261176711(mpd_qe=UNKNOWN)vd\" mimeType=\"video/mp4\" codecs=\"avc1.64001F\" width=\"720\" height=\"1280\" frameRate=\"30\" sar=\"1:1\" startWithSAP=\"1\" bandwidth=\"1842632\" FBEncodingTag=\"dash_high_1_v1\" FBContentLength=\"17957987\" FBPlaybackResolutionMos=\"0:100,360:91.2,480:86.7,720:75.3\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:96.8,480:95.5,720:89.8\" FBAbrPolicyTags=\"\" FBDefaultQuality=\"1\" FBQualityClass=\"hd\" FBQualityLabel=\"720p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQNuvI8iZ6PI0GxDcF9ntJ6b4KxvF1RNlddP0q3xxeYbKu_7cDjRc1k39zsPJDq5tsYljZWSSIMjViiZhfL-hBIk.mp4?strext=1&amp;_nc_cat=102&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=AA3N5OKh7y0Q7kNvgEWMHlB&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9oaWdoXzFfdjEiLCJ2aWRlb19pZCI6bnVsbCwiY2xpZW50X25hbWUiOiJpZyIsIm9pbF91cmxnZW5fYXBwX2lkIjo5MzY2MTk3NDMzOTI0NTksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&amp;ccb=9-4&amp;oh=00_AYBVS1GWVw8Kt2gN0wCbpO8iRhatyI1wHdf-UmUuHKAQrg&amp;oe=6754C563</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"845-1080\" FBFirstSegmentRange=\"1081-369325\" FBFirstSegmentDuration=\"2000\" FBSecondSegmentRange=\"369326-1091403\" FBPrefetchSegmentRange=\"1081-1091403\" FBPrefetchSegmentDuration=\"4000\"><Initialization range=\"0-844\"/></SegmentBase></Representation><Representation id=\"976881853228996(mpd_qe=UNKNOWN)v\" mimeType=\"video/mp4\" codecs=\"avc1.64001F\" width=\"720\" height=\"1280\" frameRate=\"30\" sar=\"1:1\" startWithSAP=\"1\" bandwidth=\"1128100\" FBEncodingTag=\"dash_high_2_v1\" FBContentLength=\"10994282\" FBPlaybackResolutionMos=\"0:100,360:83.2,480:76.5,720:64.2\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:94.4,480:90.9,720:79.4\" FBAbrPolicyTags=\"\" FBQualityClass=\"hd\" FBQualityLabel=\"640p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQOrjkBC6zPvrlPVr-WdFOirZgisbuzE0ot3v2jwuqRUu2oAE8w2ws9l7CRa_dV9rEkleKtuk1Xl92mrvBex4-T4.mp4?strext=1&amp;_nc_cat=102&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=3N_9KHxTQHcQ7kNvgGG07Bm&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9oaWdoXzJfdjEiLCJ2aWRlb19pZCI6bnVsbCwiY2xpZW50X25hbWUiOiJpZyIsIm9pbF91cmxnZW5fYXBwX2lkIjo5MzY2MTk3NDMzOTI0NTksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&amp;ccb=9-4&amp;oh=00_AYCDb8BDGCv-z6TjqqLlNhRO3W5-FvL1lxGVZjLtzkAyVA&amp;oe=67549403</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"845-1080\" FBFirstSegmentRange=\"1081-223968\" FBFirstSegmentDuration=\"2000\" FBSecondSegmentRange=\"223969-647155\" FBPrefetchSegmentRange=\"1081-647155\" FBPrefetchSegmentDuration=\"4000\"><Initialization range=\"0-844\"/></SegmentBase></Representation><Representation id=\"366109291672245(mpd_qe=UNKNOWN)v\" mimeType=\"video/mp4\" codecs=\"avc1.64001F\" width=\"688\" height=\"1224\" frameRate=\"30\" sar=\"1:1\" startWithSAP=\"1\" bandwidth=\"674374\" FBEncodingTag=\"dash_high_3_v1\" FBContentLength=\"6572340\" FBPlaybackResolutionMos=\"0:100,360:70.4,480:62.3,720:47.9\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:85.1,480:77.6,720:62.8\" FBAbrPolicyTags=\"\" FBQualityClass=\"sd\" FBQualityLabel=\"540p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQNtwsVznGdoQyiHwJHeiNr95uzlJe7QmB6dxsvl_0FrC8TK9DXXhzUom3_uKtHPP0RFMKn33y__sKLm_cLLXxcg.mp4?strext=1&amp;_nc_cat=111&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=15SHgl-I1YQQ7kNvgFPiMwD&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9oaWdoXzNfdjEiLCJ2aWRlb19pZCI6bnVsbCwiY2xpZW50X25hbWUiOiJpZyIsIm9pbF91cmxnZW5fYXBwX2lkIjo5MzY2MTk3NDMzOTI0NTksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&amp;ccb=9-4&amp;oh=00_AYCwajrigKEQwIgx3jFoO89FbimosOT-vvWjyaAWiSO1Vg&amp;oe=6754BC70</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"846-1081\" FBFirstSegmentRange=\"1082-134331\" FBFirstSegmentDuration=\"2000\" FBSecondSegmentRange=\"134332-372511\" FBPrefetchSegmentRange=\"1082-372511\" FBPrefetchSegmentDuration=\"4000\"><Initialization range=\"0-845\"/></SegmentBase></Representation><Representation id=\"474859797476573(mpd_qe=UNKNOWN)v\" mimeType=\"video/mp4\" codecs=\"avc1.64001F\" width=\"484\" height=\"860\" frameRate=\"30\" sar=\"1:1\" startWithSAP=\"1\" bandwidth=\"408817\" FBEncodingTag=\"dash_high_4_v1\" FBContentLength=\"3984270\" FBPlaybackResolutionMos=\"0:100,360:58,480:48.7,720:35.2\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:73.4,480:63.6,720:48.6\" FBAbrPolicyTags=\"\" FBQualityClass=\"sd\" FBQualityLabel=\"480p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQMmgg8bnL6ul3icVyWReKqxuX92XV-41TR8as88p1qbj2PL9ysHm13vN67V3cFK0Czrv4aYl3Zi4eOUadfQ5jt_.mp4?strext=1&amp;_nc_cat=110&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=05ctkIF0GTsQ7kNvgFptPJw&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9oaWdoXzRfdjEiLCJ2aWRlb19pZCI6bnVsbCwiY2xpZW50X25hbWUiOiJpZyIsIm9pbF91cmxnZW5fYXBwX2lkIjo5MzY2MTk3NDMzOTI0NTksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&amp;ccb=9-4&amp;oh=00_AYDOE8aCIELdFw_gifgmJ9_wlY9gku_ZLE_xr9IG8_xztw&amp;oe=6754B9D3</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"847-1082\" FBFirstSegmentRange=\"1083-83705\" FBFirstSegmentDuration=\"2000\" FBSecondSegmentRange=\"83706-229038\" FBPrefetchSegmentRange=\"1083-229038\" FBPrefetchSegmentDuration=\"4000\"><Initialization range=\"0-846\"/></SegmentBase></Representation><Representation id=\"645923136747192(mpd_qe=UNKNOWN)v\" mimeType=\"video/mp4\" codecs=\"avc1.64001F\" width=\"328\" height=\"584\" frameRate=\"30\" sar=\"1:1\" startWithSAP=\"1\" bandwidth=\"224657\" FBEncodingTag=\"dash_high_5_v1\" FBContentLength=\"2189475\" FBPlaybackResolutionMos=\"0:100,360:41.3,480:33.2,720:23.6\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:55.6,480:45.5,720:32.6\" FBAbrPolicyTags=\"\" FBQualityClass=\"sd\" FBQualityLabel=\"270p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQOBzV4S8fcTRUs8nHmQc_Zl5Hf2mhTyuj3Rve3grpItGI_cb3RPdZAmY0j8EgDNyxITWx-anLbKT0O7HXMFNuV7.mp4?strext=1&amp;_nc_cat=110&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=i7znsUNeIJEQ7kNvgGUzW-M&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9oaWdoXzVfdjEiLCJ2aWRlb19pZCI6bnVsbCwiY2xpZW50X25hbWUiOiJpZyIsIm9pbF91cmxnZW5fYXBwX2lkIjo5MzY2MTk3NDMzOTI0NTksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&amp;ccb=9-4&amp;oh=00_AYApzyOXqEngOQcINMeagcIl4Kkuhgo-GJGaFHpJFmllSw&amp;oe=6754AA93</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"846-1081\" FBFirstSegmentRange=\"1082-47420\" FBFirstSegmentDuration=\"2000\" FBSecondSegmentRange=\"47421-126508\" FBPrefetchSegmentRange=\"1082-126508\" FBPrefetchSegmentDuration=\"4000\"><Initialization range=\"0-845\"/></SegmentBase></Representation><Representation id=\"1142721396533749(mpd_qe=UNKNOWN)v\" mimeType=\"video/mp4\" codecs=\"avc1.64001F\" width=\"240\" height=\"426\" frameRate=\"30\" sar=\"1:1\" startWithSAP=\"1\" bandwidth=\"119042\" FBEncodingTag=\"dash_high_6_v1\" FBContentLength=\"1160170\" FBPlaybackResolutionMos=\"0:100,360:24.7,480:20.1,720:16\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:34,480:26.1,720:19.1\" FBAbrPolicyTags=\"\" FBQualityClass=\"sd\" FBQualityLabel=\"240p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQMcRo7B8zkYlKQeTKErXsKv0x6Uh_M_KcUxVJFUhn8zLXXWhgLB4x0_twiejM2XCtt_5W0dlkjeS9eGUhJCUbJQ.mp4?strext=1&amp;_nc_cat=102&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=uAopebtEza0Q7kNvgFxbC4T&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9oaWdoXzZfdjEiLCJ2aWRlb19pZCI6bnVsbCwiY2xpZW50X25hbWUiOiJpZyIsIm9pbF91cmxnZW5fYXBwX2lkIjo5MzY2MTk3NDMzOTI0NTksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&amp;ccb=9-4&amp;oh=00_AYCjcPxQn2_ZMXoPYp5pjSFv4VR_Cg709_j8PCR9hkg9qw&amp;oe=6754A567</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"845-1080\" FBFirstSegmentRange=\"1081-33067\" FBFirstSegmentDuration=\"2000\" FBSecondSegmentRange=\"33068-66045\" FBPrefetchSegmentRange=\"1081-66045\" FBPrefetchSegmentDuration=\"4000\"><Initialization range=\"0-844\"/></SegmentBase></Representation></AdaptationSet><AdaptationSet segmentAlignment=\"true\" subsegmentAlignment=\"true\" subsegmentStartsWithSAP=\"1\" id=\"1\"><Representation id=\"3065882173741820ad\" mimeType=\"audio/mp4\" codecs=\"mp4a.40.5\" audioSamplingRate=\"44100\" startWithSAP=\"1\" bandwidth=\"91842\" FBEncodingTag=\"dash_baseline_audio_v1\" FBContentLength=\"896716\" FBAbrPolicyTags=\"\" FBDefaultQuality=\"1\"><AudioChannelConfiguration schemeIdUri=\"urn:mpeg:dash:23003:3:audio_channel_configuration:2011\" value=\"2\"/><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQPLpzz9BiCa-ohOzLL4RHRq_8xVA39NcVq_qjMUx-RYRmlm0CsAswb_GpUMSDDttIkc7bGXSftRivt55dcVyQl7.mp4?strext=1&amp;_nc_cat=103&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=2afyvOIazmEQ7kNvgGas5LU&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmlndHYuYzItQzMuZGFzaF9iYXNlbGluZV9hdWRpb192MSIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYDh3rlf3Tu_qEjuBUYVyckhfoj_6L6jnf5oLZ4YYcovMA&amp;oe=6754ABE4</BaseURL><SegmentBase indexRangeExact=\"true\" indexRange=\"783-1294\" FBFirstSegmentRange=\"1295-25642\" FBFirstSegmentDuration=\"1880\" FBSecondSegmentRange=\"25643-52614\" FBPrefetchSegmentRange=\"1295-52614\" FBPrefetchSegmentDuration=\"3876\"><Initialization range=\"0-782\"/></SegmentBase></Representation></AdaptationSet></Period></MPD>\n",
                                "number_of_qualities": 6
                            },
                            "has_audio": true,
                            "tracking_token": "eyJ2ZXJzaW9uIjo1LCJwYXlsb2FkIjp7ImlzX2FuYWx5dGljc190cmFja2VkIjp0cnVlLCJ1dWlkIjoiYmM1MmYwZDVhMzU1NDI1Y2ExODI0ZWFjOGNmZTRlNzUyNzY5MjQzNjc1MTcyMzk4ODc5In0sInNpZ25hdHVyZSI6IiJ9",
                            "video_url": "https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQM_jVNP_Sb8ZkA7ILPTmk8b3ardPi1OBuAj0LrrknJiDqC70CDKHWEhlZiiJ77uw_Wv8TseJttbbzFOcSWyCC0_.mp4?stp=dst-mp4&efg=eyJxZV9ncm91cHMiOiJbXCJpZ193ZWJfZGVsaXZlcnlfdnRzX290ZlwiXSIsInZlbmNvZGVfdGFnIjoidnRzX3ZvZF91cmxnZW4uaWd0di5jMi43MjAuYmFzZWxpbmUifQ&_nc_cat=100&vs=265299839011383_17004797&_nc_vs=HBksFQIYOnBhc3N0aHJvdWdoX2V2ZXJzdG9yZS9HSUNXbUFEZ0VhZk9fR2tDQUxpazgxZDZGSTU0YnZWQkFBQUYVAALIAQAVAhg6cGFzc3Rocm91Z2hfZXZlcnN0b3JlL0dKeDlUaENGWi15OE81a0RBTXY2bUx2QXQya1didlZCQUFBRhUCAsgBACgAGAAbAYgHdXNlX29pbAExFQAAJuiOks73sOM%2FFQIoAkMzLBdAU33S8an75xgSZGFzaF9iYXNlbGluZV8xX3YxEQB17AcA&ccb=9-4&oh=00_AYDdyoFNfJDnyS4_8-VU_dbSIyISuTxME7dax8wNeGBLtA&oe=6750B8DD&_nc_sid=8b3546",
                            "video_view_count": 6949852,
                            "edge_media_to_caption": {
                                "edges": [
                                    {
                                        "node": {
                                            "text": "Joy for Jordan Parker (@jpcharisma) means taking time for himself to do things he loves. Even better when that time is spent with butterflies. 🦋\n\n“Every time you see them, they grab your attention,” says the butterfly gardener. “They’re just so elegant and so beautiful.”\n\nThis Black History Month, we’re continuing to #ShareBlackStories and celebrate Black joy in all its glory."
                                        }
                                    }
                                ]
                            },
                            "edge_media_to_comment": {
                                "count": 14759
                            },
                            "comments_disabled": false,
                            "taken_at_timestamp": 1644339702,
                            "edge_liked_by": {
                                "count": 393035
                            },
                            "edge_media_preview_like": {
                                "count": 393035
                            },
                            "location": null,
                            "nft_asset_info": null,
                            "thumbnail_src": "https://scontent-atl3-1.cdninstagram.com/v/t51.29350-15/273504845_368900124638058_3606017815225838548_n.jpg?stp=c0.420.1080.1080a_dst-jpg_e35_s640x640_sh0.08&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=106&_nc_ohc=XinigzNhG6oQ7kNvgEWfhQP&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYA8hXAnuOCwSM37DQj9d17pgFt14Nz8ow9yNr1tuYXxsQ&oe=6754995C&_nc_sid=8b3546",
                            "thumbnail_resources": [
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.29350-15/273504845_368900124638058_3606017815225838548_n.jpg?stp=dst-jpg_e35_p150x150&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xMDgweDE5MjAuc2RyLmYyOTM1MC5kZWZhdWx0X2NvdmVyX2ZyYW1lIn0&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=106&_nc_ohc=XinigzNhG6oQ7kNvgEWfhQP&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYCAFPiRx8z8J3K1W-E7xpDX4sp5gccucWfN_s7Uxl9VOA&oe=6754995C&_nc_sid=8b3546",
                                    "config_width": 150,
                                    "config_height": 266
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.29350-15/273504845_368900124638058_3606017815225838548_n.jpg?stp=dst-jpg_e35_p240x240&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xMDgweDE5MjAuc2RyLmYyOTM1MC5kZWZhdWx0X2NvdmVyX2ZyYW1lIn0&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=106&_nc_ohc=XinigzNhG6oQ7kNvgEWfhQP&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDvRonG6qlNOc5-bW_cbNhLlmsiJnhHBcPRhO4F0m3pug&oe=6754995C&_nc_sid=8b3546",
                                    "config_width": 240,
                                    "config_height": 426
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.29350-15/273504845_368900124638058_3606017815225838548_n.jpg?stp=dst-jpg_e35_p320x320&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xMDgweDE5MjAuc2RyLmYyOTM1MC5kZWZhdWx0X2NvdmVyX2ZyYW1lIn0&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=106&_nc_ohc=XinigzNhG6oQ7kNvgEWfhQP&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYCyYl_anXkWii7jUchA0RAbcvbgB1J0xMrNYG_Njdo3gw&oe=6754995C&_nc_sid=8b3546",
                                    "config_width": 320,
                                    "config_height": 568
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.29350-15/273504845_368900124638058_3606017815225838548_n.jpg?stp=dst-jpg_e35_p480x480&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xMDgweDE5MjAuc2RyLmYyOTM1MC5kZWZhdWx0X2NvdmVyX2ZyYW1lIn0&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=106&_nc_ohc=XinigzNhG6oQ7kNvgEWfhQP&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDDeqKyiWz9OcWKOyUxzbKYHme0G8jP8ED-NuLjBrV2YA&oe=6754995C&_nc_sid=8b3546",
                                    "config_width": 480,
                                    "config_height": 853
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.29350-15/273504845_368900124638058_3606017815225838548_n.jpg?stp=dst-jpg_e35_p640x640_sh0.08&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xMDgweDE5MjAuc2RyLmYyOTM1MC5kZWZhdWx0X2NvdmVyX2ZyYW1lIn0&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=106&_nc_ohc=XinigzNhG6oQ7kNvgEWfhQP&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYC5PtMARYBFVkXftJLwfa15HLJ24atr29Zbx7mqEx2USg&oe=6754995C&_nc_sid=8b3546",
                                    "config_width": 640,
                                    "config_height": 1137
                                }
                            ],
                            "felix_profile_grid_crop": {
                                "crop_left": 0,
                                "crop_right": 1,
                                "crop_top": 0.1144927536231884,
                                "crop_bottom": 0.6768115942028986
                            },
                            "coauthor_producers": [],
                            "pinned_for_users": [],
                            "viewer_can_reshare": true,
                            "like_and_view_counts_disabled": false,
                            "encoding_status": null,
                            "is_published": true,
                            "product_type": "igtv",
                            "title": "",
                            "video_duration": 77.966
                        }
                    }
                ]
            },
            "edge_owner_to_timeline_media": {
                "count": 7888,
                "page_info": {
                    "has_next_page": true,
                    "end_cursor": "QVFBMk8tUFMxc1lkRlh4SmJCU3VhZkttQ2VJZWtXMjU3ZXZEQWdEYUVQTjNZM3JmWXEta2JtY1F5QlBnMnBmNmdOYUZYSWZBc3N3clhjV0RFUDhzejRtcg=="
                },
                "edges": [
                    {
                        "node": {
                            "__typename": "GraphVideo",
                            "id": "3514322786674368125",
                            "shortcode": "DDFYfRtyV59",
                            "dimensions": {
                                "height": 1920,
                                "width": 1080
                            },
                            "display_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/469119401_18611751532001321_1832318402680525774_n.jpg?stp=dst-jpg_e15_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=h3jjc_e1bbkQ7kNvgEo8LL3&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDYwneY8ZVZeF28qLKeCTtNlgbnniMtTH2Vb86dZc0CKg&oe=6754BBDB&_nc_sid=8b3546",
                            "edge_media_to_tagged_user": {
                                "edges": [
                                    {
                                        "node": {
                                            "user": {
                                                "full_name": "Jia Xin’s homecafe",
                                                "followed_by_viewer": false,
                                                "id": "36369173167",
                                                "is_verified": false,
                                                "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/356108455_829941148749852_6002181908570760440_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=100&_nc_ohc=N2P3ihNwjkEQ7kNvgG8quRb&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYA4TPFQ2F5XI8IWhsqnF9zvM4Rl6UlwxaLGW0GMPKtzUQ&oe=67549AE4&_nc_sid=8b3546",
                                                "username": "h0mec4fe"
                                            },
                                            "x": 0,
                                            "y": 0
                                        }
                                    }
                                ]
                            },
                            "fact_check_overall_rating": null,
                            "fact_check_information": null,
                            "gating_info": null,
                            "sharing_friction_info": {
                                "should_have_sharing_friction": false,
                                "bloks_app_url": null
                            },
                            "media_overlay_info": null,
                            "media_preview": "ABgqo7v9GCn7wlJx3wQefpU1vNtTBGQD+P8A+qmNb5BIOQMZ/HpUYG0Y/wA9aQyWWTecjgUVXYkAE9D096KAL6OsaF2OCSMDH905/Wq4iEpLsrhSOOCOpzx61IY/OUKwOAetS7VV1X5hxhef889+lRZ6vr0Hfp0KdzggleSCFXPoAe3Tr/nrRWilgTjeS2On+fWimlZA3dl3y6jEIRi68sfX/PFWhThVklV3lA+7j8aKuHpRQB//2Q==",
                            "owner": {
                                "id": "25025320",
                                "username": "instagram"
                            },
                            "is_video": true,
                            "has_upcoming_event": false,
                            "accessibility_caption": null,
                            "dash_info": {
                                "is_dash_eligible": true,
                                "video_dash_manifest": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<MPD xmlns=\"urn:mpeg:dash:schema:mpd:2011\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"urn:mpeg:dash:schema:mpd:2011 DASH-MPD.xsd\" profiles=\"urn:mpeg:dash:profile:isoff-on-demand:2011\" minBufferTime=\"PT2S\" type=\"static\" mediaPresentationDuration=\"PT14.233334S\" FBManifestIdentifier=\"FgAYEnIyZXZldnA5LXIxZ2VuMnZwORlGqKTbzoiPjALU5emd6tGWA/6A0bmzzpMIzrbn8a3x1AkiGBhkYXNoX2xuX2hlYWFjX3ZicjNfYXVkaW8A\"><Period id=\"0\" duration=\"PT14.233334S\"><AdaptationSet id=\"0\" contentType=\"video\" frameRate=\"15360/512\" subsegmentAlignment=\"true\" par=\"9:16\" FBUnifiedUploadResolutionMos=\"360:73.5\"><Representation id=\"894209269512554vd\" bandwidth=\"107286\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q70\" FBContentLength=\"190880\" FBPlaybackResolutionMos=\"0:100,360:69.8,480:67.7,720:65.1\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:89.3,480:85.8,720:80.9\" FBAbrPolicyTags=\"\" width=\"720\" height=\"1280\" FBDefaultQuality=\"1\" FBQualityClass=\"hd\" FBQualityLabel=\"540p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQOFtp_tLCFn7Lnxj0fLpKTUJwi6dtX9yGkiD7v-YgQJNoK0JZQWs4lyBe2hLqKytlAfE5rM7jjZi_3V0bdtWa5a.mp4?strext=1&amp;_nc_cat=1&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=hyFY5RSdQcoQ7kNvgFJQK85&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfcjJldmV2cDktcjFnZW4ydnA5X3E3MCIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYDC2mu4azabLqOK0WgkzKkbQlAe1sd62rt5CtkoBN6PrQ&amp;oe=67549D44</BaseURL><SegmentBase indexRange=\"818-885\" timescale=\"15360\" FBMinimumPrefetchRange=\"886-22634\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"886-27311\" FBFirstSegmentRange=\"886-65586\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"65587-132544\" FBPrefetchSegmentRange=\"886-65586\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"589597086804244v\" bandwidth=\"292978\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q80\" FBContentLength=\"521257\" FBPlaybackResolutionMos=\"0:100,360:77.9,480:76.9,720:75.4\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:94.9,480:93.5,720:91.1\" FBAbrPolicyTags=\"\" width=\"720\" height=\"1280\" FBQualityClass=\"hd\" FBQualityLabel=\"640p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQPVUcpHMnkL1Lz5jkV_o04epaMZALgD9WVm_O9ftZYU3nyGsIJCa6rWVlTzTAioZR21MawlmlKIgPqm-wrx_gAp.mp4?strext=1&amp;_nc_cat=1&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=HstVvUdqmn8Q7kNvgFuJy2j&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfcjJldmV2cDktcjFnZW4ydnA5X3E4MCIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYAvYJMBRCNok4syAto8TUCrAJu-v0XSoFsUtuSs84gCDQ&amp;oe=6754922A</BaseURL><SegmentBase indexRange=\"818-885\" timescale=\"15360\" FBMinimumPrefetchRange=\"886-43511\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"886-56788\" FBFirstSegmentRange=\"886-170653\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"170654-365355\" FBPrefetchSegmentRange=\"886-170653\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"2719940228214183v\" bandwidth=\"473112\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q90\" FBContentLength=\"841746\" FBPlaybackResolutionMos=\"0:100,360:80.5,480:79.7,720:78.4\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:96.2,480:95.3,720:93.7\" FBAbrPolicyTags=\"\" width=\"720\" height=\"1280\" FBQualityClass=\"hd\" FBQualityLabel=\"720p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQMuArC2hpxqvW5V3G11ItGdSrn4IQWuAjiSBm93-xlea-CpyQECW6nywuiXEF71s23f2iSPMTv-Ye-WtRQ8FdhG.mp4?strext=1&amp;_nc_cat=1&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=XgkpnJBOhhEQ7kNvgHp6Cpz&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfcjJldmV2cDktcjFnZW4ydnA5X3E5MCIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYCOm8qUzPKeJYLMHyEgnzzgImlBdoC5HV9kWGCcenPCeg&amp;oe=67549ADC</BaseURL><SegmentBase indexRange=\"818-885\" timescale=\"15360\" FBMinimumPrefetchRange=\"886-53594\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"886-87670\" FBFirstSegmentRange=\"886-282176\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"282177-595443\" FBPrefetchSegmentRange=\"886-282176\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation></AdaptationSet><AdaptationSet id=\"1\" contentType=\"audio\" subsegmentStartsWithSAP=\"1\" subsegmentAlignment=\"true\"><Representation id=\"2294928190873663ad\" bandwidth=\"88896\" codecs=\"mp4a.40.5\" mimeType=\"audio/mp4\" FBAvgBitrate=\"88896\" audioSamplingRate=\"44100\" FBEncodingTag=\"dash_ln_heaac_vbr3_audio\" FBContentLength=\"159102\" FBPaqMos=\"92.69\" FBAbrPolicyTags=\"\" FBDefaultQuality=\"1\"><AudioChannelConfiguration schemeIdUri=\"urn:mpeg:dash:23003:3:audio_channel_configuration:2011\" value=\"2\"/><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQPrZeIJmgKXZQquvhgSiyjeLl_Xf_dbk6Qbrcnb2sheO9WvNe0kb00jEUlWw_sMWgqCmZFl0dQtQAYW1H4LXUJE.mp4?strext=1&amp;_nc_cat=1&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=kMNCbDtEfu8Q7kNvgGJJ9lc&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfbG5faGVhYWNfdmJyM19hdWRpbyIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYDOAm2hwz-h4xwpdDYyP56eroF6Mrwzsie5NdX8BKB5Xw&amp;oe=6754C47C</BaseURL><SegmentBase indexRange=\"824-951\" timescale=\"44100\" FBMinimumPrefetchRange=\"952-1295\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"952-10907\" FBFirstSegmentRange=\"952-26241\" FBFirstSegmentDuration=\"2021\" FBSecondSegmentRange=\"26242-46234\" FBPrefetchSegmentRange=\"952-46234\" FBPrefetchSegmentDuration=\"4017\"><Initialization range=\"0-823\"/></SegmentBase></Representation></AdaptationSet></Period></MPD>\n",
                                "number_of_qualities": 3
                            },
                            "has_audio": true,
                            "tracking_token": "eyJ2ZXJzaW9uIjo1LCJwYXlsb2FkIjp7ImlzX2FuYWx5dGljc190cmFja2VkIjp0cnVlLCJ1dWlkIjoiYmM1MmYwZDVhMzU1NDI1Y2ExODI0ZWFjOGNmZTRlNzUzNTE0MzIyNzg2Njc0MzY4MTI1In0sInNpZ25hdHVyZSI6IiJ9",
                            "video_url": "https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f1/m86/1F4293FA6A0B093E24285044EC11F7AF_video_dashinit.mp4?stp=dst-mp4&efg=eyJxZV9ncm91cHMiOiJbXCJpZ193ZWJfZGVsaXZlcnlfdnRzX290ZlwiXSIsInZlbmNvZGVfdGFnIjoidnRzX3ZvZF91cmxnZW4uY2xpcHMuYzIuNzIwLmJhc2VsaW5lIn0&_nc_cat=1&vs=8822763397811680_3042668681&_nc_vs=HBksFQIYUmlnX3hwdl9yZWVsc19wZXJtYW5lbnRfc3JfcHJvZC8xRjQyOTNGQTZBMEIwOTNFMjQyODUwNDRFQzExRjdBRl92aWRlb19kYXNoaW5pdC5tcDQVAALIAQAVAhg6cGFzc3Rocm91Z2hfZXZlcnN0b3JlL0dJZFA5aHRGRXB6ZUVmd0RBSC11NXh1N3hITWNicV9FQUFBRhUCAsgBACgAGAAbABUAACaE%2Bpj2s%2FieQBUCKAJDMywXQCx3S8an754YEmRhc2hfYmFzZWxpbmVfMV92MREAdf4HAA%3D%3D&ccb=9-4&oh=00_AYB9AkwnnUFI5PFhuCKpJYJ7E1OauVX2CBjjSTP-IlsRIw&oe=67509FDE&_nc_sid=8b3546",
                            "video_view_count": 1854438,
                            "edge_media_to_caption": {
                                "edges": [
                                    {
                                        "node": {
                                            "text": "Waterfall 🍄🌲\n\n#InTheMoment \n \nVideo by @h0mec4fe \nMusic by Makoto Matsushita"
                                        }
                                    }
                                ]
                            },
                            "edge_media_to_comment": {
                                "count": 2405
                            },
                            "comments_disabled": false,
                            "taken_at_timestamp": 1733160020,
                            "edge_liked_by": {
                                "count": 69157
                            },
                            "edge_media_preview_like": {
                                "count": 69157
                            },
                            "location": null,
                            "nft_asset_info": null,
                            "thumbnail_src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/469119401_18611751532001321_1832318402680525774_n.jpg?stp=c0.358.920.920a_dst-jpg_e15_s640x640_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=h3jjc_e1bbkQ7kNvgEo8LL3&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDDKcQBdPJzpP_yDrSddD-mvlg1pBSa_sOKTxIelAmdWg&oe=6754BBDB&_nc_sid=8b3546",
                            "thumbnail_resources": [
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/469119401_18611751532001321_1832318402680525774_n.jpg?stp=c0.358.920.920a_dst-jpg_e15_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi45MjB4MTYzNi5zZHIuZjc1NzYxLmRlZmF1bHRfY292ZXJfZnJhbWUifQ&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=h3jjc_e1bbkQ7kNvgEo8LL3&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYC7bRjIaaBNJ9dtqkgX4bAibsbRCwlHvfn-MFYJWl9p0g&oe=6754BBDB&_nc_sid=8b3546",
                                    "config_width": 150,
                                    "config_height": 150
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/469119401_18611751532001321_1832318402680525774_n.jpg?stp=c0.358.920.920a_dst-jpg_e15_s240x240_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi45MjB4MTYzNi5zZHIuZjc1NzYxLmRlZmF1bHRfY292ZXJfZnJhbWUifQ&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=h3jjc_e1bbkQ7kNvgEo8LL3&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYCI6tqkmUPi9eO3jZsUncL6pyfayvlNH1NjrzWBMfHJHQ&oe=6754BBDB&_nc_sid=8b3546",
                                    "config_width": 240,
                                    "config_height": 240
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/469119401_18611751532001321_1832318402680525774_n.jpg?stp=c0.358.920.920a_dst-jpg_e15_s320x320_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi45MjB4MTYzNi5zZHIuZjc1NzYxLmRlZmF1bHRfY292ZXJfZnJhbWUifQ&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=h3jjc_e1bbkQ7kNvgEo8LL3&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYCJpjmgjXGnDuY20gIFoPK5Cab9k9D3XMiOCXhEWzdw0g&oe=6754BBDB&_nc_sid=8b3546",
                                    "config_width": 320,
                                    "config_height": 320
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/469119401_18611751532001321_1832318402680525774_n.jpg?stp=c0.358.920.920a_dst-jpg_e15_s480x480_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi45MjB4MTYzNi5zZHIuZjc1NzYxLmRlZmF1bHRfY292ZXJfZnJhbWUifQ&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=h3jjc_e1bbkQ7kNvgEo8LL3&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDyiM61oXa7hFzthTTsz6FfHxr6ztOwuNWcctYw8eh4hw&oe=6754BBDB&_nc_sid=8b3546",
                                    "config_width": 480,
                                    "config_height": 480
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/469119401_18611751532001321_1832318402680525774_n.jpg?stp=c0.358.920.920a_dst-jpg_e15_s640x640_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi45MjB4MTYzNi5zZHIuZjc1NzYxLmRlZmF1bHRfY292ZXJfZnJhbWUifQ&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=h3jjc_e1bbkQ7kNvgEo8LL3&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDDKcQBdPJzpP_yDrSddD-mvlg1pBSa_sOKTxIelAmdWg&oe=6754BBDB&_nc_sid=8b3546",
                                    "config_width": 640,
                                    "config_height": 640
                                }
                            ],
                            "felix_profile_grid_crop": null,
                            "coauthor_producers": [],
                            "pinned_for_users": [],
                            "viewer_can_reshare": true,
                            "like_and_view_counts_disabled": false,
                            "product_type": "clips",
                            "clips_music_attribution_info": {
                                "artist_name": "Makoto Matsushita",
                                "song_name": "September Rain (2020 Remastered)",
                                "uses_original_audio": false,
                                "should_mute_audio": false,
                                "should_mute_audio_reason": "",
                                "audio_id": "2733102056805256"
                            }
                        }
                    },
                    {
                        "node": {
                            "__typename": "GraphVideo",
                            "id": "3510690226294926528",
                            "shortcode": "DC4eikOvqzA",
                            "dimensions": {
                                "height": 1920,
                                "width": 1080
                            },
                            "display_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/468701809_18610788898001321_3539461778809962519_n.jpg?stp=dst-jpg_e35_p1080x1080_sh0.08&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=n5uiEds81bAQ7kNvgGdYiq3&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYA1_NKr89HxIKJcJk09lrlQEWKB6kn31pu4A0VQqFnSHg&oe=6754C79F&_nc_sid=8b3546",
                            "edge_media_to_tagged_user": {
                                "edges": [
                                    {
                                        "node": {
                                            "user": {
                                                "full_name": "Emily Bear",
                                                "followed_by_viewer": false,
                                                "id": "262459274",
                                                "is_verified": true,
                                                "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/449879171_861422619242288_5797562312419398568_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=kmERNHViYPwQ7kNvgGsmT3C&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYCw74hantyHvTpOs-y5yAZ9GnQsO30mwYztrRyRbDK-Ig&oe=6754C028&_nc_sid=8b3546",
                                                "username": "mlebear"
                                            },
                                            "x": 0,
                                            "y": 0
                                        }
                                    },
                                    {
                                        "node": {
                                            "user": {
                                                "full_name": "Abigail Ross Barlow",
                                                "followed_by_viewer": false,
                                                "id": "11315414",
                                                "is_verified": true,
                                                "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/463943685_1225914261962362_3094238044398974626_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=110&_nc_ohc=J68uHgIYHFUQ7kNvgFagnz3&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBKI5YUeL0ws6c1li0yK9cU8fkrd5Lr0BM6IVYlmVITRA&oe=6754952C&_nc_sid=8b3546",
                                                "username": "abigailbarloww"
                                            },
                                            "x": 0,
                                            "y": 0
                                        }
                                    },
                                    {
                                        "node": {
                                            "user": {
                                                "full_name": "Abigail Barlow & Emily Bear",
                                                "followed_by_viewer": false,
                                                "id": "47569103854",
                                                "is_verified": true,
                                                "profile_pic_url": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-19/241049239_196163942506144_4731973432078039354_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=104&_nc_ohc=8-UZNhm88McQ7kNvgHat25-&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDK4KNPQTrYTEQR6Kg-Jd7kt01mUUnCfrSOzYrBigaXsA&oe=675493A5&_nc_sid=8b3546",
                                                "username": "barlowandbear"
                                            },
                                            "x": 0,
                                            "y": 0
                                        }
                                    }
                                ]
                            },
                            "fact_check_overall_rating": null,
                            "fact_check_information": null,
                            "gating_info": null,
                            "sharing_friction_info": {
                                "should_have_sharing_friction": false,
                                "bloks_app_url": null
                            },
                            "media_overlay_info": null,
                            "media_preview": null,
                            "owner": {
                                "id": "25025320",
                                "username": "instagram"
                            },
                            "is_video": true,
                            "has_upcoming_event": false,
                            "accessibility_caption": null,
                            "dash_info": {
                                "is_dash_eligible": true,
                                "video_dash_manifest": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<MPD xmlns=\"urn:mpeg:dash:schema:mpd:2011\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"urn:mpeg:dash:schema:mpd:2011 DASH-MPD.xsd\" profiles=\"urn:mpeg:dash:profile:isoff-on-demand:2011\" minBufferTime=\"PT2S\" type=\"static\" mediaPresentationDuration=\"PT90.022316S\" FBManifestIdentifier=\"FgAYEnIyZXZldnA5LXIxZ2VuMnZwORmGiPueuKj0vwGEtsOvi8CKArjS7OC22okEwKzBuuicggXEg9yft6KsBdKN9tihnZ8HvKLuyor07giYuMnyivHxDSIYGGRhc2hfbG5faGVhYWNfdmJyM19hdWRpbwA=\"><Period id=\"0\" duration=\"PT90.022316S\"><AdaptationSet id=\"0\" contentType=\"video\" frameRate=\"11988/500\" subsegmentAlignment=\"true\" par=\"9:16\" FBUnifiedUploadResolutionMos=\"360:83.4\"><Representation id=\"1147244653679772vd\" bandwidth=\"224292\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q30\" FBContentLength=\"2523483\" FBPlaybackResolutionMos=\"0:100,360:15.9,480:14.1,720:12.3,1080:12.2\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:77.9,480:70.5,720:59.7,1080:50.3\" FBAbrPolicyTags=\"\" width=\"720\" height=\"1280\" FBDefaultQuality=\"1\" FBQualityClass=\"hd\" FBQualityLabel=\"270p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f1/m367/5E4B462CC26A1D2F62A0F3815D20169C_video_dashinit.mp4?_nc_cat=108&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=vxv1DUp_qqMQ7kNvgFwRUat&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfcjJldmV2cDktcjFnZW4ydnA5X3EzMCIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYAPt9hFZc732I9zhGK9CDSWGosuSWCPkEUWJF7Pd2ErAw&amp;oe=67549620</BaseURL><SegmentBase indexRange=\"818-1065\" timescale=\"11988\" FBMinimumPrefetchRange=\"1066-9737\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"1066-57592\" FBFirstSegmentRange=\"1066-190314\" FBFirstSegmentDuration=\"5005\" FBSecondSegmentRange=\"190315-366531\" FBPrefetchSegmentRange=\"1066-190314\" FBPrefetchSegmentDuration=\"5005\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"586041223835010v\" bandwidth=\"431473\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q40\" FBContentLength=\"4854435\" FBPlaybackResolutionMos=\"0:100,360:22.9,480:20,720:16.6,1080:16\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:89.9,480:84.3,720:74.1,1080:63.6\" FBAbrPolicyTags=\"\" width=\"720\" height=\"1280\" FBQualityClass=\"hd\" FBQualityLabel=\"360p\"><BaseURL>https://scontent-atl3-3.cdninstagram.com/o1/v/t16/f1/m367/0A47444CE28E61026F38DA297CE71DBC_video_dashinit.mp4?_nc_cat=109&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-3.cdninstagram.com&amp;_nc_ohc=Go08yiOeP0sQ7kNvgF6KN_L&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfcjJldmV2cDktcjFnZW4ydnA5X3E0MCIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYD88i8sHfkEggSoUX85vLPRuz7yoSkiqyArauQxzGVERA&amp;oe=6754C4EB</BaseURL><SegmentBase indexRange=\"818-1065\" timescale=\"11988\" FBMinimumPrefetchRange=\"1066-15232\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"1066-106442\" FBFirstSegmentRange=\"1066-386908\" FBFirstSegmentDuration=\"5005\" FBSecondSegmentRange=\"386909-711347\" FBPrefetchSegmentRange=\"1066-386908\" FBPrefetchSegmentDuration=\"5005\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"1412267986397984v\" bandwidth=\"657710\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q50\" FBContentLength=\"7399796\" FBPlaybackResolutionMos=\"0:100,360:29.9,480:26.1,720:22,1080:20.5\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:95.2,480:91.3,720:82.4,1080:72.1\" FBAbrPolicyTags=\"\" width=\"720\" height=\"1280\" FBQualityClass=\"hd\" FBQualityLabel=\"480p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f1/m367/0448C6DEFC663CB1D37E1E42AF659093_video_dashinit.mp4?_nc_cat=1&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=-gEfMdaptw0Q7kNvgF9hb6D&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfcjJldmV2cDktcjFnZW4ydnA5X3E1MCIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYAK2Om3oVJQVk6XAtAdBCKDBuuoxkLUnzWhSKZ7DNcFTw&amp;oe=67549449</BaseURL><SegmentBase indexRange=\"818-1065\" timescale=\"11988\" FBMinimumPrefetchRange=\"1066-21105\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"1066-161939\" FBFirstSegmentRange=\"1066-608053\" FBFirstSegmentDuration=\"5005\" FBSecondSegmentRange=\"608054-1083542\" FBPrefetchSegmentRange=\"1066-608053\" FBPrefetchSegmentDuration=\"5005\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"1504723437584610v\" bandwidth=\"1000206\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q60\" FBContentLength=\"11253163\" FBPlaybackResolutionMos=\"0:100,360:34.7,480:32.2,720:28,1080:25.2\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:97.8,480:97,720:91,1080:82.4\" FBAbrPolicyTags=\"\" width=\"720\" height=\"1280\" FBQualityClass=\"hd\" FBQualityLabel=\"540p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f1/m367/F84F9F85237BB895E6038D7D367C9C8E_video_dashinit.mp4?_nc_cat=101&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=1KVkPZQwqeUQ7kNvgFzeHqI&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfcjJldmV2cDktcjFnZW4ydnA5X3E2MCIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYAZmX_M5wHXoN-BFgYhbdmLgk7EankYEnonMKvAH2y2VQ&amp;oe=67549FDB</BaseURL><SegmentBase indexRange=\"818-1065\" timescale=\"11988\" FBMinimumPrefetchRange=\"1066-28055\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"1066-233907\" FBFirstSegmentRange=\"1066-952636\" FBFirstSegmentDuration=\"5005\" FBSecondSegmentRange=\"952637-1665093\" FBPrefetchSegmentRange=\"1066-952636\" FBPrefetchSegmentDuration=\"5005\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"3909607112650252v\" bandwidth=\"1429198\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q70\" FBContentLength=\"16079674\" FBPlaybackResolutionMos=\"0:100,360:39,480:36.6,720:33.3,1080:30.6\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:98.49,480:97.9,720:95.8,1080:88.8\" FBAbrPolicyTags=\"\" width=\"720\" height=\"1280\" FBQualityClass=\"hd\" FBQualityLabel=\"640p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f1/m367/2C442B07489DD4070B5E684051DE7F98_video_dashinit.mp4?_nc_cat=105&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=1NRKBpjNXjQQ7kNvgH1i7-o&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfcjJldmV2cDktcjFnZW4ydnA5X3E3MCIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYCziwSdyAY39zrxZ9l3tIfoJUDp5pOkimh9ww_taH4hSg&amp;oe=675496E3</BaseURL><SegmentBase indexRange=\"818-1065\" timescale=\"11988\" FBMinimumPrefetchRange=\"1066-35852\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"1066-333798\" FBFirstSegmentRange=\"1066-1383373\" FBFirstSegmentDuration=\"5005\" FBSecondSegmentRange=\"1383374-2395418\" FBPrefetchSegmentRange=\"1066-1383373\" FBPrefetchSegmentDuration=\"5005\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"2495686657296542v\" bandwidth=\"2043918\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q80\" FBContentLength=\"22995789\" FBPlaybackResolutionMos=\"0:100,360:42.5,480:41.2,720:38.2,1080:34.9\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:99.04,480:98.64,720:97.7,1080:93.8\" FBAbrPolicyTags=\"avoid_on_cellular,avoid_on_cellular_intentional\" width=\"720\" height=\"1280\" FBQualityClass=\"hd\" FBQualityLabel=\"720p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f1/m367/E6406C14A056BE805E2B176C1C028499_video_dashinit.mp4?_nc_cat=106&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=OpYbUYMvhYIQ7kNvgEjpXuV&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfcjJldmV2cDktcjFnZW4ydnA5X3E4MCIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYBUz66MzNAALmqKPR4GfQWC31vEoiJE3mLAttU4tvoQ8Q&amp;oe=6754BC96</BaseURL><SegmentBase indexRange=\"818-1065\" timescale=\"11988\" FBMinimumPrefetchRange=\"1066-45449\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"1066-476068\" FBFirstSegmentRange=\"1066-1998043\" FBFirstSegmentDuration=\"5005\" FBSecondSegmentRange=\"1998044-3423138\" FBPrefetchSegmentRange=\"1066-1998043\" FBPrefetchSegmentDuration=\"5005\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"2038997296530281v\" bandwidth=\"3061971\" codecs=\"vp09.00.40.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q90\" FBContentLength=\"34449739\" FBPlaybackResolutionMos=\"0:100,360:45,480:44.6,720:43.9,1080:43.1\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:99.25,480:98.99,720:98.42,1080:97.3\" FBAbrPolicyTags=\"avoid_on_cellular,avoid_on_cellular_intentional\" width=\"1080\" height=\"1920\" FBQualityClass=\"hd\" FBQualityLabel=\"1080p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f1/m367/874F4F6CBDB2F639AC621B2CB973C3AE_video_dashinit.mp4?_nc_cat=1&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=VHIzlQFgb3kQ7kNvgG3rfoB&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfcjJldmV2cDktcjFnZW4ydnA5X3E5MCIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYDJ7YTc_xsxcKzlZ08EWUinqCjMxWRB0TCSjFXhsebMpw&amp;oe=6754C220</BaseURL><SegmentBase indexRange=\"818-1065\" timescale=\"11988\" FBMinimumPrefetchRange=\"1066-61386\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"1066-754485\" FBFirstSegmentRange=\"1066-3188841\" FBFirstSegmentDuration=\"5005\" FBSecondSegmentRange=\"3188842-5292342\" FBPrefetchSegmentRange=\"1066-3188841\" FBPrefetchSegmentDuration=\"5005\"><Initialization range=\"0-817\"/></SegmentBase></Representation></AdaptationSet><AdaptationSet id=\"1\" contentType=\"audio\" subsegmentStartsWithSAP=\"1\" subsegmentAlignment=\"true\"><Representation id=\"422011734318788ad\" bandwidth=\"74188\" codecs=\"mp4a.40.5\" mimeType=\"audio/mp4\" FBAvgBitrate=\"74188\" audioSamplingRate=\"44100\" FBEncodingTag=\"dash_ln_heaac_vbr3_audio\" FBContentLength=\"836213\" FBPaqMos=\"86.86\" FBAbrPolicyTags=\"\" FBDefaultQuality=\"1\"><AudioChannelConfiguration schemeIdUri=\"urn:mpeg:dash:23003:3:audio_channel_configuration:2011\" value=\"2\"/><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQP47s9hMttc6VA5njmiAbL76m7RApWHv1JZbS6YceqsYpCcgMXBNIONhnZqPsPtYWHy57TxTmMRXCqZxbNrhVG6.mp4?strext=1&amp;_nc_cat=1&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=pckw2-IqEl4Q7kNvgHGkVjM&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfbG5faGVhYWNfdmJyM19hdWRpbyIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYBJx73k0u7eOl8ly4NetQl2RmLP79ozuxFbO00lybbbNQ&amp;oe=6754B538</BaseURL><SegmentBase indexRange=\"824-1395\" timescale=\"44100\" FBMinimumPrefetchRange=\"1396-1739\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"1396-9445\" FBFirstSegmentRange=\"1396-17135\" FBFirstSegmentDuration=\"2021\" FBSecondSegmentRange=\"17136-34106\" FBPrefetchSegmentRange=\"1396-34106\" FBPrefetchSegmentDuration=\"4017\"><Initialization range=\"0-823\"/></SegmentBase></Representation></AdaptationSet></Period></MPD>\n",
                                "number_of_qualities": 7
                            },
                            "has_audio": true,
                            "tracking_token": "eyJ2ZXJzaW9uIjo1LCJwYXlsb2FkIjp7ImlzX2FuYWx5dGljc190cmFja2VkIjp0cnVlLCJ1dWlkIjoiYmM1MmYwZDVhMzU1NDI1Y2ExODI0ZWFjOGNmZTRlNzUzNTEwNjkwMjI2Mjk0OTI2NTI4In0sInNpZ25hdHVyZSI6IiJ9",
                            "video_url": "https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f1/m86/3D4B7AB942A0ECE4FE6A6536276D87A0_video_dashinit.mp4?stp=dst-mp4&efg=eyJxZV9ncm91cHMiOiJbXCJpZ193ZWJfZGVsaXZlcnlfdnRzX290ZlwiXSIsInZlbmNvZGVfdGFnIjoidnRzX3ZvZF91cmxnZW4uY2xpcHMuYzIuNzIwLmJhc2VsaW5lIn0&_nc_cat=104&vs=1293056231601324_1475431623&_nc_vs=HBksFQIYUmlnX3hwdl9yZWVsc19wZXJtYW5lbnRfc3JfcHJvZC8zRDRCN0FCOTQyQTBFQ0U0RkU2QTY1MzYyNzZEODdBMF92aWRlb19kYXNoaW5pdC5tcDQVAALIAQAVAhg6cGFzc3Rocm91Z2hfZXZlcnN0b3JlL0dQWlg2eHVyYzhIdjFLd0JBUGdkN2tBSGpiWlJicV9FQUFBRhUCAsgBACgAGAAbABUAACaMmNuArKaaQRUCKAJDMywXQFaAYk3S8aoYEmRhc2hfYmFzZWxpbmVfMV92MREAdf4HAA%3D%3D&ccb=9-4&oh=00_AYBeNaGNOTgwbkobaJTaxm079V6y6PZYT-o1jAsG8QvrDg&oe=6750BDCE&_nc_sid=8b3546",
                            "video_view_count": 3663384,
                            "edge_media_to_caption": {
                                "edges": [
                                    {
                                        "node": {
                                            "text": "What happens when two accomplished musicians find each other during a global pandemic? @barlowandbear, that’s what.\n \nFour years ago, @abigailbarloww (Abigail Barlow) and @mlebear (Emily Bear) were strangers, and today they’re a Grammy award-winning, musical score-composing duo who’ve found a deep connection over their shared creativity and passion for telling stories through music.\n \nTheir latest endeavor is one of childhood dreams manifested — writing and composing the score for @disneyanimation’s “Moana 2,” which releases today in theaters worldwide. 🌺🌊🐚\n \n“This partnership and creating music together became one of the most important things in my life,” says Abigail. “I realized that creating is all I wanted to do.”\n \n“I think showing your growth is so important because we’re not going to be brave and amazing and inspiring all the time,” says Emily. “We’re going to have our moments. And I think how we act in those moments and how we grow from them is the most important part.”\n \nExperience the vibrant Pacific in Hawaii with Emily and Abigail, and dive into the music and their creative inspiration that helped form their latest masterpiece.\n \nMusic by @barlowandbear"
                                        }
                                    }
                                ]
                            },
                            "edge_media_to_comment": {
                                "count": 4300
                            },
                            "comments_disabled": false,
                            "taken_at_timestamp": 1732727084,
                            "edge_liked_by": {
                                "count": 110739
                            },
                            "edge_media_preview_like": {
                                "count": 110739
                            },
                            "location": null,
                            "nft_asset_info": null,
                            "thumbnail_src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/468701809_18610788898001321_3539461778809962519_n.jpg?stp=c0.2079.5346.5346a_dst-jpg_e35_s640x640_sh0.08&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=n5uiEds81bAQ7kNvgGdYiq3&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYCoEZ9ouymVbvGb_M4C7oiNrq0jdAwmCYK3uJoQ7YMk_g&oe=6754C79F&_nc_sid=8b3546",
                            "thumbnail_resources": [
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/468701809_18610788898001321_3539461778809962519_n.jpg?stp=c0.2079.5346.5346a_dst-jpg_e15_s150x150&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi41MzQ2eDk1MDQuc2RyLmY3NTc2MS5kZWZhdWx0X2NvdmVyX2ZyYW1lIn0&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=n5uiEds81bAQ7kNvgGdYiq3&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBE--8B1qqTY2IFqSlZUsD4xF-NrJb9ZSs2vpzRBtYpGA&oe=6754C79F&_nc_sid=8b3546",
                                    "config_width": 150,
                                    "config_height": 150
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/468701809_18610788898001321_3539461778809962519_n.jpg?stp=c0.2079.5346.5346a_dst-jpg_e15_s240x240&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi41MzQ2eDk1MDQuc2RyLmY3NTc2MS5kZWZhdWx0X2NvdmVyX2ZyYW1lIn0&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=n5uiEds81bAQ7kNvgGdYiq3&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYC002yAfx1CJmo4QYpLAM3teYG2janrAX-EpDIqDbg9nw&oe=6754C79F&_nc_sid=8b3546",
                                    "config_width": 240,
                                    "config_height": 240
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/468701809_18610788898001321_3539461778809962519_n.jpg?stp=c0.2079.5346.5346a_dst-jpg_e15_s320x320&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi41MzQ2eDk1MDQuc2RyLmY3NTc2MS5kZWZhdWx0X2NvdmVyX2ZyYW1lIn0&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=n5uiEds81bAQ7kNvgGdYiq3&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAtOviuaioZkPIve_WTManiK0Iqlf6ARvmkgg3TFReTeg&oe=6754C79F&_nc_sid=8b3546",
                                    "config_width": 320,
                                    "config_height": 320
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/468701809_18610788898001321_3539461778809962519_n.jpg?stp=c0.2079.5346.5346a_dst-jpg_e15_s480x480&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi41MzQ2eDk1MDQuc2RyLmY3NTc2MS5kZWZhdWx0X2NvdmVyX2ZyYW1lIn0&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=n5uiEds81bAQ7kNvgGdYiq3&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBGG1y2Q4whPCKVYSLnkFjmotf8NCXfd3dzUKqKLnv7hA&oe=6754C79F&_nc_sid=8b3546",
                                    "config_width": 480,
                                    "config_height": 480
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/468701809_18610788898001321_3539461778809962519_n.jpg?stp=c0.2079.5346.5346a_dst-jpg_e35_s640x640_sh0.08&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi41MzQ2eDk1MDQuc2RyLmY3NTc2MS5kZWZhdWx0X2NvdmVyX2ZyYW1lIn0&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=n5uiEds81bAQ7kNvgGdYiq3&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYCoEZ9ouymVbvGb_M4C7oiNrq0jdAwmCYK3uJoQ7YMk_g&oe=6754C79F&_nc_sid=8b3546",
                                    "config_width": 640,
                                    "config_height": 640
                                }
                            ],
                            "felix_profile_grid_crop": null,
                            "coauthor_producers": [
                                {
                                    "id": "262459274",
                                    "is_verified": true,
                                    "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/449879171_861422619242288_5797562312419398568_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=kmERNHViYPwQ7kNvgGsmT3C&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYCw74hantyHvTpOs-y5yAZ9GnQsO30mwYztrRyRbDK-Ig&oe=6754C028&_nc_sid=8b3546",
                                    "username": "mlebear"
                                },
                                {
                                    "id": "47569103854",
                                    "is_verified": true,
                                    "profile_pic_url": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-19/241049239_196163942506144_4731973432078039354_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=104&_nc_ohc=8-UZNhm88McQ7kNvgHat25-&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDK4KNPQTrYTEQR6Kg-Jd7kt01mUUnCfrSOzYrBigaXsA&oe=675493A5&_nc_sid=8b3546",
                                    "username": "barlowandbear"
                                },
                                {
                                    "id": "11315414",
                                    "is_verified": true,
                                    "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/463943685_1225914261962362_3094238044398974626_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=110&_nc_ohc=J68uHgIYHFUQ7kNvgFagnz3&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBKI5YUeL0ws6c1li0yK9cU8fkrd5Lr0BM6IVYlmVITRA&oe=6754952C&_nc_sid=8b3546",
                                    "username": "abigailbarloww"
                                }
                            ],
                            "pinned_for_users": [],
                            "viewer_can_reshare": true,
                            "like_and_view_counts_disabled": false,
                            "product_type": "clips",
                            "clips_music_attribution_info": null
                        }
                    },
                    {
                        "node": {
                            "__typename": "GraphVideo",
                            "id": "3509969872752546218",
                            "shortcode": "DC16wCtvRGq",
                            "dimensions": {
                                "height": 1920,
                                "width": 1080
                            },
                            "display_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/468616695_18610611394001321_1247804736818079431_n.jpg?stp=dst-jpg_e15_fr_p1080x1080&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=mPodFL8B2L8Q7kNvgFTMOIP&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBlcE96Y-IOmKQYrc1eF8GR_ZHXu4ROZrS-T7JoAqnfbQ&oe=67549D40&_nc_sid=8b3546",
                            "edge_media_to_tagged_user": {
                                "edges": [
                                    {
                                        "node": {
                                            "user": {
                                                "full_name": "Charles Curle",
                                                "followed_by_viewer": false,
                                                "id": "50669850060",
                                                "is_verified": true,
                                                "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/458286225_480306338239980_1710149277179549249_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=7-IL4hxq3VoQ7kNvgEe92zA&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBnO00yfb4sCG4md69N5uV96xIjtr8TVQ9xECibJ94Kyg&oe=6754ADF7&_nc_sid=8b3546",
                                                "username": "cjcvfx"
                                            },
                                            "x": 0,
                                            "y": 0
                                        }
                                    }
                                ]
                            },
                            "fact_check_overall_rating": null,
                            "fact_check_information": null,
                            "gating_info": null,
                            "sharing_friction_info": {
                                "should_have_sharing_friction": false,
                                "bloks_app_url": null
                            },
                            "media_overlay_info": null,
                            "media_preview": "ABgqiigdwGA4PTkc/masfZZPT9R/jVW2uWUqmcgfwkDp19M81aj1ISSbdrA54zt5xzg/LQBFJbuoLEcDvkf40VJPKz5HRT2wOnp0oqRmfapvnH+7/WtTAU1RssBi3fGP1zSTykMNpxx09aALUtFZ32rIIbJIzz7e9FIYRSbDmkkxKec8dDUA6U8VQis3yk+xopX6n8KKAP/Z",
                            "owner": {
                                "id": "25025320",
                                "username": "instagram"
                            },
                            "is_video": true,
                            "has_upcoming_event": false,
                            "accessibility_caption": null,
                            "dash_info": {
                                "is_dash_eligible": true,
                                "video_dash_manifest": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<MPD xmlns=\"urn:mpeg:dash:schema:mpd:2011\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"urn:mpeg:dash:schema:mpd:2011 DASH-MPD.xsd\" profiles=\"urn:mpeg:dash:profile:isoff-on-demand:2011\" minBufferTime=\"PT2S\" type=\"static\" mediaPresentationDuration=\"PT15.681826S\" FBManifestIdentifier=\"FgAYEnIyZXZldnA5LXIxZ2VuMnZwORl27J28ta+a4gHqkLCGw9XrA5ilysboktAE0pmat5mcggX+49yfm6OIBeqt/JHd6JsI+KrX9fXblgoiGBhkYXNoX2xuX2hlYWFjX3ZicjNfYXVkaW8A\"><Period id=\"0\" duration=\"PT15.681826S\"><AdaptationSet id=\"0\" contentType=\"video\" frameRate=\"29971/1000\" subsegmentAlignment=\"true\" par=\"9:16\" FBUnifiedUploadResolutionMos=\"360:75.9\"><Representation id=\"497432296654710vd\" bandwidth=\"110574\" codecs=\"vp09.00.30.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q40\" FBContentLength=\"216751\" FBPlaybackResolutionMos=\"0:100,360:44.9,480:45.7,720:49,1080:54.2\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:71.8,480:65.5,720:56.4,1080:48.2\" FBAbrPolicyTags=\"\" width=\"540\" height=\"960\" FBDefaultQuality=\"1\" FBQualityClass=\"sd\" FBQualityLabel=\"360p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f1/m367/3147464737E49222E7BB65DBFE3926BB_video_dashinit.mp4?_nc_cat=105&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=sDcAf7-4uHMQ7kNvgH4BLZP&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfcjJldmV2cDktcjFnZW4ydnA5X3E0MCIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYDu8R-7DUYI8-7A0vr0l2X9Ok6SfCv2mkslpdtnarZ6nA&amp;oe=67549137</BaseURL><SegmentBase indexRange=\"818-897\" timescale=\"29971\" FBMinimumPrefetchRange=\"898-12226\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"898-25923\" FBFirstSegmentRange=\"898-81412\" FBFirstSegmentDuration=\"5004\" FBSecondSegmentRange=\"81413-160290\" FBPrefetchSegmentRange=\"898-81412\" FBPrefetchSegmentDuration=\"5004\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"1302145037584716v\" bandwidth=\"170179\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q50\" FBContentLength=\"333590\" FBPlaybackResolutionMos=\"0:100,360:55.1,480:55.2,720:57,1080:60.7\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:81.5,480:76,720:68.2,1080:60.8\" FBAbrPolicyTags=\"\" width=\"720\" height=\"1280\" FBQualityClass=\"hd\" FBQualityLabel=\"480p\"><BaseURL>https://scontent-atl3-3.cdninstagram.com/o1/v/t16/f1/m367/6E4FDCD59733463D267871A668DDA995_video_dashinit.mp4?_nc_cat=109&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-3.cdninstagram.com&amp;_nc_ohc=z-dE0MWlEYYQ7kNvgGjc53_&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfcjJldmV2cDktcjFnZW4ydnA5X3E1MCIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYDQuzOL4mq_iz7Z8fDKJlBiEyNDIwyr4R47V8RwxzYM2g&amp;oe=6754A7B7</BaseURL><SegmentBase indexRange=\"818-897\" timescale=\"29971\" FBMinimumPrefetchRange=\"898-16616\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"898-38180\" FBFirstSegmentRange=\"898-128124\" FBFirstSegmentDuration=\"5004\" FBSecondSegmentRange=\"128125-247104\" FBPrefetchSegmentRange=\"898-128124\" FBPrefetchSegmentDuration=\"5004\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"1425572022163711v\" bandwidth=\"301203\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q60\" FBContentLength=\"590427\" FBPlaybackResolutionMos=\"0:100,360:69.1,480:68.5,720:68.9,1080:70.8\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:91.1,480:87.8,720:81.5,1080:74.3\" FBAbrPolicyTags=\"\" width=\"720\" height=\"1280\" FBQualityClass=\"hd\" FBQualityLabel=\"540p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f1/m367/524EDA41925514AB58FC82713B7F8F9D_video_dashinit.mp4?_nc_cat=108&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=KbJkSeVD-cMQ7kNvgE1VByX&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfcjJldmV2cDktcjFnZW4ydnA5X3E2MCIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYA3lYCRt1NziDsqrZeRDxbIicMV0iXxcBOF1KkLn2JtVg&amp;oe=6754AD8C</BaseURL><SegmentBase indexRange=\"818-897\" timescale=\"29971\" FBMinimumPrefetchRange=\"898-24097\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"898-61374\" FBFirstSegmentRange=\"898-228328\" FBFirstSegmentDuration=\"5004\" FBSecondSegmentRange=\"228329-441394\" FBPrefetchSegmentRange=\"898-228328\" FBPrefetchSegmentDuration=\"5004\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"1412257379731049v\" bandwidth=\"497581\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q70\" FBContentLength=\"975374\" FBPlaybackResolutionMos=\"0:100,360:77.5,480:76.6,720:76.2,1080:76.8\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:94.5,480:92,720:87.1,1080:81.5\" FBAbrPolicyTags=\"\" width=\"720\" height=\"1280\" FBQualityClass=\"hd\" FBQualityLabel=\"640p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f1/m367/104561B4AF43274374A855C810980C83_video_dashinit.mp4?_nc_cat=100&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=7o2EDGEf3toQ7kNvgE5Gqop&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfcjJldmV2cDktcjFnZW4ydnA5X3E3MCIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYCriSZmMiHFdJDJWn2dXf-AcZv6M79GXvH1XzfmjtBBUg&amp;oe=6754AB30</BaseURL><SegmentBase indexRange=\"818-897\" timescale=\"29971\" FBMinimumPrefetchRange=\"898-31508\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"898-95872\" FBFirstSegmentRange=\"898-380591\" FBFirstSegmentDuration=\"5004\" FBSecondSegmentRange=\"380592-725455\" FBPrefetchSegmentRange=\"898-380591\" FBPrefetchSegmentDuration=\"5004\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"2864707473697468v\" bandwidth=\"743164\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q80\" FBContentLength=\"1456772\" FBPlaybackResolutionMos=\"0:100,360:83.5,480:82.2,720:81.3,1080:81.1\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:96.6,480:94.9,720:91.2,1080:86.5\" FBAbrPolicyTags=\"\" width=\"720\" height=\"1280\" FBQualityClass=\"hd\" FBQualityLabel=\"720p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f1/m367/7E4C6C349AC252DF152D44DB144F1A91_video_dashinit.mp4?_nc_cat=100&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=2sNRqaxjdFQQ7kNvgEUJJ8m&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfcjJldmV2cDktcjFnZW4ydnA5X3E4MCIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYCsd2D0iYsdPhCICANFEoQA1R_iqaLGmPfU6Slx0OxdNg&amp;oe=6754B370</BaseURL><SegmentBase indexRange=\"818-897\" timescale=\"29971\" FBMinimumPrefetchRange=\"898-39981\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"898-142530\" FBFirstSegmentRange=\"898-587237\" FBFirstSegmentDuration=\"5004\" FBSecondSegmentRange=\"587238-1090684\" FBPrefetchSegmentRange=\"898-587237\" FBPrefetchSegmentDuration=\"5004\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"2312972649073525v\" bandwidth=\"1063963\" codecs=\"vp09.00.40.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q90\" FBContentLength=\"2085612\" FBPlaybackResolutionMos=\"0:100,360:87.1,480:85.8,720:84.8,1080:85\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:98,480:97.1,720:95,1080:92\" FBAbrPolicyTags=\"\" width=\"1080\" height=\"1920\" FBQualityClass=\"hd\" FBQualityLabel=\"1080p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQNAlX8HT-KdjCsx2Rm0BFVk4BD6gCviJoae7FgSzpzWPpqhbK_5c6Y6YjPJirO-wHIKXJLfXg4rjhbP10sO0KtG.mp4?strext=1&amp;_nc_cat=111&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=jhFaJRX1UHQQ7kNvgE-dJg7&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfcjJldmV2cDktcjFnZW4ydnA5X3E5MCIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYC4xGzyk9dVcCFZobpUTpx-Jni4DIM2G-EouIFhN3Phxg&amp;oe=6754BD30</BaseURL><SegmentBase indexRange=\"818-897\" timescale=\"29971\" FBMinimumPrefetchRange=\"898-46218\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"898-206840\" FBFirstSegmentRange=\"898-847700\" FBFirstSegmentDuration=\"5004\" FBSecondSegmentRange=\"847701-1554613\" FBPrefetchSegmentRange=\"898-847700\" FBPrefetchSegmentDuration=\"5004\"><Initialization range=\"0-817\"/></SegmentBase></Representation></AdaptationSet><AdaptationSet id=\"1\" contentType=\"audio\" subsegmentStartsWithSAP=\"1\" subsegmentAlignment=\"true\"><Representation id=\"1081189706630197ad\" bandwidth=\"83370\" codecs=\"mp4a.40.5\" mimeType=\"audio/mp4\" FBAvgBitrate=\"83370\" audioSamplingRate=\"44100\" FBEncodingTag=\"dash_ln_heaac_vbr3_audio\" FBContentLength=\"164031\" FBPaqMos=\"90.41\" FBAbrPolicyTags=\"\" FBDefaultQuality=\"1\"><AudioChannelConfiguration schemeIdUri=\"urn:mpeg:dash:23003:3:audio_channel_configuration:2011\" value=\"2\"/><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQOO3gmD2wP4xd1v4Y6kI60qBoTjdb2jrdnFggw1nvt-lfChM9UsK0yFICEhJECtS6LKeDBhLI0Mi-uTRxGBVhRj.mp4?strext=1&amp;_nc_cat=110&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=XCekr1JFUVEQ7kNvgEqQmED&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfbG5faGVhYWNfdmJyM19hdWRpbyIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYAG5Qvs3lCgfoqunYGj12B65IqJw_HEEEFAcgXLW9VETw&amp;oe=67549BA7</BaseURL><SegmentBase indexRange=\"824-951\" timescale=\"44100\" FBMinimumPrefetchRange=\"952-1295\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"952-10973\" FBFirstSegmentRange=\"952-22499\" FBFirstSegmentDuration=\"2021\" FBSecondSegmentRange=\"22500-41019\" FBPrefetchSegmentRange=\"952-41019\" FBPrefetchSegmentDuration=\"4017\"><Initialization range=\"0-823\"/></SegmentBase></Representation></AdaptationSet></Period></MPD>\n",
                                "number_of_qualities": 6
                            },
                            "has_audio": true,
                            "tracking_token": "eyJ2ZXJzaW9uIjo1LCJwYXlsb2FkIjp7ImlzX2FuYWx5dGljc190cmFja2VkIjp0cnVlLCJ1dWlkIjoiYmM1MmYwZDVhMzU1NDI1Y2ExODI0ZWFjOGNmZTRlNzUzNTA5OTY5ODcyNzUyNTQ2MjE4In0sInNpZ25hdHVyZSI6IiJ9",
                            "video_url": "https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f1/m86/5A4C97D3073E436536B77A653FB43293_video_dashinit.mp4?stp=dst-mp4&efg=eyJxZV9ncm91cHMiOiJbXCJpZ193ZWJfZGVsaXZlcnlfdnRzX290ZlwiXSIsInZlbmNvZGVfdGFnIjoidnRzX3ZvZF91cmxnZW4uY2xpcHMuYzIuNzIwLmJhc2VsaW5lIn0&_nc_cat=110&vs=1079020997239614_2839075097&_nc_vs=HBksFQIYUmlnX3hwdl9yZWVsc19wZXJtYW5lbnRfc3JfcHJvZC81QTRDOTdEMzA3M0U0MzY1MzZCNzdBNjUzRkI0MzI5M192aWRlb19kYXNoaW5pdC5tcDQVAALIAQAVAhg6cGFzc3Rocm91Z2hfZXZlcnN0b3JlL0dFY2E3UnM0MS1Rd2g4NEZBSWNrNTNYWVhPUXZicV9FQUFBRhUCAsgBACgAGAAbABUAACbS%2Fqf7nNDTPxUCKAJDMywXQC9crAgxJukYEmRhc2hfYmFzZWxpbmVfMV92MREAdf4HAA%3D%3D&ccb=9-4&oh=00_AYD_EfipJTODVlDtLdI5p270UX6C99-Ir-RfNfMye8omyQ&oe=6750BD58&_nc_sid=8b3546",
                            "video_view_count": 3946782,
                            "edge_media_to_caption": {
                                "edges": [
                                    {
                                        "node": {
                                            "text": "Creators of Tomorrow: The Creator’s Inspo  Name: @cjcvfx (Charles Curle)  Occupation: Video editor and content creator\n \n“I want to convey chaos in a way that’s relatable.\n \nMy signature element is the use of silhouette shots and an animation-like style that blends two mediums. It gives a dynamic, storytelling vibe that stands out as uniquely mine — allowing me to exaggerate and explore relatable experiences.\n \nI’m all about pushing creative boundaries, and everything from directing to editing is done by me, so my content is a direct extension of who I am.”\n \nVideo and music by @cjcvfx"
                                        }
                                    }
                                ]
                            },
                            "edge_media_to_comment": {
                                "count": 2272
                            },
                            "comments_disabled": false,
                            "taken_at_timestamp": 1732641116,
                            "edge_liked_by": {
                                "count": 85479
                            },
                            "edge_media_preview_like": {
                                "count": 85479
                            },
                            "location": null,
                            "nft_asset_info": null,
                            "thumbnail_src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/468616695_18610611394001321_1247804736818079431_n.jpg?stp=c0.420.1080.1080a_dst-jpg_e35_s640x640_sh0.08&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=mPodFL8B2L8Q7kNvgFTMOIP&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBm_ex2azyaAWuy2WZxIeUj_Wxi6kN24F2-3h5VvzlQOA&oe=67549D40&_nc_sid=8b3546",
                            "thumbnail_resources": [
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/468616695_18610611394001321_1247804736818079431_n.jpg?stp=c0.420.1080.1080a_dst-jpg_e15_s150x150&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xMDgweDE5MjAuc2RyLmY3NTc2MS5kZWZhdWx0X2NvdmVyX2ZyYW1lIn0&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=mPodFL8B2L8Q7kNvgFTMOIP&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAzlvc7AVdqWCYVhIIjtQHslI2qeqmY5rQDiFEKPdSglg&oe=67549D40&_nc_sid=8b3546",
                                    "config_width": 150,
                                    "config_height": 150
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/468616695_18610611394001321_1247804736818079431_n.jpg?stp=c0.420.1080.1080a_dst-jpg_e15_s240x240&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xMDgweDE5MjAuc2RyLmY3NTc2MS5kZWZhdWx0X2NvdmVyX2ZyYW1lIn0&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=mPodFL8B2L8Q7kNvgFTMOIP&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYC6_VUcErPg3HRGOGo4ZaJjaxogIB_1gvh0Pq3ZvNMSdw&oe=67549D40&_nc_sid=8b3546",
                                    "config_width": 240,
                                    "config_height": 240
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/468616695_18610611394001321_1247804736818079431_n.jpg?stp=c0.420.1080.1080a_dst-jpg_e15_s320x320&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xMDgweDE5MjAuc2RyLmY3NTc2MS5kZWZhdWx0X2NvdmVyX2ZyYW1lIn0&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=mPodFL8B2L8Q7kNvgFTMOIP&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBfTx0iY9ruYpDI6Ffwg0Vmq4cRI6OMhv6m8XX2h2aUAw&oe=67549D40&_nc_sid=8b3546",
                                    "config_width": 320,
                                    "config_height": 320
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/468616695_18610611394001321_1247804736818079431_n.jpg?stp=c0.420.1080.1080a_dst-jpg_e15_s480x480&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xMDgweDE5MjAuc2RyLmY3NTc2MS5kZWZhdWx0X2NvdmVyX2ZyYW1lIn0&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=mPodFL8B2L8Q7kNvgFTMOIP&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYD-k_UKHxVyyuSEcToAzHo9onFjyxvdDkr9iC0pKYUAAw&oe=67549D40&_nc_sid=8b3546",
                                    "config_width": 480,
                                    "config_height": 480
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/468616695_18610611394001321_1247804736818079431_n.jpg?stp=c0.420.1080.1080a_dst-jpg_e35_s640x640_sh0.08&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xMDgweDE5MjAuc2RyLmY3NTc2MS5kZWZhdWx0X2NvdmVyX2ZyYW1lIn0&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=mPodFL8B2L8Q7kNvgFTMOIP&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBm_ex2azyaAWuy2WZxIeUj_Wxi6kN24F2-3h5VvzlQOA&oe=67549D40&_nc_sid=8b3546",
                                    "config_width": 640,
                                    "config_height": 640
                                }
                            ],
                            "felix_profile_grid_crop": null,
                            "coauthor_producers": [
                                {
                                    "id": "50669850060",
                                    "is_verified": true,
                                    "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/458286225_480306338239980_1710149277179549249_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=7-IL4hxq3VoQ7kNvgEe92zA&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBnO00yfb4sCG4md69N5uV96xIjtr8TVQ9xECibJ94Kyg&oe=6754ADF7&_nc_sid=8b3546",
                                    "username": "cjcvfx"
                                }
                            ],
                            "pinned_for_users": [],
                            "viewer_can_reshare": true,
                            "like_and_view_counts_disabled": false,
                            "product_type": "clips",
                            "clips_music_attribution_info": {
                                "artist_name": "instagram",
                                "song_name": "Original audio",
                                "uses_original_audio": true,
                                "should_mute_audio": false,
                                "should_mute_audio_reason": "",
                                "audio_id": "1257578938771095"
                            }
                        }
                    },
                    {
                        "node": {
                            "__typename": "GraphVideo",
                            "id": "3509309921802343484",
                            "shortcode": "DCzksffyFQ8",
                            "dimensions": {
                                "height": 1333,
                                "width": 750
                            },
                            "display_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/468274355_18610447756001321_3305237204360897748_n.jpg?stp=dst-jpg_e15&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=SwV5ff6gDFIQ7kNvgHFSxpE&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYCOnynmlAoPhajbmOnZSO-o-ydhla8VA_zxXVEUL1H50w&oe=6754966E&_nc_sid=8b3546",
                            "edge_media_to_tagged_user": {
                                "edges": [
                                    {
                                        "node": {
                                            "user": {
                                                "full_name": "Leyton Pinto",
                                                "followed_by_viewer": false,
                                                "id": "66045975419",
                                                "is_verified": false,
                                                "profile_pic_url": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-19/464281032_1275109243504646_4107382664893934758_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=102&_nc_ohc=vtBuzNGIBQAQ7kNvgEmt_Nd&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAINAInnEeju1frKHi6GC0S7aAhhTUlJ8clauAIUo231A&oe=6754A299&_nc_sid=8b3546",
                                                "username": "not.lleytonn"
                                            },
                                            "x": 0,
                                            "y": 0
                                        }
                                    }
                                ]
                            },
                            "fact_check_overall_rating": null,
                            "fact_check_information": null,
                            "gating_info": null,
                            "sharing_friction_info": {
                                "should_have_sharing_friction": false,
                                "bloks_app_url": null
                            },
                            "media_overlay_info": null,
                            "media_preview": "ABgqzb+YMBGPqf6Umntlih4zyM+1UHO5ifUmlQ80wOgYxr95vyorD3UUhixuAuCcfnU4PfpVEUd/wpiLMrAjGaKiaigCSK1eQkDjHrkVG8TI21uv/wCut1KpT9D+NJAZhOaKSimB/9k=",
                            "owner": {
                                "id": "25025320",
                                "username": "instagram"
                            },
                            "is_video": true,
                            "has_upcoming_event": false,
                            "accessibility_caption": null,
                            "dash_info": {
                                "is_dash_eligible": true,
                                "video_dash_manifest": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<MPD xmlns=\"urn:mpeg:dash:schema:mpd:2011\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"urn:mpeg:dash:schema:mpd:2011 DASH-MPD.xsd\" profiles=\"urn:mpeg:dash:profile:isoff-on-demand:2011\" minBufferTime=\"PT2S\" type=\"static\" mediaPresentationDuration=\"PT3.713742S\" FBManifestIdentifier=\"FgAYEnIyZXZldnA5LXIxZ2VuMnZwORl2pNK1gOWw5wG45cXm4PWPAsSh24fGt6YE3Ou9ipv83AS6vMuunNvdBKbSl/HGqfEGzuLTx9GktgkiGBhkYXNoX2xuX2hlYWFjX3ZicjNfYXVkaW8A\"><Period id=\"0\" duration=\"PT3.713742S\"><AdaptationSet id=\"0\" contentType=\"video\" frameRate=\"15360/512\" subsegmentAlignment=\"true\" par=\"9:16\" FBUnifiedUploadResolutionMos=\"360:72\"><Representation id=\"508812562183314vd\" bandwidth=\"113212\" codecs=\"vp09.00.30.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q40\" FBContentLength=\"52361\" FBPlaybackResolutionMos=\"0:100,360:53.2,480:53.1,720:54.1\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:79.1,480:75.2,720:69.7\" FBAbrPolicyTags=\"\" width=\"540\" height=\"960\" FBDefaultQuality=\"1\" FBQualityClass=\"sd\" FBQualityLabel=\"270p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQO8qul0p6SXmnzO60il6vZmQrS92YoyvRCrV48rp7OxifiMTDpkcdo7ztK2L5v4_GQsCRsKQsgdfO0xOKY-oy6Q.mp4?strext=1&amp;_nc_cat=101&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=K89dVF-dLyMQ7kNvgGFM_FA&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfcjJldmV2cDktcjFnZW4ydnA5X3E0MCIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYAJe-mMU6M0v7Y9kSBd4O_O7aPl8aDp5-TBLCS83C65iQ&amp;oe=6754C5B2</BaseURL><SegmentBase indexRange=\"818-861\" timescale=\"15360\" FBMinimumPrefetchRange=\"862-10737\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"862-13784\" FBFirstSegmentRange=\"862-52360\" FBFirstSegmentDuration=\"3700\" FBPrefetchSegmentRange=\"862-52360\" FBPrefetchSegmentDuration=\"3700\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"1331976244653853v\" bandwidth=\"158125\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q50\" FBContentLength=\"73133\" FBPlaybackResolutionMos=\"0:100,360:59.2,480:58.8,720:59.9\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:86.7,480:83.9,720:80.8\" FBAbrPolicyTags=\"\" width=\"720\" height=\"1280\" FBQualityClass=\"hd\" FBQualityLabel=\"360p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQOAzrJL5W7qXkPQ3v_WvYF8UP27tiUQsktdMiVzQvkV9XJsYLWXRZEwBNonpchXUJd0CrQaDJC7uX1z-wl7Ha6j.mp4?strext=1&amp;_nc_cat=101&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=B9Gc6FulxcQQ7kNvgGOJg1c&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfcjJldmV2cDktcjFnZW4ydnA5X3E1MCIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYDBlFIAt1t__udWouFuUfdrvozR2dZ77v7jxSO4iAmMvQ&amp;oe=675497A6</BaseURL><SegmentBase indexRange=\"818-861\" timescale=\"15360\" FBMinimumPrefetchRange=\"862-13880\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"862-17721\" FBFirstSegmentRange=\"862-73132\" FBFirstSegmentDuration=\"3700\" FBPrefetchSegmentRange=\"862-73132\" FBPrefetchSegmentDuration=\"3700\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"1210417086687330v\" bandwidth=\"200250\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q60\" FBContentLength=\"92616\" FBPlaybackResolutionMos=\"0:100,360:68.1,480:67.4,720:67.4\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:89.5,480:87.1,720:83.9\" FBAbrPolicyTags=\"\" width=\"720\" height=\"1280\" FBQualityClass=\"hd\" FBQualityLabel=\"480p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQNKFzvvFMGaK55gg9gjhtvF5j_lI1-WZqkF0ZP_-eRm3nViblWQLpv4QzOvYzoOQER-9zu52QXx9SpkzzloVQw9.mp4?strext=1&amp;_nc_cat=106&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=9TddQUE68AwQ7kNvgF0vO33&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfcjJldmV2cDktcjFnZW4ydnA5X3E2MCIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYA55lyCZVwho83LZkXJRW00BPW_mFUa-Hs_Hl67FdtZlQ&amp;oe=6754BAE7</BaseURL><SegmentBase indexRange=\"818-861\" timescale=\"15360\" FBMinimumPrefetchRange=\"862-16168\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"862-20995\" FBFirstSegmentRange=\"862-92615\" FBFirstSegmentDuration=\"3700\" FBPrefetchSegmentRange=\"862-92615\" FBPrefetchSegmentDuration=\"3700\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"1330343985003246v\" bandwidth=\"305169\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q70\" FBContentLength=\"141141\" FBPlaybackResolutionMos=\"0:100,360:76.6,480:75.7,720:75.1\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:95.1,480:93.2,720:90.3\" FBAbrPolicyTags=\"\" width=\"720\" height=\"1280\" FBQualityClass=\"hd\" FBQualityLabel=\"540p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQNcuEpJ1b19a0ueMXalhhbo4J1IIC5L6UPJfYSY_NR7ReoRUumgeWk3djMv3DI1kUkOSi4QJjJ0RKmgOBL13XOx.mp4?strext=1&amp;_nc_cat=105&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=xgLeuQDnTdAQ7kNvgFPx3vN&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfcjJldmV2cDktcjFnZW4ydnA5X3E3MCIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYDMki4-OFkjeL5htw-q6y7aAI_R4pwRcGGa_lhla1aAdA&amp;oe=6754A906</BaseURL><SegmentBase indexRange=\"818-861\" timescale=\"15360\" FBMinimumPrefetchRange=\"862-19418\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"862-26961\" FBFirstSegmentRange=\"862-141140\" FBFirstSegmentDuration=\"3700\" FBPrefetchSegmentRange=\"862-141140\" FBPrefetchSegmentDuration=\"3700\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"2652651468257447v\" bandwidth=\"460985\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q80\" FBContentLength=\"213206\" FBPlaybackResolutionMos=\"0:100,360:84.5,480:83.3,720:82.2\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:97.6,480:97,720:95.3\" FBAbrPolicyTags=\"\" width=\"720\" height=\"1280\" FBQualityClass=\"hd\" FBQualityLabel=\"640p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQNnhIVZLdTu_p-RQXdZ3p_c-vhLI7XN-p9MN7O0DIl-sP3KakIY9h-nA8nGQeacqiZsvhAYnaZncaxbtnLCt1EA.mp4?strext=1&amp;_nc_cat=102&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=z2p3gW-OAw0Q7kNvgEBdZeg&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfcjJldmV2cDktcjFnZW4ydnA5X3E4MCIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYChmkLXoToxqUmCVtL_qaSN3xxksc3tA0YCKpxgsJPmBw&amp;oe=6754969B</BaseURL><SegmentBase indexRange=\"818-861\" timescale=\"15360\" FBMinimumPrefetchRange=\"862-24793\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"862-37094\" FBFirstSegmentRange=\"862-213205\" FBFirstSegmentDuration=\"3700\" FBPrefetchSegmentRange=\"862-213205\" FBPrefetchSegmentDuration=\"3700\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"597958339377500v\" bandwidth=\"635288\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q90\" FBContentLength=\"293821\" FBPlaybackResolutionMos=\"0:100,360:87.8,480:86.7,720:85.7\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:98.48,480:98.07,720:97.5\" FBAbrPolicyTags=\"avoid_on_cellular,avoid_on_cellular_intentional\" width=\"720\" height=\"1280\" FBQualityClass=\"hd\" FBQualityLabel=\"720p\"><BaseURL>https://scontent-atl3-3.cdninstagram.com/o1/v/t16/f2/m69/AQNTo0y3E5ql37-DnqTlUMYNTYWLu2fMoGUOUhOQVVBzDKkoKP3hSJuSNxiNVwnyu7o4QW93icFkZDOew9bmxKTS.mp4?strext=1&amp;_nc_cat=109&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-3.cdninstagram.com&amp;_nc_ohc=Y_fUhPM-R3kQ7kNvgFF7HhU&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfcjJldmV2cDktcjFnZW4ydnA5X3E5MCIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYDTwNyqojwUtlLhU92ela6kjyKSvRNcUf3C-Aw1EUwzqw&amp;oe=6754C7FA</BaseURL><SegmentBase indexRange=\"818-861\" timescale=\"15360\" FBMinimumPrefetchRange=\"862-29731\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"862-48567\" FBFirstSegmentRange=\"862-293820\" FBFirstSegmentDuration=\"3700\" FBPrefetchSegmentRange=\"862-293820\" FBPrefetchSegmentDuration=\"3700\"><Initialization range=\"0-817\"/></SegmentBase></Representation></AdaptationSet><AdaptationSet id=\"1\" contentType=\"audio\" subsegmentStartsWithSAP=\"1\" subsegmentAlignment=\"true\"><Representation id=\"1938053376701587ad\" bandwidth=\"63701\" codecs=\"mp4a.40.5\" mimeType=\"audio/mp4\" FBAvgBitrate=\"63701\" audioSamplingRate=\"44100\" FBEncodingTag=\"dash_ln_heaac_vbr3_audio\" FBContentLength=\"30451\" FBPaqMos=\"90.89\" FBAbrPolicyTags=\"\" FBDefaultQuality=\"1\"><AudioChannelConfiguration schemeIdUri=\"urn:mpeg:dash:23003:3:audio_channel_configuration:2011\" value=\"2\"/><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQPO3IPxnA42Cfkvifiy5oh9pwNLofPvELogiKS2jGfGKPwmXG0UL-aWyiD5OZXe2-mSNiDUQwqkBOXIyq5pIpS9.mp4?strext=1&amp;_nc_cat=111&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=U9AxtwgoedQQ7kNvgEuOxb_&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfbG5faGVhYWNfdmJyM19hdWRpbyIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYC2jWnEMyi80kFjFIWDxvhckpQQyylbMGwVM63oVYgUnQ&amp;oe=6754AA94</BaseURL><SegmentBase indexRange=\"824-879\" timescale=\"44100\" FBMinimumPrefetchRange=\"880-1223\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"880-8841\" FBFirstSegmentRange=\"880-17425\" FBFirstSegmentDuration=\"2021\" FBSecondSegmentRange=\"17426-30450\" FBPrefetchSegmentRange=\"880-30450\" FBPrefetchSegmentDuration=\"3713\"><Initialization range=\"0-823\"/></SegmentBase></Representation></AdaptationSet></Period></MPD>\n",
                                "number_of_qualities": 6
                            },
                            "has_audio": true,
                            "tracking_token": "eyJ2ZXJzaW9uIjo1LCJwYXlsb2FkIjp7ImlzX2FuYWx5dGljc190cmFja2VkIjp0cnVlLCJ1dWlkIjoiYmM1MmYwZDVhMzU1NDI1Y2ExODI0ZWFjOGNmZTRlNzUzNTA5MzA5OTIxODAyMzQzNDg0In0sInNpZ25hdHVyZSI6IiJ9",
                            "video_url": "https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f1/m86/5C476954A7880F8C8EA925B78D52C38D_video_dashinit.mp4?stp=dst-mp4&efg=eyJxZV9ncm91cHMiOiJbXCJpZ193ZWJfZGVsaXZlcnlfdnRzX290ZlwiXSIsInZlbmNvZGVfdGFnIjoidnRzX3ZvZF91cmxnZW4uY2xpcHMuYzIuNzIwLmJhc2VsaW5lIn0&_nc_cat=105&vs=495088089537103_1085294210&_nc_vs=HBksFQIYUmlnX3hwdl9yZWVsc19wZXJtYW5lbnRfc3JfcHJvZC81QzQ3Njk1NEE3ODgwRjhDOEVBOTI1Qjc4RDUyQzM4RF92aWRlb19kYXNoaW5pdC5tcDQVAALIAQAVAhg6cGFzc3Rocm91Z2hfZXZlcnN0b3JlL0dKTTE2QnUwSUVLZ2Rfa0JBSFhFYjBTR3RBSmdicV9FQUFBRhUCAsgBACgAGAAbABUAACbOvKbhlsiGQBUCKAJDMywXQA2ZmZmZmZoYEmRhc2hfYmFzZWxpbmVfMV92MREAdf4HAA%3D%3D&ccb=9-4&oh=00_AYB67ETTM5eV85SG4Orh5jxFxtKA68v9Jy6QuR-edQ8tew&oe=6750AE6D&_nc_sid=8b3546",
                            "video_view_count": 2871286,
                            "edge_media_to_caption": {
                                "edges": [
                                    {
                                        "node": {
                                            "text": "who else jumped? 😭\n\n#InTheMoment\n\nVideo by @not.lleytonn"
                                        }
                                    }
                                ]
                            },
                            "edge_media_to_comment": {
                                "count": 2546
                            },
                            "comments_disabled": false,
                            "taken_at_timestamp": 1732562452,
                            "edge_liked_by": {
                                "count": 129615
                            },
                            "edge_media_preview_like": {
                                "count": 129615
                            },
                            "location": null,
                            "nft_asset_info": null,
                            "thumbnail_src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/468274355_18610447756001321_3305237204360897748_n.jpg?stp=c0.273.702.702a_dst-jpg_e15_s640x640&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=SwV5ff6gDFIQ7kNvgHFSxpE&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYB-X9pQwIb4qizdkmqY3mHwrQt3tziIUPmgs8HKhEwTRA&oe=6754966E&_nc_sid=8b3546",
                            "thumbnail_resources": [
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/468274355_18610447756001321_3305237204360897748_n.jpg?stp=c0.273.702.702a_dst-jpg_e15_s150x150&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi43MDJ4MTI0OC5zZHIuZjc1NzYxLmRlZmF1bHRfY292ZXJfZnJhbWUifQ&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=SwV5ff6gDFIQ7kNvgHFSxpE&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBWQace6EzAisi5TdvlxBrTFWnJ9pYWaHhYOOxj7vOZGg&oe=6754966E&_nc_sid=8b3546",
                                    "config_width": 150,
                                    "config_height": 150
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/468274355_18610447756001321_3305237204360897748_n.jpg?stp=c0.273.702.702a_dst-jpg_e15_s240x240&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi43MDJ4MTI0OC5zZHIuZjc1NzYxLmRlZmF1bHRfY292ZXJfZnJhbWUifQ&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=SwV5ff6gDFIQ7kNvgHFSxpE&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYCmaaDwd-xQiRNRej0Ti2mJT2x4hDaHHdvt0RxsF7BU5Q&oe=6754966E&_nc_sid=8b3546",
                                    "config_width": 240,
                                    "config_height": 240
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/468274355_18610447756001321_3305237204360897748_n.jpg?stp=c0.273.702.702a_dst-jpg_e15_s320x320&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi43MDJ4MTI0OC5zZHIuZjc1NzYxLmRlZmF1bHRfY292ZXJfZnJhbWUifQ&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=SwV5ff6gDFIQ7kNvgHFSxpE&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAvMqrdzR5aN8RrNhlFjP4WDdKhPb6sZQx3JD5Rdjn63A&oe=6754966E&_nc_sid=8b3546",
                                    "config_width": 320,
                                    "config_height": 320
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/468274355_18610447756001321_3305237204360897748_n.jpg?stp=c0.273.702.702a_dst-jpg_e15_s480x480&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi43MDJ4MTI0OC5zZHIuZjc1NzYxLmRlZmF1bHRfY292ZXJfZnJhbWUifQ&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=SwV5ff6gDFIQ7kNvgHFSxpE&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDs4vGXUSM8kSZ_IqTDyCzKbmkAPaJcpuAyHluODBN4dA&oe=6754966E&_nc_sid=8b3546",
                                    "config_width": 480,
                                    "config_height": 480
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/468274355_18610447756001321_3305237204360897748_n.jpg?stp=c0.273.702.702a_dst-jpg_e15_s640x640&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi43MDJ4MTI0OC5zZHIuZjc1NzYxLmRlZmF1bHRfY292ZXJfZnJhbWUifQ&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=SwV5ff6gDFIQ7kNvgHFSxpE&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYB-X9pQwIb4qizdkmqY3mHwrQt3tziIUPmgs8HKhEwTRA&oe=6754966E&_nc_sid=8b3546",
                                    "config_width": 640,
                                    "config_height": 640
                                }
                            ],
                            "felix_profile_grid_crop": null,
                            "coauthor_producers": [],
                            "pinned_for_users": [],
                            "viewer_can_reshare": true,
                            "like_and_view_counts_disabled": false,
                            "product_type": "clips",
                            "clips_music_attribution_info": {
                                "artist_name": "not.lleytonn",
                                "song_name": "Original audio",
                                "uses_original_audio": true,
                                "should_mute_audio": false,
                                "should_mute_audio_reason": "",
                                "audio_id": "1121842325770689"
                            }
                        }
                    },
                    {
                        "node": {
                            "__typename": "GraphVideo",
                            "id": "3507073693082326355",
                            "shortcode": "DCroPFNShVT",
                            "dimensions": {
                                "height": 1333,
                                "width": 750
                            },
                            "display_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/468019396_18609846838001321_5343207079704224996_n.jpg?stp=dst-jpg_e15_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=viCXKF_0vd8Q7kNvgF7RSO7&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBu0uvSG3GWuzrM4Z6BIRvnRG8SkG6jG7GdIlx9j8dgRg&oe=6754C2E9&_nc_sid=8b3546",
                            "edge_media_to_tagged_user": {
                                "edges": [
                                    {
                                        "node": {
                                            "user": {
                                                "full_name": "Willy’s World",
                                                "followed_by_viewer": false,
                                                "id": "69146374346",
                                                "is_verified": false,
                                                "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/461603435_326219830549700_2561672083772027461_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=108&_nc_ohc=Kvo-ujDg-pYQ7kNvgHJvVXh&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBzFSsHuPhxvICK-27IEWhiLxsdLXjB7G2aGg8wZkmAlw&oe=67549E35&_nc_sid=8b3546",
                                                "username": "willys360world"
                                            },
                                            "x": 0,
                                            "y": 0
                                        }
                                    }
                                ]
                            },
                            "fact_check_overall_rating": null,
                            "fact_check_information": null,
                            "gating_info": null,
                            "sharing_friction_info": {
                                "should_have_sharing_friction": false,
                                "bloks_app_url": null
                            },
                            "media_overlay_info": null,
                            "media_preview": "ABgqcFpVqdoeKjEYHLHaPXpXc2cZMi5oqaJM9ORRWTkUovsUJJCepJA6jrn/AD7VRuZAFyo5z0P+FRSF15Ukj0qES5IzxjmuZJ7tnUasNzIFEhGwtxnjnHTj/JoqGObzcr0BHHpx0/8Ar0UJjaICaiaMNUhpKoBYyUXaOhooFFAH/9k=",
                            "owner": {
                                "id": "25025320",
                                "username": "instagram"
                            },
                            "is_video": true,
                            "has_upcoming_event": false,
                            "accessibility_caption": null,
                            "dash_info": {
                                "is_dash_eligible": true,
                                "video_dash_manifest": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<MPD xmlns=\"urn:mpeg:dash:schema:mpd:2011\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"urn:mpeg:dash:schema:mpd:2011 DASH-MPD.xsd\" profiles=\"urn:mpeg:dash:profile:isoff-on-demand:2011\" minBufferTime=\"PT2S\" type=\"static\" mediaPresentationDuration=\"PT15.866667S\" FBManifestIdentifier=\"FgAYEnIyZXZldnA5LXIxZ2VuMnZwORmGvOCP3KCn/wHO3cLzu5bsAr7L68zzlLYD1PrL2/ixwASapf+1i/7SBIDOp5/YsIQGzPOuot6MjweIuZuC5oCcByIYGGRhc2hfbG5faGVhYWNfdmJyM19hdWRpbwA=\"><Period id=\"0\" duration=\"PT15.866667S\"><AdaptationSet id=\"0\" contentType=\"video\" frameRate=\"15360/512\" subsegmentAlignment=\"true\" par=\"9:16\" FBUnifiedUploadResolutionMos=\"360:74.9\"><Representation id=\"1267495410957994vd\" bandwidth=\"89459\" codecs=\"vp09.00.30.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q30\" FBContentLength=\"177429\" FBPlaybackResolutionMos=\"0:100,360:22.4,480:22.7,720:25.2\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:54.5,480:46.4,720:36.6\" FBAbrPolicyTags=\"\" width=\"540\" height=\"960\" FBDefaultQuality=\"1\" FBQualityClass=\"sd\" FBQualityLabel=\"240p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQNM9Wakg6Ojxfy6bXQ4WQET1eFXDoYVwVqgRqYqWUsXizcUvtfy-hVHDkUlB2QTN70oFJeYzYjd5wrAjIApX7BF.mp4?strext=1&amp;_nc_cat=103&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=DsujfhT2vDoQ7kNvgGQJYMW&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfcjJldmV2cDktcjFnZW4ydnA5X3EzMCIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYAuhlWk7i_YNV1I7CAvpz4VZPDMs_Lv6igPE7qjWDnYYg&amp;oe=6754A918</BaseURL><SegmentBase indexRange=\"818-897\" timescale=\"15360\" FBMinimumPrefetchRange=\"898-17258\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"898-25554\" FBFirstSegmentRange=\"898-60671\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"60672-113162\" FBPrefetchSegmentRange=\"898-60671\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"963531298927327v\" bandwidth=\"192530\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q40\" FBContentLength=\"381853\" FBPlaybackResolutionMos=\"0:100,360:32.1,480:31.7,720:33.2\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:66,480:58.1,720:48.9\" FBAbrPolicyTags=\"\" width=\"720\" height=\"1280\" FBQualityClass=\"hd\" FBQualityLabel=\"270p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQO4O-oZ8ZdR9LZ05jdrup-FsKrZb3wwVUiLeNMq_LakRINSxjBHdHuDcrW-8eeSrjBiHW3s8BBA7gvhwgfcWw9H.mp4?strext=1&amp;_nc_cat=105&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=44KHRA_o2qgQ7kNvgH1t4yc&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfcjJldmV2cDktcjFnZW4ydnA5X3E0MCIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYBQMmd4t1uo6cEYoxZXRdTaSGxQJ7_2drKPEL-pOHSA7A&amp;oe=6754AA2E</BaseURL><SegmentBase indexRange=\"818-897\" timescale=\"15360\" FBMinimumPrefetchRange=\"898-41010\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"898-59778\" FBFirstSegmentRange=\"898-138005\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"138006-249863\" FBPrefetchSegmentRange=\"898-138005\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"561425336629278v\" bandwidth=\"299287\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q50\" FBContentLength=\"593587\" FBPlaybackResolutionMos=\"0:100,360:40.2,480:39,720:39.9\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:75.4,480:67.4,720:57.3\" FBAbrPolicyTags=\"\" width=\"720\" height=\"1280\" FBQualityClass=\"hd\" FBQualityLabel=\"360p\"><BaseURL>https://scontent-atl3-3.cdninstagram.com/o1/v/t16/f2/m69/AQO9NnpDvQP-KMtpN663ee5yJIyVPVXkFOow5-CBLSc-29-1VXW-VWCKCO3Eceh89fju1IwS2NrBNSeFOv1l8OdL.mp4?strext=1&amp;_nc_cat=109&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-3.cdninstagram.com&amp;_nc_ohc=91VqisTsAwwQ7kNvgFW8S7x&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfcjJldmV2cDktcjFnZW4ydnA5X3E1MCIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYAoPx5gcBjw18m3FcPiWxr326xha4v0csVj8b8eYYxRyQ&amp;oe=6754C69A</BaseURL><SegmentBase indexRange=\"818-897\" timescale=\"15360\" FBMinimumPrefetchRange=\"898-61993\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"898-102067\" FBFirstSegmentRange=\"898-215877\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"215878-390995\" FBPrefetchSegmentRange=\"898-215877\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"1698482430997376v\" bandwidth=\"469146\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q60\" FBContentLength=\"930473\" FBPlaybackResolutionMos=\"0:100,360:51.2,480:49.1,720:48.7\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:83.7,480:76.5,720:66.9\" FBAbrPolicyTags=\"\" width=\"720\" height=\"1280\" FBQualityClass=\"hd\" FBQualityLabel=\"480p\"><BaseURL>https://scontent-atl3-3.cdninstagram.com/o1/v/t16/f2/m69/AQPfYTFRs5uflvVJYeIgvfcAQ0Ms97axGhhVEjAzkXCJhYe-BN3ZSiz1UfCWrlbv_8uhVIVdY_926TRhmuc7-B8p.mp4?strext=1&amp;_nc_cat=109&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-3.cdninstagram.com&amp;_nc_ohc=u5iMjBHgjGkQ7kNvgE9gZ_X&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfcjJldmV2cDktcjFnZW4ydnA5X3E2MCIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYCHMg6I5YPk0rwVf7Uf_31OePlZpEZ0fIBG9b7BHHwc3Q&amp;oe=6754C1A6</BaseURL><SegmentBase indexRange=\"818-897\" timescale=\"15360\" FBMinimumPrefetchRange=\"898-85107\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"898-148983\" FBFirstSegmentRange=\"898-334352\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"334353-617232\" FBPrefetchSegmentRange=\"898-334352\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"2003528996740326v\" bandwidth=\"715920\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q70\" FBContentLength=\"1419909\" FBPlaybackResolutionMos=\"0:100,360:62.1,480:59.6,720:57.9\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:90,480:84.4,720:76.2\" FBAbrPolicyTags=\"\" width=\"720\" height=\"1280\" FBQualityClass=\"hd\" FBQualityLabel=\"540p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQPJkEFiEyCYYGjf5gQhl8SF-k4_dJi1JmNQje2-3Rvwfquxa1jgANfywRgRIVP52Iijvw2lYqCGKJuGrzfG56C_.mp4?strext=1&amp;_nc_cat=100&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=HmNEUGdmqgsQ7kNvgF5xqV-&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfcjJldmV2cDktcjFnZW4ydnA5X3E3MCIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYApqSTWrnwZP-6KVnwUR2mqp99DgYl4zkrOZmOel5NBZQ&amp;oe=67549355</BaseURL><SegmentBase indexRange=\"818-897\" timescale=\"15360\" FBMinimumPrefetchRange=\"898-109169\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"898-211030\" FBFirstSegmentRange=\"898-501736\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"501737-947490\" FBPrefetchSegmentRange=\"898-501736\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"800830462121831v\" bandwidth=\"1015547\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q80\" FBContentLength=\"2014169\" FBPlaybackResolutionMos=\"0:100,360:70.3,480:67.8,720:65.6\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:94.3,480:90.4,720:83.7\" FBAbrPolicyTags=\"\" width=\"720\" height=\"1280\" FBQualityClass=\"hd\" FBQualityLabel=\"640p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQNEW902Ducbc2w9CdLOigDBQHYXjrn0dKMUQi_aUJnt6-BxmUTc22cSmK5nbQKcEi2bpHJsKbHqMQ0HtlOLqJh_.mp4?strext=1&amp;_nc_cat=108&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=aRrNeUyjkHkQ7kNvgEiopJo&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfcjJldmV2cDktcjFnZW4ydnA5X3E4MCIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYDZnK_-3cooKkCfzOOAByMWn1jyZWj4ZBznvKUPyi95SQ&amp;oe=6754BBBD</BaseURL><SegmentBase indexRange=\"818-897\" timescale=\"15360\" FBMinimumPrefetchRange=\"898-134920\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"898-289817\" FBFirstSegmentRange=\"898-711449\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"711450-1349321\" FBPrefetchSegmentRange=\"898-711449\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"2031911180660292v\" bandwidth=\"1404292\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q90\" FBContentLength=\"2785180\" FBPlaybackResolutionMos=\"0:100,360:76.2,480:73.8,720:71.1\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:96.5,480:93.6,720:88.3\" FBAbrPolicyTags=\"\" width=\"720\" height=\"1280\" FBQualityClass=\"hd\" FBQualityLabel=\"720p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQMt7CYHgBIaA_VFRh0L6OC6YYTmhS4RH3cJQkBPb_chR_OlkDfFpd8iDcmRbfgNv0E_a5mTaxbQzkZjbZfVFffe.mp4?strext=1&amp;_nc_cat=105&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=QUY5Sw88LcsQ7kNvgG2OjNw&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfcjJldmV2cDktcjFnZW4ydnA5X3E5MCIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYDNLyWc3CabHopMXVDl3DRkeVAtABtHXEklCvg61LKkDg&amp;oe=67549846</BaseURL><SegmentBase indexRange=\"818-897\" timescale=\"15360\" FBMinimumPrefetchRange=\"898-160125\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"898-386422\" FBFirstSegmentRange=\"898-973203\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"973204-1880562\" FBPrefetchSegmentRange=\"898-973203\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation></AdaptationSet><AdaptationSet id=\"1\" contentType=\"audio\" subsegmentStartsWithSAP=\"1\" subsegmentAlignment=\"true\"><Representation id=\"1308386010327373ad\" bandwidth=\"65406\" codecs=\"mp4a.40.5\" mimeType=\"audio/mp4\" FBAvgBitrate=\"65406\" audioSamplingRate=\"44100\" FBEncodingTag=\"dash_ln_heaac_vbr3_audio\" FBContentLength=\"130600\" FBPaqMos=\"94.29\" FBAbrPolicyTags=\"\" FBDefaultQuality=\"1\"><AudioChannelConfiguration schemeIdUri=\"urn:mpeg:dash:23003:3:audio_channel_configuration:2011\" value=\"2\"/><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQM6q_MeXNdSL71kBpe2N7A4cc9Cr-_OgEgTEu4ZqBz1bdxeueTFI_tqXizxMUl2g6HgcKXPmavp8vz2WzzKJL4-.mp4?strext=1&amp;_nc_cat=106&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=0TusVusRFacQ7kNvgEqm2EE&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfbG5faGVhYWNfdmJyM19hdWRpbyIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYDlVDgKl46F9FuDBfNnA-h54Rn6nOWeGtriFaLdUN-x7Q&amp;oe=67549E93</BaseURL><SegmentBase indexRange=\"824-951\" timescale=\"44100\" FBMinimumPrefetchRange=\"952-1295\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"952-7437\" FBFirstSegmentRange=\"952-14539\" FBFirstSegmentDuration=\"2021\" FBSecondSegmentRange=\"14540-31103\" FBPrefetchSegmentRange=\"952-31103\" FBPrefetchSegmentDuration=\"4017\"><Initialization range=\"0-823\"/></SegmentBase></Representation></AdaptationSet></Period></MPD>\n",
                                "number_of_qualities": 7
                            },
                            "has_audio": true,
                            "tracking_token": "eyJ2ZXJzaW9uIjo1LCJwYXlsb2FkIjp7ImlzX2FuYWx5dGljc190cmFja2VkIjp0cnVlLCJ1dWlkIjoiYmM1MmYwZDVhMzU1NDI1Y2ExODI0ZWFjOGNmZTRlNzUzNTA3MDczNjkzMDgyMzI2MzU1In0sInNpZ25hdHVyZSI6IiJ9",
                            "video_url": "https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f1/m86/2749B6F54BB12CE42C28C3C93B3C0EBE_video_dashinit.mp4?stp=dst-mp4&efg=eyJxZV9ncm91cHMiOiJbXCJpZ193ZWJfZGVsaXZlcnlfdnRzX290ZlwiXSIsInZlbmNvZGVfdGFnIjoidnRzX3ZvZF91cmxnZW4uY2xpcHMuYzIuNzIwLmJhc2VsaW5lIn0&_nc_cat=108&vs=495082396885160_3050337303&_nc_vs=HBksFQIYUmlnX3hwdl9yZWVsc19wZXJtYW5lbnRfc3JfcHJvZC8yNzQ5QjZGNTRCQjEyQ0U0MkMyOEMzQzkzQjNDMEVCRV92aWRlb19kYXNoaW5pdC5tcDQVAALIAQAVAhg6cGFzc3Rocm91Z2hfZXZlcnN0b3JlL0dKV3Y0QnU2djhqMlNtSUdBR1lzc25WaDhZQWticV9FQUFBRhUCAsgBACgAGAAbABUAACa447mqgY2EQBUCKAJDMywXQC%2B7ZFocrAgYEmRhc2hfYmFzZWxpbmVfMV92MREAdf4HAA%3D%3D&ccb=9-4&oh=00_AYANQjvbJU4kYGLDFnDUHB7qNE3fDXCkfARfi2l3eCVY9g&oe=6750D0FA&_nc_sid=8b3546",
                            "video_view_count": 5057638,
                            "edge_media_to_caption": {
                                "edges": [
                                    {
                                        "node": {
                                            "text": "Zoomies 🐶🐾🎥\n\n#InTheMoment\n\nVideo by @willys360world \nMusic by @odecore"
                                        }
                                    }
                                ]
                            },
                            "edge_media_to_comment": {
                                "count": 4838
                            },
                            "comments_disabled": false,
                            "taken_at_timestamp": 1732295851,
                            "edge_liked_by": {
                                "count": 370668
                            },
                            "edge_media_preview_like": {
                                "count": 370668
                            },
                            "location": null,
                            "nft_asset_info": null,
                            "thumbnail_src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/468019396_18609846838001321_5343207079704224996_n.jpg?stp=c0.280.720.720a_dst-jpg_e15_s640x640_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=viCXKF_0vd8Q7kNvgF7RSO7&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYCSK9p4rYCIOJWUWp63OTDaEoyt0jwvzienZe5yFMhHyQ&oe=6754C2E9&_nc_sid=8b3546",
                            "thumbnail_resources": [
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/468019396_18609846838001321_5343207079704224996_n.jpg?stp=c0.280.720.720a_dst-jpg_e15_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi43MjB4MTI4MC5zZHIuZjc1NzYxLmRlZmF1bHRfY292ZXJfZnJhbWUifQ&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=viCXKF_0vd8Q7kNvgF7RSO7&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYARIYX25U0KE1N567cOg9wX1dZBoyZsYQR9PLx8_Z9gfA&oe=6754C2E9&_nc_sid=8b3546",
                                    "config_width": 150,
                                    "config_height": 150
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/468019396_18609846838001321_5343207079704224996_n.jpg?stp=c0.280.720.720a_dst-jpg_e15_s240x240_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi43MjB4MTI4MC5zZHIuZjc1NzYxLmRlZmF1bHRfY292ZXJfZnJhbWUifQ&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=viCXKF_0vd8Q7kNvgF7RSO7&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDljyLgzl5wM1p5pBPmToMTMOIjf11a5Csr8lsAAQAusA&oe=6754C2E9&_nc_sid=8b3546",
                                    "config_width": 240,
                                    "config_height": 240
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/468019396_18609846838001321_5343207079704224996_n.jpg?stp=c0.280.720.720a_dst-jpg_e15_s320x320_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi43MjB4MTI4MC5zZHIuZjc1NzYxLmRlZmF1bHRfY292ZXJfZnJhbWUifQ&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=viCXKF_0vd8Q7kNvgF7RSO7&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDtfXMtwZR046mPA_UQEUQU6nJH2E6P-zA3UUc-vvM54g&oe=6754C2E9&_nc_sid=8b3546",
                                    "config_width": 320,
                                    "config_height": 320
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/468019396_18609846838001321_5343207079704224996_n.jpg?stp=c0.280.720.720a_dst-jpg_e15_s480x480_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi43MjB4MTI4MC5zZHIuZjc1NzYxLmRlZmF1bHRfY292ZXJfZnJhbWUifQ&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=viCXKF_0vd8Q7kNvgF7RSO7&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAzvwwdQebCQGD18tjAlUMN1QAEo7PhEDfYSMGmkEp2Ng&oe=6754C2E9&_nc_sid=8b3546",
                                    "config_width": 480,
                                    "config_height": 480
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/468019396_18609846838001321_5343207079704224996_n.jpg?stp=c0.280.720.720a_dst-jpg_e15_s640x640_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi43MjB4MTI4MC5zZHIuZjc1NzYxLmRlZmF1bHRfY292ZXJfZnJhbWUifQ&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=viCXKF_0vd8Q7kNvgF7RSO7&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYCSK9p4rYCIOJWUWp63OTDaEoyt0jwvzienZe5yFMhHyQ&oe=6754C2E9&_nc_sid=8b3546",
                                    "config_width": 640,
                                    "config_height": 640
                                }
                            ],
                            "felix_profile_grid_crop": null,
                            "coauthor_producers": [],
                            "pinned_for_users": [],
                            "viewer_can_reshare": true,
                            "like_and_view_counts_disabled": false,
                            "product_type": "clips",
                            "clips_music_attribution_info": {
                                "artist_name": "ODECORE",
                                "song_name": "KEEP UP (Slowed & Reverbed) [feat. Odetari]",
                                "uses_original_audio": false,
                                "should_mute_audio": false,
                                "should_mute_audio_reason": "",
                                "audio_id": "1481232106087714"
                            }
                        }
                    },
                    {
                        "node": {
                            "__typename": "GraphSidecar",
                            "id": "3505860568052124896",
                            "shortcode": "DCnUZyey8zg",
                            "dimensions": {
                                "height": 937,
                                "width": 750
                            },
                            "display_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/467749118_18609530869001321_9163764497276818023_n.jpg?stp=dst-jpg_e15&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=Io3d4Bf5Zq4Q7kNvgFmOgSb&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDVniutHoEXgYGr7lwC6U1i2jXH93SopQWKctABXJkQnA&oe=6754AF97&_nc_sid=8b3546",
                            "edge_media_to_tagged_user": {
                                "edges": [
                                    {
                                        "node": {
                                            "user": {
                                                "full_name": "",
                                                "followed_by_viewer": false,
                                                "id": "1924521",
                                                "is_verified": true,
                                                "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/244362143_902995690346326_4181665239625661127_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=110&_nc_ohc=LYG6h6t6hxwQ7kNvgEsfKJZ&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAuTV2FojOelmgBKtlLL10KV3mlI8O75muuVbaB9Ipw6A&oe=6754BCB1&_nc_sid=8b3546",
                                                "username": "verdy"
                                            },
                                            "x": 0.44105173880000004,
                                            "y": 0.8592027142
                                        }
                                    },
                                    {
                                        "node": {
                                            "user": {
                                                "full_name": "kyan  /  かいあん",
                                                "followed_by_viewer": false,
                                                "id": "5045385127",
                                                "is_verified": false,
                                                "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/311338745_606807284463736_1142699983768494601_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=iz_DaI7S1cQQ7kNvgH06jCR&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYADUv5Y_jH0lSyirSzo-tREPv2cn3C5BN170Bgc2hSf8w&oe=675494DB&_nc_sid=8b3546",
                                                "username": "kyanlm"
                                            },
                                            "x": 0,
                                            "y": 0
                                        }
                                    },
                                    {
                                        "node": {
                                            "user": {
                                                "full_name": "issey",
                                                "followed_by_viewer": false,
                                                "id": "25946691014",
                                                "is_verified": false,
                                                "profile_pic_url": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-19/261437944_223392343259992_896284420506269350_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=104&_nc_ohc=zon7Ba87HTQQ7kNvgGczu18&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAXhVLc7LpS0iMBeUcUD8koGmlYFiSvJRHKyP4ElgKSwA&oe=6754A31E&_nc_sid=8b3546",
                                                "username": "issey.0503"
                                            },
                                            "x": 0,
                                            "y": 0
                                        }
                                    },
                                    {
                                        "node": {
                                            "user": {
                                                "full_name": "PIZZA SLICE",
                                                "followed_by_viewer": false,
                                                "id": "750415117",
                                                "is_verified": false,
                                                "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/11355067_478923812315218_1062997547_a.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=110&_nc_ohc=LAMGjdvLCvMQ7kNvgGfj4xV&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYD_WMuvelM7Jqn55Xz8zQmXEEGuXhvQzY9ea8S1HPIVKQ&oe=6754C417&_nc_sid=8b3546",
                                                "username": "pizza_slice_tokyo"
                                            },
                                            "x": 0.3519932146,
                                            "y": 0.7209499576
                                        }
                                    },
                                    {
                                        "node": {
                                            "user": {
                                                "full_name": "yume@メンズネイル専門 | tokyo",
                                                "followed_by_viewer": false,
                                                "id": "6928792779",
                                                "is_verified": false,
                                                "profile_pic_url": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-19/317207413_855573315635992_8116207701055733319_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=104&_nc_ohc=D24oNzy6mQQQ7kNvgHaAEts&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBJUraCEXpcllpHOXJRp9sgIVtmPAHs1kMs04IGxxp-VA&oe=6754AD2E&_nc_sid=8b3546",
                                                "username": "yu_mensnail"
                                            },
                                            "x": 0,
                                            "y": 0
                                        }
                                    }
                                ]
                            },
                            "fact_check_overall_rating": null,
                            "fact_check_information": null,
                            "gating_info": null,
                            "sharing_friction_info": {
                                "should_have_sharing_friction": false,
                                "bloks_app_url": null
                            },
                            "media_overlay_info": null,
                            "media_preview": null,
                            "owner": {
                                "id": "25025320",
                                "username": "instagram"
                            },
                            "is_video": false,
                            "has_upcoming_event": false,
                            "accessibility_caption": null,
                            "edge_media_to_caption": {
                                "edges": [
                                    {
                                        "node": {
                                            "text": "“Moral of the story: shoot your shot, send that DM and follow that person.”\n \nJapanese creator @kyanlm (Kyan) knows how to make his dreams a reality. To celebrate reuniting with his twin brother @issey.0503 (Issey) in Tokyo, Kyan imagined the perfect day in the city based on some of his favorite Instagram connections. The day (fit for Close Friends only) ranged from getting iconic nail art by @yu_mensnail, to grabbing underground pizza at @pizza_slice_tokyo (Pizza Slice), to visiting fashion designer @verdy (Verdy), whom he originally met in DMs. Kyan’s growing creative community makes it clear that his dreams are right on track and he’s exactly where he’s meant to be.\n \nWe’re happy to be #CloseFriendsOnly with Kyan and friends, spending a day exploring the gems of Tokyo."
                                        }
                                    }
                                ]
                            },
                            "edge_media_to_comment": {
                                "count": 3460
                            },
                            "comments_disabled": false,
                            "taken_at_timestamp": 1732151169,
                            "edge_liked_by": {
                                "count": 150113
                            },
                            "edge_media_preview_like": {
                                "count": 150113
                            },
                            "location": null,
                            "nft_asset_info": null,
                            "thumbnail_src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/467749118_18609530869001321_9163764497276818023_n.jpg?stp=c0.90.720.720a_dst-jpg_e15_s640x640&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=Io3d4Bf5Zq4Q7kNvgFmOgSb&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBhabLDhD8WHkD-Dzr3M96NMttd33J0kULCF5Xyoan6Kg&oe=6754AF97&_nc_sid=8b3546",
                            "thumbnail_resources": [
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/467749118_18609530869001321_9163764497276818023_n.jpg?stp=c0.90.720.720a_dst-jpg_e15_s150x150&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi43MjB4OTAwLnNkci5mNzU3NjEuZGVmYXVsdF9jb3Zlcl9mcmFtZSJ9&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=Io3d4Bf5Zq4Q7kNvgFmOgSb&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYB7tgEoVhfvimN3BUiTEGEN0_NUxMRt3biX-D-_9S5TBg&oe=6754AF97&_nc_sid=8b3546",
                                    "config_width": 150,
                                    "config_height": 150
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/467749118_18609530869001321_9163764497276818023_n.jpg?stp=c0.90.720.720a_dst-jpg_e15_s240x240&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi43MjB4OTAwLnNkci5mNzU3NjEuZGVmYXVsdF9jb3Zlcl9mcmFtZSJ9&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=Io3d4Bf5Zq4Q7kNvgFmOgSb&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYCWMCWaL1bL0euWQIl3qA7oxyK97wcMHa7gIKyXNGMO5A&oe=6754AF97&_nc_sid=8b3546",
                                    "config_width": 240,
                                    "config_height": 240
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/467749118_18609530869001321_9163764497276818023_n.jpg?stp=c0.90.720.720a_dst-jpg_e15_s320x320&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi43MjB4OTAwLnNkci5mNzU3NjEuZGVmYXVsdF9jb3Zlcl9mcmFtZSJ9&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=Io3d4Bf5Zq4Q7kNvgFmOgSb&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAXTfCJGaP1uEuR648WD2uZUk5F5aA-NNZTjPzXo7HIfQ&oe=6754AF97&_nc_sid=8b3546",
                                    "config_width": 320,
                                    "config_height": 320
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/467749118_18609530869001321_9163764497276818023_n.jpg?stp=c0.90.720.720a_dst-jpg_e15_s480x480&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi43MjB4OTAwLnNkci5mNzU3NjEuZGVmYXVsdF9jb3Zlcl9mcmFtZSJ9&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=Io3d4Bf5Zq4Q7kNvgFmOgSb&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAjtRHY6STtxXMHdJz4eA_IuD9-o0wUpENRbu7vsS05Gg&oe=6754AF97&_nc_sid=8b3546",
                                    "config_width": 480,
                                    "config_height": 480
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/467749118_18609530869001321_9163764497276818023_n.jpg?stp=c0.90.720.720a_dst-jpg_e15_s640x640&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi43MjB4OTAwLnNkci5mNzU3NjEuZGVmYXVsdF9jb3Zlcl9mcmFtZSJ9&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=Io3d4Bf5Zq4Q7kNvgFmOgSb&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBhabLDhD8WHkD-Dzr3M96NMttd33J0kULCF5Xyoan6Kg&oe=6754AF97&_nc_sid=8b3546",
                                    "config_width": 640,
                                    "config_height": 640
                                }
                            ],
                            "coauthor_producers": [
                                {
                                    "id": "5045385127",
                                    "is_verified": false,
                                    "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/311338745_606807284463736_1142699983768494601_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=iz_DaI7S1cQQ7kNvgH06jCR&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYADUv5Y_jH0lSyirSzo-tREPv2cn3C5BN170Bgc2hSf8w&oe=675494DB&_nc_sid=8b3546",
                                    "username": "kyanlm"
                                }
                            ],
                            "pinned_for_users": [],
                            "viewer_can_reshare": true,
                            "like_and_view_counts_disabled": false,
                            "edge_sidecar_to_children": {
                                "edges": [
                                    {
                                        "node": {
                                            "__typename": "GraphVideo",
                                            "id": "3505858800698099705",
                                            "shortcode": "DCnUAEgSYf5",
                                            "dimensions": {
                                                "height": 937,
                                                "width": 750
                                            },
                                            "display_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/467749118_18609530869001321_9163764497276818023_n.jpg?stp=dst-jpg_e15&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=Io3d4Bf5Zq4Q7kNvgFmOgSb&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDVniutHoEXgYGr7lwC6U1i2jXH93SopQWKctABXJkQnA&oe=6754AF97&_nc_sid=8b3546",
                                            "edge_media_to_tagged_user": {
                                                "edges": [
                                                    {
                                                        "node": {
                                                            "user": {
                                                                "full_name": "kyan  /  かいあん",
                                                                "followed_by_viewer": false,
                                                                "id": "5045385127",
                                                                "is_verified": false,
                                                                "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/311338745_606807284463736_1142699983768494601_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=iz_DaI7S1cQQ7kNvgH06jCR&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYADUv5Y_jH0lSyirSzo-tREPv2cn3C5BN170Bgc2hSf8w&oe=675494DB&_nc_sid=8b3546",
                                                                "username": "kyanlm"
                                                            },
                                                            "x": 0,
                                                            "y": 0
                                                        }
                                                    }
                                                ]
                                            },
                                            "fact_check_overall_rating": null,
                                            "fact_check_information": null,
                                            "gating_info": null,
                                            "sharing_friction_info": {
                                                "should_have_sharing_friction": false,
                                                "bloks_app_url": null
                                            },
                                            "media_overlay_info": null,
                                            "media_preview": "ACIqdCpmQvgAHO3PBH09iaqMZVjw+Q288euev/660oZD5SggfdH8qhunkwsa9GPfkDFSWtXqZ6xrE4YE8g4B/Ln2P86sW0TzfKSQAefbjge+f0qrO7j5XHO3IYe39Kv25CQ/Kc52njjnAz9cH/DtSHJW21/APsoPJHJ6896KnEp9aKZAiJLgj04AbjPuCM4H+eKFjuXIY7Ao9+v44/pTbUmbdIDhM7RnHQd/8Mepp0lwY1wxGB09KS8y2+bXqTPYo/M7bh0AXjrycnqef061DLFFbR7o/ujqM5/H3qJ9RDnbjP09enU9hVa43yoVGB04ouUoTnd9Evn6WJRMhGd4Gff/AOtRWUYgONrnHeiq0MrPz+43IEECFVGR15Pfv6/y5rOnJmfnOM8e2OtawrJfmfB5GDx2oBOzuVhnr0x2q/jPWrLopi3EDcV645/OqsfSs2ehTleVrbq46ikoqTrP/9k=",
                                            "owner": {
                                                "id": "25025320",
                                                "username": "instagram"
                                            },
                                            "is_video": true,
                                            "has_upcoming_event": false,
                                            "accessibility_caption": null,
                                            "dash_info": {
                                                "is_dash_eligible": true,
                                                "video_dash_manifest": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<MPD xmlns=\"urn:mpeg:dash:schema:mpd:2011\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"urn:mpeg:dash:schema:mpd:2011 DASH-MPD.xsd\" profiles=\"urn:mpeg:dash:profile:isoff-on-demand:2011\" minBufferTime=\"PT2S\" type=\"static\" mediaPresentationDuration=\"PT7.633333S\" FBManifestIdentifier=\"FgAYEnIyZXZldnA5LXIxZ2VuMnZwORmWwInt2MDC4AHwr7TC2/X0AZa3rdKNlogCwpWctsGl5QPCmPqajZHyA5KYxofjpYoE9IeFobL+wASkhZDSiKToBdKa6YqRiOMfIhgYZGFzaF9sbl9oZWFhY192YnIzX2F1ZGlvAA==\"><Period id=\"0\" duration=\"PT7.633333S\"><AdaptationSet id=\"0\" contentType=\"video\" frameRate=\"15360/512\" subsegmentAlignment=\"true\" par=\"4:5\" FBUnifiedUploadResolutionMos=\"360:73.2\"><Representation id=\"1148539090028041vd\" bandwidth=\"69810\" codecs=\"vp09.00.20.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q20\" FBContentLength=\"66611\" FBPlaybackResolutionMos=\"0:100,360:16.2,480:16.7,720:19.9,1080:25\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:36.4,480:28.6,720:20.8,1080:13.9\" FBAbrPolicyTags=\"\" width=\"288\" height=\"360\" FBDefaultQuality=\"1\" FBQualityClass=\"sd\" FBQualityLabel=\"240p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQOMYO-Z1d3OZ_TO8XvMkfSf9jdQjuR6vnnu3ZYr7lEKTGOtqRrcVwzGT8mKOxK9EBGrFSr1vPj5E47lRJgcZokO.mp4?strext=1&amp;_nc_cat=110&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=hHySNMxXENEQ7kNvgH6VPGa&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTIwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYCi0Z5OCLVUbWtgykW-KIXFvfGlhHGrw_gt7ALCpFwFSQ&amp;oe=6754B883</BaseURL><SegmentBase indexRange=\"818-873\" timescale=\"15360\" FBMinimumPrefetchRange=\"874-2639\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"874-11318\" FBFirstSegmentRange=\"874-44615\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"44616-66610\" FBPrefetchSegmentRange=\"874-44615\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"1636692937277778v\" bandwidth=\"151966\" codecs=\"vp09.00.21.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q30\" FBContentLength=\"145001\" FBPlaybackResolutionMos=\"0:100,360:30.2,480:29.5,720:30.9,1080:34.8\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:59.5,480:49.5,720:39.1,1080:28.7\" FBAbrPolicyTags=\"\" width=\"360\" height=\"450\" FBQualityClass=\"sd\" FBQualityLabel=\"270p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQNBTIFuxTbqTqWn9jPo5SLnuAV8frwAOLI38U94s5-u5KqwpIBOFC8im7oqM66c8zB_dSwmI_ma5fY7Bm50F6Xq.mp4?strext=1&amp;_nc_cat=102&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=O0wq8jm2YCMQ7kNvgEMbk_2&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTMwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYBpWygfFUx6QXpo5ZmjZFo4BjZkyb4OtbZJMEYYl9e9lQ&amp;oe=6754923F</BaseURL><SegmentBase indexRange=\"818-873\" timescale=\"15360\" FBMinimumPrefetchRange=\"874-3641\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"874-22214\" FBFirstSegmentRange=\"874-97188\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"97189-145000\" FBPrefetchSegmentRange=\"874-97188\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"8943567312332457v\" bandwidth=\"242536\" codecs=\"vp09.00.30.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q40\" FBContentLength=\"231420\" FBPlaybackResolutionMos=\"0:100,360:38.2,480:36.1,720:36.5,1080:40.4\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:75.2,480:66.3,720:55.8,1080:45.5\" FBAbrPolicyTags=\"\" width=\"538\" height=\"674\" FBQualityClass=\"sd\" FBQualityLabel=\"360p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQOwdm42cOXCaA7jdQNeEQqhozLhy7OZ8BHH_dUxi8PL8reBR_gJQoSDsNV_3vDIROHJYQPhj-s62G-UJO0i_cDP.mp4?strext=1&amp;_nc_cat=100&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=e6q7uy16SdUQ7kNvgE7LeOK&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTQwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYA8u70JkYdige_pdWNAS37jp781RsR445XInSv9Enp2sQ&amp;oe=6754C089</BaseURL><SegmentBase indexRange=\"818-873\" timescale=\"15360\" FBMinimumPrefetchRange=\"874-4594\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"874-34451\" FBFirstSegmentRange=\"874-156009\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"156010-231419\" FBPrefetchSegmentRange=\"874-156009\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"493723763712608v\" bandwidth=\"394861\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q50\" FBContentLength=\"376764\" FBPlaybackResolutionMos=\"0:100,360:51.2,480:48.2,720:46.9,1080:49.3\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:86.2,480:79.8,720:69.6,1080:59.9\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"480p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQPtaZ4PQvHAQLjB-ff0NYfx1pcBz6HsdgUkWMwo8HBSCKg7OAh2E7GPxrerHz4A4EVdsybjKgaXmSYfbzku_JNk.mp4?strext=1&amp;_nc_cat=107&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=Opbxra8iX4YQ7kNvgEkuEWT&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTUwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYCF_dN-lF5mkxSEnMI5UQnI0k8io52o6qh-T8YAHpasAw&amp;oe=6754B25C</BaseURL><SegmentBase indexRange=\"818-873\" timescale=\"15360\" FBMinimumPrefetchRange=\"874-5944\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"874-53987\" FBFirstSegmentRange=\"874-253743\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"253744-376763\" FBPrefetchSegmentRange=\"874-253743\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"580921927773643v\" bandwidth=\"628971\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q60\" FBContentLength=\"600144\" FBPlaybackResolutionMos=\"0:100,360:64.5,480:61.3,720:58.9,1080:59.5\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:93.2,480:90,720:82.6,1080:74.2\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"540p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQMY1JGX-_8OvpA9GPi59obTZ_mN1RlFBi8j9syyZn6l9pM2NgO4oWDx_t2yyZSsRnsjTsvLwMu3u4cNTLgwWmEe.mp4?strext=1&amp;_nc_cat=106&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=_zGAFnfOKSgQ7kNvgFjCPY3&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTYwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYDBQi9MbUMi4C8-SnvDvXznAPjDzMJXUcok4fdcvo6ANg&amp;oe=6754BB0B</BaseURL><SegmentBase indexRange=\"818-873\" timescale=\"15360\" FBMinimumPrefetchRange=\"874-7512\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"874-84136\" FBFirstSegmentRange=\"874-410325\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"410326-600143\" FBPrefetchSegmentRange=\"874-410325\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"1268808804246010v\" bandwidth=\"929304\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q70\" FBContentLength=\"886711\" FBPlaybackResolutionMos=\"0:100,360:73.5,480:70.6,720:68,1080:67.4\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:95.7,480:94.1,720:90.3,1080:84.5\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"640p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQNOzIDQgdM6pTb9O59pE82D4R2x0qMl8Xk1LNMSYGY3F9x32oTKa73hw1T2VP1gfAhqb_7abdVC2ec8Sa1qEzdC.mp4?strext=1&amp;_nc_cat=100&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=VH-SENw2jl8Q7kNvgHy0h71&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTcwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYDL18R7Qv6Kxb2HZ1h1FYlsBjSTbQFCQ0PFlwn2g-Q8Ug&amp;oe=6754AE55</BaseURL><SegmentBase indexRange=\"818-873\" timescale=\"15360\" FBMinimumPrefetchRange=\"874-9502\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"874-124461\" FBFirstSegmentRange=\"874-613944\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"613945-886710\" FBPrefetchSegmentRange=\"874-613944\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"1067170715108705v\" bandwidth=\"1301292\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q80\" FBContentLength=\"1241650\" FBPlaybackResolutionMos=\"0:100,360:79.6,480:76.6,720:74.2,1080:73.1\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:96.8,480:95.9,720:93.6,1080:90.1\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"720p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQNH1RUwqFWts6gDrEDJ_8LybZnJ1HHjnnpsfPShfLGt5pVIVecd-njMTtNKVXlmtd9Ka7sDJfm6Hx0OyCBHhg-C.mp4?strext=1&amp;_nc_cat=104&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=9XWKabHtgTMQ7kNvgFKpDvy&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTgwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYCZBLPc27g7mA2NxwBhSpu91eKKusP3m44I8lpx6QtSQA&amp;oe=6754C7FD</BaseURL><SegmentBase indexRange=\"818-873\" timescale=\"15360\" FBMinimumPrefetchRange=\"874-11797\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"874-174808\" FBFirstSegmentRange=\"874-868005\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"868006-1241649\" FBPrefetchSegmentRange=\"874-868005\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"538584002497528v\" bandwidth=\"1882453\" codecs=\"vp09.00.40.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q90\" FBContentLength=\"1796174\" FBPlaybackResolutionMos=\"0:100,360:85.3,480:82.5,720:79.4,1080:78.3\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:97.5,480:96.9,720:95.5,1080:93.4\" FBAbrPolicyTags=\"avoid_on_cellular,avoid_on_cellular_intentional\" width=\"1080\" height=\"1350\" FBQualityClass=\"hd\" FBQualityLabel=\"1080p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQPvHF5t9lHY5s0xu5ZPf8cuU47OcvXAGMF7TiVTr1LfGdKFQ4voHMTsvLsqsgzZCsvM7R-AOaDazijYhB-urFM8.mp4?strext=1&amp;_nc_cat=105&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=foGtlE-zPC0Q7kNvgGM6TBb&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTkwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYCnjb0kGt0VkGBtQLXOHBH76gzZew0_t9gvFhq3BdJ6Dw&amp;oe=6754923E</BaseURL><SegmentBase indexRange=\"818-873\" timescale=\"15360\" FBMinimumPrefetchRange=\"874-14883\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"874-253172\" FBFirstSegmentRange=\"874-1257174\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"1257175-1796173\" FBPrefetchSegmentRange=\"874-1257174\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation></AdaptationSet><AdaptationSet id=\"1\" contentType=\"audio\" subsegmentStartsWithSAP=\"1\" subsegmentAlignment=\"true\"><Representation id=\"1095407412135457ad\" bandwidth=\"48842\" codecs=\"mp4a.40.5\" mimeType=\"audio/mp4\" FBAvgBitrate=\"48842\" audioSamplingRate=\"44100\" FBEncodingTag=\"dash_ln_heaac_vbr3_audio\" FBContentLength=\"46968\" FBAbrPolicyTags=\"\" FBDefaultQuality=\"1\"><AudioChannelConfiguration schemeIdUri=\"urn:mpeg:dash:23003:3:audio_channel_configuration:2011\" value=\"2\"/><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQMvKNnDuKBsqjFfd-NjuajalSGPEHO3QiLCiifSXlEpBddJzQttOFk9qtSW9X_QC0-b_g6dzGO_ROffRjurRPtd.mp4?strext=1&amp;_nc_cat=1&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=VWZH_Uakt1cQ7kNvgHmStj7&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9sbl9oZWFhY192YnIzX2F1ZGlvIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYByqgPxdZ4xKg2NzvjUlCGTi0efyjx7tKO0X-ygFdI4pA&amp;oe=67549B61</BaseURL><SegmentBase indexRange=\"824-903\" timescale=\"44100\" FBMinimumPrefetchRange=\"904-1247\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"904-6611\" FBFirstSegmentRange=\"904-12649\" FBFirstSegmentDuration=\"2021\" FBSecondSegmentRange=\"12650-24694\" FBPrefetchSegmentRange=\"904-24694\" FBPrefetchSegmentDuration=\"4017\"><Initialization range=\"0-823\"/></SegmentBase></Representation></AdaptationSet></Period></MPD>\n",
                                                "number_of_qualities": 8
                                            },
                                            "has_audio": false,
                                            "tracking_token": "eyJ2ZXJzaW9uIjo1LCJwYXlsb2FkIjp7ImlzX2FuYWx5dGljc190cmFja2VkIjp0cnVlLCJ1dWlkIjoiYmM1MmYwZDVhMzU1NDI1Y2ExODI0ZWFjOGNmZTRlNzUzNTA1ODU4ODAwNjk4MDk5NzA1In0sInNpZ25hdHVyZSI6IiJ9",
                                            "video_url": "https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQPngEv4rmVayVJLM2-euIG4PKiWG7a3E7uMfdpvvit93se6g5lAn9a9t5INo_9Q7wUpfQzCZOciitzgbqkTn3NX.mp4?stp=dst-mp4&efg=eyJxZV9ncm91cHMiOiJbXCJpZ193ZWJfZGVsaXZlcnlfdnRzX290ZlwiXSIsInZlbmNvZGVfdGFnIjoidnRzX3ZvZF91cmxnZW4uY2Fyb3VzZWxfaXRlbS5jMi4xMDgwLmJhc2VsaW5lIn0&_nc_cat=101&vs=1093422485524857_1137503460&_nc_vs=HBksFQIYOnBhc3N0aHJvdWdoX2V2ZXJzdG9yZS9HTWxESkFjRXIyU1R1OVlEQUdjNDFfa2FfQnNTYnBSMUFBQUYVAALIAQAVAhg6cGFzc3Rocm91Z2hfZXZlcnN0b3JlL0dQQ04zeHZfR3h4ZXBva0VBTzFub0Y3X2FqTXdia1lMQUFBRhUCAsgBACgAGAAbABUAACbQw6T6w7yMQBUCKAJDMywXQB6IMSbpeNUYFmRhc2hfYmFzZWxpbmVfMTA4MHBfdjERAHXuBwA%3D&ccb=9-4&oh=00_AYCTUTe7C1dMpXx7N7aF_J4CPParFleqDk_zTRVHpcXD3A&oe=6750A1FC&_nc_sid=8b3546",
                                            "video_view_count": 5279220
                                        }
                                    },
                                    {
                                        "node": {
                                            "__typename": "GraphVideo",
                                            "id": "3505858800740032008",
                                            "shortcode": "DCnUAEiyV4I",
                                            "dimensions": {
                                                "height": 937,
                                                "width": 750
                                            },
                                            "display_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/467762180_18609530896001321_4747826884305279516_n.jpg?stp=dst-jpg_e15&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=VeH4MjpOCaoQ7kNvgFyALTt&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDZ4gKJoHbYbe0wKhGapetzuWkmhCGcE1FvHewqQ0N2xQ&oe=6754C11F&_nc_sid=8b3546",
                                            "edge_media_to_tagged_user": {
                                                "edges": [
                                                    {
                                                        "node": {
                                                            "user": {
                                                                "full_name": "kyan  /  かいあん",
                                                                "followed_by_viewer": false,
                                                                "id": "5045385127",
                                                                "is_verified": false,
                                                                "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/311338745_606807284463736_1142699983768494601_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=iz_DaI7S1cQQ7kNvgH06jCR&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYADUv5Y_jH0lSyirSzo-tREPv2cn3C5BN170Bgc2hSf8w&oe=675494DB&_nc_sid=8b3546",
                                                                "username": "kyanlm"
                                                            },
                                                            "x": 0,
                                                            "y": 0
                                                        }
                                                    },
                                                    {
                                                        "node": {
                                                            "user": {
                                                                "full_name": "issey",
                                                                "followed_by_viewer": false,
                                                                "id": "25946691014",
                                                                "is_verified": false,
                                                                "profile_pic_url": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-19/261437944_223392343259992_896284420506269350_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=104&_nc_ohc=zon7Ba87HTQQ7kNvgGczu18&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAXhVLc7LpS0iMBeUcUD8koGmlYFiSvJRHKyP4ElgKSwA&oe=6754A31E&_nc_sid=8b3546",
                                                                "username": "issey.0503"
                                                            },
                                                            "x": 0,
                                                            "y": 0
                                                        }
                                                    }
                                                ]
                                            },
                                            "fact_check_overall_rating": null,
                                            "fact_check_information": null,
                                            "gating_info": null,
                                            "sharing_friction_info": {
                                                "should_have_sharing_friction": false,
                                                "bloks_app_url": null
                                            },
                                            "media_overlay_info": null,
                                            "media_preview": "ACIqekKty3Jz3Jqwsar0AFZ007MdsJAOcN/9b+tWbd5F4l5z0P8AnFQi2XwMDNPUZGarfaPm2gfmahW4Yy4JAGDTJLlFVjcpnqPzooCxn20JlOQQWHJHqP5H0rVjjUjcw3A+o6H/AB/KqunxHd5nAwDx2yf8BU1xvRiAcK2CfUnGD9KpJLULt6FOeMCRViC++efw68cVoJDH/dX8v61kOcPkDA/me9aSAMo5IwOq/wD6qEgYGxz0YY+lFIYm/wCejfkv+FFKy7Br3LUWAAB+NQ6gwSMMOuQB+P8AhT46q6t/ql/3v6Va1RD0ZEDG4APTAxzTLeTy5MDlCcVnz9R+P9KWP+lS3qVbQ3t4orBzRUXLsf/Z",
                                            "owner": {
                                                "id": "25025320",
                                                "username": "instagram"
                                            },
                                            "is_video": true,
                                            "has_upcoming_event": false,
                                            "accessibility_caption": null,
                                            "dash_info": {
                                                "is_dash_eligible": true,
                                                "video_dash_manifest": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<MPD xmlns=\"urn:mpeg:dash:schema:mpd:2011\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"urn:mpeg:dash:schema:mpd:2011 DASH-MPD.xsd\" profiles=\"urn:mpeg:dash:profile:isoff-on-demand:2011\" minBufferTime=\"PT2S\" type=\"static\" mediaPresentationDuration=\"PT39.006973S\" FBManifestIdentifier=\"FgAYEnIyZXZldnA5LXIxZ2VuMnZwORmWjPieqK7X8wHktoG146OGAoi1xKGlyqUDxq7SnP6vpgPOzoDuktztBICanLDS5KwFqNr418vozwWwkvyhrf2RBqK5pYS6vesJIhgYZGFzaF9sbl9oZWFhY192YnIzX2F1ZGlvAA==\"><Period id=\"0\" duration=\"PT39.006973S\"><AdaptationSet id=\"0\" contentType=\"video\" frameRate=\"29969/1000\" subsegmentAlignment=\"true\" par=\"4:5\" FBUnifiedUploadResolutionMos=\"360:79.9\"><Representation id=\"927065102126404vd\" bandwidth=\"95996\" codecs=\"vp09.00.30.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q20\" FBContentLength=\"468065\" FBPlaybackResolutionMos=\"0:100,360:28.9,480:27.5,720:28.8,1080:33.1\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:58.3,480:48.1,720:34.3,1080:22.8\" FBAbrPolicyTags=\"\" width=\"538\" height=\"674\" FBDefaultQuality=\"1\" FBQualityClass=\"sd\" FBQualityLabel=\"240p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQO3GET5xfFulkzgxnUElAKhH-Gl1fY830yqAAfAsGGrN8kq8UwH7D5AZml50hWgRmBqaM9mBi77NRS_i8CjmjSj.mp4?strext=1&amp;_nc_cat=107&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=9_K8PYf_W_IQ7kNvgHNwJ0z&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTIwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYDiYNmPJDpfkNBc7lX4_Sfcx2G16LXf95Y3_sea0pVwZw&amp;oe=6754AAC0</BaseURL><SegmentBase indexRange=\"818-945\" timescale=\"29969\" FBMinimumPrefetchRange=\"946-3605\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"946-19121\" FBFirstSegmentRange=\"946-68479\" FBFirstSegmentDuration=\"5005\" FBSecondSegmentRange=\"68480-131675\" FBPrefetchSegmentRange=\"946-68479\" FBPrefetchSegmentDuration=\"5005\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"1505860950132352v\" bandwidth=\"180619\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q30\" FBContentLength=\"880677\" FBPlaybackResolutionMos=\"0:100,360:40.8,480:37.7,720:37.2,1080:40.5\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:76.7,480:67.2,720:53.5,1080:40.2\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"270p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQPoOtJ5bhNYuk8kRI2_-W64Q62ZmICs861QyqWsAlbMOI2MNzwxCGq0tpa9eIRg-BFrD6_Cs1IDkdYNgTWfRsKw.mp4?strext=1&amp;_nc_cat=111&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=M5MvSfLZjbkQ7kNvgHZu4L2&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTMwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYBNJRkdJzHpnj13r3lBwcAXWwbsgpVdS7Yf-Ajr6eHcxw&amp;oe=6754BCA0</BaseURL><SegmentBase indexRange=\"818-945\" timescale=\"29969\" FBMinimumPrefetchRange=\"946-4710\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"946-32207\" FBFirstSegmentRange=\"946-127703\" FBFirstSegmentDuration=\"5005\" FBSecondSegmentRange=\"127704-244853\" FBPrefetchSegmentRange=\"946-127703\" FBPrefetchSegmentDuration=\"5005\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"535863515930118v\" bandwidth=\"259594\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q40\" FBContentLength=\"1265748\" FBPlaybackResolutionMos=\"0:100,360:50.3,480:46.1,720:44.3,1080:46.5\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:85.6,480:77.5,720:64.4,1080:51.5\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"360p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQMqaoxhCStWCtDRttlsU2hQgEFLBfXy90rvdiW8aKk8HGnFv1EbKkDH3TOiu-3XxOOT73qUWY-7r8fAVk2C0et-.mp4?strext=1&amp;_nc_cat=101&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=5yDLXoPaaG0Q7kNvgFDJQ1R&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTQwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYBU1xSpluIin14uRhiIn71_i30GWVOI0-1AamyWS81IEA&amp;oe=6754A81E</BaseURL><SegmentBase indexRange=\"818-945\" timescale=\"29969\" FBMinimumPrefetchRange=\"946-5472\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"946-45106\" FBFirstSegmentRange=\"946-183277\" FBFirstSegmentDuration=\"5005\" FBSecondSegmentRange=\"183278-354842\" FBPrefetchSegmentRange=\"946-183277\" FBPrefetchSegmentDuration=\"5005\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"1582894585681556v\" bandwidth=\"388451\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q50\" FBContentLength=\"1894042\" FBPlaybackResolutionMos=\"0:100,360:59.7,480:55.6,720:53,1080:54\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:91.4,480:84.7,720:73.4,1080:61.1\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"480p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQMmonfAbsF-PKgA9alhfuxv-NOf7nT1Dd8PObudP7v6B-JUaNzseVuCDzxmMYjOZS6fEmzRFxPQjo0Vc9B9SayG.mp4?strext=1&amp;_nc_cat=103&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=-sMIsrs86IcQ7kNvgG2ge6X&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTUwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYATs-8Bp2m-fWQm_fktq6pSuSiB-7WryB6zQgdAFcp8lQ&amp;oe=67549FAC</BaseURL><SegmentBase indexRange=\"818-945\" timescale=\"29969\" FBMinimumPrefetchRange=\"946-6505\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"946-65442\" FBFirstSegmentRange=\"946-273025\" FBFirstSegmentDuration=\"5005\" FBSecondSegmentRange=\"273026-533343\" FBPrefetchSegmentRange=\"946-273025\" FBPrefetchSegmentDuration=\"5005\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"2769626039889489v\" bandwidth=\"570806\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q60\" FBContentLength=\"2783179\" FBPlaybackResolutionMos=\"0:100,360:68.4,480:64.3,720:61.1,1080:61.1\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:96.2,480:91.5,720:81.8,1080:70.8\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"540p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQMwm9fjGrhPHhgPMfCC4ZZlJdvpIHQD8VC8T9WPt5EJqPTySXnBej8G4AYNQ_LieQlmPPb_1VklzYSXQm0swzNo.mp4?strext=1&amp;_nc_cat=106&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=vjhhZoq8-doQ7kNvgGJi3nQ&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTYwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYDTLAqTerTRXx-pqgaqu8Is64jl3G5IrFH3MhsgdX6JZg&amp;oe=675499CF</BaseURL><SegmentBase indexRange=\"818-945\" timescale=\"29969\" FBMinimumPrefetchRange=\"946-7852\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"946-90356\" FBFirstSegmentRange=\"946-394880\" FBFirstSegmentDuration=\"5005\" FBSecondSegmentRange=\"394881-776836\" FBPrefetchSegmentRange=\"946-394880\" FBPrefetchSegmentDuration=\"5005\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"1367176520930215v\" bandwidth=\"796295\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q70\" FBContentLength=\"3882636\" FBPlaybackResolutionMos=\"0:100,360:75,480:71.4,720:68.2,1080:67.6\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:98.16,480:96.3,720:89,1080:79.8\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"640p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQOzmehmgeJFDUR6djR3ztd_Y25FlX97K6CaoQbb_wu8uGF4Q8pSODYONLfG-OzJMKwLD7e6d8uYpuYN7JyOe-lw.mp4?strext=1&amp;_nc_cat=104&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=rW-ZMt8aBBQQ7kNvgEKMR7h&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTcwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYAy0ua2NeHBrS_iMBU0UnfIXIX_yIzgUUjqRWNqq2_o8w&amp;oe=67549465</BaseURL><SegmentBase indexRange=\"818-945\" timescale=\"29969\" FBMinimumPrefetchRange=\"946-9176\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"946-119261\" FBFirstSegmentRange=\"946-537705\" FBFirstSegmentDuration=\"5005\" FBSecondSegmentRange=\"537706-1073544\" FBPrefetchSegmentRange=\"946-537705\" FBPrefetchSegmentDuration=\"5005\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"576758731517362v\" bandwidth=\"1097801\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q80\" FBContentLength=\"5352738\" FBPlaybackResolutionMos=\"0:100,360:80.1,480:76.4,720:73.5,1080:72.4\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:99.118,480:98.16,720:94.4,1080:86.8\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"720p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQOI4EPDGE26PrOBSJdUr245qFf_F3jiViEp2a8xbLp0lVFTGDXy1rzBTB7YrBv6EoUsIs8li_6b0VpiVanSY_uy.mp4?strext=1&amp;_nc_cat=101&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=px6a07ot4HYQ7kNvgFFQVnj&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTgwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYDeLaeYviZHfx17n35iTH2LNl0SQRiyqJtjtZAY-pNP8A&amp;oe=6754A0DA</BaseURL><SegmentBase indexRange=\"818-945\" timescale=\"29969\" FBMinimumPrefetchRange=\"946-10892\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"946-162649\" FBFirstSegmentRange=\"946-725107\" FBFirstSegmentDuration=\"5005\" FBSecondSegmentRange=\"725108-1460577\" FBPrefetchSegmentRange=\"946-725107\" FBPrefetchSegmentDuration=\"5005\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"1728386814674072v\" bandwidth=\"1645614\" codecs=\"vp09.00.40.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q90\" FBContentLength=\"8023803\" FBPlaybackResolutionMos=\"0:100,360:85.1,480:81.6,720:77.7,1080:76.8\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:99.452,480:99.164,720:97.7,1080:93.3\" FBAbrPolicyTags=\"avoid_on_cellular,avoid_on_cellular_intentional\" width=\"1080\" height=\"1350\" FBQualityClass=\"hd\" FBQualityLabel=\"1080p\"><BaseURL>https://scontent-atl3-3.cdninstagram.com/o1/v/t16/f2/m69/AQMFfcwtuJR8o0d_GdtRRr5rcDfNial-81j1_dRoo_cU6ZIWXr084XCCXommx6M0taNb104Xqs4zlN6iH-MoSgrm.mp4?strext=1&amp;_nc_cat=109&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-3.cdninstagram.com&amp;_nc_ohc=DjDfMAoHQ3sQ7kNvgE8YaSt&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTkwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYD8jD3IUW69mfjKgxrTXNuNFUO-Ff5l4sIkcn3bTFVWxA&amp;oe=6754C4EA</BaseURL><SegmentBase indexRange=\"818-945\" timescale=\"29969\" FBMinimumPrefetchRange=\"946-14004\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"946-231887\" FBFirstSegmentRange=\"946-1047091\" FBFirstSegmentDuration=\"5005\" FBSecondSegmentRange=\"1047092-2143557\" FBPrefetchSegmentRange=\"946-1047091\" FBPrefetchSegmentDuration=\"5005\"><Initialization range=\"0-817\"/></SegmentBase></Representation></AdaptationSet><AdaptationSet id=\"1\" contentType=\"audio\" subsegmentStartsWithSAP=\"1\" subsegmentAlignment=\"true\"><Representation id=\"928812209163171ad\" bandwidth=\"90992\" codecs=\"mp4a.40.5\" mimeType=\"audio/mp4\" FBAvgBitrate=\"90992\" audioSamplingRate=\"44100\" FBEncodingTag=\"dash_ln_heaac_vbr3_audio\" FBContentLength=\"444243\" FBAbrPolicyTags=\"\" FBDefaultQuality=\"1\"><AudioChannelConfiguration schemeIdUri=\"urn:mpeg:dash:23003:3:audio_channel_configuration:2011\" value=\"2\"/><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQOrpyPzYz1hA7gne9Bg7nJGHCzUkcX8DXcrrSqgGmbgvAwrH_BtcydPpPOc_A8ZrKBKo9rYVumgjoatJtHA_4Dm.mp4?strext=1&amp;_nc_cat=111&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=CK_l4nEeOQwQ7kNvgGt9-0f&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9sbl9oZWFhY192YnIzX2F1ZGlvIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYDRSAJzexwbB01HzSmr74m4x1vmEgdOKZ5TTHjMWqMfdw&amp;oe=6754C160</BaseURL><SegmentBase indexRange=\"824-1095\" timescale=\"44100\" FBMinimumPrefetchRange=\"1096-1469\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"1096-17534\" FBFirstSegmentRange=\"1096-30289\" FBFirstSegmentDuration=\"2021\" FBSecondSegmentRange=\"30290-50871\" FBPrefetchSegmentRange=\"1096-50871\" FBPrefetchSegmentDuration=\"4017\"><Initialization range=\"0-823\"/></SegmentBase></Representation></AdaptationSet></Period></MPD>\n",
                                                "number_of_qualities": 8
                                            },
                                            "has_audio": false,
                                            "tracking_token": "eyJ2ZXJzaW9uIjo1LCJwYXlsb2FkIjp7ImlzX2FuYWx5dGljc190cmFja2VkIjp0cnVlLCJ1dWlkIjoiYmM1MmYwZDVhMzU1NDI1Y2ExODI0ZWFjOGNmZTRlNzUzNTA1ODU4ODAwNzQwMDMyMDA4In0sInNpZ25hdHVyZSI6IiJ9",
                                            "video_url": "https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQOb4_JVTU0aiZ5TxSkD61Txn0BWkrxHl8_eLONv3idLkBha8mF0tuvCaiWwu1NZab_lkxU_dVf1eKMPFYuC-TW4.mp4?stp=dst-mp4&efg=eyJxZV9ncm91cHMiOiJbXCJpZ193ZWJfZGVsaXZlcnlfdnRzX290ZlwiXSIsInZlbmNvZGVfdGFnIjoidnRzX3ZvZF91cmxnZW4uY2Fyb3VzZWxfaXRlbS5jMi4xMDgwLmJhc2VsaW5lIn0&_nc_cat=103&vs=1113907987071911_1127977587&_nc_vs=HBksFQIYOnBhc3N0aHJvdWdoX2V2ZXJzdG9yZS9HTE9mUWdjM2lWc1U4Ym9FQU9aR1Z4Y3BLQlVSYnBSMUFBQUYVAALIAQAVAhg6cGFzc3Rocm91Z2hfZXZlcnN0b3JlL0dQQ1QzeHV2U3pGY0M3NEJBRmJuQURMbWw5a0pia1lMQUFBRhUCAsgBACgAGAAbABUAACa87NuW3bezQBUCKAJDMywXQEOAxJul41QYFmRhc2hfYmFzZWxpbmVfMTA4MHBfdjERAHXuBwA%3D&ccb=9-4&oh=00_AYA6M41QtP6Ke61NIo1Oz6KqPPPDJSfWStEneXTmZ9Brrg&oe=6750B9EA&_nc_sid=8b3546",
                                            "video_view_count": 3125797
                                        }
                                    },
                                    {
                                        "node": {
                                            "__typename": "GraphVideo",
                                            "id": "3505858800303873536",
                                            "shortcode": "DCnUAEIyh4A",
                                            "dimensions": {
                                                "height": 937,
                                                "width": 750
                                            },
                                            "display_url": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-15/467969179_18609530923001321_3890236956819402832_n.jpg?stp=dst-jpg_e15&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=105&_nc_ohc=Tu-XCo1AclMQ7kNvgE2aE_l&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBOtDWrw04WBzMC3F0U0htdJCfsJbzfqHsqzwWgU9bjpQ&oe=6754B328&_nc_sid=8b3546",
                                            "edge_media_to_tagged_user": {
                                                "edges": [
                                                    {
                                                        "node": {
                                                            "user": {
                                                                "full_name": "kyan  /  かいあん",
                                                                "followed_by_viewer": false,
                                                                "id": "5045385127",
                                                                "is_verified": false,
                                                                "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/311338745_606807284463736_1142699983768494601_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=iz_DaI7S1cQQ7kNvgH06jCR&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYADUv5Y_jH0lSyirSzo-tREPv2cn3C5BN170Bgc2hSf8w&oe=675494DB&_nc_sid=8b3546",
                                                                "username": "kyanlm"
                                                            },
                                                            "x": 0,
                                                            "y": 0
                                                        }
                                                    }
                                                ]
                                            },
                                            "fact_check_overall_rating": null,
                                            "fact_check_information": null,
                                            "gating_info": null,
                                            "sharing_friction_info": {
                                                "should_have_sharing_friction": false,
                                                "bloks_app_url": null
                                            },
                                            "media_overlay_info": null,
                                            "media_preview": "ACIqkLSO/lqMYGTnjg/rUy2an75Lew6UoH+kv7KtPuLlLddz556ACp5erHzdEEahcgccn60/A9M/X/P9Kjt5VlUuh+Vj+NSnHqT/AJ9qLaBcMN7frRSYHoaKVh3I0/4+JOvRf5VT1CWPIjcckdf6fjirUT5nlPuv8qp6hAzMJVAIC4Of6D19+1adPvIW5Hp1wE/c4HJODnv71rFn7Y/WuctomDq2OSQfTAH8+K3GkHv+tSU9yXMnqv60VBvHqfzNFH9bgZ1tNIOWHzHqfWrE8paNgaKjl+4fw/nUrcb2HmUBQw6//WFMFzntUA+6v0/pTR0ok2tuwRSZb+0D0oqrRUczKsj/2Q==",
                                            "owner": {
                                                "id": "25025320",
                                                "username": "instagram"
                                            },
                                            "is_video": true,
                                            "has_upcoming_event": false,
                                            "accessibility_caption": null,
                                            "dash_info": {
                                                "is_dash_eligible": true,
                                                "video_dash_manifest": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<MPD xmlns=\"urn:mpeg:dash:schema:mpd:2011\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"urn:mpeg:dash:schema:mpd:2011 DASH-MPD.xsd\" profiles=\"urn:mpeg:dash:profile:isoff-on-demand:2011\" minBufferTime=\"PT2S\" type=\"static\" mediaPresentationDuration=\"PT14.9S\" FBManifestIdentifier=\"FgAYEnIyZXZldnA5LXIxZ2VuMnZwORl2mu7F7LXskwL2xc3MvLz2Apy/toTHqKIDoODLu4nzgQSE54fMwq6UBviEycHc5aAG3vyVn6PDlwoiGB5kdW1teV90YWdzZXRfZm9yX2ZhbGxiYWNrX2xpc3QA\"><Period id=\"0\" duration=\"PT14.9S\"><AdaptationSet id=\"0\" contentType=\"video\" frameRate=\"15360/512\" subsegmentAlignment=\"true\" par=\"4:5\" FBUnifiedUploadResolutionMos=\"360:82.5\"><Representation id=\"1130075885500432vd\" bandwidth=\"101576\" codecs=\"vp09.00.30.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q30\" FBContentLength=\"189186\" FBPlaybackResolutionMos=\"0:100,360:30.5,480:27.2,720:25,1080:26.3\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:73.8,480:65.2,720:52.8,1080:41.4\" FBAbrPolicyTags=\"\" width=\"538\" height=\"674\" FBDefaultQuality=\"1\" FBQualityClass=\"sd\" FBQualityLabel=\"270p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQPHryMzr-3vAIAhqksyIxo_YOJRVxU-sxpaQHgYiuq3mIwGykv1iR73Tv77hEIp4v0RDekVRe4iPk3DAZHQ7NNz.mp4?strext=1&amp;_nc_cat=108&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=99GQ61USgHwQ7kNvgGkPxEX&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTMwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYAyYzYnBaoPal5FzKB-0fxZeLWmEztigklkPei8XdjQSQ&amp;oe=67549219</BaseURL><SegmentBase indexRange=\"818-885\" timescale=\"15360\" FBMinimumPrefetchRange=\"886-6729\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"886-10811\" FBFirstSegmentRange=\"886-50886\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"50887-127175\" FBPrefetchSegmentRange=\"886-50886\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"1733629537483202v\" bandwidth=\"186489\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q40\" FBContentLength=\"347337\" FBPlaybackResolutionMos=\"0:100,360:39.3,480:35,720:32.2,1080:32.2\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:85.7,480:79.1,720:68.2,1080:56.9\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"360p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQOxKq5t0Ic26VNDaQpbIzZbWF14WjYWhmG0jhsSv28moeBgTcx2m98O_2SI-RqMWZStk66zlsaP_yqMnJSTNlj_.mp4?strext=1&amp;_nc_cat=108&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=LSb-Z0BeVlkQ7kNvgGA73Hx&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTQwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYB90zEMEeooi6tOpIIWx_tnzztupg5GIYfzixhKarjQzA&amp;oe=6754A015</BaseURL><SegmentBase indexRange=\"818-885\" timescale=\"15360\" FBMinimumPrefetchRange=\"886-9239\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"886-16821\" FBFirstSegmentRange=\"886-93618\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"93619-236980\" FBPrefetchSegmentRange=\"886-93618\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"823473623118203v\" bandwidth=\"296825\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q50\" FBContentLength=\"552837\" FBPlaybackResolutionMos=\"0:100,360:47.6,480:42.8,720:38.6,1080:37.7\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:93.1,480:89,720:81.1,1080:71.4\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"480p\"><BaseURL>https://scontent-atl3-3.cdninstagram.com/o1/v/t16/f2/m69/AQM5bLaj9QhSNHrqKC6lWg3YEm4OQqUYUCpZZBIUxktmadWux3JJIwOGpF3jIhBOwd2pMousmy1HfKyLxVbLChxD.mp4?strext=1&amp;_nc_cat=109&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-3.cdninstagram.com&amp;_nc_ohc=aVKqaKxrLLEQ7kNvgHmUznL&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTUwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYDdjF9mQBSOEgFv9EzSo2RElYxCpn-k3AKRfvSF7QmDgw&amp;oe=6754C49A</BaseURL><SegmentBase indexRange=\"818-885\" timescale=\"15360\" FBMinimumPrefetchRange=\"886-12196\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"886-24481\" FBFirstSegmentRange=\"886-149855\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"149856-383014\" FBPrefetchSegmentRange=\"886-149855\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"1760966188015932v\" bandwidth=\"464437\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q60\" FBContentLength=\"865014\" FBPlaybackResolutionMos=\"0:100,360:54.9,480:50.4,720:45.4,1080:44.1\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:96.9,480:94.8,720:89.9,1080:82.1\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"540p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQOKNVSwOTN62hB2DQ_Gtubgz4eIKhycxAhhAg2gBdVI5LRFwMjwN60OTAIXIlySQoOr2vcz8LEh1-AWGfruT2ak.mp4?strext=1&amp;_nc_cat=104&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=vMYCeIKk6ioQ7kNvgEwPQZv&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTYwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYBjMItr15GOSNYMZbguJ6Out9Ca8rlO9FnlgPERYeaRtQ&amp;oe=6754B4FD</BaseURL><SegmentBase indexRange=\"818-885\" timescale=\"15360\" FBMinimumPrefetchRange=\"886-15912\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"886-35778\" FBFirstSegmentRange=\"886-236141\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"236142-605131\" FBPrefetchSegmentRange=\"886-236141\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"919888449687502v\" bandwidth=\"689220\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q70\" FBContentLength=\"1283673\" FBPlaybackResolutionMos=\"0:100,360:60.7,480:56.9,720:52.8,1080:50.8\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:98.27,480:97.4,720:94.5,1080:89.1\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"640p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQM421eMY_rNLWhNIG-Fr8pKmsdcBWrhobnsY3GZMuLk9h1VXGgDbzHRlJfUUVQ8tQTYqvY9lzUlkb8ZmqmZ2eCg.mp4?strext=1&amp;_nc_cat=105&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=g4mNoXGNcvEQ7kNvgFxb1TV&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTcwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYAncdSbO6NbTzX8I0_ckBrXxrHLkD2VAwy6LURd02Eozw&amp;oe=6754A166</BaseURL><SegmentBase indexRange=\"818-885\" timescale=\"15360\" FBMinimumPrefetchRange=\"886-19953\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"886-51575\" FBFirstSegmentRange=\"886-354408\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"354409-903117\" FBPrefetchSegmentRange=\"886-354408\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"2866483083525935v\" bandwidth=\"971864\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q80\" FBContentLength=\"1810097\" FBPlaybackResolutionMos=\"0:100,360:64.8,480:62,720:58.2,1080:56.2\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:98.7,480:98.33,720:97,1080:93.5\" FBAbrPolicyTags=\"avoid_on_cellular,avoid_on_cellular_intentional\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"720p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQOuSzuwn3iY-IyBuTtFDq5_wiZ04h7ee_KV6et2efD4dWCBAZ2Rau4jismxJ_7ABjZT7XP0DuriSD-B9fKLe6Ks.mp4?strext=1&amp;_nc_cat=106&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=mAXDCMEmfrAQ7kNvgHr81-I&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTgwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYCcxv6F1gbzFXmFiMWuJz55_q-B_Cevs_dOqqv-ZzpyMg&amp;oe=67549867</BaseURL><SegmentBase indexRange=\"818-885\" timescale=\"15360\" FBMinimumPrefetchRange=\"886-22450\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"886-77705\" FBFirstSegmentRange=\"886-509547\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"509548-1280365\" FBPrefetchSegmentRange=\"886-509547\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"606594048506765v\" bandwidth=\"1397913\" codecs=\"vp09.00.40.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q90\" FBContentLength=\"2603613\" FBPlaybackResolutionMos=\"0:100,360:67.4,480:65.4,720:62.7,1080:61.7\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:98.87,480:98.64,720:97.9,1080:96.4\" FBAbrPolicyTags=\"avoid_on_cellular,avoid_on_cellular_intentional\" width=\"1080\" height=\"1350\" FBQualityClass=\"hd\" FBQualityLabel=\"1080p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQMUSzu_YwM1A3LYmCQKh6FhtajOjCJdPXCQts0gEc_j-z4QqOSd1EHNNmRM5KJWyhVyb-I4l-89ZZLqcQLTODfD.mp4?strext=1&amp;_nc_cat=100&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=Nnei3cuxIi8Q7kNvgHMqc6X&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTkwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYDQgri_XnLLgz7IqzHi8Ry8orq6U0ujd8q7wdMaTVG7ng&amp;oe=6754960D</BaseURL><SegmentBase indexRange=\"818-885\" timescale=\"15360\" FBMinimumPrefetchRange=\"886-27492\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"886-104333\" FBFirstSegmentRange=\"886-737573\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"737574-1835152\" FBPrefetchSegmentRange=\"886-737573\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation></AdaptationSet></Period></MPD>\n",
                                                "number_of_qualities": 7
                                            },
                                            "has_audio": false,
                                            "tracking_token": "eyJ2ZXJzaW9uIjo1LCJwYXlsb2FkIjp7ImlzX2FuYWx5dGljc190cmFja2VkIjp0cnVlLCJ1dWlkIjoiYmM1MmYwZDVhMzU1NDI1Y2ExODI0ZWFjOGNmZTRlNzUzNTA1ODU4ODAwMzAzODczNTM2In0sInNpZ25hdHVyZSI6IiJ9",
                                            "video_url": "https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQPiLkpGBA_5fV2HQZgt68ujDbsWRGcXI-Tjlc7aguQM4PCKtizBTU0lfoxeDnea4sNeryqKcuEZxriD4CkzujXl.mp4?stp=dst-mp4&efg=eyJxZV9ncm91cHMiOiJbXCJpZ193ZWJfZGVsaXZlcnlfdnRzX290ZlwiXSIsInZlbmNvZGVfdGFnIjoidnRzX3ZvZF91cmxnZW4uY2Fyb3VzZWxfaXRlbS5jMi4xMDgwLmJhc2VsaW5lIn0&_nc_cat=110&vs=422533827578171_3430983621&_nc_vs=HBkcFQIYOnBhc3N0aHJvdWdoX2V2ZXJzdG9yZS9HSVgyMlJJc2xyZ2l6VkVFQUM1Sm5JOTBfZzhyYnBSMUFBQUYVAALIAQAoABgAGwAVAAAmvMr2wrahgUAVAigCQzMsF0AtzMzMzMzNGBZkYXNoX2Jhc2VsaW5lXzEwODBwX3YxEQB17gcA&ccb=9-4&oh=00_AYBo2NMHV2vqvrqHpTbjmNwOUxLArW-UreaUk6eBCh4iJA&oe=6750A8F5&_nc_sid=8b3546",
                                            "video_view_count": 195296
                                        }
                                    },
                                    {
                                        "node": {
                                            "__typename": "GraphVideo",
                                            "id": "3505858941534517396",
                                            "shortcode": "DCnUCHqyriU",
                                            "dimensions": {
                                                "height": 937,
                                                "width": 750
                                            },
                                            "display_url": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-15/467744738_18609530944001321_2900935261326010068_n.jpg?stp=dst-jpg_e15&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=105&_nc_ohc=fVGoDD7JACsQ7kNvgGUk_6X&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYA6xz_V-dSjhDl44_fesr9BYChSdGGVXrP4B_uUyy8aSA&oe=6754B6CD&_nc_sid=8b3546",
                                            "edge_media_to_tagged_user": {
                                                "edges": [
                                                    {
                                                        "node": {
                                                            "user": {
                                                                "full_name": "kyan  /  かいあん",
                                                                "followed_by_viewer": false,
                                                                "id": "5045385127",
                                                                "is_verified": false,
                                                                "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/311338745_606807284463736_1142699983768494601_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=iz_DaI7S1cQQ7kNvgH06jCR&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYADUv5Y_jH0lSyirSzo-tREPv2cn3C5BN170Bgc2hSf8w&oe=675494DB&_nc_sid=8b3546",
                                                                "username": "kyanlm"
                                                            },
                                                            "x": 0,
                                                            "y": 0
                                                        }
                                                    }
                                                ]
                                            },
                                            "fact_check_overall_rating": null,
                                            "fact_check_information": null,
                                            "gating_info": null,
                                            "sharing_friction_info": {
                                                "should_have_sharing_friction": false,
                                                "bloks_app_url": null
                                            },
                                            "media_overlay_info": null,
                                            "media_preview": "ACIqzFBVjk5HbNQICzcZ6dq2bmAxr83HPX/9XrUFmpyUGDwfapvpcu2trkEYZBk9q0LSQFth79PriobiFtoIYZ6DHfmmRQHIOCpHc00xSjbQ1d0fvRVPZcdiuPxop38ybLsWr0BhtJ5xn8M4qjaoWKsDyxwP8abfzB5AVPyhRz255qSJsqjqc4wR+FIYt2skRAGQT0Jwfr+AqaKUNweCfyqBpCzgyHP1/wA9KJCA3y9KVgbvqWNx9TRVXJoosLmMneXBOOFxmrFiTtYfw5FQ2/8AX+lX4uh/32q2IkySM59qeOc5HIqMEjpxzT+/4D+dSAmKKz3+8fqaKCT/2Q==",
                                            "owner": {
                                                "id": "25025320",
                                                "username": "instagram"
                                            },
                                            "is_video": true,
                                            "has_upcoming_event": false,
                                            "accessibility_caption": null,
                                            "dash_info": {
                                                "is_dash_eligible": true,
                                                "video_dash_manifest": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<MPD xmlns=\"urn:mpeg:dash:schema:mpd:2011\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"urn:mpeg:dash:schema:mpd:2011 DASH-MPD.xsd\" profiles=\"urn:mpeg:dash:profile:isoff-on-demand:2011\" minBufferTime=\"PT2S\" type=\"static\" mediaPresentationDuration=\"PT12.05171S\" FBManifestIdentifier=\"FgAYEnIyZXZldnA5LXIxZ2VuMnZwORlm3qyksuPq0gGuy4HQsL/sA4i1oP6Fi6wEnv2il8ypjgaatfWv69T6Bp7975zAtOQeIhgYZGFzaF9sbl9oZWFhY192YnIzX2F1ZGlvAA==\"><Period id=\"0\" duration=\"PT12.05171S\"><AdaptationSet id=\"0\" contentType=\"video\" frameRate=\"19184/800\" subsegmentAlignment=\"true\" par=\"4:5\" FBUnifiedUploadResolutionMos=\"360:84.4\"><Representation id=\"463629290081071vd\" bandwidth=\"722730\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q50\" FBContentLength=\"1088768\" FBPlaybackResolutionMos=\"0:100,360:25.6,480:22,720:19,1080:18.1\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:95.2,480:91.3,720:80.9,1080:68.2\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBDefaultQuality=\"1\" FBQualityClass=\"hd\" FBQualityLabel=\"480p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQPxfKXdZ-AU9cnoeXxb5rsxYqoWEsdV3hq3cme2EX78Y1KgbuOZpu3dYsxGBJl7ZCJFRirMdyDypkfgiAZv-XeC.mp4?strext=1&amp;_nc_cat=102&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=KU1aT39uzxwQ7kNvgFb2xzf&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTUwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYAsQZYVR5D_OzLZySSPQBqde6sH-TuEq2W6zCoyQhJP6Q&amp;oe=6754C627</BaseURL><SegmentBase indexRange=\"818-885\" timescale=\"19184\" FBMinimumPrefetchRange=\"886-14499\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"886-127384\" FBFirstSegmentRange=\"886-441967\" FBFirstSegmentDuration=\"5004\" FBSecondSegmentRange=\"441968-899598\" FBPrefetchSegmentRange=\"886-441967\" FBPrefetchSegmentDuration=\"5004\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"8665053600284495v\" bandwidth=\"1117788\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q60\" FBContentLength=\"1683908\" FBPlaybackResolutionMos=\"0:100,360:31.8,480:28.3,720:23.9,1080:22.8\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:98.23,480:96.5,720:90.2,1080:79.5\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"540p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQO0q_4Bn0u7Z6z86t5U6yN2PW4KOQeWn6tnnfDHeLxhHvpFkKEhAo0bCm3gLaGLJex-h905sQB9REM9que_JNDK.mp4?strext=1&amp;_nc_cat=110&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=s8KTHB1gtp8Q7kNvgEqm8Bo&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTYwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYCM7fndYrJAU_hyJHMiyNZEoZYYyipLaZo8DHOIiXLAng&amp;oe=67549777</BaseURL><SegmentBase indexRange=\"818-885\" timescale=\"19184\" FBMinimumPrefetchRange=\"886-20433\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"886-192626\" FBFirstSegmentRange=\"886-697145\" FBFirstSegmentDuration=\"5004\" FBSecondSegmentRange=\"697146-1393370\" FBPrefetchSegmentRange=\"886-697145\" FBPrefetchSegmentDuration=\"5004\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"1083008299840215v\" bandwidth=\"1563712\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q70\" FBContentLength=\"2355676\" FBPlaybackResolutionMos=\"0:100,360:35.2,480:32.6,720:29.1,1080:27.4\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:99.107,480:98.35,720:95.1,1080:86.8\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"640p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQNPFjSZx5hbRAQmUrZPzpKyK1dT0B00h7ZoRPLaEa7T_KykPzUgoD9Wj_I96twC-rqI7eDyKfYE9GQfkJBcmbs7.mp4?strext=1&amp;_nc_cat=104&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=x5CMNK8GL6QQ7kNvgFWthk4&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTcwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYCXuu_rWMSGZDYd3ue0ikocgvmyHs57zjcRFB4ZTfHPGw&amp;oe=67549565</BaseURL><SegmentBase indexRange=\"818-885\" timescale=\"19184\" FBMinimumPrefetchRange=\"886-26341\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"886-263931\" FBFirstSegmentRange=\"886-986733\" FBFirstSegmentDuration=\"5004\" FBSecondSegmentRange=\"986734-1951061\" FBPrefetchSegmentRange=\"886-986733\" FBPrefetchSegmentDuration=\"5004\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"1720350785429327v\" bandwidth=\"2205231\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q80\" FBContentLength=\"3322102\" FBPlaybackResolutionMos=\"0:100,360:38.9,480:36.2,720:33.4,1080:32\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:99.35,480:99.178,720:97.5,1080:92.7\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"720p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQPMDT5i-__OkZESoon-f7nWkwNClSzTiQQCfMbnT55d2rZTzkQ6CiCzTABVhGG2IKD4bPH50Jd1RGSa_07NCbCu.mp4?strext=1&amp;_nc_cat=104&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=T4GW7vLqrz0Q7kNvgHtTQva&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTgwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYAVxhmNRbdGHmIcpJwJDasD9Ytnbn5e2KDv9ifaw3purA&amp;oe=6754C5B5</BaseURL><SegmentBase indexRange=\"818-885\" timescale=\"19184\" FBMinimumPrefetchRange=\"886-34368\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"886-364205\" FBFirstSegmentRange=\"886-1406375\" FBFirstSegmentDuration=\"5004\" FBSecondSegmentRange=\"1406376-2753591\" FBPrefetchSegmentRange=\"886-1406375\" FBPrefetchSegmentDuration=\"5004\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"1222846712122692v\" bandwidth=\"3284130\" codecs=\"vp09.00.40.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q90\" FBContentLength=\"4947424\" FBPlaybackResolutionMos=\"0:100,360:42.1,480:40.6,720:38.5,1080:37.7\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:99.447,480:99.31,720:98.88,1080:96.8\" FBAbrPolicyTags=\"avoid_on_cellular,avoid_on_cellular_intentional\" width=\"1080\" height=\"1350\" FBQualityClass=\"hd\" FBQualityLabel=\"1080p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQNDqQ1riG-d7w8N0l2iw9HUUziLXikIVlS1vjRBEwZbkMyERvUS4jG_WKbcZfGVFvsS4ek4pE7VNy0hgSSYtepb.mp4?strext=1&amp;_nc_cat=107&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=573Uq4x8szQQ7kNvgEjS6J9&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTkwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYBok_q7Htpr4CKrVfQXAtt2uCbxqVZioNrNDH6lBz1e4g&amp;oe=6754966C</BaseURL><SegmentBase indexRange=\"818-885\" timescale=\"19184\" FBMinimumPrefetchRange=\"886-48502\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"886-525463\" FBFirstSegmentRange=\"886-2125278\" FBFirstSegmentDuration=\"5004\" FBSecondSegmentRange=\"2125279-4101809\" FBPrefetchSegmentRange=\"886-2125278\" FBPrefetchSegmentDuration=\"5004\"><Initialization range=\"0-817\"/></SegmentBase></Representation></AdaptationSet><AdaptationSet id=\"1\" contentType=\"audio\" subsegmentStartsWithSAP=\"1\" subsegmentAlignment=\"true\"><Representation id=\"1958588217994573ad\" bandwidth=\"96792\" codecs=\"mp4a.40.5\" mimeType=\"audio/mp4\" FBAvgBitrate=\"96792\" audioSamplingRate=\"44100\" FBEncodingTag=\"dash_ln_heaac_vbr3_audio\" FBContentLength=\"146448\" FBAbrPolicyTags=\"\" FBDefaultQuality=\"1\"><AudioChannelConfiguration schemeIdUri=\"urn:mpeg:dash:23003:3:audio_channel_configuration:2011\" value=\"2\"/><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQMKNgNSaukeXBnTPa5tXxDJYClhf3qYuc7DSxnwLOZOKR-_IViAAaaj8LoZfRjzkkEDp00bTqH7OtLjU3b43rgA.mp4?strext=1&amp;_nc_cat=108&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=AaVzw0ejczgQ7kNvgGpRfr6&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9sbl9oZWFhY192YnIzX2F1ZGlvIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYBzCSKOMbKraGX-sjfgNreEgBQ9SfiS2LZ987hkZMy2NA&amp;oe=675494F5</BaseURL><SegmentBase indexRange=\"824-939\" timescale=\"44100\" FBMinimumPrefetchRange=\"940-1283\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"940-14034\" FBFirstSegmentRange=\"940-27969\" FBFirstSegmentDuration=\"2021\" FBSecondSegmentRange=\"27970-52837\" FBPrefetchSegmentRange=\"940-52837\" FBPrefetchSegmentDuration=\"4017\"><Initialization range=\"0-823\"/></SegmentBase></Representation></AdaptationSet></Period></MPD>\n",
                                                "number_of_qualities": 5
                                            },
                                            "has_audio": false,
                                            "tracking_token": "eyJ2ZXJzaW9uIjo1LCJwYXlsb2FkIjp7ImlzX2FuYWx5dGljc190cmFja2VkIjp0cnVlLCJ1dWlkIjoiYmM1MmYwZDVhMzU1NDI1Y2ExODI0ZWFjOGNmZTRlNzUzNTA1ODU4OTQxNTM0NTE3Mzk2In0sInNpZ25hdHVyZSI6IiJ9",
                                            "video_url": "https://scontent-atl3-3.cdninstagram.com/o1/v/t16/f2/m69/AQP8dla5hpb-5sM3ECB6_4KM8yvVUfVkOjcVwZrhq56kLoYR0mnYfJMwg8aUjeAt8mLeFf7QqBgj4gU7lXO69e4s.mp4?stp=dst-mp4&efg=eyJxZV9ncm91cHMiOiJbXCJpZ193ZWJfZGVsaXZlcnlfdnRzX290ZlwiXSIsInZlbmNvZGVfdGFnIjoidnRzX3ZvZF91cmxnZW4uY2Fyb3VzZWxfaXRlbS5jMi4xMDgwLmJhc2VsaW5lIn0&_nc_cat=109&vs=594541503231852_4676990&_nc_vs=HBksFQIYOnBhc3N0aHJvdWdoX2V2ZXJzdG9yZS9HRkdUSkFkbXhGbFNBLVFEQUI0VHgxQ1hrOUVqYnBSMUFBQUYVAALIAQAVAhg6cGFzc3Rocm91Z2hfZXZlcnN0b3JlL0dEV0o0UnNQenZ2T2dkY0RBT0t4c2x6TDVQY3Via1lMQUFBRhUCAsgBACgAGAAbABUAACa6por87smTQBUCKAJDMywXQCgaHKwIMScYFmRhc2hfYmFzZWxpbmVfMTA4MHBfdjERAHXuBwA%3D&ccb=9-4&oh=00_AYAe4WFWq4bXbA6p3fATBkw5gte1ykCl9vIaoIQ90mg6_Q&oe=6750AB24&_nc_sid=8b3546",
                                            "video_view_count": 83344
                                        }
                                    },
                                    {
                                        "node": {
                                            "__typename": "GraphVideo",
                                            "id": "3505859225170197686",
                                            "shortcode": "DCnUGP0y7y2",
                                            "dimensions": {
                                                "height": 937,
                                                "width": 750
                                            },
                                            "display_url": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-15/468021553_18609531040001321_1135896801188682771_n.jpg?stp=dst-jpg_e15_tt6&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=105&_nc_ohc=wE3n71Vg3KoQ7kNvgFkOXzn&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDPu7MoLSVlv51QAu_VWDtxiC_r8mxe3xYtoecmw7UknQ&oe=6754BD46&_nc_sid=8b3546",
                                            "edge_media_to_tagged_user": {
                                                "edges": [
                                                    {
                                                        "node": {
                                                            "user": {
                                                                "full_name": "kyan  /  かいあん",
                                                                "followed_by_viewer": false,
                                                                "id": "5045385127",
                                                                "is_verified": false,
                                                                "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/311338745_606807284463736_1142699983768494601_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=iz_DaI7S1cQQ7kNvgH06jCR&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYADUv5Y_jH0lSyirSzo-tREPv2cn3C5BN170Bgc2hSf8w&oe=675494DB&_nc_sid=8b3546",
                                                                "username": "kyanlm"
                                                            },
                                                            "x": 0,
                                                            "y": 0
                                                        }
                                                    },
                                                    {
                                                        "node": {
                                                            "user": {
                                                                "full_name": "yume@メンズネイル専門 | tokyo",
                                                                "followed_by_viewer": false,
                                                                "id": "6928792779",
                                                                "is_verified": false,
                                                                "profile_pic_url": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-19/317207413_855573315635992_8116207701055733319_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=104&_nc_ohc=D24oNzy6mQQQ7kNvgHaAEts&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBJUraCEXpcllpHOXJRp9sgIVtmPAHs1kMs04IGxxp-VA&oe=6754AD2E&_nc_sid=8b3546",
                                                                "username": "yu_mensnail"
                                                            },
                                                            "x": 0,
                                                            "y": 0
                                                        }
                                                    }
                                                ]
                                            },
                                            "fact_check_overall_rating": null,
                                            "fact_check_information": null,
                                            "gating_info": null,
                                            "sharing_friction_info": {
                                                "should_have_sharing_friction": false,
                                                "bloks_app_url": null
                                            },
                                            "media_overlay_info": null,
                                            "media_preview": "ACIqpzTFRhepqv5LNyxJJGaeoyee4qyqu4C7Tx0xx+OfT6VBqkVY5TGcZz7VpK4IyO9NlsVKgjhh1rPchHKqeFOKm9xtWNTNFZnmH1op2EW4Qvl7m6D/AD+tWvNBwUOVI4x1/H0xWNKxA2dhViz37tq8jGSP8Pf+dU0TGVnY0i/GD3rnkG0kGtbLM/rVe5VQ2O4GT9c8fpUJblyZVzRSbPeirIuOPzc+1WbSby5Ax6dPwNDqPLBxzgfyFQL1P0P8qszNea/UA+WMv054A9/esds87vvE8/596Q9KdEAfyP8AKkO5HRRRQI//2Q==",
                                            "owner": {
                                                "id": "25025320",
                                                "username": "instagram"
                                            },
                                            "is_video": true,
                                            "has_upcoming_event": false,
                                            "accessibility_caption": null,
                                            "dash_info": {
                                                "is_dash_eligible": true,
                                                "video_dash_manifest": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<MPD xmlns=\"urn:mpeg:dash:schema:mpd:2011\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"urn:mpeg:dash:schema:mpd:2011 DASH-MPD.xsd\" profiles=\"urn:mpeg:dash:profile:isoff-on-demand:2011\" minBufferTime=\"PT2S\" type=\"static\" mediaPresentationDuration=\"PT14.875S\" FBManifestIdentifier=\"FgAYEnIyZXZldnA5LXIxZ2VuMnZwORmG6MPIxYWW3AHG3vXezPXzAZ7Lurf9+qADkLfJyaKeowToitTm8uegBYLA58muo/0GkMKsyPqDuQiipqPSr4zbHSIYGGRhc2hfbG5faGVhYWNfdmJyM19hdWRpbwA=\"><Period id=\"0\" duration=\"PT14.875S\"><AdaptationSet id=\"0\" contentType=\"video\" frameRate=\"12288/512\" subsegmentAlignment=\"true\" par=\"4:5\" FBUnifiedUploadResolutionMos=\"360:79.3\"><Representation id=\"484163817378036vd\" bandwidth=\"105904\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q30\" FBContentLength=\"196916\" FBPlaybackResolutionMos=\"0:100,360:23.6,480:22.7,720:22.6,1080:24.1\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:73.4,480:64.6,720:52.9,1080:42.5\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBDefaultQuality=\"1\" FBQualityClass=\"hd\" FBQualityLabel=\"270p\"><BaseURL>https://scontent-atl3-3.cdninstagram.com/o1/v/t16/f2/m69/AQNFmEiuClfbULS7GTa91NWN16JnVAjq82Z2jvcusfmWFoUiw4-JTqua8mB8nIBdqsnzEcTgfZ2kN4KshHCEil1N.mp4?strext=1&amp;_nc_cat=109&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-3.cdninstagram.com&amp;_nc_ohc=WWIe40c78ekQ7kNvgG-LzEH&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTMwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYARskipOLIS9SPpvMXFDjEbxeWxpjKVgq7Mmog64P5stA&amp;oe=6754A68E</BaseURL><SegmentBase indexRange=\"818-885\" timescale=\"12288\" FBMinimumPrefetchRange=\"886-7146\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"886-19033\" FBFirstSegmentRange=\"886-63239\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"63240-133924\" FBPrefetchSegmentRange=\"886-63239\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"1203385757412808v\" bandwidth=\"198467\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q40\" FBContentLength=\"369025\" FBPlaybackResolutionMos=\"0:100,360:30.9,480:29.5,720:28.8,1080:30.1\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:85.5,480:79.2,720:68.5,1080:57.8\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"360p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQNxSp1ItwEiOyc_DggVnr7FmyxHKYdqL5MqXAt7FOOg2XpUSS0qH5MLWtDaoxlccvdB-Z8KHL7t_xJPcaI9qiMd.mp4?strext=1&amp;_nc_cat=107&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=8_sCQCTjQ_cQ7kNvgG64ump&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTQwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYDiONqE1vnx3EMlCJZHYIpQUqB4ZuQIa_0jIsfbVx7Jkw&amp;oe=6754BF94</BaseURL><SegmentBase indexRange=\"818-885\" timescale=\"12288\" FBMinimumPrefetchRange=\"886-10983\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"886-31884\" FBFirstSegmentRange=\"886-112075\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"112076-245426\" FBPrefetchSegmentRange=\"886-112075\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"916906453717711v\" bandwidth=\"293270\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q50\" FBContentLength=\"545300\" FBPlaybackResolutionMos=\"0:100,360:34.1,480:32.8,720:32.1,1080:33.1\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:91.1,480:86.1,720:77,1080:66.7\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"480p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQOcn7hkkA8jd2ndUV_nMflVNFPzzGrAhZ3HrMhonH3N-Nz9T09wQ_FCp7_tk7Um14UXwFg_cU8SsBNE7M-Zc5jM.mp4?strext=1&amp;_nc_cat=111&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=eNGH2fif6m8Q7kNvgHEUeLD&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTUwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYDQaM6z_kidWLteqRWglLQecXhSWgdkHZqGx4oAjDf7Xw&amp;oe=6754C69C</BaseURL><SegmentBase indexRange=\"818-885\" timescale=\"12288\" FBMinimumPrefetchRange=\"886-15125\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"886-45382\" FBFirstSegmentRange=\"886-163164\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"163165-356521\" FBPrefetchSegmentRange=\"886-163164\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"1964335314038785v\" bandwidth=\"420376\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q60\" FBContentLength=\"781638\" FBPlaybackResolutionMos=\"0:100,360:36.5,480:35.2,720:34.7,1080:35.4\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:94.9,480:91,720:83.8,1080:74.2\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"540p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQNM_YCYARQz_a33nUStIEis9OJjQQOqKBM8tMFyyrHRx94tNxTdsAb9lzzDl0yr6hF-cFcg2s7WAM_vN11Rl5mF.mp4?strext=1&amp;_nc_cat=104&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=jegUpx6lPFQQ7kNvgF7j9ZQ&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTYwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYA18IeA2Rm__DuzoEcgtrE1ajeYSWkfF-7rZYCS5ql3tw&amp;oe=6754ADFD</BaseURL><SegmentBase indexRange=\"818-885\" timescale=\"12288\" FBMinimumPrefetchRange=\"886-20543\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"886-63610\" FBFirstSegmentRange=\"886-233414\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"233415-505324\" FBPrefetchSegmentRange=\"886-233414\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"8363097993800081v\" bandwidth=\"578047\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q70\" FBContentLength=\"1074807\" FBPlaybackResolutionMos=\"0:100,360:38.7,480:37.5,720:36.8,1080:37.8\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:97,480:94.2,720:88.1,1080:79.8\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"640p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQOgw8xLwaVYr8uDPCo2rXJY8QFF53v09xt0yOwn-Rx0ilQhEpu7xuBCOwnAuHHxk2hX_aHzoxu0-Ekz-5MMvfmv.mp4?strext=1&amp;_nc_cat=110&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=qa4l92hDxxcQ7kNvgECii1l&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTcwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYD0F9erj9WilUwhTNCJN6m7bkeP9JlrCSRlx9QcFqQ7hQ&amp;oe=6754BEAB</BaseURL><SegmentBase indexRange=\"818-885\" timescale=\"12288\" FBMinimumPrefetchRange=\"886-26794\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"886-85942\" FBFirstSegmentRange=\"886-319209\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"319210-687391\" FBPrefetchSegmentRange=\"886-319209\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"536382995871651v\" bandwidth=\"783057\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q80\" FBContentLength=\"1455997\" FBPlaybackResolutionMos=\"0:100,360:40.4,480:39.4,720:38.9,1080:39.8\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:98.16,480:96.6,720:91.6,1080:84.7\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"720p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQOJAMIa1G5VUPA76zFDfoEFoQ0xrWoToEKqAEL21SURvTV-ec4YTJB17fSShm5Cszidb0lggroIH0YjJvGmlV3w.mp4?strext=1&amp;_nc_cat=104&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=XmdGVHum3tkQ7kNvgEu9diA&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTgwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYAgHtQc_KKmI2xhjxDCYJTObQgk3ccAnqmrGpIf46K9rg&amp;oe=6754B855</BaseURL><SegmentBase indexRange=\"818-885\" timescale=\"12288\" FBMinimumPrefetchRange=\"886-34736\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"886-115732\" FBFirstSegmentRange=\"886-425998\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"425999-921584\" FBPrefetchSegmentRange=\"886-425998\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"1479528562721460v\" bandwidth=\"1123722\" codecs=\"vp09.00.40.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q90\" FBContentLength=\"2089422\" FBPlaybackResolutionMos=\"0:100,360:41.8,480:41.1,720:40.9,1080:42.1\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:98.77,480:97.8,720:94.9,1080:89.8\" FBAbrPolicyTags=\"\" width=\"1080\" height=\"1350\" FBQualityClass=\"hd\" FBQualityLabel=\"1080p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQO0yaSmHykJfFGc7NHtjZkw_QMv2NqrNfAXb_APSViM2rmrn6JmnxNSvLE0f91oJKoN0xvJTLke_Ia4rnomCVPu.mp4?strext=1&amp;_nc_cat=106&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=HaXrZa4pOUsQ7kNvgFdbE8R&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTkwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYAZB41CuORkSsWR5AjlXm3PANImvK_AVh6mWX9hrpVYCw&amp;oe=67549D13</BaseURL><SegmentBase indexRange=\"818-885\" timescale=\"12288\" FBMinimumPrefetchRange=\"886-50408\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"886-168586\" FBFirstSegmentRange=\"886-606102\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"606103-1303946\" FBPrefetchSegmentRange=\"886-606102\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation></AdaptationSet><AdaptationSet id=\"1\" contentType=\"audio\" subsegmentStartsWithSAP=\"1\" subsegmentAlignment=\"true\"><Representation id=\"2377212129284232ad\" bandwidth=\"79481\" codecs=\"mp4a.40.5\" mimeType=\"audio/mp4\" FBAvgBitrate=\"79481\" audioSamplingRate=\"44100\" FBEncodingTag=\"dash_ln_heaac_vbr3_audio\" FBContentLength=\"148350\" FBAbrPolicyTags=\"\" FBDefaultQuality=\"1\"><AudioChannelConfiguration schemeIdUri=\"urn:mpeg:dash:23003:3:audio_channel_configuration:2011\" value=\"2\"/><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQM38pv_AtTjuNjszNPIcq6mkMjpiMaCt16xWhL5PCF_Hlx_FEmAfN3r9jEkUhGrdQ0N_vnreZs-vv4MGvauvq2t.mp4?strext=1&amp;_nc_cat=102&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=_Tjmy9Aow_8Q7kNvgEgIIMY&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9sbl9oZWFhY192YnIzX2F1ZGlvIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYD3kwcETs7PVvzHyD1j9Qk4GxZKVCp6kI2Wf1GVfGVj1A&amp;oe=6754A553</BaseURL><SegmentBase indexRange=\"824-951\" timescale=\"44100\" FBMinimumPrefetchRange=\"952-1295\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"952-9664\" FBFirstSegmentRange=\"952-18481\" FBFirstSegmentDuration=\"2021\" FBSecondSegmentRange=\"18482-37948\" FBPrefetchSegmentRange=\"952-37948\" FBPrefetchSegmentDuration=\"4017\"><Initialization range=\"0-823\"/></SegmentBase></Representation></AdaptationSet></Period></MPD>\n",
                                                "number_of_qualities": 7
                                            },
                                            "has_audio": false,
                                            "tracking_token": "eyJ2ZXJzaW9uIjo1LCJwYXlsb2FkIjp7ImlzX2FuYWx5dGljc190cmFja2VkIjp0cnVlLCJ1dWlkIjoiYmM1MmYwZDVhMzU1NDI1Y2ExODI0ZWFjOGNmZTRlNzUzNTA1ODU5MjI1MTcwMTk3Njg2In0sInNpZ25hdHVyZSI6IiJ9",
                                            "video_url": "https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQNi_A3jTo-ULg_QqwUHXHfaPRFzoX-Og4nnOi0gaRJcqnx8u89HwZmqXqxfugEymQ5RbXf5v5dLmp71jeIRwPU3.mp4?stp=dst-mp4&efg=eyJxZV9ncm91cHMiOiJbXCJpZ193ZWJfZGVsaXZlcnlfdnRzX290ZlwiXSIsInZlbmNvZGVfdGFnIjoidnRzX3ZvZF91cmxnZW4uY2Fyb3VzZWxfaXRlbS5jMi4xMDgwLmJhc2VsaW5lIn0&_nc_cat=111&vs=357684080740591_78111197&_nc_vs=HBksFQIYOnBhc3N0aHJvdWdoX2V2ZXJzdG9yZS9HQnNKNlFJdURXYVJmRVlEQUMwNWd6MzNOdWxCYnBSMUFBQUYVAALIAQAVAhg6cGFzc3Rocm91Z2hfZXZlcnN0b3JlL0dFeVA0UnY1alpFNXZPTURBTnBUdmJWS3NyUVBia1lMQUFBRhUCAsgBACgAGAAbABUAACaQj9Tz%2BeCXQRUCKAJDMywXQC3AAAAAAAAYFmRhc2hfYmFzZWxpbmVfMTA4MHBfdjERAHXuBwA%3D&ccb=9-4&oh=00_AYDRfGvHqIDiQfQ96nCuMOfe_6y_OhqGxLXDNdhSSHXY5w&oe=6750ACFA&_nc_sid=8b3546",
                                            "video_view_count": 71312
                                        }
                                    },
                                    {
                                        "node": {
                                            "__typename": "GraphVideo",
                                            "id": "3505859243943882029",
                                            "shortcode": "DCnUGhTy20t",
                                            "dimensions": {
                                                "height": 937,
                                                "width": 750
                                            },
                                            "display_url": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-15/467756710_18609531103001321_6267300930108617442_n.jpg?stp=dst-jpg_e15&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=105&_nc_ohc=kSHL6JHpydsQ7kNvgG4cjH0&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYALO7p7CitFIKNcNuL1UZhKSnh0krzzofVEC8ijSCUVsA&oe=6754BD43&_nc_sid=8b3546",
                                            "edge_media_to_tagged_user": {
                                                "edges": [
                                                    {
                                                        "node": {
                                                            "user": {
                                                                "full_name": "kyan  /  かいあん",
                                                                "followed_by_viewer": false,
                                                                "id": "5045385127",
                                                                "is_verified": false,
                                                                "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/311338745_606807284463736_1142699983768494601_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=iz_DaI7S1cQQ7kNvgH06jCR&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYADUv5Y_jH0lSyirSzo-tREPv2cn3C5BN170Bgc2hSf8w&oe=675494DB&_nc_sid=8b3546",
                                                                "username": "kyanlm"
                                                            },
                                                            "x": 0,
                                                            "y": 0
                                                        }
                                                    }
                                                ]
                                            },
                                            "fact_check_overall_rating": null,
                                            "fact_check_information": null,
                                            "gating_info": null,
                                            "sharing_friction_info": {
                                                "should_have_sharing_friction": false,
                                                "bloks_app_url": null
                                            },
                                            "media_overlay_info": null,
                                            "media_preview": "ACIqc52qQenUH3/oD71XWcMrLgH5hwPU9+PpSTXheNldRgjHBqC38xP3ihcDr79P5UBY2Ut1aPlNxBwByMfr+lZcse8/Ku3bx16kdc5P5VvWsgeMP/eJNZ+1WdgepJ7+/bvTbsgSuzO+zyeh/MUVr+Wo9fzNFTzFciOcY546itm0dWjAwMjj/wCv+VU9iQjCck8bj/SrdrcrHE24ZKnI/HAptXJTsWY51VBGRt2nnAOM5z1GaZK6q2V6t+X1B/8ArVSgY3D7ScHduP49fyrYCjOae+gLTUrjef8A9VFXuaKXKu5XMcxNn7vel3YHByPelUcE96j/AIRTMzS06E/PI3ptH9f8KvrHhhtJA7jt/ntTbMfuB+P86e3CnH9xv5UFDG1GJSQT0OKKx1AwPpRSuFj/2Q==",
                                            "owner": {
                                                "id": "25025320",
                                                "username": "instagram"
                                            },
                                            "is_video": true,
                                            "has_upcoming_event": false,
                                            "accessibility_caption": null,
                                            "dash_info": {
                                                "is_dash_eligible": true,
                                                "video_dash_manifest": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<MPD xmlns=\"urn:mpeg:dash:schema:mpd:2011\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"urn:mpeg:dash:schema:mpd:2011 DASH-MPD.xsd\" profiles=\"urn:mpeg:dash:profile:isoff-on-demand:2011\" minBufferTime=\"PT2S\" type=\"static\" mediaPresentationDuration=\"PT28S\" FBManifestIdentifier=\"FgAYEnIyZXZldnA5LXIxZ2VuMnZwORmWjJPcpYj+zwG87ZmgzbXdAbrTiNK+z/oBurL8hJCpkAKcxrXL0O72AqqDl8v3spgDstv1yJ+c4APsgqf0iIOCBPj8tdaVjvAFIhgYZGFzaF9sbl9oZWFhY192YnIzX2F1ZGlvAA==\"><Period id=\"0\" duration=\"PT28S\"><AdaptationSet id=\"0\" contentType=\"video\" frameRate=\"12288/512\" subsegmentAlignment=\"true\" par=\"4:5\" FBUnifiedUploadResolutionMos=\"360:74.6\"><Representation id=\"898076532465877vd\" bandwidth=\"95882\" codecs=\"vp09.00.21.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q20\" FBContentLength=\"335589\" FBPlaybackResolutionMos=\"0:100,360:16.4,480:15.2,720:14.8,1080:15.6\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:61.3,480:50.9,720:36.8,1080:24\" FBAbrPolicyTags=\"\" width=\"360\" height=\"450\" FBDefaultQuality=\"1\" FBQualityClass=\"sd\" FBQualityLabel=\"240p\"><BaseURL>https://scontent-atl3-3.cdninstagram.com/o1/v/t16/f2/m69/AQPWf9CQvQrHK3qoDOFeX1xDcBZuOx-3bZBRi5KGKJXLMxhArRbA448NiBN2nEOz5eQ8a6BckH3ab1MKzn-mOjaB.mp4?strext=1&amp;_nc_cat=109&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-3.cdninstagram.com&amp;_nc_ohc=VwaHa3YR7FMQ7kNvgFHxmPs&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTIwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYCl6CVbhsedjXHhHJidGS1GZm2kJoqpXIJwruKZECQhEA&amp;oe=6754B6FA</BaseURL><SegmentBase indexRange=\"818-921\" timescale=\"12288\" FBMinimumPrefetchRange=\"922-5167\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"922-21521\" FBFirstSegmentRange=\"922-79252\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"79253-148092\" FBPrefetchSegmentRange=\"922-79252\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"1056016436213465v\" bandwidth=\"182619\" codecs=\"vp09.00.30.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q30\" FBContentLength=\"639167\" FBPlaybackResolutionMos=\"0:100,360:26.6,480:22.9,720:21.1,1080:21.2\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:78.6,480:69.1,720:55.3,1080:41.6\" FBAbrPolicyTags=\"\" width=\"538\" height=\"674\" FBQualityClass=\"sd\" FBQualityLabel=\"270p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQPVVP1QKkEJIgaX_ZLG_IzDHyRM7eKJdHPmPJxZFcGis4qT9Qu7gtZUTG53hVXIpdQq-PChkvVWzRYwixJSuoyq.mp4?strext=1&amp;_nc_cat=111&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=FQG7f48PW14Q7kNvgHCMRST&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTMwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYCSpewl9rw3UTzc3m6OZKZRX-Ahbc9a9LEEtOt-GMjJ3w&amp;oe=6754B774</BaseURL><SegmentBase indexRange=\"818-921\" timescale=\"12288\" FBMinimumPrefetchRange=\"922-7808\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"922-40177\" FBFirstSegmentRange=\"922-157804\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"157805-293130\" FBPrefetchSegmentRange=\"922-157804\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"1130350688657590v\" bandwidth=\"259367\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q40\" FBContentLength=\"907785\" FBPlaybackResolutionMos=\"0:100,360:33.2,480:29.2,720:25.7,1080:24.8\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:85.2,480:77.2,720:64.2,1080:51.2\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"360p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQOdwwXGWhuUN-WLnkVt9e7wr3kChKe3CBn_f-xKpf_onPtH8K7Vt05sAONrGTU4gPSZJCR6XaAVRvCyW4qLUKSH.mp4?strext=1&amp;_nc_cat=106&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=JwsNv6ymZ1gQ7kNvgGXVKVP&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTQwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYB3dbey6BiIJF_5rlEZpWG438zTmNQNSSE9EpeTTSluhQ&amp;oe=6754C4D7</BaseURL><SegmentBase indexRange=\"818-921\" timescale=\"12288\" FBMinimumPrefetchRange=\"922-10162\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"922-56663\" FBFirstSegmentRange=\"922-227207\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"227208-419963\" FBPrefetchSegmentRange=\"922-227207\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"598840852843677v\" bandwidth=\"411098\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q50\" FBContentLength=\"1438845\" FBPlaybackResolutionMos=\"0:100,360:44.6,480:39.2,720:34.5,1080:32.8\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:93.6,480:88.1,720:76.8,1080:64\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"480p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQP9zEGU4v60lKuyRmNnJ-p8ntbAmFTmIic3TKIoKC5N28lIV2glO0Kk9acXtx1-GAZmTnW4tFx2mQBkDRRfVfNE.mp4?strext=1&amp;_nc_cat=111&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=fyvmmpaLmiEQ7kNvgFiKNaa&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTUwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYCTfWCc3hitTSDqd8_ddhBPzrXQnhRGyIvdU6PgUf6O7g&amp;oe=6754B0B0</BaseURL><SegmentBase indexRange=\"818-921\" timescale=\"12288\" FBMinimumPrefetchRange=\"922-13311\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"922-87744\" FBFirstSegmentRange=\"922-367795\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"367796-679539\" FBPrefetchSegmentRange=\"922-367795\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"551121431106781v\" bandwidth=\"643462\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q60\" FBContentLength=\"2252120\" FBPlaybackResolutionMos=\"0:100,360:57.4,480:51.4,720:45,1080:41.9\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:97.7,480:95.1,720:87.3,1080:76.3\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"540p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQOxS1ARQEjZpwOeHlVLv9UAuhuKDcSt7N7XCE2PCLZhVNr8U6BMZVhIOHZdFhWZi3XjLMWy9c_SMfG6dwyoc2n8.mp4?strext=1&amp;_nc_cat=104&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=PdOF4-ZnykIQ7kNvgFFAPww&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTYwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYDWd9s3r6BtZW29DqAl7v_8Zz_66tTFMsRMjaoU74EwXg&amp;oe=6754A345</BaseURL><SegmentBase indexRange=\"818-921\" timescale=\"12288\" FBMinimumPrefetchRange=\"922-17688\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"922-132960\" FBFirstSegmentRange=\"922-588702\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"588703-1087051\" FBPrefetchSegmentRange=\"922-588702\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"1653908915535676v\" bandwidth=\"944795\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q70\" FBContentLength=\"3306784\" FBPlaybackResolutionMos=\"0:100,360:67.2,480:61.3,720:55.2,1080:50.9\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:99.291,480:98.35,720:94.4,1080:86.2\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"640p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQM8ozPgkshuaFrocKv6x7EmYPPN7CH0SkDka7TUYeOY9mjj_nj1i-2yGczUj--vSVlN2cOrjIBFJNKiW-quRIsv.mp4?strext=1&amp;_nc_cat=101&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=MiIIRvMtN-4Q7kNvgF_9Ew4&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTcwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYBJydsOcfQtyM6aHVaObifdhO2Egs8pobDvTVepFqf95g&amp;oe=6754B87E</BaseURL><SegmentBase indexRange=\"818-921\" timescale=\"12288\" FBMinimumPrefetchRange=\"922-22592\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"922-192422\" FBFirstSegmentRange=\"922-885007\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"885008-1631158\" FBPrefetchSegmentRange=\"922-885007\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"457363590710470v\" bandwidth=\"1348648\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q80\" FBContentLength=\"4720270\" FBPlaybackResolutionMos=\"0:100,360:74.8,480:69.7,720:63.8,1080:59.1\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:99.442,480:99.274,720:97.9,1080:93.8\" FBAbrPolicyTags=\"avoid_on_cellular,avoid_on_cellular_intentional\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"720p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQPNQ3rMw5sIALt1b14XVod45mNsva4dy-Jz9-mA4mKKNprwyMp8--SzH00rsLxqMVGRpKkZZrF2Pnf1WjFvS4EG.mp4?strext=1&amp;_nc_cat=101&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=fpY6g8oZ0PoQ7kNvgGhH4Uk&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTgwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYAGL0KXo48ZVmYOdHGt3HXpn8H0hsVEK_s5g7GoMt0f9Q&amp;oe=6754C59A</BaseURL><SegmentBase indexRange=\"818-921\" timescale=\"12288\" FBMinimumPrefetchRange=\"922-28899\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"922-270530\" FBFirstSegmentRange=\"922-1283003\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"1283004-2366240\" FBPrefetchSegmentRange=\"922-1283003\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"486905041075038v\" bandwidth=\"1956751\" codecs=\"vp09.00.40.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q90\" FBContentLength=\"6848631\" FBPlaybackResolutionMos=\"0:100,360:81.1,480:76.2,720:71.4,1080:68\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:99.51,480:99.378,720:99.141,1080:97.4\" FBAbrPolicyTags=\"avoid_on_cellular,avoid_on_cellular_intentional\" width=\"1080\" height=\"1350\" FBQualityClass=\"hd\" FBQualityLabel=\"1080p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQPI2kc4zxOvZu-KOLqInQudErBsiLLVAv74mcuZYtFFXuscD0ypAMNTHVi0tsMXXQhev6NM_IDT7VE40NnCFqFE.mp4?strext=1&amp;_nc_cat=104&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=HxFt8u3MMRQQ7kNvgHybXxi&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTkwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYDSOtyeSAz9xubTdn2405BCOzvA2E9iU1Swhss9RABOhA&amp;oe=6754B361</BaseURL><SegmentBase indexRange=\"818-921\" timescale=\"12288\" FBMinimumPrefetchRange=\"922-36950\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"922-385750\" FBFirstSegmentRange=\"922-1880936\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"1880937-3473582\" FBPrefetchSegmentRange=\"922-1880936\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation></AdaptationSet><AdaptationSet id=\"1\" contentType=\"audio\" subsegmentStartsWithSAP=\"1\" subsegmentAlignment=\"true\"><Representation id=\"824335299686798ad\" bandwidth=\"77959\" codecs=\"mp4a.40.5\" mimeType=\"audio/mp4\" FBAvgBitrate=\"77959\" audioSamplingRate=\"44100\" FBEncodingTag=\"dash_ln_heaac_vbr3_audio\" FBContentLength=\"273671\" FBAbrPolicyTags=\"\" FBDefaultQuality=\"1\"><AudioChannelConfiguration schemeIdUri=\"urn:mpeg:dash:23003:3:audio_channel_configuration:2011\" value=\"2\"/><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQN3Bh_zCpWcU9Hqn-3S8PZWVvgOa1czZ4svvd26M28Lrt8TYZiP4bl0FB-0rZ0nEouQ2kEbbPNsiMDz1BwCZPrq.mp4?strext=1&amp;_nc_cat=105&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=79Vp7Wf2ooYQ7kNvgEPXHY9&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9sbl9oZWFhY192YnIzX2F1ZGlvIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYBBSUqgyVSc_dB8L953UMDEAfiyLoXuy3mAoWHhZbS78A&amp;oe=6754AE16</BaseURL><SegmentBase indexRange=\"824-1023\" timescale=\"44100\" FBMinimumPrefetchRange=\"1024-1367\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"1024-10406\" FBFirstSegmentRange=\"1024-21369\" FBFirstSegmentDuration=\"2021\" FBSecondSegmentRange=\"21370-39526\" FBPrefetchSegmentRange=\"1024-39526\" FBPrefetchSegmentDuration=\"4017\"><Initialization range=\"0-823\"/></SegmentBase></Representation></AdaptationSet></Period></MPD>\n",
                                                "number_of_qualities": 8
                                            },
                                            "has_audio": false,
                                            "tracking_token": "eyJ2ZXJzaW9uIjo1LCJwYXlsb2FkIjp7ImlzX2FuYWx5dGljc190cmFja2VkIjp0cnVlLCJ1dWlkIjoiYmM1MmYwZDVhMzU1NDI1Y2ExODI0ZWFjOGNmZTRlNzUzNTA1ODU5MjQzOTQzODgyMDI5In0sInNpZ25hdHVyZSI6IiJ9",
                                            "video_url": "https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQNq9NRJ2fHjUu5v7200HAaHk9zTpYg4AkaNNYVOL2ZUJeqsPiiYcrxxv-BJc6If_wKHbPZRr-dy7aKo3EX1yUh1.mp4?stp=dst-mp4&efg=eyJxZV9ncm91cHMiOiJbXCJpZ193ZWJfZGVsaXZlcnlfdnRzX290ZlwiXSIsInZlbmNvZGVfdGFnIjoidnRzX3ZvZF91cmxnZW4uY2Fyb3VzZWxfaXRlbS5jMi4xMDgwLmJhc2VsaW5lIn0&_nc_cat=103&vs=1265939851120913_2330765422&_nc_vs=HBksFQIYOnBhc3N0aHJvdWdoX2V2ZXJzdG9yZS9HUExwNkFLTEQtM2FDMWNIQU5tRjdRTEtIVmtYYnBSMUFBQUYVAALIAQAVAhg6cGFzc3Rocm91Z2hfZXZlcnN0b3JlL0dFSUo0aHZtRmdKWmVCMEhBRS1uc1FWOW1icGJia1lMQUFBRhUCAsgBACgAGAAbABUAACbEwev554CHQRUCKAJDMywXQDwAAAAAAAAYFmRhc2hfYmFzZWxpbmVfMTA4MHBfdjERAHXuBwA%3D&ccb=9-4&oh=00_AYAgQsjbsFrDa8oDkmnP1f-1B4RzwDOt8LkdUxy-5He5yQ&oe=6750B9CC&_nc_sid=8b3546",
                                            "video_view_count": 40009
                                        }
                                    },
                                    {
                                        "node": {
                                            "__typename": "GraphImage",
                                            "id": "3505860551442563426",
                                            "shortcode": "DCnUZjAygFi",
                                            "dimensions": {
                                                "height": 1350,
                                                "width": 1080
                                            },
                                            "display_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.29350-15/467909492_1993382094408295_3798777042609155155_n.jpg?stp=dst-jpg_e35_p1080x1080&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=107&_nc_ohc=bS0tqpIWuTEQ7kNvgEhQcua&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYA5eE5LHOIY5oAi1VvhA8sTknPMPQDyVMG8NFEQ1l1cyg&oe=6754B4D8&_nc_sid=8b3546",
                                            "edge_media_to_tagged_user": {
                                                "edges": [
                                                    {
                                                        "node": {
                                                            "user": {
                                                                "full_name": "kyan  /  かいあん",
                                                                "followed_by_viewer": false,
                                                                "id": "5045385127",
                                                                "is_verified": false,
                                                                "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/311338745_606807284463736_1142699983768494601_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=iz_DaI7S1cQQ7kNvgH06jCR&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYADUv5Y_jH0lSyirSzo-tREPv2cn3C5BN170Bgc2hSf8w&oe=675494DB&_nc_sid=8b3546",
                                                                "username": "kyanlm"
                                                            },
                                                            "x": 0.7438507209,
                                                            "y": 0.7921967769
                                                        }
                                                    },
                                                    {
                                                        "node": {
                                                            "user": {
                                                                "full_name": "PIZZA SLICE",
                                                                "followed_by_viewer": false,
                                                                "id": "750415117",
                                                                "is_verified": false,
                                                                "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/11355067_478923812315218_1062997547_a.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=110&_nc_ohc=LAMGjdvLCvMQ7kNvgGfj4xV&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYD_WMuvelM7Jqn55Xz8zQmXEEGuXhvQzY9ea8S1HPIVKQ&oe=6754C417&_nc_sid=8b3546",
                                                                "username": "pizza_slice_tokyo"
                                                            },
                                                            "x": 0.3519932146,
                                                            "y": 0.7209499576
                                                        }
                                                    }
                                                ]
                                            },
                                            "fact_check_overall_rating": null,
                                            "fact_check_information": null,
                                            "gating_info": null,
                                            "sharing_friction_info": {
                                                "should_have_sharing_friction": false,
                                                "bloks_app_url": null
                                            },
                                            "media_overlay_info": null,
                                            "media_preview": null,
                                            "owner": {
                                                "id": "25025320",
                                                "username": "instagram"
                                            },
                                            "is_video": false,
                                            "has_upcoming_event": false,
                                            "accessibility_caption": "Slices of pizza and sodas sitting on a table."
                                        }
                                    },
                                    {
                                        "node": {
                                            "__typename": "GraphVideo",
                                            "id": "3505859452451115369",
                                            "shortcode": "DCnUJjfy1Fp",
                                            "dimensions": {
                                                "height": 937,
                                                "width": 750
                                            },
                                            "display_url": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-15/467763998_18609531127001321_3964209847373598847_n.jpg?stp=dst-jpg_e15_tt6&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=105&_nc_ohc=db_glgOdtuYQ7kNvgHf7hlJ&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDKsviXThmIt9_FFuX907zP0OQH8J_e0uA1j8KaxLP2eQ&oe=67549675&_nc_sid=8b3546",
                                            "edge_media_to_tagged_user": {
                                                "edges": [
                                                    {
                                                        "node": {
                                                            "user": {
                                                                "full_name": "kyan  /  かいあん",
                                                                "followed_by_viewer": false,
                                                                "id": "5045385127",
                                                                "is_verified": false,
                                                                "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/311338745_606807284463736_1142699983768494601_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=iz_DaI7S1cQQ7kNvgH06jCR&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYADUv5Y_jH0lSyirSzo-tREPv2cn3C5BN170Bgc2hSf8w&oe=675494DB&_nc_sid=8b3546",
                                                                "username": "kyanlm"
                                                            },
                                                            "x": 0,
                                                            "y": 0
                                                        }
                                                    }
                                                ]
                                            },
                                            "fact_check_overall_rating": null,
                                            "fact_check_information": null,
                                            "gating_info": null,
                                            "sharing_friction_info": {
                                                "should_have_sharing_friction": false,
                                                "bloks_app_url": null
                                            },
                                            "media_overlay_info": null,
                                            "media_preview": "ACIqfE8sB5HX8P8A6xqZ9TbGFA+tNnmDplee3HPX2rLKPgDHUnB+nakNK5ox6g275+RV7zFZcjkE5rmZAyDPTFaun5aI57k0MdjR+0e1FR4oqbjsZTmInOCODjHHfI6VITltwHGOvOPrjpmrw09epCj8TVd0WQGOLkAZJGQOvGPXNU0KLsZ7ksCep9K0ooHRAu7HqAB1PWqywND87cAfn+FSxTMQzsT9PT2pWBst+S394/p/hRVP7TL6GiiwrmlfybISO7fL/j+grMsZtrFTjDD6dB/hVrVfup/vH+VZcff6N/KrJ6kMjGXlyTk5wTwPw/IVctmCx7QOhzVI9vp/U1Nb/f8AwNIC55o9BRWUxOT9aKC+Zn//2Q==",
                                            "owner": {
                                                "id": "25025320",
                                                "username": "instagram"
                                            },
                                            "is_video": true,
                                            "has_upcoming_event": false,
                                            "accessibility_caption": null,
                                            "dash_info": {
                                                "is_dash_eligible": true,
                                                "video_dash_manifest": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<MPD xmlns=\"urn:mpeg:dash:schema:mpd:2011\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"urn:mpeg:dash:schema:mpd:2011 DASH-MPD.xsd\" profiles=\"urn:mpeg:dash:profile:isoff-on-demand:2011\" minBufferTime=\"PT2S\" type=\"static\" mediaPresentationDuration=\"PT11.583333S\" FBManifestIdentifier=\"FgAYEnIyZXZldnA5LXIxZ2VuMnZwORl2gLbujqaJ3wGA+aLDmMvwAdLopvrDhJEC1rvk7abckgKwr9v1k/KNA9CruZCJlakE0OyTuabH1gUiGBhkYXNoX2xuX2hlYWFjX3ZicjNfYXVkaW8A\"><Period id=\"0\" duration=\"PT11.583333S\"><AdaptationSet id=\"0\" contentType=\"video\" frameRate=\"12288/512\" subsegmentAlignment=\"true\" par=\"4:5\" FBUnifiedUploadResolutionMos=\"360:83.3\"><Representation id=\"874973411109848vd\" bandwidth=\"272297\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q40\" FBContentLength=\"394264\" FBPlaybackResolutionMos=\"0:100,360:29.1,480:24.8,720:22.2,1080:21.9\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:90.9,480:86.1,720:75.9,1080:63\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBDefaultQuality=\"1\" FBQualityClass=\"hd\" FBQualityLabel=\"360p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQOkxSNCh9ux28UEQfwz-pK8_RLvWdosKtUX4AqK3lSrV0fS-TPy9poooVYrDEfHDfiPBV_B1kXQL6KfPkNFffWN.mp4?strext=1&amp;_nc_cat=103&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=L2tK84kte1UQ7kNvgGhVf5A&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTQwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYCzse1L47E5cEBcaVbXfOgXWLGkS-XXsCQexT0U6PASBQ&amp;oe=6754BBA4</BaseURL><SegmentBase indexRange=\"818-885\" timescale=\"12288\" FBMinimumPrefetchRange=\"886-19598\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"886-48956\" FBFirstSegmentRange=\"886-157673\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"157674-326802\" FBPrefetchSegmentRange=\"886-157673\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"1216421862779624v\" bandwidth=\"435347\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q50\" FBContentLength=\"630347\" FBPlaybackResolutionMos=\"0:100,360:34.7,480:31.5,720:28.3,1080:27.6\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:95.2,480:92.2,720:84.7,1080:73.8\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"480p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQNGUXpnlw2Ov0PjBqMxXgieRjXaxuhTIuoRkpFkhEfD-y0GuoaCf7kHzEA5kFvvxUJA2lKjem-9h8Mj40BPsJ7k.mp4?strext=1&amp;_nc_cat=103&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=R3ZZEcdxAwgQ7kNvgFALzsD&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTUwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYDZK2emt4mMzr5zMNNWh84seQf3gbsgLUk6nt6flVShAA&amp;oe=67549974</BaseURL><SegmentBase indexRange=\"818-885\" timescale=\"12288\" FBMinimumPrefetchRange=\"886-26499\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"886-74448\" FBFirstSegmentRange=\"886-253946\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"253947-524813\" FBPrefetchSegmentRange=\"886-253946\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"1597715814447912v\" bandwidth=\"602256\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q60\" FBContentLength=\"872017\" FBPlaybackResolutionMos=\"0:100,360:37.6,480:34.3,720:31.6,1080:31\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:97.1,480:95.3,720:89.8,1080:80.6\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"540p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQMunGPLqjt6quvQN3DsC7Wo0Z2a_pcavBr2jVRCerK4zAAnK-UNsXDpM3xKnwYNESj-al-ytvArdPf07cTgQQ5P.mp4?strext=1&amp;_nc_cat=101&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=sjEyGaxZin0Q7kNvgE3qHxC&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTYwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYCLdg1cnCXAZYLRXiG504HWs_QB3bcBBtYPzFibPnsXtw&amp;oe=6754C8AA</BaseURL><SegmentBase indexRange=\"818-885\" timescale=\"12288\" FBMinimumPrefetchRange=\"886-32445\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"886-100168\" FBFirstSegmentRange=\"886-355209\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"355210-731261\" FBPrefetchSegmentRange=\"886-355209\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"529057363287616v\" bandwidth=\"812007\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q70\" FBContentLength=\"1175719\" FBPlaybackResolutionMos=\"0:100,360:40.5,480:37.5,720:34.7,1080:34.1\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:98.16,480:96.8,720:92.7,1080:84.9\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"640p\"><BaseURL>https://scontent-atl3-3.cdninstagram.com/o1/v/t16/f2/m69/AQPoX5S9arDK4STkjHrX-9EN2PfzojNxsXBdfSPoSBlkYupdLhx8bVu_VALlYNOm2uP2jS9BMcoww809ZmRnVtyt.mp4?strext=1&amp;_nc_cat=109&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-3.cdninstagram.com&amp;_nc_ohc=oNA9UAH_SsEQ7kNvgFFvu4i&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTcwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYCSEJrnvz31H0Go4W3Ft-Yi4hHFaIxeOyovhXbPlzQZjw&amp;oe=6754B606</BaseURL><SegmentBase indexRange=\"818-885\" timescale=\"12288\" FBMinimumPrefetchRange=\"886-38876\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"886-131480\" FBFirstSegmentRange=\"886-480528\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"480529-989266\" FBPrefetchSegmentRange=\"886-480528\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"490541920669056v\" bandwidth=\"1101700\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q80\" FBContentLength=\"1595171\" FBPlaybackResolutionMos=\"0:100,360:42.8,480:40.6,720:37.9,1080:37.2\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:98.88,480:98.24,720:95.4,1080:89.4\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"720p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQOvUVZ-xcJhml5mhyqeZy2yFjA_a8UAgNLyEz1jF5njK17unqzw9aawtDp9BubroktPTLfMPANx8VHf3DQdbQI2.mp4?strext=1&amp;_nc_cat=103&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=Q1UFwMlCVl8Q7kNvgHotR5S&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTgwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYAVDX6Py2Bzp2pdMjjiejLhoRJNXi0uQQy6fNrLJ882hA&amp;oe=6754B444</BaseURL><SegmentBase indexRange=\"818-885\" timescale=\"12288\" FBMinimumPrefetchRange=\"886-45754\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"886-174291\" FBFirstSegmentRange=\"886-661566\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"661567-1349275\" FBPrefetchSegmentRange=\"886-661566\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"604118135377643v\" bandwidth=\"1633279\" codecs=\"vp09.00.40.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q90\" FBContentLength=\"2364853\" FBPlaybackResolutionMos=\"0:100,360:44.7,480:43.4,720:41.9,1080:41.9\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:99.274,480:98.93,720:97.4,1080:93.6\" FBAbrPolicyTags=\"avoid_on_cellular,avoid_on_cellular_intentional\" width=\"1080\" height=\"1350\" FBQualityClass=\"hd\" FBQualityLabel=\"1080p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQP7c3SvUIy8EKfTrHLwc5ekq82CwEC-WEgRlpFueWIZWfSy3saLItYG-xzUg2awl-zVLjE1sykn4kg3djpw3Mu_.mp4?strext=1&amp;_nc_cat=108&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=9l6ZptbOoGUQ7kNvgGvar4G&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTkwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYCs2yaUKvhtOD4ChqSjBcXL1XY8y9CKASGXNqMBgqTwhg&amp;oe=67549325</BaseURL><SegmentBase indexRange=\"818-885\" timescale=\"12288\" FBMinimumPrefetchRange=\"886-61400\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"886-258163\" FBFirstSegmentRange=\"886-986602\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"986603-2005992\" FBPrefetchSegmentRange=\"886-986602\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation></AdaptationSet><AdaptationSet id=\"1\" contentType=\"audio\" subsegmentStartsWithSAP=\"1\" subsegmentAlignment=\"true\"><Representation id=\"600411189074473ad\" bandwidth=\"88456\" codecs=\"mp4a.40.5\" mimeType=\"audio/mp4\" FBAvgBitrate=\"88456\" audioSamplingRate=\"44100\" FBEncodingTag=\"dash_ln_heaac_vbr3_audio\" FBContentLength=\"128769\" FBAbrPolicyTags=\"\" FBDefaultQuality=\"1\"><AudioChannelConfiguration schemeIdUri=\"urn:mpeg:dash:23003:3:audio_channel_configuration:2011\" value=\"2\"/><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQPm-YLFGHAvyYHMVPZMV1wnD6CXJ64cxATAf0HF5wXBpCAZrFk4EQCA2CfG-U6s3YAMBOamMoIUdjS_6Z_hHtRU.mp4?strext=1&amp;_nc_cat=100&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=wxI4cwbwNyAQ7kNvgGnEGTK&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9sbl9oZWFhY192YnIzX2F1ZGlvIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYC6UM2gwUNLtq7CJ1Bm4Jy4GozRH3xH85LcpWbt1DhpsQ&amp;oe=6754A61D</BaseURL><SegmentBase indexRange=\"824-927\" timescale=\"44100\" FBMinimumPrefetchRange=\"928-1271\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"928-12646\" FBFirstSegmentRange=\"928-24071\" FBFirstSegmentDuration=\"2021\" FBSecondSegmentRange=\"24072-48005\" FBPrefetchSegmentRange=\"928-48005\" FBPrefetchSegmentDuration=\"4017\"><Initialization range=\"0-823\"/></SegmentBase></Representation></AdaptationSet></Period></MPD>\n",
                                                "number_of_qualities": 6
                                            },
                                            "has_audio": false,
                                            "tracking_token": "eyJ2ZXJzaW9uIjo1LCJwYXlsb2FkIjp7ImlzX2FuYWx5dGljc190cmFja2VkIjp0cnVlLCJ1dWlkIjoiYmM1MmYwZDVhMzU1NDI1Y2ExODI0ZWFjOGNmZTRlNzUzNTA1ODU5NDUyNDUxMTE1MzY5In0sInNpZ25hdHVyZSI6IiJ9",
                                            "video_url": "https://scontent-atl3-3.cdninstagram.com/o1/v/t16/f2/m69/AQPOP8JIx85B4nka8BGlTKb5PM8D_wA39DXQU55iI3yT7ZZHqX5lNN0VzM3uobBwGICdrckot5CgEBkcCR9I521O.mp4?stp=dst-mp4&efg=eyJxZV9ncm91cHMiOiJbXCJpZ193ZWJfZGVsaXZlcnlfdnRzX290ZlwiXSIsInZlbmNvZGVfdGFnIjoidnRzX3ZvZF91cmxnZW4uY2Fyb3VzZWxfaXRlbS5jMi4xMDgwLmJhc2VsaW5lIn0&_nc_cat=109&vs=1232297007851881_3048567498&_nc_vs=HBksFQIYOnBhc3N0aHJvdWdoX2V2ZXJzdG9yZS9HQTRDSkFjRVZ5clI4YjBCQU9vMkppdlEwWjVSYnBSMUFBQUYVAALIAQAVAhg6cGFzc3Rocm91Z2hfZXZlcnN0b3JlL0dGU0o0UnU1SGtSenVFRURBQVZ4YzJmRVA1aG9ia1lMQUFBRhUCAsgBACgAGAAbABUAACagh5v5ouHQPxUCKAJDMywXQCcqfvnbItEYFmRhc2hfYmFzZWxpbmVfMTA4MHBfdjERAHXuBwA%3D&ccb=9-4&oh=00_AYDDZOcSyIWlWDUe0FS0rR-Y8xOLYxRCNku1-pFAnupy0A&oe=6750C1F3&_nc_sid=8b3546",
                                            "video_view_count": 21503
                                        }
                                    },
                                    {
                                        "node": {
                                            "__typename": "GraphVideo",
                                            "id": "3505859559321881899",
                                            "shortcode": "DCnULHByc0r",
                                            "dimensions": {
                                                "height": 937,
                                                "width": 750
                                            },
                                            "display_url": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-15/467751192_18609531145001321_5038710402843539742_n.jpg?stp=dst-jpg_e15&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=105&_nc_ohc=0tR5qR9O5vQQ7kNvgG7oMRM&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAUtImQ1hv3F7Xt5oVuBWPVSxeETfnKT3kxhzzWWKJEcQ&oe=6754B4C3&_nc_sid=8b3546",
                                            "edge_media_to_tagged_user": {
                                                "edges": [
                                                    {
                                                        "node": {
                                                            "user": {
                                                                "full_name": "kyan  /  かいあん",
                                                                "followed_by_viewer": false,
                                                                "id": "5045385127",
                                                                "is_verified": false,
                                                                "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/311338745_606807284463736_1142699983768494601_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=iz_DaI7S1cQQ7kNvgH06jCR&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYADUv5Y_jH0lSyirSzo-tREPv2cn3C5BN170Bgc2hSf8w&oe=675494DB&_nc_sid=8b3546",
                                                                "username": "kyanlm"
                                                            },
                                                            "x": 0,
                                                            "y": 0
                                                        }
                                                    }
                                                ]
                                            },
                                            "fact_check_overall_rating": null,
                                            "fact_check_information": null,
                                            "gating_info": null,
                                            "sharing_friction_info": {
                                                "should_have_sharing_friction": false,
                                                "bloks_app_url": null
                                            },
                                            "media_overlay_info": null,
                                            "media_preview": "ACIqeHz2P5H/AAps90eg6+9WVas4xOZGY8Lk8n0OKzsaLUBduvI7VZjn84ZUE+o4z/PP6VTNsSN2ePWpNM3J5hP3eMH35/pTB6FsSgjvRUScqD7CikIVXpZG3DAqrv2jNTQRtOTjgLj8Se35frTDZkUj4G3r9KlRikWG64JP9PyFSC0K5JwPfNUSwkfav3RkZ9f/AK3oO31oQ27l2P7i/QfyopivtAHpxRQIoMcirNlOyPhjw306jpVTtRH94fUVRPUtahLvkx2UD9eT/Sqts2H/AN7inXX+tk+v9RVYdRTEaeaKixRSKP/Z",
                                            "owner": {
                                                "id": "25025320",
                                                "username": "instagram"
                                            },
                                            "is_video": true,
                                            "has_upcoming_event": false,
                                            "accessibility_caption": null,
                                            "dash_info": {
                                                "is_dash_eligible": true,
                                                "video_dash_manifest": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<MPD xmlns=\"urn:mpeg:dash:schema:mpd:2011\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"urn:mpeg:dash:schema:mpd:2011 DASH-MPD.xsd\" profiles=\"urn:mpeg:dash:profile:isoff-on-demand:2011\" minBufferTime=\"PT2S\" type=\"static\" mediaPresentationDuration=\"PT13.541667S\" FBManifestIdentifier=\"FgAYEnIyZXZldnA5LXIxZ2VuMnZwORlmxJ3vjoaezwG22pSykoGpA8Tw4tjr++sDxJLYgI2K5QTA7dPL+87UBaKLhcmYnLQGIhgYZGFzaF9sbl9oZWFhY192YnIzX2F1ZGlvAA==\"><Period id=\"0\" duration=\"PT13.541667S\"><AdaptationSet id=\"0\" contentType=\"video\" frameRate=\"12288/512\" subsegmentAlignment=\"true\" par=\"4:5\" FBUnifiedUploadResolutionMos=\"360:71.7\"><Representation id=\"1348174799897762vd\" bandwidth=\"87030\" codecs=\"vp09.00.21.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q50\" FBContentLength=\"147318\" FBPlaybackResolutionMos=\"0:100,360:46.4,480:45.3,720:47.4,1080:52.8\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:69.8,480:61,720:49,1080:39\" FBAbrPolicyTags=\"\" width=\"360\" height=\"450\" FBDefaultQuality=\"1\" FBQualityClass=\"sd\" FBQualityLabel=\"360p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQNolAXXpMuqLM0GC5G0G_SMS_38Pj7lmJ9271d69pwXJtuwBwhpgwdEn-5mHIlHomtbuyp8O4pTfLOLxK7x7XLy.mp4?strext=1&amp;_nc_cat=107&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=79LNmpzUPrkQ7kNvgG5rp27&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTUwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYC3GSI6Nn5bHS6h4PVUfSxmN9mkOXoZcN1cfKTQ0J3ccg&amp;oe=6754BEE8</BaseURL><SegmentBase indexRange=\"818-885\" timescale=\"12288\" FBMinimumPrefetchRange=\"886-4703\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"886-14022\" FBFirstSegmentRange=\"886-53943\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"53944-101192\" FBPrefetchSegmentRange=\"886-53943\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"1081847996767266v\" bandwidth=\"200423\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q60\" FBContentLength=\"339259\" FBPlaybackResolutionMos=\"0:100,360:61,480:58.9,720:58.6,1080:61.4\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:88.6,480:82.2,720:71.9,1080:61.6\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"540p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQNjwvzh6BwZ4-3Pzb9P4vJL8HUGZRgRNi9Xwegz4S7X193bregonPl7UC43uBcAPS03yg1R33Lx5V_axJ4qWZND.mp4?strext=1&amp;_nc_cat=104&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=WlmMuiLl0mYQ7kNvgHr7bJt&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTYwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYA481sM5NyjkeZZ1SlYiKQ5MYnWbW4lyTbQwNSZC7Nn6g&amp;oe=6754B795</BaseURL><SegmentBase indexRange=\"818-885\" timescale=\"12288\" FBMinimumPrefetchRange=\"886-7476\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"886-28491\" FBFirstSegmentRange=\"886-122539\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"122540-232122\" FBPrefetchSegmentRange=\"886-122539\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"1803683403702993v\" bandwidth=\"376026\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q70\" FBContentLength=\"636503\" FBPlaybackResolutionMos=\"0:100,360:72.3,480:69.9,720:68.4,1080:69.4\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:96.5,480:93,720:85.5,1080:76.8\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"640p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQOnzoPuF52OKhDDJcV36XLmR4QD-4Yrb5SD_90F-Ln-6FNbmWAguXg7MVyotILadfubkitq0_o39VSBF9V7k6lX.mp4?strext=1&amp;_nc_cat=111&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=EpTqIpwyTb0Q7kNvgG_KMS8&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTcwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYBKH9Mx4JmfshT_WJFFaJdRVSDjWJKlBKyMB5LgcD5Asw&amp;oe=675496F0</BaseURL><SegmentBase indexRange=\"818-885\" timescale=\"12288\" FBMinimumPrefetchRange=\"886-10343\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"886-49859\" FBFirstSegmentRange=\"886-227538\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"227539-432993\" FBPrefetchSegmentRange=\"886-227538\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"934604531996315v\" bandwidth=\"612194\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q80\" FBContentLength=\"1036266\" FBPlaybackResolutionMos=\"0:100,360:78.7,480:76.3,720:74.5,1080:74.6\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:98.92,480:97.6,720:93.3,1080:86.9\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"720p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQNAo0_RYMfiup4s49rmtOuOEyA1k-V_mG8p7pEhHtehvayIkWO-wmHB25rKA4tB9AlR6wrPs9kEwwck9lJ2xnDY.mp4?strext=1&amp;_nc_cat=110&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=1-ZhZX9tyusQ7kNvgEc8IyK&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTgwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYDMNu9FeFTs-A3GUsTMbQWEInDdN7ixtaBU7BzCyy2fSw&amp;oe=67549AC7</BaseURL><SegmentBase indexRange=\"818-885\" timescale=\"12288\" FBMinimumPrefetchRange=\"886-13601\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"886-79572\" FBFirstSegmentRange=\"886-372456\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"372457-702892\" FBPrefetchSegmentRange=\"886-372456\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"455714030872418v\" bandwidth=\"935182\" codecs=\"vp09.00.40.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q90\" FBContentLength=\"1582991\" FBPlaybackResolutionMos=\"0:100,360:83.3,480:80.5,720:77.9,1080:77.7\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:99.413,480:98.92,720:96.7,1080:91.7\" FBAbrPolicyTags=\"\" width=\"1080\" height=\"1350\" FBQualityClass=\"hd\" FBQualityLabel=\"1080p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQP2NfLgrKtVF4p8TmmQdRNYcQYVQC6AjuWVxQQ3R3aQAQyoDJbPU8mvGjvulL0HBe9aOO3pA_7-QnqaPD_gaPHZ.mp4?strext=1&amp;_nc_cat=107&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=O5KiqAWaD38Q7kNvgEFZj4B&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTkwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYC8jSmJuQboTzpWUgpsIpOfYFdiVMxMB5B2ZTFzxe1_qA&amp;oe=6754A240</BaseURL><SegmentBase indexRange=\"818-885\" timescale=\"12288\" FBMinimumPrefetchRange=\"886-17332\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"886-121423\" FBFirstSegmentRange=\"886-574585\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"574586-1074400\" FBPrefetchSegmentRange=\"886-574585\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation></AdaptationSet><AdaptationSet id=\"1\" contentType=\"audio\" subsegmentStartsWithSAP=\"1\" subsegmentAlignment=\"true\"><Representation id=\"1593449454926688ad\" bandwidth=\"81158\" codecs=\"mp4a.40.5\" mimeType=\"audio/mp4\" FBAvgBitrate=\"81158\" audioSamplingRate=\"44100\" FBEncodingTag=\"dash_ln_heaac_vbr3_audio\" FBContentLength=\"138020\" FBAbrPolicyTags=\"\" FBDefaultQuality=\"1\"><AudioChannelConfiguration schemeIdUri=\"urn:mpeg:dash:23003:3:audio_channel_configuration:2011\" value=\"2\"/><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQNo1Muynj5dqC0rKXzic855Q9sMom7ZD5FUXAJIRx9x3W5PlZlEpEaAql2gQ5jvEPyzOPjiJZoFrIdxBto8IwPb.mp4?strext=1&amp;_nc_cat=100&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=UpKRg1Vyf68Q7kNvgEXPQv3&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9sbl9oZWFhY192YnIzX2F1ZGlvIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYAocJvMAL73GLnpXpn_1DtpqifO5LN2_Unhbc4AapSxCw&amp;oe=675499A1</BaseURL><SegmentBase indexRange=\"824-939\" timescale=\"44100\" FBMinimumPrefetchRange=\"940-1283\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"940-12021\" FBFirstSegmentRange=\"940-22577\" FBFirstSegmentDuration=\"2021\" FBSecondSegmentRange=\"22578-44656\" FBPrefetchSegmentRange=\"940-44656\" FBPrefetchSegmentDuration=\"4017\"><Initialization range=\"0-823\"/></SegmentBase></Representation></AdaptationSet></Period></MPD>\n",
                                                "number_of_qualities": 5
                                            },
                                            "has_audio": false,
                                            "tracking_token": "eyJ2ZXJzaW9uIjo1LCJwYXlsb2FkIjp7ImlzX2FuYWx5dGljc190cmFja2VkIjp0cnVlLCJ1dWlkIjoiYmM1MmYwZDVhMzU1NDI1Y2ExODI0ZWFjOGNmZTRlNzUzNTA1ODU5NTU5MzIxODgxODk5In0sInNpZ25hdHVyZSI6IiJ9",
                                            "video_url": "https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQOmojmUIYSpVemj3dX7k2MwauubJl7r-BA2l5bEUSi0GJ30vnsBwALd-zm6OeM1Ly13zTTCYMynwJephe-YmhRq.mp4?stp=dst-mp4&efg=eyJxZV9ncm91cHMiOiJbXCJpZ193ZWJfZGVsaXZlcnlfdnRzX290ZlwiXSIsInZlbmNvZGVfdGFnIjoidnRzX3ZvZF91cmxnZW4uY2Fyb3VzZWxfaXRlbS5jMi4xMDgwLmJhc2VsaW5lIn0&_nc_cat=100&vs=565141282902792_84311442&_nc_vs=HBksFQIYOnBhc3N0aHJvdWdoX2V2ZXJzdG9yZS9HQi0tQ2dPMms3dWk3c01HQVBfZ2tOYV9Ma3gwYnBSMUFBQUYVAALIAQAVAhg6cGFzc3Rocm91Z2hfZXZlcnN0b3JlL0dHVEwzQnNYbzNGdndZb0JBUEZkbnhwYUk2Z3Jia1lMQUFBRhUCAsgBACgAGAAbABUAACaW8pXhvtH2PxUCKAJDMywXQCsU%2FfO2RaIYFmRhc2hfYmFzZWxpbmVfMTA4MHBfdjERAHXuBwA%3D&ccb=9-4&oh=00_AYBR85J2VZZFDU0IaiLF_dRlyn-QeTo1zv9OSOdfQAlk-A&oe=6750AC6F&_nc_sid=8b3546",
                                            "video_view_count": 12453
                                        }
                                    },
                                    {
                                        "node": {
                                            "__typename": "GraphVideo",
                                            "id": "3505859597901221878",
                                            "shortcode": "DCnULq9S8_2",
                                            "dimensions": {
                                                "height": 937,
                                                "width": 750
                                            },
                                            "display_url": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-15/467748645_18609531163001321_8522277535148338859_n.jpg?stp=dst-jpg_e15_tt6&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=105&_nc_ohc=aP3mzHlzCWgQ7kNvgETdKSu&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDNSZcdaf54ayfCI8qKVDGiaI-KIWm3CZ3NoZAuD1yfNg&oe=6754C091&_nc_sid=8b3546",
                                            "edge_media_to_tagged_user": {
                                                "edges": [
                                                    {
                                                        "node": {
                                                            "user": {
                                                                "full_name": "kyan  /  かいあん",
                                                                "followed_by_viewer": false,
                                                                "id": "5045385127",
                                                                "is_verified": false,
                                                                "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/311338745_606807284463736_1142699983768494601_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=iz_DaI7S1cQQ7kNvgH06jCR&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYADUv5Y_jH0lSyirSzo-tREPv2cn3C5BN170Bgc2hSf8w&oe=675494DB&_nc_sid=8b3546",
                                                                "username": "kyanlm"
                                                            },
                                                            "x": 0,
                                                            "y": 0
                                                        }
                                                    }
                                                ]
                                            },
                                            "fact_check_overall_rating": null,
                                            "fact_check_information": null,
                                            "gating_info": null,
                                            "sharing_friction_info": {
                                                "should_have_sharing_friction": false,
                                                "bloks_app_url": null
                                            },
                                            "media_overlay_info": null,
                                            "media_preview": "ACIqtCUn0IqN8lQNv4j2qJGVweuCM5Hb8qjgAwUznJ4OemeOD+vtRYE+pbCkjpjPT2qJpCG64HpUHkGLPfHbOf8A69L5exyxOM84J/KkO/8AkO3E96KkC57f5/OigdyGNipIHBY9B/8AqNVIVYSk5+Uc59x2q95SwYYMScdD2H/66JYcLkHlv0+n/wBegkguWZ2AVgCeTnjp/P8ApT2cTLjOWX/OOP0qOW3yjYJO0EgnGTj/ABpljbl0LhsEnGMA/j+tFkBaS5AUDKdB1orHeGYMRgnBPPr70VVgNXjAwQdw6DrxUUhMYz0zWsFA6ACq9yARzU3GZpZ5lIHpim2sboSCD2q7ZAbfxNXwKAKOfWir2BRSGf/Z",
                                            "owner": {
                                                "id": "25025320",
                                                "username": "instagram"
                                            },
                                            "is_video": true,
                                            "has_upcoming_event": false,
                                            "accessibility_caption": null,
                                            "dash_info": {
                                                "is_dash_eligible": true,
                                                "video_dash_manifest": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<MPD xmlns=\"urn:mpeg:dash:schema:mpd:2011\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"urn:mpeg:dash:schema:mpd:2011 DASH-MPD.xsd\" profiles=\"urn:mpeg:dash:profile:isoff-on-demand:2011\" minBufferTime=\"PT2S\" type=\"static\" mediaPresentationDuration=\"PT6.4S\" FBManifestIdentifier=\"FgAYEnIyZXZldnA5LXIxZ2VuMnZwORl2/sHn6rb0xgGc0KTekZfjAZa755uf47EDjKrXvLnnxgOitPvSgbu6BN6H6sSS3rIFmMX2vdbBywUiGBhkYXNoX2xuX2hlYWFjX3ZicjNfYXVkaW8A\"><Period id=\"0\" duration=\"PT6.4S\"><AdaptationSet id=\"0\" contentType=\"video\" frameRate=\"15360/512\" subsegmentAlignment=\"true\" par=\"4:5\" FBUnifiedUploadResolutionMos=\"360:85.8\"><Representation id=\"1000133798587014vd\" bandwidth=\"343456\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q40\" FBContentLength=\"274765\" FBPlaybackResolutionMos=\"0:100,360:49.8,480:40.2,720:31.3,1080:27.3\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:90.8,480:85.9,720:76.4,1080:64.8\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBDefaultQuality=\"1\" FBQualityClass=\"hd\" FBQualityLabel=\"360p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQOL98u0_fqAIwZP9FQCAdrNmLS8GknnQcCdHsUsWgsx1hJSuaXqH_S9qBITqiJ9GwjwMqkK6APwjSr4BloU-F_E.mp4?strext=1&amp;_nc_cat=104&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=pCw2Hn9pXloQ7kNvgFbY-1p&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTQwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYBsE7Lgmtw-lPFhrwkxtmU_kt-bsdQaRPIAJuB4Iuffpg&amp;oe=6754BAED</BaseURL><SegmentBase indexRange=\"818-873\" timescale=\"15360\" FBMinimumPrefetchRange=\"874-18094\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"874-42686\" FBFirstSegmentRange=\"874-212319\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"212320-274764\" FBPrefetchSegmentRange=\"874-212319\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"953882066611915v\" bandwidth=\"570167\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q50\" FBContentLength=\"456134\" FBPlaybackResolutionMos=\"0:100,360:63.4,480:54,720:42.5,1080:36.1\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:96.4,480:93.8,720:87.1,1080:77.7\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"480p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQOS4IJc46eh8cuU9v8SHVD6KnsPxa-nOAR6Zt65OWse4bh4j8cHfA2tNtLmav-RnLGOe5B3YRPSIQEquX7tDFKd.mp4?strext=1&amp;_nc_cat=100&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=Qi3IuL5OVHsQ7kNvgE8ZgOg&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTUwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYBSOkyJiqW2Id8ULKmuv66DuB8X6OgneaI9r5qUZLvIMg&amp;oe=6754AEDD</BaseURL><SegmentBase indexRange=\"818-873\" timescale=\"15360\" FBMinimumPrefetchRange=\"874-27973\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"874-68799\" FBFirstSegmentRange=\"874-360831\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"360832-456133\" FBPrefetchSegmentRange=\"874-360831\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"1518943442125295v\" bandwidth=\"793611\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q60\" FBContentLength=\"634889\" FBPlaybackResolutionMos=\"0:100,360:70.8,480:62,720:50.7,1080:43.1\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:97.9,480:96.4,720:91.6,1080:83.7\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"540p\"><BaseURL>https://scontent-atl3-3.cdninstagram.com/o1/v/t16/f2/m69/AQPLKK7XSv3qO1F7b6isPGSaLxncWeLv9-3-b14RA1AmpyLiqF9I67LmJqpvLXMmC0Ov-GjNCPgEXKKtnBIyA5R2.mp4?strext=1&amp;_nc_cat=109&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-3.cdninstagram.com&amp;_nc_ohc=9JTkmfOzrnUQ7kNvgF5GMCW&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTYwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYBsZqaq2mBXTuDjcpylQl908CmrJAr9GGYGmyosl0AN6Q&amp;oe=6754BE32</BaseURL><SegmentBase indexRange=\"818-873\" timescale=\"15360\" FBMinimumPrefetchRange=\"874-35810\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"874-93188\" FBFirstSegmentRange=\"874-507330\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"507331-634888\" FBPrefetchSegmentRange=\"874-507330\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"437406829179007v\" bandwidth=\"1054993\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q70\" FBContentLength=\"843995\" FBPlaybackResolutionMos=\"0:100,360:75.7,480:68.2,720:57,1080:49.1\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:98.54,480:97.9,720:94.8,1080:88.2\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"640p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQNpa7TSCQn-mBRGd9vZgYHt3BfFL9XaBVorqPXGZbM5a-NqKmZG_D6P794j7WOAygx5a97cKNppLHljhVu_rLAm.mp4?strext=1&amp;_nc_cat=101&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=wIPotLxgpykQ7kNvgEoZANz&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTcwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYDVkCI8P9gf4bjTogldT5FVt3tApCFoWEhJKGf-eaSrMQ&amp;oe=6754C68A</BaseURL><SegmentBase indexRange=\"818-873\" timescale=\"15360\" FBMinimumPrefetchRange=\"874-42954\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"874-119853\" FBFirstSegmentRange=\"874-678825\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"678826-843994\" FBPrefetchSegmentRange=\"874-678825\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"499575796569102v\" bandwidth=\"1384665\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q80\" FBContentLength=\"1107732\" FBPlaybackResolutionMos=\"0:100,360:79.4,480:72.4,720:62,1080:53.6\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:98.94,480:98.61,720:96.1,1080:90.2\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"720p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQO11Mps33Ou4EwKykmLc8-R6U14yGm4h9FaEcQMRpSGYGAdzKX75TYlqCaxtmcCZ49hcvWVZ0xt0uv27oo5KjiH.mp4?strext=1&amp;_nc_cat=100&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=Rs25R83oSR8Q7kNvgFCKKQD&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTgwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYDjJdAK9a7OuRWkgS2LCFAQhpzsRJQishKM4cwB5gC1Xw&amp;oe=67549109</BaseURL><SegmentBase indexRange=\"818-873\" timescale=\"15360\" FBMinimumPrefetchRange=\"874-53041\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"874-154715\" FBFirstSegmentRange=\"874-891825\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"891826-1107731\" FBPrefetchSegmentRange=\"874-891825\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"1254457089158417v\" bandwidth=\"2129656\" codecs=\"vp09.00.40.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q90\" FBContentLength=\"1703725\" FBPlaybackResolutionMos=\"0:100,360:85.8,480:79,720:71.1,1080:65.5\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:98.97,480:98.79,720:98.1,1080:94.9\" FBAbrPolicyTags=\"avoid_on_cellular,avoid_on_cellular_intentional\" width=\"1080\" height=\"1350\" FBQualityClass=\"hd\" FBQualityLabel=\"1080p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQNQXuCCywHzgju7PuSfakg77OjeIrZYH9ryWeaXn0axQ832FF3Wz3LJqRJGJhohZdflElUWzGwhHMbT95I8OTRE.mp4?strext=1&amp;_nc_cat=103&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=JD4tUoDYmAkQ7kNvgGG4ttx&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTkwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYA-E17WlILlPKxaNU6dtD0Ilu7VOftOzv23CdaLhcZHIQ&amp;oe=6754C2D8</BaseURL><SegmentBase indexRange=\"818-873\" timescale=\"15360\" FBMinimumPrefetchRange=\"874-73126\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"874-228580\" FBFirstSegmentRange=\"874-1341965\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"1341966-1703724\" FBPrefetchSegmentRange=\"874-1341965\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation></AdaptationSet><AdaptationSet id=\"1\" contentType=\"audio\" subsegmentStartsWithSAP=\"1\" subsegmentAlignment=\"true\"><Representation id=\"1573429926875468ad\" bandwidth=\"100745\" codecs=\"mp4a.40.5\" mimeType=\"audio/mp4\" FBAvgBitrate=\"100745\" audioSamplingRate=\"44100\" FBEncodingTag=\"dash_ln_heaac_vbr3_audio\" FBContentLength=\"81006\" FBAbrPolicyTags=\"\" FBDefaultQuality=\"1\"><AudioChannelConfiguration schemeIdUri=\"urn:mpeg:dash:23003:3:audio_channel_configuration:2011\" value=\"2\"/><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQOVOHAfjP7XNsxOUe5oziCA1XAbIuGPxYL9SSStaqHec8QQeN84xLMCBK69a4kb6BOB31XgSUhFQ5R5kx8eiYbu.mp4?strext=1&amp;_nc_cat=106&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=J3AYt1amG5IQ7kNvgG5WfQn&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9sbl9oZWFhY192YnIzX2F1ZGlvIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYC57WQ_tQ_xDXzXjh2t7uMlgkULtegi8heftCxn619W0w&amp;oe=6754A41B</BaseURL><SegmentBase indexRange=\"824-903\" timescale=\"44100\" FBMinimumPrefetchRange=\"904-1247\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"904-12063\" FBFirstSegmentRange=\"904-25757\" FBFirstSegmentDuration=\"2021\" FBSecondSegmentRange=\"25758-52588\" FBPrefetchSegmentRange=\"904-52588\" FBPrefetchSegmentDuration=\"4017\"><Initialization range=\"0-823\"/></SegmentBase></Representation></AdaptationSet></Period></MPD>\n",
                                                "number_of_qualities": 6
                                            },
                                            "has_audio": false,
                                            "tracking_token": "eyJ2ZXJzaW9uIjo1LCJwYXlsb2FkIjp7ImlzX2FuYWx5dGljc190cmFja2VkIjp0cnVlLCJ1dWlkIjoiYmM1MmYwZDVhMzU1NDI1Y2ExODI0ZWFjOGNmZTRlNzUzNTA1ODU5NTk3OTAxMjIxODc4In0sInNpZ25hdHVyZSI6IiJ9",
                                            "video_url": "https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQP7zZe11tnea3nSjrScX3QREcUCE7H16AoEliraSaUbVDAiYitPpbx732TPycc8zY4v5A5ULhG_hyyvkNJ8AER_.mp4?stp=dst-mp4&efg=eyJxZV9ncm91cHMiOiJbXCJpZ193ZWJfZGVsaXZlcnlfdnRzX290ZlwiXSIsInZlbmNvZGVfdGFnIjoidnRzX3ZvZF91cmxnZW4uY2Fyb3VzZWxfaXRlbS5jMi4xMDgwLmJhc2VsaW5lIn0&_nc_cat=102&vs=971373818158171_1617101894&_nc_vs=HBksFQIYOnBhc3N0aHJvdWdoX2V2ZXJzdG9yZS9HS3UzSVFOcHNZOUJLTGNGQUtnVXlEUXVEUkJKYnBSMUFBQUYVAALIAQAVAhg6cGFzc3Rocm91Z2hfZXZlcnN0b3JlL0dNSjMzQnMyZWIzdDExRURBTm5lM0xfcXRWdHpia1lMQUFBRhUCAsgBACgAGAAbABUAACbA24myoI%2F6QBUCKAJDMywXQBmZmZmZmZoYFmRhc2hfYmFzZWxpbmVfMTA4MHBfdjERAHXuBwA%3D&ccb=9-4&oh=00_AYCSU82TTUabYeBBja0Iq9dUeRU7kGq8CwsvBEwRb98Xeg&oe=6750A574&_nc_sid=8b3546",
                                            "video_view_count": 23938
                                        }
                                    },
                                    {
                                        "node": {
                                            "__typename": "GraphImage",
                                            "id": "3505860551132174366",
                                            "shortcode": "DCnUZiuSdge",
                                            "dimensions": {
                                                "height": 1350,
                                                "width": 1080
                                            },
                                            "display_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.29350-15/467963244_575691474954411_5693602276473358032_n.jpg?stp=dst-jpg_e35_p1080x1080_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=103&_nc_ohc=MsbpxpfGzxYQ7kNvgFeGCUp&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDo6PX9-Tvm9mIYzjPpc5tpKLqzIs5z3giCUEaiAdgnYQ&oe=67549415&_nc_sid=8b3546",
                                            "edge_media_to_tagged_user": {
                                                "edges": [
                                                    {
                                                        "node": {
                                                            "user": {
                                                                "full_name": "",
                                                                "followed_by_viewer": false,
                                                                "id": "1924521",
                                                                "is_verified": true,
                                                                "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/244362143_902995690346326_4181665239625661127_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=110&_nc_ohc=LYG6h6t6hxwQ7kNvgEsfKJZ&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAuTV2FojOelmgBKtlLL10KV3mlI8O75muuVbaB9Ipw6A&oe=6754BCB1&_nc_sid=8b3546",
                                                                "username": "verdy"
                                                            },
                                                            "x": 0.44105173880000004,
                                                            "y": 0.8592027142
                                                        }
                                                    },
                                                    {
                                                        "node": {
                                                            "user": {
                                                                "full_name": "kyan  /  かいあん",
                                                                "followed_by_viewer": false,
                                                                "id": "5045385127",
                                                                "is_verified": false,
                                                                "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/311338745_606807284463736_1142699983768494601_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=iz_DaI7S1cQQ7kNvgH06jCR&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYADUv5Y_jH0lSyirSzo-tREPv2cn3C5BN170Bgc2hSf8w&oe=675494DB&_nc_sid=8b3546",
                                                                "username": "kyanlm"
                                                            },
                                                            "x": 0.7158608991000001,
                                                            "y": 0.8617472434000001
                                                        }
                                                    }
                                                ]
                                            },
                                            "fact_check_overall_rating": null,
                                            "fact_check_information": null,
                                            "gating_info": null,
                                            "sharing_friction_info": {
                                                "should_have_sharing_friction": false,
                                                "bloks_app_url": null
                                            },
                                            "media_overlay_info": null,
                                            "media_preview": "ACIq09lQvKBuXBIUA5HP4VTllmIJOVTkD1P1AHHrVW7maOMRj5Qccj0yRSeoJGgZ8DAUlAASTwRnv156+vH1qZ1LAKDjt09v0PvWBA4jLFTkE4zznHt6H37VPHeNGwJ+bv8An/P8aAubPmY4Haisv7X7frRQF0WPsnmOS0m5vu8jgfr0+lQSaW2SWk3heOQenbHJqz8kkZWMM3OScdcf0BPTpRMfJjCb9pHXB6jr+QoGQGwWJdpcKeSTjPYcdfX86ZFYpKflkzjocEYJ9VPX2OaHukZxG7BwAMMP4mPrgetW4FRXLABfkwMnrz6H9KPILaXKv9nn+/8Ap/8AXordVhgciimKxn2Y2DHI2jt/nmse/kM02fUDH05xWxF9x/wrCuuLlvZv6UkDJ4oxHhxgkevr64PHpUm8sDn5mJB3cdP6VUjJ/wA/WnqOfxpiJN59aKiooJP/2Q==",
                                            "owner": {
                                                "id": "25025320",
                                                "username": "instagram"
                                            },
                                            "is_video": false,
                                            "has_upcoming_event": false,
                                            "accessibility_caption": "Three people taking a selfie in a studio."
                                        }
                                    },
                                    {
                                        "node": {
                                            "__typename": "GraphVideo",
                                            "id": "3505859692876979349",
                                            "shortcode": "DCnUNDaStyV",
                                            "dimensions": {
                                                "height": 937,
                                                "width": 750
                                            },
                                            "display_url": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-15/467768439_18609531181001321_255776869379980605_n.jpg?stp=dst-jpg_e15_tt6&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=105&_nc_ohc=2XTPWUC4DlQQ7kNvgGjAyJ7&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYCbjl3UsMyXU1abcyD8F0lTwgne2xdnm0Ge_yPY_Fih7g&oe=6754BA18&_nc_sid=8b3546",
                                            "edge_media_to_tagged_user": {
                                                "edges": [
                                                    {
                                                        "node": {
                                                            "user": {
                                                                "full_name": "",
                                                                "followed_by_viewer": false,
                                                                "id": "1924521",
                                                                "is_verified": true,
                                                                "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/244362143_902995690346326_4181665239625661127_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=110&_nc_ohc=LYG6h6t6hxwQ7kNvgEsfKJZ&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAuTV2FojOelmgBKtlLL10KV3mlI8O75muuVbaB9Ipw6A&oe=6754BCB1&_nc_sid=8b3546",
                                                                "username": "verdy"
                                                            },
                                                            "x": 0,
                                                            "y": 0
                                                        }
                                                    },
                                                    {
                                                        "node": {
                                                            "user": {
                                                                "full_name": "kyan  /  かいあん",
                                                                "followed_by_viewer": false,
                                                                "id": "5045385127",
                                                                "is_verified": false,
                                                                "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/311338745_606807284463736_1142699983768494601_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=iz_DaI7S1cQQ7kNvgH06jCR&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYADUv5Y_jH0lSyirSzo-tREPv2cn3C5BN170Bgc2hSf8w&oe=675494DB&_nc_sid=8b3546",
                                                                "username": "kyanlm"
                                                            },
                                                            "x": 0,
                                                            "y": 0
                                                        }
                                                    }
                                                ]
                                            },
                                            "fact_check_overall_rating": null,
                                            "fact_check_information": null,
                                            "gating_info": null,
                                            "sharing_friction_info": {
                                                "should_have_sharing_friction": false,
                                                "bloks_app_url": null
                                            },
                                            "media_overlay_info": null,
                                            "media_preview": "ACIqgNlzkdh+fp+X9KjWzYD39RWttB6H6ke1SQ9Mg9/8+lK47aXMgSyQEbsMvv1q0moIPu7l9c8j/P4VBc7ppT3CnaP5nt/OoCmCRii47Gz5oPOI+aK5rzSO9FArHRLg4Pr7e3tUm1u39arCby+GGPoaUXXmcR8Hrk+lAhXjKcLwDk+vJ71C0hRTxn2HU/8A66nUtIDkgKp+8eOfT39/yqk8oV9sZDt3PX/9f16CpsaXsh32OPuv8/8ACim4Pr/P/GinYnm/qxLcDecAjp+pPrTVVoQzYC8cD/PvSryWzSlRt6d6okqPJ+7EfuWP5YFFofnOfSmzDGPpSWv+s/A0C6l0snfOaKrEDNFBpc//2Q==",
                                            "owner": {
                                                "id": "25025320",
                                                "username": "instagram"
                                            },
                                            "is_video": true,
                                            "has_upcoming_event": false,
                                            "accessibility_caption": null,
                                            "dash_info": {
                                                "is_dash_eligible": true,
                                                "video_dash_manifest": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<MPD xmlns=\"urn:mpeg:dash:schema:mpd:2011\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"urn:mpeg:dash:schema:mpd:2011 DASH-MPD.xsd\" profiles=\"urn:mpeg:dash:profile:isoff-on-demand:2011\" minBufferTime=\"PT2S\" type=\"static\" mediaPresentationDuration=\"PT12.166667S\" FBManifestIdentifier=\"FgAYEnIyZXZldnA5LXIxZ2VuMnZwORmWto/px7Pk3gGAzNzZuufwAdqhidPO7IQCgvvZjf+OiQKMrYfJw7ejA6jziZTFhu4D3L+xvJSkyAW2oY/71aTgBYTBgai35bQGIhgYZGFzaF9sbl9oZWFhY192YnIzX2F1ZGlvAA==\"><Period id=\"0\" duration=\"PT12.166667S\"><AdaptationSet id=\"0\" contentType=\"video\" frameRate=\"12288/512\" subsegmentAlignment=\"true\" par=\"4:5\" FBUnifiedUploadResolutionMos=\"360:77.6\"><Representation id=\"1086429849533652vd\" bandwidth=\"94791\" codecs=\"vp09.00.30.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q20\" FBContentLength=\"144162\" FBPlaybackResolutionMos=\"0:100,360:21.9,480:20.1,720:19.8,1080:21.6\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:65.4,480:56.5,720:44.6,1080:33\" FBAbrPolicyTags=\"\" width=\"538\" height=\"674\" FBDefaultQuality=\"1\" FBQualityClass=\"sd\" FBQualityLabel=\"240p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQOPceN05zVBNp-gD5Q_43EZFJ0QPGVImL275H4IQmDSovyVjV3ekOByjLppzL6mJ7yt7UxaGittBKFXvlPJJHTn.mp4?strext=1&amp;_nc_cat=108&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=7kJNTKeQj1AQ7kNvgG4ChyN&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTIwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYDTjNKxiP-U5JlUl-Uv-dlkgtqJe_ozJ23fZYKmzvNICA&amp;oe=6754C775</BaseURL><SegmentBase indexRange=\"818-885\" timescale=\"12288\" FBMinimumPrefetchRange=\"886-3265\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"886-15508\" FBFirstSegmentRange=\"886-61350\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"61351-116935\" FBPrefetchSegmentRange=\"886-61350\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"1566325780918254v\" bandwidth=\"186515\" codecs=\"vp09.00.30.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q30\" FBContentLength=\"283659\" FBPlaybackResolutionMos=\"0:100,360:35.3,480:31.9,720:29.7,1080:30.5\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:82.1,480:74.2,720:62,1080:49.5\" FBAbrPolicyTags=\"\" width=\"538\" height=\"674\" FBQualityClass=\"sd\" FBQualityLabel=\"270p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQP2Unmxcq5ngTkY9FXLNk5mAKKcfhybkUg9zXlUyxg_ea5sM0rDJM6Ze7VnRr9V34p2wWCZRYIdWvP6pTIZbdQs.mp4?strext=1&amp;_nc_cat=106&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=uBc7-VbzEugQ7kNvgH5nII5&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTMwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYB9L5sya564JsfcOOM0QLlpnCjRSuRnfKqtBiOWBteDDw&amp;oe=6754C6FB</BaseURL><SegmentBase indexRange=\"818-885\" timescale=\"12288\" FBMinimumPrefetchRange=\"886-4434\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"886-28033\" FBFirstSegmentRange=\"886-123307\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"123308-231664\" FBPrefetchSegmentRange=\"886-123307\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"1804941660270658v\" bandwidth=\"256543\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q40\" FBContentLength=\"390160\" FBPlaybackResolutionMos=\"0:100,360:41,480:36.1,720:33.6,1080:33.8\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:87.7,480:80.6,720:68.9,1080:56.3\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"360p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQMMTwN6TqGcystltlKBe1ukt_FE0iASp_yDO4PDvdXuvnjvR9o9JZehFhDLr_u1XfukFEJLuG11R9kM7oSFazFR.mp4?strext=1&amp;_nc_cat=105&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=NpqMwQgDjQQQ7kNvgFrjD8O&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTQwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYBQeIkUIabknU0lm1HIy9UUQs4goyhFvV2mRPCiMLSz_g&amp;oe=67549DC6</BaseURL><SegmentBase indexRange=\"818-885\" timescale=\"12288\" FBMinimumPrefetchRange=\"886-5291\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"886-37182\" FBFirstSegmentRange=\"886-168701\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"168702-319315\" FBPrefetchSegmentRange=\"886-168701\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"922344706075462v\" bandwidth=\"412113\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q50\" FBContentLength=\"626756\" FBPlaybackResolutionMos=\"0:100,360:52.2,480:46.7,720:42.4,1080:41.5\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:94.7,480:90.4,720:80.4,1080:69\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"480p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQPEQ0wX_x622sutpMBjLhj6zsQf4bQXbZ5eWH42NaNmkxLOxdcIMdkmMe1nv6XOzJlkZY8bHQZHTt5gfYs-qZXp.mp4?strext=1&amp;_nc_cat=107&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=1FROG1T7vgEQ7kNvgFvTYtu&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTUwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYCiECYPDd3IMFPogyRA1c4wLnHQJ7gfeVBgZZoOp3KSFQ&amp;oe=67549F30</BaseURL><SegmentBase indexRange=\"818-885\" timescale=\"12288\" FBMinimumPrefetchRange=\"886-6776\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"886-54596\" FBFirstSegmentRange=\"886-269208\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"269209-511335\" FBPrefetchSegmentRange=\"886-269208\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"573612028405869v\" bandwidth=\"641239\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q60\" FBContentLength=\"975218\" FBPlaybackResolutionMos=\"0:100,360:62,480:56.6,720:51.7,1080:49.7\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:98.05,480:96.1,720:89.8,1080:79.5\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"540p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQOAQ_Dt4dXeNk0hCuiuiQUeIyw6nfPGip3AzRwnWGbD2fzXB_ar3VCUKUyVCrCaZ-LE6v_u0Mh3lBU3ujstXsh-.mp4?strext=1&amp;_nc_cat=105&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=UlbyzEw5LpsQ7kNvgGLJjdh&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTYwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYAK7ZZ79Wtl95b67me5Lz1nlScx85YFzWebZQsG78bAGw&amp;oe=6754BF8E</BaseURL><SegmentBase indexRange=\"818-885\" timescale=\"12288\" FBMinimumPrefetchRange=\"886-8815\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"886-77949\" FBFirstSegmentRange=\"886-413494\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"413495-788264\" FBPrefetchSegmentRange=\"886-413494\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"489908070065115v\" bandwidth=\"952091\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q70\" FBContentLength=\"1447972\" FBPlaybackResolutionMos=\"0:100,360:70.3,480:65.3,720:60,1080:57.1\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:99.121,480:98.64,720:95.7,1080:88.4\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"640p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQPf14bcSm2lRBKNCKohi2EvYtN5ZBGo5QIQREUh722kZZM2dVlAmPHHcm5El_4EhaT91VnOlKKf56npRRyqDPaO.mp4?strext=1&amp;_nc_cat=102&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=UxyS-rlW0RoQ7kNvgEpXjcA&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTcwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYB0xyY3y3zoIRiFICH2GUkFUG6vlg678CjhtgXYXeY_XA&amp;oe=6754C763</BaseURL><SegmentBase indexRange=\"818-885\" timescale=\"12288\" FBMinimumPrefetchRange=\"886-11568\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"886-108150\" FBFirstSegmentRange=\"886-610271\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"610272-1164849\" FBPrefetchSegmentRange=\"886-610271\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"1619111128983643v\" bandwidth=\"1348662\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q80\" FBContentLength=\"2051091\" FBPlaybackResolutionMos=\"0:100,360:77,480:72.9,720:68.1,1080:64.8\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:99.404,480:99.198,720:98.27,1080:94.3\" FBAbrPolicyTags=\"avoid_on_cellular,avoid_on_cellular_intentional\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"720p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQMiq-k-KttLWa2TVjB8NOZhm0JIyDVkQAVMXyP2JSwtZ2SbqCmCr-z7AdSciuVitOO2FQhk9oAeuxJTKp_2GhLO.mp4?strext=1&amp;_nc_cat=104&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=8symi8bU8NsQ7kNvgHkOrrT&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTgwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYBPXHO2HHgiEWs0DzgxGUlaGmXOS5tJ2gin0GMvkfZXLA&amp;oe=675497BD</BaseURL><SegmentBase indexRange=\"818-885\" timescale=\"12288\" FBMinimumPrefetchRange=\"886-14621\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"886-145800\" FBFirstSegmentRange=\"886-859330\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"859331-1644247\" FBPrefetchSegmentRange=\"886-859330\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"529542986568448v\" bandwidth=\"1974232\" codecs=\"vp09.00.40.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q90\" FBContentLength=\"3002478\" FBPlaybackResolutionMos=\"0:100,360:82,480:77.2,720:73,1080:70.3\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:99.468,480:99.333,720:99.031,1080:97.8\" FBAbrPolicyTags=\"avoid_on_cellular,avoid_on_cellular_intentional\" width=\"1080\" height=\"1350\" FBQualityClass=\"hd\" FBQualityLabel=\"1080p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQNtWv0kJdDyZ26N_4NoT97w4_-VROyZaBOHujiCHJ7qqigKVuS0eANq85eBbIfXKb5Yz5MSKpqJ9UnqVwHnWTbu.mp4?strext=1&amp;_nc_cat=105&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=L35Xyt0JmusQ7kNvgG8ky4_&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTkwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYC-nnOReOJBGv-BJttQ_laOwSXUVkBsa_nXn1KpQJj5uQ&amp;oe=67549922</BaseURL><SegmentBase indexRange=\"818-885\" timescale=\"12288\" FBMinimumPrefetchRange=\"886-19841\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"886-202213\" FBFirstSegmentRange=\"886-1254110\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"1254111-2407534\" FBPrefetchSegmentRange=\"886-1254110\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation></AdaptationSet><AdaptationSet id=\"1\" contentType=\"audio\" subsegmentStartsWithSAP=\"1\" subsegmentAlignment=\"true\"><Representation id=\"582998740909761ad\" bandwidth=\"93015\" codecs=\"mp4a.40.5\" mimeType=\"audio/mp4\" FBAvgBitrate=\"93015\" audioSamplingRate=\"44100\" FBEncodingTag=\"dash_ln_heaac_vbr3_audio\" FBContentLength=\"142119\" FBAbrPolicyTags=\"\" FBDefaultQuality=\"1\"><AudioChannelConfiguration schemeIdUri=\"urn:mpeg:dash:23003:3:audio_channel_configuration:2011\" value=\"2\"/><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQOHgE69nNqIOcJuRjTBC2P_1CLN2qbOMs2_qhw5Xg0jcqmE56V3viyztNjiYxrCyZ58Xl5J6ybd9DyllF3T8oqG.mp4?strext=1&amp;_nc_cat=111&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=p5Er3VNXZ3YQ7kNvgEas5DU&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9sbl9oZWFhY192YnIzX2F1ZGlvIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYAOpxOENeZGbgerIKta05vk40JaZbOHETyYvx9aJsXAeA&amp;oe=67549D0C</BaseURL><SegmentBase indexRange=\"824-939\" timescale=\"44100\" FBMinimumPrefetchRange=\"940-1283\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"940-12887\" FBFirstSegmentRange=\"940-25388\" FBFirstSegmentDuration=\"2021\" FBSecondSegmentRange=\"25389-49663\" FBPrefetchSegmentRange=\"940-49663\" FBPrefetchSegmentDuration=\"4017\"><Initialization range=\"0-823\"/></SegmentBase></Representation></AdaptationSet></Period></MPD>\n",
                                                "number_of_qualities": 8
                                            },
                                            "has_audio": false,
                                            "tracking_token": "eyJ2ZXJzaW9uIjo1LCJwYXlsb2FkIjp7ImlzX2FuYWx5dGljc190cmFja2VkIjp0cnVlLCJ1dWlkIjoiYmM1MmYwZDVhMzU1NDI1Y2ExODI0ZWFjOGNmZTRlNzUzNTA1ODU5NjkyODc2OTc5MzQ5In0sInNpZ25hdHVyZSI6IiJ9",
                                            "video_url": "https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQNoo2mbjOyQFkkPXyGRCKF6z56BnFS6DhikWpz7iM7bYKCsEKO301GqdYVq0VdGCW-Cv9L0T84op_HN97x16ZXB.mp4?stp=dst-mp4&efg=eyJxZV9ncm91cHMiOiJbXCJpZ193ZWJfZGVsaXZlcnlfdnRzX290ZlwiXSIsInZlbmNvZGVfdGFnIjoidnRzX3ZvZF91cmxnZW4uY2Fyb3VzZWxfaXRlbS5jMi4xMDgwLmJhc2VsaW5lIn0&_nc_cat=101&vs=550863134232764_1878229278&_nc_vs=HBksFQIYOnBhc3N0aHJvdWdoX2V2ZXJzdG9yZS9HSVJiUEFlTUpXbjM4VjBoQUhoaG9faGd1bDB5YnBSMUFBQUYVAALIAQAVAhg6cGFzc3Rocm91Z2hfZXZlcnN0b3JlL0dEbEgzQnUwQkE3Z1NVSUZBR1ZoNTZQUVRabHlia1lMQUFBRhUCAsgBACgAGAAbABUAACak3%2FbtzqLuPxUCKAJDMywXQChU%2FfO2RaIYFmRhc2hfYmFzZWxpbmVfMTA4MHBfdjERAHXuBwA%3D&ccb=9-4&oh=00_AYCEprRkr1ZBKTnUcQzlwb47tgq7a-Sx_-Mt-g1VIGUNXA&oe=6750B3E7&_nc_sid=8b3546",
                                            "video_view_count": 9670
                                        }
                                    },
                                    {
                                        "node": {
                                            "__typename": "GraphVideo",
                                            "id": "3505859856169522049",
                                            "shortcode": "DCnUPbfSVOB",
                                            "dimensions": {
                                                "height": 937,
                                                "width": 750
                                            },
                                            "display_url": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-15/467772843_18609531211001321_325756080635443175_n.jpg?stp=dst-jpg_e15&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=105&_nc_ohc=wa7UnHknQbYQ7kNvgEk8ggl&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBU-3KiZ0L2kIQnAhnCaoqEiselTGUaaBqScmFQte2qdw&oe=6754C0F0&_nc_sid=8b3546",
                                            "edge_media_to_tagged_user": {
                                                "edges": [
                                                    {
                                                        "node": {
                                                            "user": {
                                                                "full_name": "",
                                                                "followed_by_viewer": false,
                                                                "id": "1924521",
                                                                "is_verified": true,
                                                                "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/244362143_902995690346326_4181665239625661127_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=110&_nc_ohc=LYG6h6t6hxwQ7kNvgEsfKJZ&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAuTV2FojOelmgBKtlLL10KV3mlI8O75muuVbaB9Ipw6A&oe=6754BCB1&_nc_sid=8b3546",
                                                                "username": "verdy"
                                                            },
                                                            "x": 0,
                                                            "y": 0
                                                        }
                                                    },
                                                    {
                                                        "node": {
                                                            "user": {
                                                                "full_name": "kyan  /  かいあん",
                                                                "followed_by_viewer": false,
                                                                "id": "5045385127",
                                                                "is_verified": false,
                                                                "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/311338745_606807284463736_1142699983768494601_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=iz_DaI7S1cQQ7kNvgH06jCR&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYADUv5Y_jH0lSyirSzo-tREPv2cn3C5BN170Bgc2hSf8w&oe=675494DB&_nc_sid=8b3546",
                                                                "username": "kyanlm"
                                                            },
                                                            "x": 0,
                                                            "y": 0
                                                        }
                                                    }
                                                ]
                                            },
                                            "fact_check_overall_rating": null,
                                            "fact_check_information": null,
                                            "gating_info": null,
                                            "sharing_friction_info": {
                                                "should_have_sharing_friction": false,
                                                "bloks_app_url": null
                                            },
                                            "media_overlay_info": null,
                                            "media_preview": "ACIqvmEOVAJ65PfHQjI7U8sHPlkEd8gf561iw30UDNtDMG4z0Prn3rZKIMzA5LL68YxkYoAxXjfeWY7X5PfIPX/PtW/GSVyeCeawhICOSdwOMe2PX/PanyXEhi2gkY598Dtn/PpS6j3NckZormvLmPOW5/26Keg+V9imCqkhgTj0P59vyrctZRJBtB+4uD9f8PT2qg1usj5ORu44GOavzgRRDpuAAPrgZxQ2JdSlGcufx/nVhuoHqMfnUFsD3/z0qwD85PoP/r1LEY/nOOPT2H+FFWvLJ/hoqwN2BBt8zp6Z/nSsUY7WAYsf8/lT5zxVS36ue4xzWPmbJdCNrdlYovAHOfY/WowWjfbgkgZLY4q5F1P4VbStOlzLrYzy756fy/worSI5opAf/9k=",
                                            "owner": {
                                                "id": "25025320",
                                                "username": "instagram"
                                            },
                                            "is_video": true,
                                            "has_upcoming_event": false,
                                            "accessibility_caption": null,
                                            "dash_info": {
                                                "is_dash_eligible": true,
                                                "video_dash_manifest": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<MPD xmlns=\"urn:mpeg:dash:schema:mpd:2011\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"urn:mpeg:dash:schema:mpd:2011 DASH-MPD.xsd\" profiles=\"urn:mpeg:dash:profile:isoff-on-demand:2011\" minBufferTime=\"PT2S\" type=\"static\" mediaPresentationDuration=\"PT25.066668S\" FBManifestIdentifier=\"FgAYEnIyZXZldnA5LXIxZ2VuMnZwORmG5t/rpc/04AHo1sKArI3hAbikz8aJtosCmvXygMK/jALclPP0h8egA7ymgJyp//4DhIqmw7DAugW88PPnsabkCiIYGGRhc2hfbG5faGVhYWNfdmJyM19hdWRpbwA=\"><Period id=\"0\" duration=\"PT25.066668S\"><AdaptationSet id=\"0\" contentType=\"video\" frameRate=\"15360/512\" subsegmentAlignment=\"true\" par=\"4:5\" FBUnifiedUploadResolutionMos=\"360:84.7\"><Representation id=\"916014507124014vd\" bandwidth=\"300904\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q30\" FBContentLength=\"942834\" FBPlaybackResolutionMos=\"0:100,360:27.4,480:23.8,720:22,1080:21.6\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:85.9,480:80.4,720:70.8,1080:60.7\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBDefaultQuality=\"1\" FBQualityClass=\"hd\" FBQualityLabel=\"270p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQO78ryMMxUGfBPNDiZzpSepXfyTRd3MF8Nk9odbepB_qvWj5pT2MYpiNQvUh4rCA0b4HCSQzf7xBmY-UdSfHkzu.mp4?strext=1&amp;_nc_cat=102&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=tDOPAOSo6o8Q7kNvgFfixJg&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTMwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYDAKna6UhZ8xF8Optn_Gpq-tCO8A4-wl3Ml5_E0rCTD_w&amp;oe=6754B027</BaseURL><SegmentBase indexRange=\"818-921\" timescale=\"15360\" FBMinimumPrefetchRange=\"922-41700\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"922-67717\" FBFirstSegmentRange=\"922-178343\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"178344-383294\" FBPrefetchSegmentRange=\"922-178343\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"588068204177692v\" bandwidth=\"423580\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q40\" FBContentLength=\"1327218\" FBPlaybackResolutionMos=\"0:100,360:32.2,480:29.1,720:26.2,1080:25.2\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:92.5,480:88.2,720:80.1,1080:70.5\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"360p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQPyG9E3tPqeKhZRUqSb44kcbqZmVEjc3cWALl3U8YrdzwCt4w3bj7bohAc40xkJW4tFdgoyLOVuC3Lk4d6jf7UN.mp4?strext=1&amp;_nc_cat=110&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=n0R6zEhDKRoQ7kNvgGIgX60&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTQwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYCcJoKJ004LcyG47AWMrMdWzgy235XfzeoPCgaDPWM5pA&amp;oe=6754C36F</BaseURL><SegmentBase indexRange=\"818-921\" timescale=\"15360\" FBMinimumPrefetchRange=\"922-51547\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"922-88729\" FBFirstSegmentRange=\"922-250374\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"250375-535799\" FBPrefetchSegmentRange=\"922-250374\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"495009476924852v\" bandwidth=\"627743\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q50\" FBContentLength=\"1966929\" FBPlaybackResolutionMos=\"0:100,360:36.7,480:33.9,720:31.4,1080:30.4\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:95.9,480:93.1,720:86.6,1080:78\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"480p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQPbcg72AY0MBNP6hPfW8tygNBZltklIW1oCXmETJsMtY-jS9g5QkRMG4dyuTZewi53utmYtjxJ-rc1fFY4XnMfN.mp4?strext=1&amp;_nc_cat=107&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=NEHoMspYWE8Q7kNvgFRwYYf&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTUwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYBp1byUOQy8IvFo-u6zKy5ByB5N5Wzy3Lw5i3onTqrBAQ&amp;oe=6754A850</BaseURL><SegmentBase indexRange=\"818-921\" timescale=\"15360\" FBMinimumPrefetchRange=\"922-64195\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"922-121495\" FBFirstSegmentRange=\"922-370299\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"370300-789344\" FBPrefetchSegmentRange=\"922-370299\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"590429423557965v\" bandwidth=\"899800\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q60\" FBContentLength=\"2819375\" FBPlaybackResolutionMos=\"0:100,360:41,480:38.1,720:35.1,1080:34.1\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:98.32,480:96.8,720:92.1,1080:84.6\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"540p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQM6AtQvybs2KEGYM1n4NheV1bnzuOwpTGvz_RGyapPRZjQu-LDZhKMWvSM52fXujPcdWTwTerBxKVWHIP0POW9O.mp4?strext=1&amp;_nc_cat=110&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=1jhzXJvIMOIQ7kNvgHeKRLG&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTYwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYAoBKZkE9g0zepeh2_QC3X7CkMv_O1_NES6UXdCoJWUpQ&amp;oe=6754A0EB</BaseURL><SegmentBase indexRange=\"818-921\" timescale=\"15360\" FBMinimumPrefetchRange=\"922-76706\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"922-160990\" FBFirstSegmentRange=\"922-528324\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"528325-1132160\" FBPrefetchSegmentRange=\"922-528324\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"3035311613312030v\" bandwidth=\"1259161\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q70\" FBContentLength=\"3945374\" FBPlaybackResolutionMos=\"0:100,360:44.3,480:42.1,720:39.6,1080:38.1\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:99.114,480:98.67,720:95.9,1080:90.3\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"640p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQP8TIbMEucIyUSzkOUDarHcUSBT9Ac6PMp3VSsl6huJ3XSgM7o8FSDs2nALLWH4ngOR4SuVWjLDHakD3LqFsJjD.mp4?strext=1&amp;_nc_cat=111&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=_dO3i-pyt8MQ7kNvgEGsDHn&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTcwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYAyTcIvtssJ3kXVPnVYfPx5RDC3g9HY3UqzpWCJDXurAQ&amp;oe=6754AB98</BaseURL><SegmentBase indexRange=\"818-921\" timescale=\"15360\" FBMinimumPrefetchRange=\"922-88469\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"922-204971\" FBFirstSegmentRange=\"922-736218\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"736219-1571268\" FBPrefetchSegmentRange=\"922-736218\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"1536024257020546v\" bandwidth=\"1715394\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q80\" FBContentLength=\"5374904\" FBPlaybackResolutionMos=\"0:100,360:46.7,480:44.5,720:42.6,1080:41.3\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:99.533,480:99.427,720:98.61,1080:94.8\" FBAbrPolicyTags=\"avoid_on_cellular,avoid_on_cellular_intentional\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"720p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQP5-5fL7zo53NU5EspcCznMdcAqDT6C7BHK3-sryyx-GwS0EM6mViliack4yRRKprqVsz5Rw-DP5Hy_QBojGR95.mp4?strext=1&amp;_nc_cat=105&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=sad__IWv_NEQ7kNvgFxUqo8&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTgwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYDJ4Pg3nBkZQnBaNIuI-CgI9Ui5IDTtRKJykHvpiYs1OQ&amp;oe=6754B7FE</BaseURL><SegmentBase indexRange=\"818-921\" timescale=\"15360\" FBMinimumPrefetchRange=\"922-103385\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"922-306393\" FBFirstSegmentRange=\"922-988436\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"988437-2100078\" FBPrefetchSegmentRange=\"922-988436\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"494584716949491v\" bandwidth=\"2625332\" codecs=\"vp09.00.40.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q90\" FBContentLength=\"8226041\" FBPlaybackResolutionMos=\"0:100,360:50.5,480:49.3,720:48.2,1080:48\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:99.532,480:99.467,720:99.254,1080:98.35\" FBAbrPolicyTags=\"avoid_on_cellular,avoid_on_cellular_intentional\" width=\"1080\" height=\"1350\" FBQualityClass=\"hd\" FBQualityLabel=\"1080p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQPvhYX3lvmERvcOVdat22qKPtHhNDwK8bJjgcHHweMysQm41Icbq3GLXUqWffMhA-Ek9LkEOS1ZaZb_9lT7UfUG.mp4?strext=1&amp;_nc_cat=108&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=yFIhCgDSEdUQ7kNvgFlgiG3&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTkwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYBAlVHX_6FGu0M4-jzT5Z00zQOHNJDHycdkN8u_N7lCCw&amp;oe=6754C1C1</BaseURL><SegmentBase indexRange=\"818-921\" timescale=\"15360\" FBMinimumPrefetchRange=\"922-153206\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"922-426726\" FBFirstSegmentRange=\"922-1565891\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"1565892-3261459\" FBPrefetchSegmentRange=\"922-1565891\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation></AdaptationSet><AdaptationSet id=\"1\" contentType=\"audio\" subsegmentStartsWithSAP=\"1\" subsegmentAlignment=\"true\"><Representation id=\"1123689236007326ad\" bandwidth=\"90267\" codecs=\"mp4a.40.5\" mimeType=\"audio/mp4\" FBAvgBitrate=\"90267\" audioSamplingRate=\"44100\" FBEncodingTag=\"dash_ln_heaac_vbr3_audio\" FBContentLength=\"283429\" FBAbrPolicyTags=\"\" FBDefaultQuality=\"1\"><AudioChannelConfiguration schemeIdUri=\"urn:mpeg:dash:23003:3:audio_channel_configuration:2011\" value=\"2\"/><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQMwLCRebMtpSvoXKOis0scua_3FVnHXrVWiPq2Sg-UMMMY07Yb9GHjputfaYvLsvBM4wi7YxtfqBej5gx7QIehk.mp4?strext=1&amp;_nc_cat=104&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=ouz1YoHFRooQ7kNvgEWNzT-&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9sbl9oZWFhY192YnIzX2F1ZGlvIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYAIRjv13MCcJU7QH9CBhmxNBdflX6r6ktGvdFB0YGiJDA&amp;oe=6754BD29</BaseURL><SegmentBase indexRange=\"824-1011\" timescale=\"44100\" FBMinimumPrefetchRange=\"1012-1355\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"1012-13595\" FBFirstSegmentRange=\"1012-25418\" FBFirstSegmentDuration=\"2021\" FBSecondSegmentRange=\"25419-46671\" FBPrefetchSegmentRange=\"1012-46671\" FBPrefetchSegmentDuration=\"4017\"><Initialization range=\"0-823\"/></SegmentBase></Representation></AdaptationSet></Period></MPD>\n",
                                                "number_of_qualities": 7
                                            },
                                            "has_audio": false,
                                            "tracking_token": "eyJ2ZXJzaW9uIjo1LCJwYXlsb2FkIjp7ImlzX2FuYWx5dGljc190cmFja2VkIjp0cnVlLCJ1dWlkIjoiYmM1MmYwZDVhMzU1NDI1Y2ExODI0ZWFjOGNmZTRlNzUzNTA1ODU5ODU2MTY5NTIyMDQ5In0sInNpZ25hdHVyZSI6IiJ9",
                                            "video_url": "https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQOqSkl6yT2kPS39uCwf5qqXp7jqLr6mYE6XVRgh1tNRiTaek7bSBJ91sSiTdsz5ntDlfybw14Rbwtz18ll29eZo.mp4?stp=dst-mp4&efg=eyJxZV9ncm91cHMiOiJbXCJpZ193ZWJfZGVsaXZlcnlfdnRzX290ZlwiXSIsInZlbmNvZGVfdGFnIjoidnRzX3ZvZF91cmxnZW4uY2Fyb3VzZWxfaXRlbS5jMi4xMDgwLmJhc2VsaW5lIn0&_nc_cat=104&vs=871739288469003_4080642706&_nc_vs=HBksFQIYOnBhc3N0aHJvdWdoX2V2ZXJzdG9yZS9HRnc0MUFKcERSU2lMYkFFQUk4dVltY3pqVHNCYnBSMUFBQUYVAALIAQAVAhg6cGFzc3Rocm91Z2hfZXZlcnN0b3JlL0dKaVEzaHNBamhjZk5EQUxBSkpwWmhvQmptaHVia1lMQUFBRhUCAsgBACgAGAAbABUAACa0%2B9zIl7eEQBUCKAJDMywXQDkQ5WBBiTcYFmRhc2hfYmFzZWxpbmVfMTA4MHBfdjERAHXuBwA%3D&ccb=9-4&oh=00_AYAEo8tV49VJQ7btjmbeMLCcfdVDVt6e93oNz_OcLkk1Zg&oe=6750C029&_nc_sid=8b3546",
                                            "video_view_count": 16286
                                        }
                                    },
                                    {
                                        "node": {
                                            "__typename": "GraphVideo",
                                            "id": "3505859905091998663",
                                            "shortcode": "DCnUQJDSxPH",
                                            "dimensions": {
                                                "height": 937,
                                                "width": 750
                                            },
                                            "display_url": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-15/467969178_18609531286001321_8608865357838344851_n.jpg?stp=dst-jpg_e15&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=105&_nc_ohc=-oTI2V7F-u4Q7kNvgF6gPa6&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYD_uN3MYjAMBDvD-R6jjqjZbZEicpSNLYUbu0YmE7W8Xw&oe=6754B5E4&_nc_sid=8b3546",
                                            "edge_media_to_tagged_user": {
                                                "edges": [
                                                    {
                                                        "node": {
                                                            "user": {
                                                                "full_name": "kyan  /  かいあん",
                                                                "followed_by_viewer": false,
                                                                "id": "5045385127",
                                                                "is_verified": false,
                                                                "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/311338745_606807284463736_1142699983768494601_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=iz_DaI7S1cQQ7kNvgH06jCR&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYADUv5Y_jH0lSyirSzo-tREPv2cn3C5BN170Bgc2hSf8w&oe=675494DB&_nc_sid=8b3546",
                                                                "username": "kyanlm"
                                                            },
                                                            "x": 0,
                                                            "y": 0
                                                        }
                                                    }
                                                ]
                                            },
                                            "fact_check_overall_rating": null,
                                            "fact_check_information": null,
                                            "gating_info": null,
                                            "sharing_friction_info": {
                                                "should_have_sharing_friction": false,
                                                "bloks_app_url": null
                                            },
                                            "media_overlay_info": null,
                                            "media_preview": "ACIqHYAZPFVy6tyDmomj898E/QUr2+wHHp/kVu61naxmqXMr3LX2xuwGPetC1l3rn86w0BIyRj61pWrbWIHQjr9P8f8AOetYN3Kin1NTNFRbqKRZgRsiNuYE59P8/rWvuQLkD6g8/wCRWHIWB5zx0B9PT6VPFdKOHGewP+NE/ed0rBTlyrlfyJLbbISVzkdd3v2z3/nVrzMNg44/zz/npWJ5xj5ThgeTnqPQipBfksCR9f8A61JLW5TldWN7fRVESqRkMvPuKKZJmsxPHamKM8f5/OlNLH/jTIQySLaM+nX8arNxVof6r8RROoCpgdd39KCipuortY7eLaPkXoP4R6fSimFj/9k=",
                                            "owner": {
                                                "id": "25025320",
                                                "username": "instagram"
                                            },
                                            "is_video": true,
                                            "has_upcoming_event": false,
                                            "accessibility_caption": null,
                                            "dash_info": {
                                                "is_dash_eligible": true,
                                                "video_dash_manifest": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<MPD xmlns=\"urn:mpeg:dash:schema:mpd:2011\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"urn:mpeg:dash:schema:mpd:2011 DASH-MPD.xsd\" profiles=\"urn:mpeg:dash:profile:isoff-on-demand:2011\" minBufferTime=\"PT2S\" type=\"static\" mediaPresentationDuration=\"PT29.946613S\" FBManifestIdentifier=\"FgAYEnIyZXZldnA5LXIxZ2VuMnZwORmWkrrMvev8/wGElojvsv+MAurX9eumwaUD3OW6qPLH8gO63bLkrvylBLSEpuj65L0F8Ojyi+b21gXGyMi2ms6LBtCpjKfNlY4GIhgYZGFzaF9sbl9oZWFhY192YnIzX2F1ZGlvAA==\"><Period id=\"0\" duration=\"PT29.946613S\"><AdaptationSet id=\"0\" contentType=\"video\" frameRate=\"11988/500\" subsegmentAlignment=\"true\" par=\"4:5\" FBUnifiedUploadResolutionMos=\"360:77.4\"><Representation id=\"926910695519733vd\" bandwidth=\"83494\" codecs=\"vp09.00.30.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q20\" FBContentLength=\"312549\" FBPlaybackResolutionMos=\"0:100,360:26.3,480:25.8,720:27,1080:29.1\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:73.3,480:65.2,720:53.5,1080:43\" FBAbrPolicyTags=\"\" width=\"538\" height=\"674\" FBDefaultQuality=\"1\" FBQualityClass=\"sd\" FBQualityLabel=\"240p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQMwDmBGpk9M0ueSjCdqtdYMPbCz1ZkdkJoLFD_Z_EZgn_akd_FP5OUcQHNisPpKJ1Z7cOBViN1-c5kZo3byKRQZ.mp4?strext=1&amp;_nc_cat=103&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=WpTYBVFXrfEQ7kNvgG4W36h&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTIwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYDLsZHrytXoao4Dshrusy1SR6TCzZkxo8nalBItKUy_-Q&amp;oe=6754A890</BaseURL><SegmentBase indexRange=\"818-921\" timescale=\"11988\" FBMinimumPrefetchRange=\"922-2058\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"922-12988\" FBFirstSegmentRange=\"922-64204\" FBFirstSegmentDuration=\"5005\" FBSecondSegmentRange=\"64205-117841\" FBPrefetchSegmentRange=\"922-64204\" FBPrefetchSegmentDuration=\"5005\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"1720007338855016v\" bandwidth=\"147805\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q30\" FBContentLength=\"553283\" FBPlaybackResolutionMos=\"0:100,360:34.3,480:33.8,720:34.4,1080:35.3\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:84.9,480:78.6,720:68,1080:57.8\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"270p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQPu85urADXgq2cikL6fVfslFRnXnZwF0n_CD5eL56eJxzW42l44671Rlxh-IYA4RxnoWRknVHlOt7RWadwrIn43.mp4?strext=1&amp;_nc_cat=106&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=iukMet0ixk8Q7kNvgHmfTW0&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTMwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYAM9Rmnbsiz6rUIHzMyZyI36qhdH8udZMPCx30RyK_jMQ&amp;oe=6754AC63</BaseURL><SegmentBase indexRange=\"818-921\" timescale=\"11988\" FBMinimumPrefetchRange=\"922-2395\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"922-21596\" FBFirstSegmentRange=\"922-117959\" FBFirstSegmentDuration=\"5005\" FBSecondSegmentRange=\"117960-211887\" FBPrefetchSegmentRange=\"922-117959\" FBPrefetchSegmentDuration=\"5005\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"1598531810777656v\" bandwidth=\"213451\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q40\" FBContentLength=\"799020\" FBPlaybackResolutionMos=\"0:100,360:40.6,480:40.3,720:40.7,1080:41.1\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:89.8,480:85.3,720:75.8,1080:65.5\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"360p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQN6XmQd7O97hCe-h21olNbqc-bZRh9C_u68WksXqvZgAD-nQmzEnHDGhzZm9AcHEZ1wteSeJApapEP1dZMdd4Np.mp4?strext=1&amp;_nc_cat=103&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=ZhfUCBF0dn0Q7kNvgGAXRgN&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTQwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYDCicQp2NiB0as4wRVT4FFSj_EQn2SeJ2xDU27YxSmztw&amp;oe=6754AC24</BaseURL><SegmentBase indexRange=\"818-921\" timescale=\"11988\" FBMinimumPrefetchRange=\"922-2592\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"922-29562\" FBFirstSegmentRange=\"922-173270\" FBFirstSegmentDuration=\"5005\" FBSecondSegmentRange=\"173271-307573\" FBPrefetchSegmentRange=\"922-173270\" FBPrefetchSegmentDuration=\"5005\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"1714382692749859v\" bandwidth=\"314494\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q50\" FBContentLength=\"1177256\" FBPlaybackResolutionMos=\"0:100,360:45.1,480:45,720:45.6,1080:45.4\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:94.5,480:91.5,720:85.3,1080:75.9\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"480p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQOQpTOaYetI4m8Xi9YIZhCctQo9lIqvyriJcHqf6p-JV5ICry4XhEVEUWnC24UsCFjGgPaJMq9H8Rl0YF_uYlx9.mp4?strext=1&amp;_nc_cat=106&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=nlyrAARiRhsQ7kNvgGXHlB4&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTUwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYBR2F3e6kq_vEFvaQKLSRpsGrvRYsjDRWueB7XMhD1PmQ&amp;oe=67549817</BaseURL><SegmentBase indexRange=\"818-921\" timescale=\"11988\" FBMinimumPrefetchRange=\"922-2846\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"922-41236\" FBFirstSegmentRange=\"922-253646\" FBFirstSegmentDuration=\"5005\" FBSecondSegmentRange=\"253647-449016\" FBPrefetchSegmentRange=\"922-253646\" FBPrefetchSegmentDuration=\"5005\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"1543249772986650v\" bandwidth=\"464401\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q60\" FBContentLength=\"1738406\" FBPlaybackResolutionMos=\"0:100,360:49.7,480:50,720:50.6,1080:49.9\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:97.2,480:95.4,720:90.5,1080:83.1\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"540p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQN22a4kSd3MKFz9LH1r_tyA7Vk2EwCoCMywZWgiAY_mjV1RVnpJQsimTvyZN8CKYjcFhKohFIKNeDxbvocZTpJ0.mp4?strext=1&amp;_nc_cat=104&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=_iE5Bftyy08Q7kNvgHAEcHK&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTYwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYD8ZdDLihZrxPNmlDhbJwzDfhsV182j6F5Wz7aJMhh-VQ&amp;oe=6754BC89</BaseURL><SegmentBase indexRange=\"818-921\" timescale=\"11988\" FBMinimumPrefetchRange=\"922-3162\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"922-57366\" FBFirstSegmentRange=\"922-374138\" FBFirstSegmentDuration=\"5005\" FBSecondSegmentRange=\"374139-659120\" FBPrefetchSegmentRange=\"922-374138\" FBPrefetchSegmentDuration=\"5005\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"562895659830921v\" bandwidth=\"645731\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q70\" FBContentLength=\"2417183\" FBPlaybackResolutionMos=\"0:100,360:53,480:53.7,720:54.6,1080:53.7\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:98.34,480:97.7,720:94.9,1080:89.6\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"640p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQPFNS9-9q8fhYap5500oFAWejr9MASg7NLCW6WHGSLEug3ovm-yPMSgORrGEXiDD3xLtsQ23XaU53BgYTwHrKZq.mp4?strext=1&amp;_nc_cat=111&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=SUXAKW2ZxlQQ7kNvgFQ690E&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTcwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYAKd7aRzqU1iNZnMcT-kU7bXXWnm80N1hn3XAGnddUt9A&amp;oe=6754C74C</BaseURL><SegmentBase indexRange=\"818-921\" timescale=\"11988\" FBMinimumPrefetchRange=\"922-3473\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"922-76071\" FBFirstSegmentRange=\"922-522731\" FBFirstSegmentDuration=\"5005\" FBSecondSegmentRange=\"522732-927485\" FBPrefetchSegmentRange=\"922-522731\" FBPrefetchSegmentDuration=\"5005\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"591526903219586v\" bandwidth=\"887570\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q80\" FBContentLength=\"3322468\" FBPlaybackResolutionMos=\"0:100,360:55.1,480:56.2,720:57.5,1080:56.4\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:98.69,480:98.25,720:96.8,1080:93.5\" FBAbrPolicyTags=\"avoid_on_cellular,avoid_on_cellular_intentional\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"720p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQPGzWCbsY8QlplKTloN5_MCm61BnczNoKPgaIhUCvEriFnkFJwHHxKmU92XjXsCsK48eOY3lVUcEyhwxzwt2C8C.mp4?strext=1&amp;_nc_cat=107&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=EtccFLQlLT8Q7kNvgFyOLue&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTgwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYB08vnVpsMGIU5FOx-SYHV3m0JPzK7N4FuJADoSrOYsVQ&amp;oe=67549390</BaseURL><SegmentBase indexRange=\"818-921\" timescale=\"11988\" FBMinimumPrefetchRange=\"922-3901\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"922-98661\" FBFirstSegmentRange=\"922-710038\" FBFirstSegmentDuration=\"5005\" FBSecondSegmentRange=\"710039-1274186\" FBPrefetchSegmentRange=\"922-710038\" FBPrefetchSegmentDuration=\"5005\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"1096348695222638v\" bandwidth=\"1333335\" codecs=\"vp09.00.40.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q90\" FBContentLength=\"4991112\" FBPlaybackResolutionMos=\"0:100,360:56.6,480:58.1,720:60.1,1080:61.3\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:98.95,480:98.78,720:98.17,1080:97\" FBAbrPolicyTags=\"avoid_on_cellular,avoid_on_cellular_intentional\" width=\"1080\" height=\"1350\" FBQualityClass=\"hd\" FBQualityLabel=\"1080p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQO9sFJC4VjVcWg2NKHcwOPJqvrkJ6uDoXQNIfIV3TxG6tKxH1YEMAbAHhR0_MX2fF66h_oV980XldHxFSr-qiXY.mp4?strext=1&amp;_nc_cat=104&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=FfVnJmvHr_IQ7kNvgG-hxEw&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTkwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYAjxKH6oZvteOG_MrWmLebGSJSdgz42FZJmp3xKW2Y9Ag&amp;oe=6754AE31</BaseURL><SegmentBase indexRange=\"818-921\" timescale=\"11988\" FBMinimumPrefetchRange=\"922-5045\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"922-138915\" FBFirstSegmentRange=\"922-1023362\" FBFirstSegmentDuration=\"5005\" FBSecondSegmentRange=\"1023363-1917348\" FBPrefetchSegmentRange=\"922-1023362\" FBPrefetchSegmentDuration=\"5005\"><Initialization range=\"0-817\"/></SegmentBase></Representation></AdaptationSet><AdaptationSet id=\"1\" contentType=\"audio\" subsegmentStartsWithSAP=\"1\" subsegmentAlignment=\"true\"><Representation id=\"1209400350365533ad\" bandwidth=\"92266\" codecs=\"mp4a.40.5\" mimeType=\"audio/mp4\" FBAvgBitrate=\"92266\" audioSamplingRate=\"44100\" FBEncodingTag=\"dash_ln_heaac_vbr3_audio\" FBContentLength=\"345944\" FBAbrPolicyTags=\"\" FBDefaultQuality=\"1\"><AudioChannelConfiguration schemeIdUri=\"urn:mpeg:dash:23003:3:audio_channel_configuration:2011\" value=\"2\"/><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQNidj3_nZbqTp9LUkpadx4wIZ6b6JYQUFkFjHGsM1uzLNRB9x0xswputtC6oyA-I4xIqbxTDFbstCeMLchDix6s.mp4?strext=1&amp;_nc_cat=103&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=NpgxzVGBK_YQ7kNvgFot4dc&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9sbl9oZWFhY192YnIzX2F1ZGlvIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYD_ki_673mqXTeG_l49WlkC79hvBCIek7DTDmvmCpa_Hg&amp;oe=6754C2C4</BaseURL><SegmentBase indexRange=\"824-1035\" timescale=\"44100\" FBMinimumPrefetchRange=\"1036-1379\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"1036-11488\" FBFirstSegmentRange=\"1036-23126\" FBFirstSegmentDuration=\"2021\" FBSecondSegmentRange=\"23127-46932\" FBPrefetchSegmentRange=\"1036-46932\" FBPrefetchSegmentDuration=\"4017\"><Initialization range=\"0-823\"/></SegmentBase></Representation></AdaptationSet></Period></MPD>\n",
                                                "number_of_qualities": 8
                                            },
                                            "has_audio": false,
                                            "tracking_token": "eyJ2ZXJzaW9uIjo1LCJwYXlsb2FkIjp7ImlzX2FuYWx5dGljc190cmFja2VkIjp0cnVlLCJ1dWlkIjoiYmM1MmYwZDVhMzU1NDI1Y2ExODI0ZWFjOGNmZTRlNzUzNTA1ODU5OTA1MDkxOTk4NjYzIn0sInNpZ25hdHVyZSI6IiJ9",
                                            "video_url": "https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQP2Z71oFlRloulE1NJ7u6VofhtAH5fZ1G1wP07TdtJihAzNwFy2-grxghjdhcpyy5j3n3TW74-d2yN4IAWUcUez.mp4?stp=dst-mp4&efg=eyJxZV9ncm91cHMiOiJbXCJpZ193ZWJfZGVsaXZlcnlfdnRzX290ZlwiXSIsInZlbmNvZGVfdGFnIjoidnRzX3ZvZF91cmxnZW4uY2Fyb3VzZWxfaXRlbS5jMi4xMDgwLmJhc2VsaW5lIn0&_nc_cat=103&vs=553415140764677_3625124714&_nc_vs=HBksFQIYOnBhc3N0aHJvdWdoX2V2ZXJzdG9yZS9HRjRaOWdMdDhiZldXXzRCQUlsOE5SU09TaTFPYnBSMUFBQUYVAALIAQAVAhg6cGFzc3Rocm91Z2hfZXZlcnN0b3JlL0dOZDUyeHVmWVRiZjVWOERBS1hlQl9sOXRlY21ia1lMQUFBRhUCAsgBACgAGAAbABUAACbM8dG0ocW%2FPxUCKAJDMywXQD387ZFocrAYFmRhc2hfYmFzZWxpbmVfMTA4MHBfdjERAHXuBwA%3D&ccb=9-4&oh=00_AYC3DIsNYXxHnabg9IxIAaTRuYdEQuUlPlCvRafx7I_wsw&oe=6750B3A4&_nc_sid=8b3546",
                                            "video_view_count": 12804
                                        }
                                    },
                                    {
                                        "node": {
                                            "__typename": "GraphImage",
                                            "id": "3505860551039893034",
                                            "shortcode": "DCnUZioyb4q",
                                            "dimensions": {
                                                "height": 1350,
                                                "width": 1080
                                            },
                                            "display_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.29350-15/467756707_576861024890706_163240107735192173_n.jpg?stp=dst-jpg_e35_p1080x1080&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=106&_nc_ohc=-xmbCFp0emEQ7kNvgEXMU04&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDcPi_6zqQNR9kptkBGR9-PytxUdydrBVHjetmrnQPdhA&oe=6754C012&_nc_sid=8b3546",
                                            "edge_media_to_tagged_user": {
                                                "edges": [
                                                    {
                                                        "node": {
                                                            "user": {
                                                                "full_name": "kyan  /  かいあん",
                                                                "followed_by_viewer": false,
                                                                "id": "5045385127",
                                                                "is_verified": false,
                                                                "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/311338745_606807284463736_1142699983768494601_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=iz_DaI7S1cQQ7kNvgH06jCR&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYADUv5Y_jH0lSyirSzo-tREPv2cn3C5BN170Bgc2hSf8w&oe=675494DB&_nc_sid=8b3546",
                                                                "username": "kyanlm"
                                                            },
                                                            "x": 0.5284139101,
                                                            "y": 0.6887192536
                                                        }
                                                    }
                                                ]
                                            },
                                            "fact_check_overall_rating": null,
                                            "fact_check_information": null,
                                            "gating_info": null,
                                            "sharing_friction_info": {
                                                "should_have_sharing_friction": false,
                                                "bloks_app_url": null
                                            },
                                            "media_overlay_info": null,
                                            "media_preview": null,
                                            "owner": {
                                                "id": "25025320",
                                                "username": "instagram"
                                            },
                                            "is_video": false,
                                            "has_upcoming_event": false,
                                            "accessibility_caption": "Two people pose in a photo booth."
                                        }
                                    }
                                ]
                            }
                        }
                    },
                    {
                        "node": {
                            "__typename": "GraphVideo",
                            "id": "3505653501127155527",
                            "shortcode": "DCmlUkYSd9H",
                            "dimensions": {
                                "height": 1920,
                                "width": 1080
                            },
                            "display_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/467768464_18609478921001321_7892186948542213391_n.jpg?stp=dst-jpg_e35_p1080x1080_sh0.08_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=VLqVK8s-JCgQ7kNvgEhg_uI&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYD81kt6oqGdLC5ZNfnX3oYlpG7GwDDyXZHg1rtYRQJQJg&oe=6754B6E4&_nc_sid=8b3546",
                            "edge_media_to_tagged_user": {
                                "edges": [
                                    {
                                        "node": {
                                            "user": {
                                                "full_name": "O'Neil Thomas",
                                                "followed_by_viewer": false,
                                                "id": "33502377",
                                                "is_verified": true,
                                                "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/452578416_1952182788566442_3250280503709057956_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=106&_nc_ohc=pgFr0MPpwPIQ7kNvgEy0GBa&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAV8TXvUdFUYD38fTHvOZQC2yU3ViDjupjSuDZYqKKb9A&oe=67549FE3&_nc_sid=8b3546",
                                                "username": "oneilthomas"
                                            },
                                            "x": 0,
                                            "y": 0
                                        }
                                    }
                                ]
                            },
                            "fact_check_overall_rating": null,
                            "fact_check_information": null,
                            "gating_info": null,
                            "sharing_friction_info": {
                                "should_have_sharing_friction": false,
                                "bloks_app_url": null
                            },
                            "media_overlay_info": null,
                            "media_preview": "ABgq0gzr/d596WI7YyO/JrKuZJVwqnBYZJ7gZxx6Z71GLieEAZDeuR179agu2h0B5GfaikD7lDDoRn8xmimSUbyM/Lu9xx+dZ5TcwHXoKaLySc7XPHUD3qG5neJwRxj7p+n1pdS1sdG5wMUVhxapu4kH4j/CimQJaw8Fj1PT6VWv1fjIO3rn/PStaAfKv0FJcDP5GsXO0ku9ypvljp5HOLxRS+tFbkn/2Q==",
                            "owner": {
                                "id": "25025320",
                                "username": "instagram"
                            },
                            "is_video": true,
                            "has_upcoming_event": false,
                            "accessibility_caption": null,
                            "dash_info": {
                                "is_dash_eligible": true,
                                "video_dash_manifest": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<MPD xmlns=\"urn:mpeg:dash:schema:mpd:2011\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"urn:mpeg:dash:schema:mpd:2011 DASH-MPD.xsd\" profiles=\"urn:mpeg:dash:profile:isoff-on-demand:2011\" minBufferTime=\"PT2S\" type=\"static\" mediaPresentationDuration=\"PT34.599998S\" FBManifestIdentifier=\"FgAYEnIyZXZldnA5LXIxZ2VuMnZwORl20N+V0/6R6gGymdPE7/mLAtyFis2hho0D0KWti+n5/QP69MqJloX/A5KWrsXru68F7o2Bhern7gYiGBhkYXNoX2xuX2hlYWFjX3ZicjNfYXVkaW8A\"><Period id=\"0\" duration=\"PT34.599998S\"><AdaptationSet id=\"0\" contentType=\"video\" frameRate=\"15360/512\" subsegmentAlignment=\"true\" par=\"9:16\" FBUnifiedUploadResolutionMos=\"360:77.7\"><Representation id=\"873119821676910vd\" bandwidth=\"93748\" codecs=\"vp09.00.30.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q40\" FBContentLength=\"405462\" FBPlaybackResolutionMos=\"0:100,360:38.6,480:37.8,720:39,1080:42.4\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:74.5,480:67.2,720:57.4,1080:48.6\" FBAbrPolicyTags=\"\" width=\"540\" height=\"960\" FBDefaultQuality=\"1\" FBQualityClass=\"sd\" FBQualityLabel=\"360p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQNpsDRPw6i3Q8CIY8lXoPmY-JvEdsd8_0iGU0wBQENwtR_E9RxNpZ2AJOrFXGMKZkebx-4BhiBrwsxybQ3HuEbR.mp4?strext=1&amp;_nc_cat=108&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=5QtfFjKzLGEQ7kNvgEcAo76&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfcjJldmV2cDktcjFnZW4ydnA5X3E0MCIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYDC08QnZCjwje4i9VIYF1MW7WxjjLUx-qTseuTFmnpAvg&amp;oe=6754BC0D</BaseURL><SegmentBase indexRange=\"818-933\" timescale=\"15360\" FBMinimumPrefetchRange=\"934-8066\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"934-26162\" FBFirstSegmentRange=\"934-76412\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"76413-128244\" FBPrefetchSegmentRange=\"934-76412\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"514880498218984v\" bandwidth=\"164407\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q50\" FBContentLength=\"711064\" FBPlaybackResolutionMos=\"0:100,360:49.3,480:48.1,720:48.7,1080:51.3\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:86.6,480:81.1,720:73.2,1080:64.9\" FBAbrPolicyTags=\"\" width=\"720\" height=\"1280\" FBQualityClass=\"hd\" FBQualityLabel=\"480p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQOJzYW-CA3QdQKG1e5FCSkE3yMNoN1OrwGWr9xmjB2WleNexFurneXFLqsUzdSJxAd_UF5BWUpQU4plmMhxZ9_u.mp4?strext=1&amp;_nc_cat=102&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=uVb-bWL8EnYQ7kNvgGc1kmx&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfcjJldmV2cDktcjFnZW4ydnA5X3E1MCIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYDyMgdnaT345Julqmg-RShfH21UE4tToa6IpcS-68LV0w&amp;oe=67549AE7</BaseURL><SegmentBase indexRange=\"818-933\" timescale=\"15360\" FBMinimumPrefetchRange=\"934-12463\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"934-46351\" FBFirstSegmentRange=\"934-143253\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"143254-235817\" FBPrefetchSegmentRange=\"934-143253\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"1511757022872969v\" bandwidth=\"280418\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q60\" FBContentLength=\"1212811\" FBPlaybackResolutionMos=\"0:100,360:57,480:56.1,720:56.3,1080:58.1\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:93.6,480:90.2,720:84,1080:76.6\" FBAbrPolicyTags=\"\" width=\"720\" height=\"1280\" FBQualityClass=\"hd\" FBQualityLabel=\"540p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQMcxrtRdPwv56VW_nLAVYcyx3eqQlGpK_svwBZSE5DcJ4WS8cpjryUe3Q_TdTCJH76qFwQpuJFgy4Yyx_Rrk5d3.mp4?strext=1&amp;_nc_cat=111&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=_HynznJWYikQ7kNvgF3Bnbr&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfcjJldmV2cDktcjFnZW4ydnA5X3E2MCIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYDG_UKZcW2bMg7pdiPWQ4NTskZkaa0QkBmeNWsGU1pIiA&amp;oe=6754B078</BaseURL><SegmentBase indexRange=\"818-933\" timescale=\"15360\" FBMinimumPrefetchRange=\"934-17158\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"934-79046\" FBFirstSegmentRange=\"934-259990\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"259991-428138\" FBPrefetchSegmentRange=\"934-259990\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"1121395706014056v\" bandwidth=\"432263\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q70\" FBContentLength=\"1869539\" FBPlaybackResolutionMos=\"0:100,360:61.2,480:60.5,720:60.9,1080:62.4\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:97.4,480:95.6,720:91.3,1080:85.1\" FBAbrPolicyTags=\"\" width=\"720\" height=\"1280\" FBQualityClass=\"hd\" FBQualityLabel=\"640p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQM9TZOl4lCLj7GCGHgLxKy4zAtDF27I11XTzE5XRb5Z5-1D1uP0yocu07DEctOe6rBlyjytACVtiIeF2QcgSJhn.mp4?strext=1&amp;_nc_cat=110&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=Hwj_rGTpMq0Q7kNvgEvEu95&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfcjJldmV2cDktcjFnZW4ydnA5X3E3MCIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYDn_CY_sHB4HveFFGnGZW7JfUbIM0dVDyahMR_2-mw0zg&amp;oe=6754988B</BaseURL><SegmentBase indexRange=\"818-933\" timescale=\"15360\" FBMinimumPrefetchRange=\"934-22376\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"934-119985\" FBFirstSegmentRange=\"934-410752\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"410753-687815\" FBPrefetchSegmentRange=\"934-410752\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"1123789745773885v\" bandwidth=\"609143\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q80\" FBContentLength=\"2634546\" FBPlaybackResolutionMos=\"0:100,360:63.9,480:63.6,720:64.2,1080:65.6\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:98.52,480:97.5,720:95,1080:89.9\" FBAbrPolicyTags=\"\" width=\"720\" height=\"1280\" FBQualityClass=\"hd\" FBQualityLabel=\"720p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQPameKk9EF20HXr6AllF6EeAb4DfZ4Wdxn4jTqwjNCWEWiBlML2fEAuQG1xyfuOU-QFhRdkvyZMV51aQTiXSBSw.mp4?strext=1&amp;_nc_cat=108&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=uazN143gkiEQ7kNvgFM3Zf8&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfcjJldmV2cDktcjFnZW4ydnA5X3E4MCIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYChSTUQl0w3k0Vf5quZx1QZkoZ2lRazj4G4GLGSKGtH8A&amp;oe=6754B1C9</BaseURL><SegmentBase indexRange=\"818-933\" timescale=\"15360\" FBMinimumPrefetchRange=\"934-27979\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"934-166583\" FBFirstSegmentRange=\"934-598854\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"598855-1002147\" FBPrefetchSegmentRange=\"934-598854\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"1932526177231735v\" bandwidth=\"862812\" codecs=\"vp09.00.40.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q90\" FBContentLength=\"3731664\" FBPlaybackResolutionMos=\"0:100,360:66.1,480:66,720:66.8,1080:68.7\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:99.162,480:98.67,720:97.3,1080:94.8\" FBAbrPolicyTags=\"avoid_on_cellular,avoid_on_cellular_intentional\" width=\"1080\" height=\"1920\" FBQualityClass=\"hd\" FBQualityLabel=\"1080p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQO2mAmRJQSzs9csIwhc6A0YrNAO-34noLiNTxUgJkhd1iAsOg8kkc9Dd-1M_48LQL1tVtc5MYQobfGRu_63MlLH.mp4?strext=1&amp;_nc_cat=104&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=HShbS5nYoUYQ7kNvgEIaWzD&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfcjJldmV2cDktcjFnZW4ydnA5X3E5MCIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYB8zmkrLcuRYHkj2MwbN2Hl5ur2X_BW5_RF0G0ye-FLMA&amp;oe=6754B04D</BaseURL><SegmentBase indexRange=\"818-933\" timescale=\"15360\" FBMinimumPrefetchRange=\"934-35477\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"934-233829\" FBFirstSegmentRange=\"934-868282\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"868283-1488082\" FBPrefetchSegmentRange=\"934-868282\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation></AdaptationSet><AdaptationSet id=\"1\" contentType=\"audio\" subsegmentStartsWithSAP=\"1\" subsegmentAlignment=\"true\"><Representation id=\"589232943556185ad\" bandwidth=\"56151\" codecs=\"mp4a.40.5\" mimeType=\"audio/mp4\" FBAvgBitrate=\"56151\" audioSamplingRate=\"44100\" FBEncodingTag=\"dash_ln_heaac_vbr3_audio\" FBContentLength=\"243733\" FBPaqMos=\"88.87\" FBAbrPolicyTags=\"\" FBDefaultQuality=\"1\"><AudioChannelConfiguration schemeIdUri=\"urn:mpeg:dash:23003:3:audio_channel_configuration:2011\" value=\"2\"/><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQMn8j-W1VUwu5qvu1-J9jUty_I4h0gkMuU9gV2kFI65H90U4NKnRftkHT-446Yo7lvLs0KCqVhUQ6vbveyGfP-w.mp4?strext=1&amp;_nc_cat=102&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=tQ7NNuS76LQQ7kNvgF-v2l7&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfbG5faGVhYWNfdmJyM19hdWRpbyIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYDXMjTWN-xzJ0yJtd_kxMzlbUzKdvZe5fiNYr32CR3Hyg&amp;oe=6754B3E3</BaseURL><SegmentBase indexRange=\"824-1071\" timescale=\"44100\" FBMinimumPrefetchRange=\"1072-1415\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"1072-9224\" FBFirstSegmentRange=\"1072-16839\" FBFirstSegmentDuration=\"2021\" FBSecondSegmentRange=\"16840-30321\" FBPrefetchSegmentRange=\"1072-30321\" FBPrefetchSegmentDuration=\"4017\"><Initialization range=\"0-823\"/></SegmentBase></Representation></AdaptationSet></Period></MPD>\n",
                                "number_of_qualities": 6
                            },
                            "has_audio": true,
                            "tracking_token": "eyJ2ZXJzaW9uIjo1LCJwYXlsb2FkIjp7ImlzX2FuYWx5dGljc190cmFja2VkIjp0cnVlLCJ1dWlkIjoiYmM1MmYwZDVhMzU1NDI1Y2ExODI0ZWFjOGNmZTRlNzUzNTA1NjUzNTAxMTI3MTU1NTI3In0sInNpZ25hdHVyZSI6IiJ9",
                            "video_url": "https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f1/m86/904F6DED25829D582C407E0DD5CB4D9E_video_dashinit.mp4?stp=dst-mp4&efg=eyJxZV9ncm91cHMiOiJbXCJpZ193ZWJfZGVsaXZlcnlfdnRzX290ZlwiXSIsInZlbmNvZGVfdGFnIjoidnRzX3ZvZF91cmxnZW4uY2xpcHMuYzIuNzIwLmJhc2VsaW5lIn0&_nc_cat=108&vs=785859783664607_2002347264&_nc_vs=HBksFQIYUmlnX3hwdl9yZWVsc19wZXJtYW5lbnRfc3JfcHJvZC85MDRGNkRFRDI1ODI5RDU4MkM0MDdFMERENUNCNEQ5RV92aWRlb19kYXNoaW5pdC5tcDQVAALIAQAVAhg6cGFzc3Rocm91Z2hfZXZlcnN0b3JlL0dQV2wyUnZXdHJoR2JKQUZBQXRIOThhYkZndDZicV9FQUFBRhUCAsgBACgAGAAbABUAACaWk%2ByqnpSZQBUCKAJDMywXQEFMzMzMzM0YEmRhc2hfYmFzZWxpbmVfMV92MREAdf4HAA%3D%3D&ccb=9-4&oh=00_AYBR1CTW_LRxuVEExenXCkvsMbdjwaWr0J-snfZpJtXgfg&oe=6750C08A&_nc_sid=8b3546",
                            "video_view_count": 1231225,
                            "edge_media_to_caption": {
                                "edges": [
                                    {
                                        "node": {
                                            "text": "Psst! did you know there’s a secret font hidden in Stories? 🤫\n \nVideo by @oneilthomas"
                                        }
                                    }
                                ]
                            },
                            "edge_media_to_comment": {
                                "count": 2632
                            },
                            "comments_disabled": false,
                            "taken_at_timestamp": 1732126526,
                            "edge_liked_by": {
                                "count": 52839
                            },
                            "edge_media_preview_like": {
                                "count": 52839
                            },
                            "location": null,
                            "nft_asset_info": null,
                            "thumbnail_src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/467768464_18609478921001321_7892186948542213391_n.jpg?stp=c0.490.1260.1260a_dst-jpg_e35_s640x640_sh0.08_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=VLqVK8s-JCgQ7kNvgEhg_uI&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDhSdQBtRWosiNLGaI9LBNeVW7DRtEaPduakLsE3GJlmQ&oe=6754B6E4&_nc_sid=8b3546",
                            "thumbnail_resources": [
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/467768464_18609478921001321_7892186948542213391_n.jpg?stp=c0.490.1260.1260a_dst-jpg_e15_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xMjYweDIyNDAuc2RyLmY3NTc2MS5kZWZhdWx0X2NvdmVyX2ZyYW1lIn0&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=VLqVK8s-JCgQ7kNvgEhg_uI&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBVgjE3RaXL2sDr_XWY8gFSWzKAM1hSeVYI46Son5fdfg&oe=6754B6E4&_nc_sid=8b3546",
                                    "config_width": 150,
                                    "config_height": 150
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/467768464_18609478921001321_7892186948542213391_n.jpg?stp=c0.490.1260.1260a_dst-jpg_e15_s240x240_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xMjYweDIyNDAuc2RyLmY3NTc2MS5kZWZhdWx0X2NvdmVyX2ZyYW1lIn0&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=VLqVK8s-JCgQ7kNvgEhg_uI&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYD3Op-KQ5MnNt6J_HULwFc9167vClqrCqREdQUiRMbVOg&oe=6754B6E4&_nc_sid=8b3546",
                                    "config_width": 240,
                                    "config_height": 240
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/467768464_18609478921001321_7892186948542213391_n.jpg?stp=c0.490.1260.1260a_dst-jpg_e15_s320x320_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xMjYweDIyNDAuc2RyLmY3NTc2MS5kZWZhdWx0X2NvdmVyX2ZyYW1lIn0&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=VLqVK8s-JCgQ7kNvgEhg_uI&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBOm5P6FhyudTFIZDK_R_cHqSbauf7S7EhoO7JnJhx0Dw&oe=6754B6E4&_nc_sid=8b3546",
                                    "config_width": 320,
                                    "config_height": 320
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/467768464_18609478921001321_7892186948542213391_n.jpg?stp=c0.490.1260.1260a_dst-jpg_e15_s480x480_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xMjYweDIyNDAuc2RyLmY3NTc2MS5kZWZhdWx0X2NvdmVyX2ZyYW1lIn0&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=VLqVK8s-JCgQ7kNvgEhg_uI&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYCX4XgeaMopEZj0dFo0DWNXOA4inJWBg3mE5plZGVWpWw&oe=6754B6E4&_nc_sid=8b3546",
                                    "config_width": 480,
                                    "config_height": 480
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/467768464_18609478921001321_7892186948542213391_n.jpg?stp=c0.490.1260.1260a_dst-jpg_e35_s640x640_sh0.08_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xMjYweDIyNDAuc2RyLmY3NTc2MS5kZWZhdWx0X2NvdmVyX2ZyYW1lIn0&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=VLqVK8s-JCgQ7kNvgEhg_uI&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDhSdQBtRWosiNLGaI9LBNeVW7DRtEaPduakLsE3GJlmQ&oe=6754B6E4&_nc_sid=8b3546",
                                    "config_width": 640,
                                    "config_height": 640
                                }
                            ],
                            "felix_profile_grid_crop": null,
                            "coauthor_producers": [],
                            "pinned_for_users": [],
                            "viewer_can_reshare": true,
                            "like_and_view_counts_disabled": false,
                            "product_type": "clips",
                            "clips_music_attribution_info": {
                                "artist_name": "instagram",
                                "song_name": "Original audio",
                                "uses_original_audio": true,
                                "should_mute_audio": false,
                                "should_mute_audio_reason": "",
                                "audio_id": "428402623646103"
                            }
                        }
                    },
                    {
                        "node": {
                            "__typename": "GraphVideo",
                            "id": "3505140957665030053",
                            "shortcode": "DCkwyFFS--l",
                            "dimensions": {
                                "height": 1920,
                                "width": 1080
                            },
                            "display_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/467554495_18609346108001321_8446496511191069471_n.jpg?stp=dst-jpg_e15_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=ZRPcNgekkWEQ7kNvgGNTi-u&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDXggwR1hS9HJC7d5Lo69f6Ikk9XecNSMee2wJvxg5F7g&oe=6754A96B&_nc_sid=8b3546",
                            "edge_media_to_tagged_user": {
                                "edges": [
                                    {
                                        "node": {
                                            "user": {
                                                "full_name": "Beauteuss World👸🏽",
                                                "followed_by_viewer": false,
                                                "id": "5445097695",
                                                "is_verified": false,
                                                "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/318162497_1212519639645300_6749278047801003180_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=100&_nc_ohc=RN3KpX5HcC4Q7kNvgHQlenM&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYCwW8D6DjLCrFnUYt_z7kktCxIWdSpfHihteIR3xp6StQ&oe=6754C5EA&_nc_sid=8b3546",
                                                "username": "beauteuss"
                                            },
                                            "x": 0,
                                            "y": 0
                                        }
                                    }
                                ]
                            },
                            "fact_check_overall_rating": null,
                            "fact_check_information": null,
                            "gating_info": null,
                            "sharing_friction_info": {
                                "should_have_sharing_friction": false,
                                "bloks_app_url": null
                            },
                            "media_overlay_info": null,
                            "media_preview": "ABgq057mO3GXPPYDqfw/rVeHUopWCcqTwM9D+NZzMZbqQsMqpIH/AAHAqe62vFkA57H6c5qblpXVzYIopIn82NZP7yg0UyTmvOMNywPQucj6nr/ntWhdTbELf59OlYt9L5spYcZrTQfbLcA8N0/Ed6T7mkXui/pk6PCsYOWUcjv1orBiWW1ffjAU4Pp/+qimZjZ1BOa0bSYrEF2jjPP41m3H3vwrQg+4KATtsWGdn+9zRRH1opBuf//Z",
                            "owner": {
                                "id": "25025320",
                                "username": "instagram"
                            },
                            "is_video": true,
                            "has_upcoming_event": false,
                            "accessibility_caption": null,
                            "dash_info": {
                                "is_dash_eligible": true,
                                "video_dash_manifest": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<MPD xmlns=\"urn:mpeg:dash:schema:mpd:2011\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"urn:mpeg:dash:schema:mpd:2011 DASH-MPD.xsd\" profiles=\"urn:mpeg:dash:profile:isoff-on-demand:2011\" minBufferTime=\"PT2S\" type=\"static\" mediaPresentationDuration=\"PT61.133335S\" FBManifestIdentifier=\"FgAYEnIyZXZldnA5LXIxZ2VuMnZwORmWiqaCsa/ByQGSs5+56KH4AaDVzJOCiqMC6qy8i4Tj8wK44OGRt5aXA5yBgNL+jaEDtJaQqZO96AO21Y7zp77oBPa/n/Tu6NIcIhgYZGFzaF9sbl9oZWFhY192YnIzX2F1ZGlvAA==\"><Period id=\"0\" duration=\"PT61.133335S\"><AdaptationSet id=\"0\" contentType=\"video\" frameRate=\"15360/512\" subsegmentAlignment=\"true\" par=\"9:16\" FBUnifiedUploadResolutionMos=\"360:79.6\"><Representation id=\"917233033281614vd\" bandwidth=\"99328\" codecs=\"vp09.00.30.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q20\" FBContentLength=\"759034\" FBPlaybackResolutionMos=\"0:100,360:31.6,480:30.4,720:30.8,1080:33.3\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:68.6,480:59.9,720:49.8,1080:38.6\" FBAbrPolicyTags=\"\" width=\"540\" height=\"960\" FBDefaultQuality=\"1\" FBQualityClass=\"sd\" FBQualityLabel=\"240p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQPrgbgeqzsGOmVWGYVEoHB5yWzlqjeA0qnk__tvVmh4iZwcZyiIibmVkkCFeT_wG9vCaelZWzYM_RbvPbiHWfJW.mp4?strext=1&amp;_nc_cat=104&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=Sh-BCgO3-OMQ7kNvgF3lZWD&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfcjJldmV2cDktcjFnZW4ydnA5X3EyMCIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYDKnB1_GS6KbtfJ-bcnuiCA6QP4_ebRB6ZhfxU8yXdNIA&amp;oe=6754BD99</BaseURL><SegmentBase indexRange=\"818-1005\" timescale=\"15360\" FBMinimumPrefetchRange=\"1006-6245\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"1006-18112\" FBFirstSegmentRange=\"1006-54554\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"54555-109977\" FBPrefetchSegmentRange=\"1006-54554\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"8063420847091707v\" bandwidth=\"198152\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q30\" FBContentLength=\"1514212\" FBPlaybackResolutionMos=\"0:100,360:38.8,480:36.9,720:36.3,1080:38.4\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:82,480:75.6,720:66,1080:55.1\" FBAbrPolicyTags=\"\" width=\"720\" height=\"1280\" FBQualityClass=\"hd\" FBQualityLabel=\"270p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQP4ZqDKyK0AYiQhRBWKnza86ncUXdWuryJn6TY2_EKtN5VTWO82x7KkFxEqyAx8qurlQME8_72zxMRhVuP4th5D.mp4?strext=1&amp;_nc_cat=107&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=ng2eEdUf52EQ7kNvgG-IotG&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfcjJldmV2cDktcjFnZW4ydnA5X3EzMCIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYA9M0Jc7d4m9kXvnoEHJ3tvK46SawQmW-3_-ixHHBKHWg&amp;oe=6754A284</BaseURL><SegmentBase indexRange=\"818-1005\" timescale=\"15360\" FBMinimumPrefetchRange=\"1006-10522\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"1006-32860\" FBFirstSegmentRange=\"1006-106638\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"106639-216446\" FBPrefetchSegmentRange=\"1006-106638\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"640087855043920v\" bandwidth=\"295160\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q40\" FBContentLength=\"2255517\" FBPlaybackResolutionMos=\"0:100,360:43.6,480:41.8,720:41,1080:42.4\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:86.3,480:81.1,720:72.8,1080:61.8\" FBAbrPolicyTags=\"\" width=\"720\" height=\"1280\" FBQualityClass=\"hd\" FBQualityLabel=\"360p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQOEbjpYt_tuO8wfJIMe9zUm8kmqdCB2ICGMejuA8QGPxL7wLWlIkdfvedRwbBtBuUK2xxr1yE8FU-aq1wB7QZCp.mp4?strext=1&amp;_nc_cat=104&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=_PueaQJiSKAQ7kNvgFQJ7NT&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfcjJldmV2cDktcjFnZW4ydnA5X3E0MCIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYD8TJ0CgGAjRAOAGO9ltQXYC9rnwpSewr1dBrM08fZu9w&amp;oe=6754C8A1</BaseURL><SegmentBase indexRange=\"818-1005\" timescale=\"15360\" FBMinimumPrefetchRange=\"1006-14426\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"1006-48682\" FBFirstSegmentRange=\"1006-159454\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"159455-324286\" FBPrefetchSegmentRange=\"1006-159454\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"1074173913990554v\" bandwidth=\"441652\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q50\" FBContentLength=\"3374962\" FBPlaybackResolutionMos=\"0:100,360:48.7,480:46.6,720:45.4,1080:46.6\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:90.4,480:86.4,720:79.2,1080:69.1\" FBAbrPolicyTags=\"\" width=\"720\" height=\"1280\" FBQualityClass=\"hd\" FBQualityLabel=\"480p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQPaYcjV7EW_QPh3NXEj73w2r8On-D0EiygXmKw02TTIUmfU2Hu22hDVC-axDvQCYiaa87-Dt62QPNYuJ9u1BiKt.mp4?strext=1&amp;_nc_cat=110&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=5o_4M4KATIkQ7kNvgF17QO0&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfcjJldmV2cDktcjFnZW4ydnA5X3E1MCIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYBNDt01Je4CAbqSaac7vFqxeAbiAVu8VHarKqeeIRdVvA&amp;oe=6754B3B3</BaseURL><SegmentBase indexRange=\"818-1005\" timescale=\"15360\" FBMinimumPrefetchRange=\"1006-19211\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"1006-70373\" FBFirstSegmentRange=\"1006-240776\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"240777-489971\" FBPrefetchSegmentRange=\"1006-240776\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"1355668832507227v\" bandwidth=\"629279\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q60\" FBContentLength=\"4808743\" FBPlaybackResolutionMos=\"0:100,360:52.8,480:51.2,720:50.3,1080:51.1\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:93,480:89.8,720:83.8,1080:74.8\" FBAbrPolicyTags=\"\" width=\"720\" height=\"1280\" FBQualityClass=\"hd\" FBQualityLabel=\"540p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQMFPtrq2SA6qElcetCyTYk3TJHUmf68a9I5B2FvrbdCmC_kP66jDrl25VLHqf6yMY-d1VSx8pF6yhUinOHgDz9M.mp4?strext=1&amp;_nc_cat=108&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=h0X_TWn7lycQ7kNvgEJX3ae&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfcjJldmV2cDktcjFnZW4ydnA5X3E2MCIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYAG83ZRWOiKyshGMAFPYpu22Wu4ei00TZOAPq5GSxJYIg&amp;oe=6754BEB5</BaseURL><SegmentBase indexRange=\"818-1005\" timescale=\"15360\" FBMinimumPrefetchRange=\"1006-24843\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"1006-96895\" FBFirstSegmentRange=\"1006-347681\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"347682-704940\" FBPrefetchSegmentRange=\"1006-347681\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"895387822733340v\" bandwidth=\"893923\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q70\" FBContentLength=\"6831063\" FBPlaybackResolutionMos=\"0:100,360:54.7,480:53.4,720:52.6,1080:53.2\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:95.3,480:93.3,720:89.1,1080:81.3\" FBAbrPolicyTags=\"\" width=\"720\" height=\"1280\" FBQualityClass=\"hd\" FBQualityLabel=\"640p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQNrzryr2uoU7YzeudL9fipy-OW5cLQRJrMnsO7Bl5r88Jvckydi3Vs3IulZNMMHkdcUcjviuVa-dD7gyL8FEZCI.mp4?strext=1&amp;_nc_cat=105&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=FiI--sJpcxIQ7kNvgHl3G2t&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfcjJldmV2cDktcjFnZW4ydnA5X3E3MCIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYCbcRO72iUZGv47rWPGhb-EBNp6r2QLZCr_LkFuLJyz5g&amp;oe=67549BBE</BaseURL><SegmentBase indexRange=\"818-1005\" timescale=\"15360\" FBMinimumPrefetchRange=\"1006-31771\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"1006-134988\" FBFirstSegmentRange=\"1006-489275\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"489276-1006955\" FBPrefetchSegmentRange=\"1006-489275\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"443126725495173v\" bandwidth=\"1213344\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q80\" FBContentLength=\"9271976\" FBPlaybackResolutionMos=\"0:100,360:56.9,480:56,720:55.5,1080:56\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:96.5,480:95.1,720:92,1080:85.2\" FBAbrPolicyTags=\"\" width=\"720\" height=\"1280\" FBQualityClass=\"hd\" FBQualityLabel=\"720p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQNZK7CdlsjjRDrN4ARb7Siac1yodJM5p8mXRrpIp3m1y66cJ21D3QBYMBux0yXiHMYqGDArKmd-WI-FIdmtTrNq.mp4?strext=1&amp;_nc_cat=103&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=ygtlQUuG44AQ7kNvgE1rntk&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfcjJldmV2cDktcjFnZW4ydnA5X3E4MCIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYAXEznCsTIoRlvZwOIaVT9SZepY6gJeC1JmXTNakZ0N3Q&amp;oe=6754C4D4</BaseURL><SegmentBase indexRange=\"818-1005\" timescale=\"15360\" FBMinimumPrefetchRange=\"1006-38801\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"1006-178355\" FBFirstSegmentRange=\"1006-662256\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"662257-1360150\" FBPrefetchSegmentRange=\"1006-662256\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"545938721729737v\" bandwidth=\"1794588\" codecs=\"vp09.00.40.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q90\" FBContentLength=\"13713646\" FBPlaybackResolutionMos=\"0:100,360:59.5,480:59,720:58.8,1080:59.8\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:97.2,480:96.3,720:94.1,1080:90.2\" FBAbrPolicyTags=\"\" width=\"1080\" height=\"1920\" FBQualityClass=\"hd\" FBQualityLabel=\"1080p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQOk52enit-Tzw46gTuY92oc_k1-64cB-OrElwCzpYWd9-y7qrvLodvMMCjDWHLVh2lQ1xJCZXrZY4G2zYWR_Pe2.mp4?strext=1&amp;_nc_cat=110&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=MzzdiZsFpBcQ7kNvgEppMmx&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfcjJldmV2cDktcjFnZW4ydnA5X3E5MCIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYDjIFiinYEqTlThngGwqXI3nd6njtc5l6FFIbww1t86xg&amp;oe=67549BE7</BaseURL><SegmentBase indexRange=\"818-1005\" timescale=\"15360\" FBMinimumPrefetchRange=\"1006-50190\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"1006-258976\" FBFirstSegmentRange=\"1006-985111\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"985112-2017520\" FBPrefetchSegmentRange=\"1006-985111\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation></AdaptationSet><AdaptationSet id=\"1\" contentType=\"audio\" subsegmentStartsWithSAP=\"1\" subsegmentAlignment=\"true\"><Representation id=\"817538983758645ad\" bandwidth=\"85783\" codecs=\"mp4a.40.5\" mimeType=\"audio/mp4\" FBAvgBitrate=\"85783\" audioSamplingRate=\"44100\" FBEncodingTag=\"dash_ln_heaac_vbr3_audio\" FBContentLength=\"656289\" FBPaqMos=\"79.48\" FBAbrPolicyTags=\"\" FBDefaultQuality=\"1\"><AudioChannelConfiguration schemeIdUri=\"urn:mpeg:dash:23003:3:audio_channel_configuration:2011\" value=\"2\"/><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQOC2_xPeeYNT612A9AclPfvkwCzUjMV0-NJRKNiEuqqCqLT7Z9DULXzw2g2Kx_VNArnNPW17SBAuu5eGE3MJaUn.mp4?strext=1&amp;_nc_cat=103&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=JXr6K7GsSugQ7kNvgHCc5WN&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfbG5faGVhYWNfdmJyM19hdWRpbyIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYBIELmqcDm-eeaOTnU_YZvZwGsyCYarXwDKa4PuogdMdw&amp;oe=6754B6E0</BaseURL><SegmentBase indexRange=\"824-1227\" timescale=\"44100\" FBMinimumPrefetchRange=\"1228-1571\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"1228-13243\" FBFirstSegmentRange=\"1228-24785\" FBFirstSegmentDuration=\"2021\" FBSecondSegmentRange=\"24786-46592\" FBPrefetchSegmentRange=\"1228-46592\" FBPrefetchSegmentDuration=\"4017\"><Initialization range=\"0-823\"/></SegmentBase></Representation></AdaptationSet></Period></MPD>\n",
                                "number_of_qualities": 8
                            },
                            "has_audio": true,
                            "tracking_token": "eyJ2ZXJzaW9uIjo1LCJwYXlsb2FkIjp7ImlzX2FuYWx5dGljc190cmFja2VkIjp0cnVlLCJ1dWlkIjoiYmM1MmYwZDVhMzU1NDI1Y2ExODI0ZWFjOGNmZTRlNzUzNTA1MTQwOTU3NjY1MDMwMDUzIn0sInNpZ25hdHVyZSI6IiJ9",
                            "video_url": "https://scontent-atl3-3.cdninstagram.com/o1/v/t16/f1/m86/FA48EBB91527B32B8F01501509F7EC91_video_dashinit.mp4?stp=dst-mp4&efg=eyJxZV9ncm91cHMiOiJbXCJpZ193ZWJfZGVsaXZlcnlfdnRzX290ZlwiXSIsInZlbmNvZGVfdGFnIjoidnRzX3ZvZF91cmxnZW4uY2xpcHMuYzIuNzIwLmJhc2VsaW5lIn0&_nc_cat=109&vs=1295481824781381_637289147&_nc_vs=HBksFQIYUmlnX3hwdl9yZWVsc19wZXJtYW5lbnRfc3JfcHJvZC9GQTQ4RUJCOTE1MjdCMzJCOEYwMTUwMTUwOUY3RUM5MV92aWRlb19kYXNoaW5pdC5tcDQVAALIAQAVAhg6cGFzc3Rocm91Z2hfZXZlcnN0b3JlL0dBUEQ0eHRiTGR5MUVQSUJBQUcyY0FyX3BsNXJicV9FQUFBRhUCAsgBACgAGAAbABUAACaOv%2BXvv%2B%2FkPxUCKAJDMywXQE6RBiTdLxsYEmRhc2hfYmFzZWxpbmVfMV92MREAdf4HAA%3D%3D&ccb=9-4&oh=00_AYCO3KUJxaxiAymKiUJAR2QSpy85d61_F1WV0YMBOcEH-g&oe=6750BE89&_nc_sid=8b3546",
                            "video_view_count": 1741093,
                            "edge_media_to_caption": {
                                "edges": [
                                    {
                                        "node": {
                                            "text": "In honor of Trans Awareness Week, creator @beauteuss (Darie Santana) has a message to share with her community.\n\n“I want trans identifying people to know that trans people are gifted in so many different ways,” says Darie. “Love your imperfections, love and appreciate the little things. If you ever feel alone, remember community will always be home.”\n\nVideo by @beauteuss"
                                        }
                                    }
                                ]
                            },
                            "edge_media_to_comment": {
                                "count": 2738
                            },
                            "comments_disabled": false,
                            "taken_at_timestamp": 1732065501,
                            "edge_liked_by": {
                                "count": 65647
                            },
                            "edge_media_preview_like": {
                                "count": 65647
                            },
                            "location": null,
                            "nft_asset_info": null,
                            "thumbnail_src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/467554495_18609346108001321_8446496511191069471_n.jpg?stp=c0.406.1044.1044a_dst-jpg_e15_s640x640_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=ZRPcNgekkWEQ7kNvgGNTi-u&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDD8LkO0u_7uOhgLOdq97_Mq0oEfaHZfuvB1KH8tR6GiA&oe=6754A96B&_nc_sid=8b3546",
                            "thumbnail_resources": [
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/467554495_18609346108001321_8446496511191069471_n.jpg?stp=c0.406.1044.1044a_dst-jpg_e15_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xMDQ0eDE4NTYuc2RyLmY3NTc2MS5kZWZhdWx0X2NvdmVyX2ZyYW1lIn0&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=ZRPcNgekkWEQ7kNvgGNTi-u&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAGsctfip9cGMBGKmCGl_Vp39vhI9mlG-483BPDduU3Zg&oe=6754A96B&_nc_sid=8b3546",
                                    "config_width": 150,
                                    "config_height": 150
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/467554495_18609346108001321_8446496511191069471_n.jpg?stp=c0.406.1044.1044a_dst-jpg_e15_s240x240_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xMDQ0eDE4NTYuc2RyLmY3NTc2MS5kZWZhdWx0X2NvdmVyX2ZyYW1lIn0&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=ZRPcNgekkWEQ7kNvgGNTi-u&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBq4FAtkTxhQ6dCByUJQ_WWdPjxqErpYmHOvzZIGO64YA&oe=6754A96B&_nc_sid=8b3546",
                                    "config_width": 240,
                                    "config_height": 240
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/467554495_18609346108001321_8446496511191069471_n.jpg?stp=c0.406.1044.1044a_dst-jpg_e15_s320x320_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xMDQ0eDE4NTYuc2RyLmY3NTc2MS5kZWZhdWx0X2NvdmVyX2ZyYW1lIn0&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=ZRPcNgekkWEQ7kNvgGNTi-u&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDxPn5azHcQk5tHN3beccBTBUArVntuL1cY1CwfdepLOg&oe=6754A96B&_nc_sid=8b3546",
                                    "config_width": 320,
                                    "config_height": 320
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/467554495_18609346108001321_8446496511191069471_n.jpg?stp=c0.406.1044.1044a_dst-jpg_e15_s480x480_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xMDQ0eDE4NTYuc2RyLmY3NTc2MS5kZWZhdWx0X2NvdmVyX2ZyYW1lIn0&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=ZRPcNgekkWEQ7kNvgGNTi-u&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYCOd54JtqmRllLcOpxpcXJ0-ZeHvybDvy6p4d1oSLkIrg&oe=6754A96B&_nc_sid=8b3546",
                                    "config_width": 480,
                                    "config_height": 480
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/467554495_18609346108001321_8446496511191069471_n.jpg?stp=c0.406.1044.1044a_dst-jpg_e15_s640x640_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xMDQ0eDE4NTYuc2RyLmY3NTc2MS5kZWZhdWx0X2NvdmVyX2ZyYW1lIn0&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=ZRPcNgekkWEQ7kNvgGNTi-u&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDD8LkO0u_7uOhgLOdq97_Mq0oEfaHZfuvB1KH8tR6GiA&oe=6754A96B&_nc_sid=8b3546",
                                    "config_width": 640,
                                    "config_height": 640
                                }
                            ],
                            "felix_profile_grid_crop": null,
                            "coauthor_producers": [
                                {
                                    "id": "5445097695",
                                    "is_verified": false,
                                    "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/318162497_1212519639645300_6749278047801003180_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=100&_nc_ohc=RN3KpX5HcC4Q7kNvgHQlenM&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYCwW8D6DjLCrFnUYt_z7kktCxIWdSpfHihteIR3xp6StQ&oe=6754C5EA&_nc_sid=8b3546",
                                    "username": "beauteuss"
                                }
                            ],
                            "pinned_for_users": [],
                            "viewer_can_reshare": true,
                            "like_and_view_counts_disabled": false,
                            "product_type": "clips",
                            "clips_music_attribution_info": {
                                "artist_name": "instagram",
                                "song_name": "Original audio",
                                "uses_original_audio": true,
                                "should_mute_audio": false,
                                "should_mute_audio_reason": "",
                                "audio_id": "1223797888675632"
                            }
                        }
                    },
                    {
                        "node": {
                            "__typename": "GraphVideo",
                            "id": "3504892971840138235",
                            "shortcode": "DCj4ZaSS2v7",
                            "dimensions": {
                                "height": 1920,
                                "width": 1080
                            },
                            "display_url": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-15/467763988_18609277435001321_8167609778074325034_n.jpg?stp=dst-jpg_e15_tt6&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=105&_nc_ohc=W4rSBCRzrQIQ7kNvgHLk_j-&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBcsC-ZOLOSz-iCmL9kCW7KsB_aAY6YgSMQ5m7y5yDEBw&oe=67549DED&_nc_sid=8b3546",
                            "edge_media_to_tagged_user": {
                                "edges": [
                                    {
                                        "node": {
                                            "user": {
                                                "full_name": "Brian ヅ",
                                                "followed_by_viewer": false,
                                                "id": "3881419219",
                                                "is_verified": false,
                                                "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/446598818_806516568104990_6368437131902367962_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=-9RUDLeBDSEQ7kNvgG2-YHL&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAILiRm2r06M5kq4GdUOuHrk_jc_7NJeppMJZfh_K5NXw&oe=6754970F&_nc_sid=8b3546",
                                                "username": "iambriancoro"
                                            },
                                            "x": 0,
                                            "y": 0
                                        }
                                    }
                                ]
                            },
                            "fact_check_overall_rating": null,
                            "fact_check_information": null,
                            "gating_info": null,
                            "sharing_friction_info": {
                                "should_have_sharing_friction": false,
                                "bloks_app_url": null
                            },
                            "media_overlay_info": null,
                            "media_preview": "ABgqnW3DhuxGMH86jjTaNznAHUmrayrGSCeTiqN1GGYFiSuD8oPepHYtwyJMu5OgJH5Y/wAaKq6Z/qmHo/8AMf8A1qKBE80YxuIzjHYce/Ssu7AjP19D/LkVpxTJcg7eeM8j371ny26tIAxOMHFMY/TZMOVHcZ/I/U0VPaIqOVXoF69z060UmIh0wEIT2Ix+tMmbEgP+e9M0/wC6fp/Wo7g8mmUi1bMftGezIfzGKKfB/rR+P8qKQH//2Q==",
                            "owner": {
                                "id": "25025320",
                                "username": "instagram"
                            },
                            "is_video": true,
                            "has_upcoming_event": false,
                            "accessibility_caption": null,
                            "dash_info": {
                                "is_dash_eligible": true,
                                "video_dash_manifest": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<MPD xmlns=\"urn:mpeg:dash:schema:mpd:2011\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"urn:mpeg:dash:schema:mpd:2011 DASH-MPD.xsd\" profiles=\"urn:mpeg:dash:profile:isoff-on-demand:2011\" minBufferTime=\"PT2S\" type=\"static\" mediaPresentationDuration=\"PT16.033333S\" FBManifestIdentifier=\"FgAYEnIyZXZldnA5LXIxZ2VuMnZwORmGjLOdgqvWqAHOsPHElrz5AeT6367KhPoBpsChrYm+jwKiopyRiueyA9qq7K6Do8UD7Kj+5aPlyATMuJLxmY7CBiIYGGRhc2hfbG5faGVhYWNfdmJyM19hdWRpbwA=\"><Period id=\"0\" duration=\"PT16.033333S\"><AdaptationSet id=\"0\" contentType=\"video\" frameRate=\"15360/512\" subsegmentAlignment=\"true\" par=\"9:16\" FBUnifiedUploadResolutionMos=\"360:76\"><Representation id=\"549834514497202vd\" bandwidth=\"97256\" codecs=\"vp09.00.30.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q30\" FBContentLength=\"194919\" FBPlaybackResolutionMos=\"0:100,360:48.1,480:41.7,720:36.7\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:79.8,480:75.4,720:68\" FBAbrPolicyTags=\"\" width=\"540\" height=\"960\" FBDefaultQuality=\"1\" FBQualityClass=\"sd\" FBQualityLabel=\"240p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQPffC7Zm1s_td8Fq3DnfOgCBFTzyTQGeZOFrIGKIeHnb2ReuIBjG3YS2CMYMDP9V7D6CLP2g8jdedVv4w4isfh5.mp4?strext=1&amp;_nc_cat=105&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=3Xh1mas-kr8Q7kNvgHD402l&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfcjJldmV2cDktcjFnZW4ydnA5X3EzMCIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYDo9C-dDCLitjBZcnfw2UyH77tU6niRhiGiSeeEtfaxVA&amp;oe=6754BC8A</BaseURL><SegmentBase indexRange=\"818-897\" timescale=\"15360\" FBMinimumPrefetchRange=\"898-12154\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"898-20219\" FBFirstSegmentRange=\"898-57091\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"57092-142703\" FBPrefetchSegmentRange=\"898-57091\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"1285969552591414v\" bandwidth=\"126919\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q40\" FBContentLength=\"254368\" FBPlaybackResolutionMos=\"0:100,360:55.3,480:48.6,720:42.9\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:83.8,480:80,720:74.5\" FBAbrPolicyTags=\"\" width=\"720\" height=\"1280\" FBQualityClass=\"hd\" FBQualityLabel=\"270p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQPKXRYb_QYXbrwUXQRpKsVDOSC2WuCg2bAD5-bi4rDje6D34YZd6XknbuWNbXzDRxiDmcjr6Ai8_0yanXWbhhlW.mp4?strext=1&amp;_nc_cat=102&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=Hspj06FIrYAQ7kNvgFvqeKZ&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfcjJldmV2cDktcjFnZW4ydnA5X3E0MCIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYBPi3TKIBWfZjl5zlLqwfTLkOU2KXuYsNttm656OAedpw&amp;oe=6754A67F</BaseURL><SegmentBase indexRange=\"818-897\" timescale=\"15360\" FBMinimumPrefetchRange=\"898-14982\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"898-25014\" FBFirstSegmentRange=\"898-75077\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"75078-187321\" FBPrefetchSegmentRange=\"898-75077\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"597001709563923v\" bandwidth=\"185343\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q50\" FBContentLength=\"371460\" FBPlaybackResolutionMos=\"0:100,360:66.5,480:59.8,720:53.6\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:89.9,480:87,720:82\" FBAbrPolicyTags=\"\" width=\"720\" height=\"1280\" FBQualityClass=\"hd\" FBQualityLabel=\"360p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQPT40NSoCQgYafGF2f0oJ4qE0CnU4AU6ELVCgoJ88K0WMWAeRPTd_70x3iHlYHher0UE1Rjs48whqX70yKF-iEG.mp4?strext=1&amp;_nc_cat=100&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=0pIKmnOY7L0Q7kNvgGi9FT3&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfcjJldmV2cDktcjFnZW4ydnA5X3E1MCIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYDmV6vo1FFYRy78yKSIgH0Lzdon_TmqRUAFlXcbuiAOqg&amp;oe=675494F1</BaseURL><SegmentBase indexRange=\"818-897\" timescale=\"15360\" FBMinimumPrefetchRange=\"898-18456\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"898-32712\" FBFirstSegmentRange=\"898-109961\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"109962-275422\" FBPrefetchSegmentRange=\"898-109961\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"548590607805479v\" bandwidth=\"282972\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q60\" FBContentLength=\"567124\" FBPlaybackResolutionMos=\"0:100,360:74.8,480:68.9,720:62.3\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:93.6,480:91.6,720:87.9\" FBAbrPolicyTags=\"\" width=\"720\" height=\"1280\" FBQualityClass=\"hd\" FBQualityLabel=\"480p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQPBfikNPy6Z_O5OBra6GVyA5YEJa98kTdeue0NjscRav6ibynKqw5WiN1YJuu3uEj5RcaeJ7MV2wsQrquTWAsWw.mp4?strext=1&amp;_nc_cat=111&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=RL8qo5lj7XQQ7kNvgHznYRD&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfcjJldmV2cDktcjFnZW4ydnA5X3E2MCIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYDyBFxR8X5VDKn3S3Mfso-JD7nQvH8-iCDLQoT-stWfvg&amp;oe=67549CAC</BaseURL><SegmentBase indexRange=\"818-897\" timescale=\"15360\" FBMinimumPrefetchRange=\"898-24551\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"898-46041\" FBFirstSegmentRange=\"898-164516\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"164517-421614\" FBPrefetchSegmentRange=\"898-164516\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"370919149382854v\" bandwidth=\"415895\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q70\" FBContentLength=\"833524\" FBPlaybackResolutionMos=\"0:100,360:82.4,480:77,720:71.7\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:96.1,480:94.9,720:92.4\" FBAbrPolicyTags=\"\" width=\"720\" height=\"1280\" FBQualityClass=\"hd\" FBQualityLabel=\"540p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQPz0GN8T4u3FCOVqX-rk7KabxmFbAsldGyyCYnX4qMwef3khz8dBblLpJEtk9Z4RFdQ3xscEJwmmwA_7hY8wNCs.mp4?strext=1&amp;_nc_cat=102&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=dg6pilNiX_YQ7kNvgFYinK0&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfcjJldmV2cDktcjFnZW4ydnA5X3E3MCIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYCe5MhsLrV3On92ro_phSe3U5QyUZGlrD0cQO5wa8LFNg&amp;oe=6754AF7B</BaseURL><SegmentBase indexRange=\"818-897\" timescale=\"15360\" FBMinimumPrefetchRange=\"898-30920\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"898-62362\" FBFirstSegmentRange=\"898-248718\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"248719-624450\" FBPrefetchSegmentRange=\"898-248718\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"1834229387382310v\" bandwidth=\"568486\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q80\" FBContentLength=\"1139341\" FBPlaybackResolutionMos=\"0:100,360:86.7,480:82.5,720:76.8\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:97.1,480:96.3,720:94.6\" FBAbrPolicyTags=\"avoid_on_cellular,avoid_on_cellular_intentional\" width=\"720\" height=\"1280\" FBQualityClass=\"hd\" FBQualityLabel=\"640p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQOC5TGEo5Okqysrv0qddowt-_6DgsLOWZw9S7kG43og2NMkQxxbzqDXgT3IaGOojTI6cyTjjZ58OaUe47uB4eRH.mp4?strext=1&amp;_nc_cat=106&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=tjS32Ly0QbEQ7kNvgGE06xh&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfcjJldmV2cDktcjFnZW4ydnA5X3E4MCIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYB7P7Ejt8hz5dFkXEMiMzm1ceNKzKIp7ou-8hKGbifgYQ&amp;oe=6754A40F</BaseURL><SegmentBase indexRange=\"818-897\" timescale=\"15360\" FBMinimumPrefetchRange=\"898-38058\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"898-81626\" FBFirstSegmentRange=\"898-345652\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"345653-852915\" FBPrefetchSegmentRange=\"898-345652\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"956146979670161v\" bandwidth=\"747262\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q90\" FBContentLength=\"1497638\" FBPlaybackResolutionMos=\"0:100,360:89.6,480:86.3,720:81.3\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:97.7,480:97.1,720:95.8\" FBAbrPolicyTags=\"avoid_on_cellular,avoid_on_cellular_intentional\" width=\"720\" height=\"1280\" FBQualityClass=\"hd\" FBQualityLabel=\"720p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQOINr-kUz89eq_xXZ0ZVmLTouUXOCH6fVKtPTqbDqvkpveQOGWjTZmTzokw83AYu5stEgk876EE_NIVPfsVx4R1.mp4?strext=1&amp;_nc_cat=104&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=1as4ZeOLQ9EQ7kNvgFwDTbA&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfcjJldmV2cDktcjFnZW4ydnA5X3E5MCIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYCngcMahxZL-cE42zUvrn8gc3p_-xnzfe3AVNAZObQmow&amp;oe=6754BF35</BaseURL><SegmentBase indexRange=\"818-897\" timescale=\"15360\" FBMinimumPrefetchRange=\"898-44765\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"898-103292\" FBFirstSegmentRange=\"898-457800\" FBFirstSegmentDuration=\"5000\" FBSecondSegmentRange=\"457801-1116966\" FBPrefetchSegmentRange=\"898-457800\" FBPrefetchSegmentDuration=\"5000\"><Initialization range=\"0-817\"/></SegmentBase></Representation></AdaptationSet><AdaptationSet id=\"1\" contentType=\"audio\" subsegmentStartsWithSAP=\"1\" subsegmentAlignment=\"true\"><Representation id=\"996759281961645ad\" bandwidth=\"81997\" codecs=\"mp4a.40.5\" mimeType=\"audio/mp4\" FBAvgBitrate=\"81997\" audioSamplingRate=\"44100\" FBEncodingTag=\"dash_ln_heaac_vbr3_audio\" FBContentLength=\"164916\" FBPaqMos=\"89.06\" FBAbrPolicyTags=\"\" FBDefaultQuality=\"1\"><AudioChannelConfiguration schemeIdUri=\"urn:mpeg:dash:23003:3:audio_channel_configuration:2011\" value=\"2\"/><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQPK6lo0Z0x31tPlnEI5WUp1lH6TXe11FQcpWfQZobu72t_BlftwH-_Vdb4p4psIvrVMHbdZT2hU6eg2sTL9odQu.mp4?strext=1&amp;_nc_cat=100&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=66LD7KwOzZkQ7kNvgGzTjKN&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfbG5faGVhYWNfdmJyM19hdWRpbyIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYAh4FRsor7tTRtfuYS4mWLr9ZjWNJmJMSlxiKDeTmy2lA&amp;oe=675494B5</BaseURL><SegmentBase indexRange=\"824-951\" timescale=\"44100\" FBMinimumPrefetchRange=\"952-1295\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"952-11698\" FBFirstSegmentRange=\"952-23174\" FBFirstSegmentDuration=\"2021\" FBSecondSegmentRange=\"23175-43863\" FBPrefetchSegmentRange=\"952-43863\" FBPrefetchSegmentDuration=\"4017\"><Initialization range=\"0-823\"/></SegmentBase></Representation></AdaptationSet></Period></MPD>\n",
                                "number_of_qualities": 7
                            },
                            "has_audio": true,
                            "tracking_token": "eyJ2ZXJzaW9uIjo1LCJwYXlsb2FkIjp7ImlzX2FuYWx5dGljc190cmFja2VkIjp0cnVlLCJ1dWlkIjoiYmM1MmYwZDVhMzU1NDI1Y2ExODI0ZWFjOGNmZTRlNzUzNTA0ODkyOTcxODQwMTM4MjM1In0sInNpZ25hdHVyZSI6IiJ9",
                            "video_url": "https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f1/m86/34409115CA0FD8B3F82A7141F7896590_video_dashinit.mp4?stp=dst-mp4&efg=eyJxZV9ncm91cHMiOiJbXCJpZ193ZWJfZGVsaXZlcnlfdnRzX290ZlwiXSIsInZlbmNvZGVfdGFnIjoidnRzX3ZvZF91cmxnZW4uY2xpcHMuYzIuNzIwLmJhc2VsaW5lIn0&_nc_cat=102&vs=1212613399814193_3303072675&_nc_vs=HBksFQIYUmlnX3hwdl9yZWVsc19wZXJtYW5lbnRfc3JfcHJvZC8zNDQwOTExNUNBMEZEOEIzRjgyQTcxNDFGNzg5NjU5MF92aWRlb19kYXNoaW5pdC5tcDQVAALIAQAVAhg6cGFzc3Rocm91Z2hfZXZlcnN0b3JlL0dDWngyUnRRdjJsaG9lUURBTG9MWGE2anNya3picV9FQUFBRhUCAsgBACgAGAAbABUAACaezfX%2F6e3FPxUCKAJDMywXQDAIcrAgxJwYEmRhc2hfYmFzZWxpbmVfMV92MREAdf4HAA%3D%3D&ccb=9-4&oh=00_AYB9e2z7UtduixQR5AyBbFxhy_FzNZkIh1oo9sxT9tSnYQ&oe=6750B384&_nc_sid=8b3546",
                            "video_view_count": 3912471,
                            "edge_media_to_caption": {
                                "edges": [
                                    {
                                        "node": {
                                            "text": "Creators of Tomorrow: DM-Worthy Icons\n \nName: @iambriancoro (Brian Coro)\n\nOccupation: Content creator\n \n“I want people to engage and laugh every time they see my videos. The content I make represents how I show up in the world. I’m a person who just loves to make people laugh — through my videos and in the real world. I’m the same guy and I would never change who I am.\n\nIf you’re having a bad day or going through something, I hope my videos can lift you up and make your day so much better.“\n\nVideo by @iambriancoro"
                                        }
                                    }
                                ]
                            },
                            "edge_media_to_comment": {
                                "count": 2789
                            },
                            "comments_disabled": false,
                            "taken_at_timestamp": 1732035916,
                            "edge_liked_by": {
                                "count": 169073
                            },
                            "edge_media_preview_like": {
                                "count": 169073
                            },
                            "location": null,
                            "nft_asset_info": null,
                            "thumbnail_src": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-15/467763988_18609277435001321_8167609778074325034_n.jpg?stp=c0.393.1010.1010a_dst-jpg_e15_s640x640_tt6&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=105&_nc_ohc=W4rSBCRzrQIQ7kNvgHLk_j-&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBypozXherDW2ZcpyR98e-QInbfisIt7zTpO6ukji-p3Q&oe=67549DED&_nc_sid=8b3546",
                            "thumbnail_resources": [
                                {
                                    "src": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-15/467763988_18609277435001321_8167609778074325034_n.jpg?stp=c0.393.1010.1010a_dst-jpg_e15_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xMDEweDE3OTYuc2RyLmY3NTc2MS5kZWZhdWx0X2NvdmVyX2ZyYW1lIn0&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=105&_nc_ohc=W4rSBCRzrQIQ7kNvgHLk_j-&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYCLz70flm6z_oJEaukw3x6NeYf__IPnJ789dMUy-zKLtA&oe=67549DED&_nc_sid=8b3546",
                                    "config_width": 150,
                                    "config_height": 150
                                },
                                {
                                    "src": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-15/467763988_18609277435001321_8167609778074325034_n.jpg?stp=c0.393.1010.1010a_dst-jpg_e15_s240x240_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xMDEweDE3OTYuc2RyLmY3NTc2MS5kZWZhdWx0X2NvdmVyX2ZyYW1lIn0&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=105&_nc_ohc=W4rSBCRzrQIQ7kNvgHLk_j-&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYCkkfW9hxBnnzyys6w-gRXSCEg4WxxTBa0-qQUKUYjnbw&oe=67549DED&_nc_sid=8b3546",
                                    "config_width": 240,
                                    "config_height": 240
                                },
                                {
                                    "src": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-15/467763988_18609277435001321_8167609778074325034_n.jpg?stp=c0.393.1010.1010a_dst-jpg_e15_s320x320_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xMDEweDE3OTYuc2RyLmY3NTc2MS5kZWZhdWx0X2NvdmVyX2ZyYW1lIn0&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=105&_nc_ohc=W4rSBCRzrQIQ7kNvgHLk_j-&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDrW_j-fVgkU8p5D6FNLlt-y1xnXSw8ojcxL1CvtjCSaA&oe=67549DED&_nc_sid=8b3546",
                                    "config_width": 320,
                                    "config_height": 320
                                },
                                {
                                    "src": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-15/467763988_18609277435001321_8167609778074325034_n.jpg?stp=c0.393.1010.1010a_dst-jpg_e15_s480x480_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xMDEweDE3OTYuc2RyLmY3NTc2MS5kZWZhdWx0X2NvdmVyX2ZyYW1lIn0&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=105&_nc_ohc=W4rSBCRzrQIQ7kNvgHLk_j-&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYD8W1EaNrjQ_nusj0iXqzDqRYWKGfcR0ruOTl57_Xovig&oe=67549DED&_nc_sid=8b3546",
                                    "config_width": 480,
                                    "config_height": 480
                                },
                                {
                                    "src": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-15/467763988_18609277435001321_8167609778074325034_n.jpg?stp=c0.393.1010.1010a_dst-jpg_e15_s640x640_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xMDEweDE3OTYuc2RyLmY3NTc2MS5kZWZhdWx0X2NvdmVyX2ZyYW1lIn0&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=105&_nc_ohc=W4rSBCRzrQIQ7kNvgHLk_j-&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBypozXherDW2ZcpyR98e-QInbfisIt7zTpO6ukji-p3Q&oe=67549DED&_nc_sid=8b3546",
                                    "config_width": 640,
                                    "config_height": 640
                                }
                            ],
                            "felix_profile_grid_crop": null,
                            "coauthor_producers": [
                                {
                                    "id": "3881419219",
                                    "is_verified": false,
                                    "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/446598818_806516568104990_6368437131902367962_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=-9RUDLeBDSEQ7kNvgG2-YHL&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAILiRm2r06M5kq4GdUOuHrk_jc_7NJeppMJZfh_K5NXw&oe=6754970F&_nc_sid=8b3546",
                                    "username": "iambriancoro"
                                }
                            ],
                            "pinned_for_users": [],
                            "viewer_can_reshare": true,
                            "like_and_view_counts_disabled": false,
                            "product_type": "clips",
                            "clips_music_attribution_info": {
                                "artist_name": "instagram",
                                "song_name": "Original audio",
                                "uses_original_audio": true,
                                "should_mute_audio": false,
                                "should_mute_audio_reason": "",
                                "audio_id": "575367478509566"
                            }
                        }
                    },
                    {
                        "node": {
                            "__typename": "GraphVideo",
                            "id": "3504194125287817442",
                            "shortcode": "DChZf2tyoDi",
                            "dimensions": {
                                "height": 1918,
                                "width": 1080
                            },
                            "display_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/467532948_18609103744001321_4066765072496668197_n.jpg?stp=dst-jpg_e15_fr_p1080x1080_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=fMMVy_x6nfcQ7kNvgE47yZg&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDEHQUfQ1uExpadqf_bIlYv8_Pw8iwDfCqI2GpUozcQJA&oe=6754B9CD&_nc_sid=8b3546",
                            "edge_media_to_tagged_user": {
                                "edges": [
                                    {
                                        "node": {
                                            "user": {
                                                "full_name": "Chloe Wong",
                                                "followed_by_viewer": false,
                                                "id": "44547130035",
                                                "is_verified": false,
                                                "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/468991521_542349605359300_5319808328318759370_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=AvOtADjBlQkQ7kNvgGVHZqO&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYB2IKqiPzQRBZIMwJvzqA6ne18Mty1CbM34wVFWYyIcgw&oe=67549111&_nc_sid=8b3546",
                                                "username": "chl0beary"
                                            },
                                            "x": 0,
                                            "y": 0
                                        }
                                    }
                                ]
                            },
                            "fact_check_overall_rating": null,
                            "fact_check_information": null,
                            "gating_info": null,
                            "sharing_friction_info": {
                                "should_have_sharing_friction": false,
                                "bloks_app_url": null
                            },
                            "media_overlay_info": null,
                            "media_preview": "ABgq0yKRkA7D60+aRYEMj9F9KjhnW5jDqCvPQ9f/ANVSA5FoqXtRTAzdTuhHGY+jNjH4MM/571UjvmkkEcGDuPUjGBjn+WQe3SrM0QvZHTaN0RKqSTjkdTj04x71Rs9PuIJg7LhVzk5GOmOOc0D/AFOgHHU5opm7migBkBRZZAqtuZ+TgkH39qtsjMCBxkHmpk+6PoP5Up6UCMe4WWMqq4zkEntjvRVmYZJ+lFAH/9k=",
                            "owner": {
                                "id": "25025320",
                                "username": "instagram"
                            },
                            "is_video": true,
                            "has_upcoming_event": false,
                            "accessibility_caption": null,
                            "dash_info": {
                                "is_dash_eligible": true,
                                "video_dash_manifest": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<MPD xmlns=\"urn:mpeg:dash:schema:mpd:2011\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"urn:mpeg:dash:schema:mpd:2011 DASH-MPD.xsd\" profiles=\"urn:mpeg:dash:profile:isoff-on-demand:2011\" minBufferTime=\"PT2S\" type=\"static\" mediaPresentationDuration=\"PT13.535782S\" FBManifestIdentifier=\"FgAYEnIyZXZldnA5LXIxZ2VuMnZwORl2juPBquLa6wGI9bqSgMX6AYCT5cndvqkDxKyk3OyYqgTaifq87dzRBeiKhbC39+UIwrWY0duP0gwiGBhkYXNoX2xuX2hlYWFjX3ZicjNfYXVkaW8A\"><Period id=\"0\" duration=\"PT13.535782S\"><AdaptationSet id=\"0\" contentType=\"video\" frameRate=\"14226/500\" subsegmentAlignment=\"true\" par=\"9:16\" FBUnifiedUploadResolutionMos=\"360:77.1\"><Representation id=\"1218685792717602vd\" bandwidth=\"135293\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q40\" FBContentLength=\"228841\" FBPlaybackResolutionMos=\"0:100,360:55.7,480:51.2,720:48.4\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:86.8,480:82.7,720:75.8\" FBAbrPolicyTags=\"\" width=\"720\" height=\"1280\" FBDefaultQuality=\"1\" FBQualityClass=\"hd\" FBQualityLabel=\"270p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQO9Yf8DlqEEahxze75o9qGKe_SdY-it2VykVX3Mmgnz8N1zM1HTd_AL_61ZDwy_1oWYOYvnLs7zFFRmi1kRfprb.mp4?strext=1&amp;_nc_cat=102&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=HMRJAfTsZsYQ7kNvgGWafBI&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfcjJldmV2cDktcjFnZW4ydnA5X3E0MCIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYDth6Iukex-WAOa53sY4pdd9JhD9nnwk8Qb0nrgtKBZ5g&amp;oe=6754A91F</BaseURL><SegmentBase indexRange=\"818-885\" timescale=\"14226\" FBMinimumPrefetchRange=\"886-11166\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"886-29791\" FBFirstSegmentRange=\"886-66804\" FBFirstSegmentDuration=\"5026\" FBSecondSegmentRange=\"66805-125832\" FBPrefetchSegmentRange=\"886-66804\" FBPrefetchSegmentDuration=\"5026\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"1587091008864877v\" bandwidth=\"214668\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q50\" FBContentLength=\"363100\" FBPlaybackResolutionMos=\"0:100,360:69.1,480:64.6,720:61.2\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:91.9,480:89.4,720:84.6\" FBAbrPolicyTags=\"\" width=\"720\" height=\"1280\" FBQualityClass=\"hd\" FBQualityLabel=\"360p\"><BaseURL>https://scontent-atl3-3.cdninstagram.com/o1/v/t16/f2/m69/AQOXEe3TW79nSuCff4M36bqPJbhrgnrvKGH0UgVaj5IhRRsy0pmt0HAPlmtrTjbFkSlH7SUKfGn3u_76sDSZ6p9y.mp4?strext=1&amp;_nc_cat=109&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-3.cdninstagram.com&amp;_nc_ohc=Gw1eo6N6ZLIQ7kNvgGi_vHD&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfcjJldmV2cDktcjFnZW4ydnA5X3E1MCIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYBtQnRerVyi34hx0uJhFSIq36B5_ZQAwap9QcAup3pbpg&amp;oe=6754AE62</BaseURL><SegmentBase indexRange=\"818-885\" timescale=\"14226\" FBMinimumPrefetchRange=\"886-15609\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"886-48865\" FBFirstSegmentRange=\"886-100892\" FBFirstSegmentDuration=\"5026\" FBSecondSegmentRange=\"100893-190625\" FBPrefetchSegmentRange=\"886-100892\" FBPrefetchSegmentDuration=\"5026\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"3558289624468833v\" bandwidth=\"319665\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q60\" FBContentLength=\"540697\" FBPlaybackResolutionMos=\"0:100,360:77.3,480:73.7,720:70.3\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:94.5,480:92.9,720:89.5\" FBAbrPolicyTags=\"\" width=\"720\" height=\"1280\" FBQualityClass=\"hd\" FBQualityLabel=\"480p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQONtHsZxRh7qNkL5_eZBskAR-jmaTkGvqSfkf4pFUmAJ2tovPargp1Wxxf4WWOTsBH9Qo7aRCQM0Z1pcjYWmwyi.mp4?strext=1&amp;_nc_cat=104&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=ZoIhHNCCs0oQ7kNvgEFTCd0&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfcjJldmV2cDktcjFnZW4ydnA5X3E2MCIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYCPLjQ-F4DZHLgGVk8gONFyQBB9n78HPHKuaHd0ot2hSQ&amp;oe=6754B631</BaseURL><SegmentBase indexRange=\"818-885\" timescale=\"14226\" FBMinimumPrefetchRange=\"886-20782\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"886-70340\" FBFirstSegmentRange=\"886-146103\" FBFirstSegmentDuration=\"5026\" FBSecondSegmentRange=\"146104-277442\" FBPrefetchSegmentRange=\"886-146103\" FBPrefetchSegmentDuration=\"5026\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"2475952999277236v\" bandwidth=\"449694\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q70\" FBContentLength=\"760633\" FBPlaybackResolutionMos=\"0:100,360:84.8,480:81,720:77.3\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:96.2,480:95.1,720:92.7\" FBAbrPolicyTags=\"\" width=\"720\" height=\"1280\" FBQualityClass=\"hd\" FBQualityLabel=\"540p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQNDw3bYIgieL-QcQPbgG5Zb04Pi_pCOOlTWPpQ9h7Hqn6p5B1ZUcrTAI4vEdKUUOWJJBti9nmnL2ihKllU_Ri5C.mp4?strext=1&amp;_nc_cat=104&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=GnxXFyff6W0Q7kNvgF1OUIT&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfcjJldmV2cDktcjFnZW4ydnA5X3E3MCIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYBebACqRb_og3yTlp4L7SwZE0QcQL5kjaLdQB8AMGvCaQ&amp;oe=6754B83D</BaseURL><SegmentBase indexRange=\"818-885\" timescale=\"14226\" FBMinimumPrefetchRange=\"886-26573\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"886-99090\" FBFirstSegmentRange=\"886-212459\" FBFirstSegmentDuration=\"5026\" FBSecondSegmentRange=\"212460-391443\" FBPrefetchSegmentRange=\"886-212459\" FBPrefetchSegmentDuration=\"5026\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"550941244218692v\" bandwidth=\"622165\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q80\" FBContentLength=\"1052359\" FBPlaybackResolutionMos=\"0:100,360:89.3,480:86.6,720:83.5\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:97,480:96.4,720:94.9\" FBAbrPolicyTags=\"avoid_on_cellular,avoid_on_cellular_intentional\" width=\"720\" height=\"1280\" FBQualityClass=\"hd\" FBQualityLabel=\"640p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQNeQERqzAu03gmskr3JXWN6XKmbIBdE1eHXBrQs-fdrnJyU-1ngjSSAdRkuyyh8wADW8s2d8Vid5GdQ643JPNUv.mp4?strext=1&amp;_nc_cat=111&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=sEQJdZ6YrMQQ7kNvgHUh_6y&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfcjJldmV2cDktcjFnZW4ydnA5X3E4MCIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYAsyXvFaVKg8EbdeZGHrKHD1_2uMfR09mC9oCuqzVSrxQ&amp;oe=67549C08</BaseURL><SegmentBase indexRange=\"818-885\" timescale=\"14226\" FBMinimumPrefetchRange=\"886-33944\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"886-140286\" FBFirstSegmentRange=\"886-301316\" FBFirstSegmentDuration=\"5026\" FBSecondSegmentRange=\"301317-568359\" FBPrefetchSegmentRange=\"886-301316\" FBPrefetchSegmentDuration=\"5026\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"935662595122368v\" bandwidth=\"823871\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q90\" FBContentLength=\"1393534\" FBPlaybackResolutionMos=\"0:100,360:92.6,480:90.6,720:88.1\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:97.5,480:97.2,720:96.3\" FBAbrPolicyTags=\"avoid_on_cellular,avoid_on_cellular_intentional\" width=\"720\" height=\"1280\" FBQualityClass=\"hd\" FBQualityLabel=\"720p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQOfIexUibajAVsP7UW7Q5HPqn39ih_2CEpiHh4fdexnoiPNVfGu3_AwJWARtk44Mq4pTKkt4LzSebHBWnUfbG8O.mp4?strext=1&amp;_nc_cat=105&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=HFJEb_DkJ7YQ7kNvgE_vDqA&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfcjJldmV2cDktcjFnZW4ydnA5X3E5MCIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYAs4uGAUKVo5J5pDab825fFy3N3RskU50WfTCay6T0-kw&amp;oe=6754BB92</BaseURL><SegmentBase indexRange=\"818-885\" timescale=\"14226\" FBMinimumPrefetchRange=\"886-42578\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"886-199802\" FBFirstSegmentRange=\"886-430735\" FBFirstSegmentDuration=\"5026\" FBSecondSegmentRange=\"430736-785592\" FBPrefetchSegmentRange=\"886-430735\" FBPrefetchSegmentDuration=\"5026\"><Initialization range=\"0-817\"/></SegmentBase></Representation></AdaptationSet><AdaptationSet id=\"1\" contentType=\"audio\" subsegmentStartsWithSAP=\"1\" subsegmentAlignment=\"true\"><Representation id=\"518329851197639ad\" bandwidth=\"79216\" codecs=\"mp4a.40.5\" mimeType=\"audio/mp4\" FBAvgBitrate=\"79216\" audioSamplingRate=\"44100\" FBEncodingTag=\"dash_ln_heaac_vbr3_audio\" FBContentLength=\"134970\" FBPaqMos=\"94.28\" FBAbrPolicyTags=\"\" FBDefaultQuality=\"1\"><AudioChannelConfiguration schemeIdUri=\"urn:mpeg:dash:23003:3:audio_channel_configuration:2011\" value=\"2\"/><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQNJWpAyHzJbUBiHnBXcJ3SwCtCfQD8vaYsxA_deTtFBXYk1PLgICcaGC9EYTnkx1GdjOyjJdAuxPZJJ0QRKzJS6.mp4?strext=1&amp;_nc_cat=102&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=Apd7V9frBPcQ7kNvgEkjRgE&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfbG5faGVhYWNfdmJyM19hdWRpbyIsInZpZGVvX2lkIjpudWxsLCJjbGllbnRfbmFtZSI6ImlnIiwib2lsX3VybGdlbl9hcHBfaWQiOjkzNjYxOTc0MzM5MjQ1OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&amp;ccb=9-4&amp;oh=00_AYDLdJly26TfdFD4nDCSbXwjSVpLpQbSeEPX9J69vJ8RWA&amp;oe=6754C3F3</BaseURL><SegmentBase indexRange=\"824-939\" timescale=\"44100\" FBMinimumPrefetchRange=\"940-1283\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"940-10253\" FBFirstSegmentRange=\"940-21909\" FBFirstSegmentDuration=\"2021\" FBSecondSegmentRange=\"21910-41319\" FBPrefetchSegmentRange=\"940-41319\" FBPrefetchSegmentDuration=\"4017\"><Initialization range=\"0-823\"/></SegmentBase></Representation></AdaptationSet></Period></MPD>\n",
                                "number_of_qualities": 6
                            },
                            "has_audio": true,
                            "tracking_token": "eyJ2ZXJzaW9uIjo1LCJwYXlsb2FkIjp7ImlzX2FuYWx5dGljc190cmFja2VkIjp0cnVlLCJ1dWlkIjoiYmM1MmYwZDVhMzU1NDI1Y2ExODI0ZWFjOGNmZTRlNzUzNTA0MTk0MTI1Mjg3ODE3NDQyIn0sInNpZ25hdHVyZSI6IiJ9",
                            "video_url": "https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f1/m86/EE42BC08583F1BE1789B48947915C384_video_dashinit.mp4?stp=dst-mp4&efg=eyJxZV9ncm91cHMiOiJbXCJpZ193ZWJfZGVsaXZlcnlfdnRzX290ZlwiXSIsInZlbmNvZGVfdGFnIjoidnRzX3ZvZF91cmxnZW4uY2xpcHMuYzIuNzIwLmJhc2VsaW5lIn0&_nc_cat=106&vs=2832430600262052_2952551441&_nc_vs=HBksFQIYUmlnX3hwdl9yZWVsc19wZXJtYW5lbnRfc3JfcHJvZC9FRTQyQkMwODU4M0YxQkUxNzg5QjQ4OTQ3OTE1QzM4NF92aWRlb19kYXNoaW5pdC5tcDQVAALIAQAVAhg6cGFzc3Rocm91Z2hfZXZlcnN0b3JlL0dEb0o0QnRHbDhlVHllNEJBR0FJWkk0WEczOGlicV9FQUFBRhUCAsgBACgAGAAbABUAACaEjvDwwuGEQBUCKAJDMywXQCsiTdLxqfwYEmRhc2hfYmFzZWxpbmVfMV92MREAdf4HAA%3D%3D&ccb=9-4&oh=00_AYA5Ed7mhnb-tDRlbpmt_-1mx8jWyLumG4hQvE6-S3hL-w&oe=6750A1D8&_nc_sid=8b3546",
                            "video_view_count": 3247694,
                            "edge_media_to_caption": {
                                "edges": [
                                    {
                                        "node": {
                                            "text": "those who know... 😉🫶\n\nVideo by @chl0beary \nMusic by @addisonraee"
                                        }
                                    }
                                ]
                            },
                            "edge_media_to_comment": {
                                "count": 4132
                            },
                            "comments_disabled": false,
                            "taken_at_timestamp": 1731952600,
                            "edge_liked_by": {
                                "count": 146528
                            },
                            "edge_media_preview_like": {
                                "count": 146528
                            },
                            "location": null,
                            "nft_asset_info": null,
                            "thumbnail_src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/467532948_18609103744001321_4066765072496668197_n.jpg?stp=c0.419.1080.1080a_dst-jpg_e35_s640x640_sh0.08_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=fMMVy_x6nfcQ7kNvgE47yZg&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAZc7yZbHELGKge0WkzVndrCaJh0I_OFWN9dkuXS0ajcQ&oe=6754B9CD&_nc_sid=8b3546",
                            "thumbnail_resources": [
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/467532948_18609103744001321_4066765072496668197_n.jpg?stp=c0.419.1080.1080a_dst-jpg_e15_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xMDgweDE5MTguc2RyLmY3NTc2MS5kZWZhdWx0X2NvdmVyX2ZyYW1lIn0&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=fMMVy_x6nfcQ7kNvgE47yZg&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAtZzwZRCUyjJMgKPl43A35eHA-yc44D9waHiqWO_z6Fg&oe=6754B9CD&_nc_sid=8b3546",
                                    "config_width": 150,
                                    "config_height": 150
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/467532948_18609103744001321_4066765072496668197_n.jpg?stp=c0.419.1080.1080a_dst-jpg_e15_s240x240_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xMDgweDE5MTguc2RyLmY3NTc2MS5kZWZhdWx0X2NvdmVyX2ZyYW1lIn0&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=fMMVy_x6nfcQ7kNvgE47yZg&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAFoG0GzDz7lr8YQ9svpUEjaTFCcFMDbFZ7XgBAebRfwA&oe=6754B9CD&_nc_sid=8b3546",
                                    "config_width": 240,
                                    "config_height": 240
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/467532948_18609103744001321_4066765072496668197_n.jpg?stp=c0.419.1080.1080a_dst-jpg_e15_s320x320_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xMDgweDE5MTguc2RyLmY3NTc2MS5kZWZhdWx0X2NvdmVyX2ZyYW1lIn0&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=fMMVy_x6nfcQ7kNvgE47yZg&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAy6HAtByO92QWCczYCnilcgGvCC0eQL-SCPG3HFA4_JA&oe=6754B9CD&_nc_sid=8b3546",
                                    "config_width": 320,
                                    "config_height": 320
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/467532948_18609103744001321_4066765072496668197_n.jpg?stp=c0.419.1080.1080a_dst-jpg_e15_s480x480_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xMDgweDE5MTguc2RyLmY3NTc2MS5kZWZhdWx0X2NvdmVyX2ZyYW1lIn0&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=fMMVy_x6nfcQ7kNvgE47yZg&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYD--CFvlO7DxQvEDT7m09pxXi2ttnmoUYucGgI2eV7paw&oe=6754B9CD&_nc_sid=8b3546",
                                    "config_width": 480,
                                    "config_height": 480
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/467532948_18609103744001321_4066765072496668197_n.jpg?stp=c0.419.1080.1080a_dst-jpg_e35_s640x640_sh0.08_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xMDgweDE5MTguc2RyLmY3NTc2MS5kZWZhdWx0X2NvdmVyX2ZyYW1lIn0&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=fMMVy_x6nfcQ7kNvgE47yZg&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAZc7yZbHELGKge0WkzVndrCaJh0I_OFWN9dkuXS0ajcQ&oe=6754B9CD&_nc_sid=8b3546",
                                    "config_width": 640,
                                    "config_height": 640
                                }
                            ],
                            "felix_profile_grid_crop": null,
                            "coauthor_producers": [],
                            "pinned_for_users": [],
                            "viewer_can_reshare": true,
                            "like_and_view_counts_disabled": false,
                            "product_type": "clips",
                            "clips_music_attribution_info": {
                                "artist_name": "Addison Rae",
                                "song_name": "Diet Pepsi",
                                "uses_original_audio": false,
                                "should_mute_audio": false,
                                "should_mute_audio_reason": "",
                                "audio_id": "1171911860682370"
                            }
                        }
                    },
                    {
                        "node": {
                            "__typename": "GraphSidecar",
                            "id": "3502071613535959484",
                            "shortcode": "DCZ25Pmyjm8",
                            "dimensions": {
                                "height": 1350,
                                "width": 1080
                            },
                            "display_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.29350-15/467008628_1322837145764687_2209409424211688680_n.jpg?stp=dst-jpg_e35_p1080x1080_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=59tzP4vNyycQ7kNvgHDCYKA&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYCsi_riIkysGkJ4Z0vWFWZZQkPOOI78s_RcjzK18ZkTBA&oe=6754B068&_nc_sid=8b3546",
                            "edge_media_to_tagged_user": {
                                "edges": [
                                    {
                                        "node": {
                                            "user": {
                                                "full_name": "TR1 ⛈",
                                                "followed_by_viewer": false,
                                                "id": "4357961863",
                                                "is_verified": true,
                                                "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/443836249_472257882133285_6110715878806547766_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=HRRE1q0jfSoQ7kNvgEOjHsX&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDjLD4kGOXiJFcW68p1RUhvfAZhXeySU2mtCwR113Bayg&oe=6754BBCC&_nc_sid=8b3546",
                                                "username": "trueno"
                                            },
                                            "x": 0.4961832061,
                                            "y": 0.8583545377
                                        }
                                    }
                                ]
                            },
                            "fact_check_overall_rating": null,
                            "fact_check_information": null,
                            "gating_info": null,
                            "sharing_friction_info": {
                                "should_have_sharing_friction": false,
                                "bloks_app_url": null
                            },
                            "media_overlay_info": null,
                            "media_preview": null,
                            "owner": {
                                "id": "25025320",
                                "username": "instagram"
                            },
                            "is_video": false,
                            "has_upcoming_event": false,
                            "accessibility_caption": "A person wearing a black shirt and baseball hat.",
                            "edge_media_to_caption": {
                                "edges": [
                                    {
                                        "node": {
                                            "text": "In today’s edition of #10Things, we’re with Argentine artist @trueno (Trueno), who not only performed at last night’s @latingrammys (Latin Grammy Awards) in Miami, but also took home his first-ever Latin Grammy after his song “Tranky Funky” won for best urban fusion/performance.\n \n“I think Latin music is at an all-time high. Every country has artists that represent its native culture and native genre,” says Trueno. “I belong to the hip-hop culture and movement. Argentinian hip-hop always has that Argentinian feel and the flavors of South America in the music.”\n \nBefore Thursday’s big show, Trueno spent time in Miami cooking, playing soccer and preparing for his stellar performance, where he entertained fans and Latin music artists from all over the world. When it comes to collaborating with other artists, Trueno says it all comes down to the DMs. “I think the majority of the international collaborations that I’ve done in my career I was able to make happen thanks to Instagram. I remember huge artists, like J Balvin, for example, DMing me on Instagram, “Hey, I like your music.” And from there we struck up a friendship and connection.” 🎵🔥"
                                        }
                                    }
                                ]
                            },
                            "edge_media_to_comment": {
                                "count": 5096
                            },
                            "comments_disabled": false,
                            "taken_at_timestamp": 1731699490,
                            "edge_liked_by": {
                                "count": 620079
                            },
                            "edge_media_preview_like": {
                                "count": 620079
                            },
                            "location": {
                                "id": "332387124104554",
                                "has_public_page": true,
                                "name": "Miami, Florida",
                                "slug": "miami-florida"
                            },
                            "nft_asset_info": null,
                            "thumbnail_src": "https://scontent-atl3-1.cdninstagram.com/v/t51.29350-15/467008628_1322837145764687_2209409424211688680_n.jpg?stp=c0.180.1440.1440a_dst-jpg_e35_s640x640_sh0.08_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=59tzP4vNyycQ7kNvgHDCYKA&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYC07TWBY1y2kCSiEDHyHMvnkfDokd5r1E3BfXZAFTzapw&oe=6754B068&_nc_sid=8b3546",
                            "thumbnail_resources": [
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.29350-15/467008628_1322837145764687_2209409424211688680_n.jpg?stp=c0.180.1440.1440a_dst-jpg_e35_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xNDQweDE4MDAuc2RyLmYyOTM1MC5kZWZhdWx0X2ltYWdlIn0&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=59tzP4vNyycQ7kNvgHDCYKA&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYA6dTj6cRKAlcgac-3O1PbMB8X7_ECINdWoKgvavpTp8Q&oe=6754B068&_nc_sid=8b3546",
                                    "config_width": 150,
                                    "config_height": 150
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.29350-15/467008628_1322837145764687_2209409424211688680_n.jpg?stp=c0.180.1440.1440a_dst-jpg_e35_s240x240_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xNDQweDE4MDAuc2RyLmYyOTM1MC5kZWZhdWx0X2ltYWdlIn0&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=59tzP4vNyycQ7kNvgHDCYKA&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBuUWFNKVtYyy6pmym2u01MWBscWKI6z_hfPv9JXHLlBQ&oe=6754B068&_nc_sid=8b3546",
                                    "config_width": 240,
                                    "config_height": 240
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.29350-15/467008628_1322837145764687_2209409424211688680_n.jpg?stp=c0.180.1440.1440a_dst-jpg_e35_s320x320_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xNDQweDE4MDAuc2RyLmYyOTM1MC5kZWZhdWx0X2ltYWdlIn0&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=59tzP4vNyycQ7kNvgHDCYKA&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBnhDoT2ZLms6M6imR5OYRN93WHUzMNOzA8Xl63UHjqsg&oe=6754B068&_nc_sid=8b3546",
                                    "config_width": 320,
                                    "config_height": 320
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.29350-15/467008628_1322837145764687_2209409424211688680_n.jpg?stp=c0.180.1440.1440a_dst-jpg_e35_s480x480_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xNDQweDE4MDAuc2RyLmYyOTM1MC5kZWZhdWx0X2ltYWdlIn0&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=59tzP4vNyycQ7kNvgHDCYKA&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYC6Qd9KLD_HDsaVGqWHMFTZwe-XNhjxkXdPKVmNXJ_vCg&oe=6754B068&_nc_sid=8b3546",
                                    "config_width": 480,
                                    "config_height": 480
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.29350-15/467008628_1322837145764687_2209409424211688680_n.jpg?stp=c0.180.1440.1440a_dst-jpg_e35_s640x640_sh0.08_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xNDQweDE4MDAuc2RyLmYyOTM1MC5kZWZhdWx0X2ltYWdlIn0&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=59tzP4vNyycQ7kNvgHDCYKA&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYC07TWBY1y2kCSiEDHyHMvnkfDokd5r1E3BfXZAFTzapw&oe=6754B068&_nc_sid=8b3546",
                                    "config_width": 640,
                                    "config_height": 640
                                }
                            ],
                            "coauthor_producers": [
                                {
                                    "id": "4357961863",
                                    "is_verified": true,
                                    "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/443836249_472257882133285_6110715878806547766_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=HRRE1q0jfSoQ7kNvgEOjHsX&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDjLD4kGOXiJFcW68p1RUhvfAZhXeySU2mtCwR113Bayg&oe=6754BBCC&_nc_sid=8b3546",
                                    "username": "trueno"
                                }
                            ],
                            "pinned_for_users": [],
                            "viewer_can_reshare": true,
                            "like_and_view_counts_disabled": false,
                            "edge_sidecar_to_children": {
                                "edges": [
                                    {
                                        "node": {
                                            "__typename": "GraphImage",
                                            "id": "3502071601355697739",
                                            "shortcode": "DCZ25EQyi5L",
                                            "dimensions": {
                                                "height": 1350,
                                                "width": 1080
                                            },
                                            "display_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.29350-15/467008628_1322837145764687_2209409424211688680_n.jpg?stp=dst-jpg_e35_p1080x1080_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=59tzP4vNyycQ7kNvgHDCYKA&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYCsi_riIkysGkJ4Z0vWFWZZQkPOOI78s_RcjzK18ZkTBA&oe=6754B068&_nc_sid=8b3546",
                                            "edge_media_to_tagged_user": {
                                                "edges": [
                                                    {
                                                        "node": {
                                                            "user": {
                                                                "full_name": "TR1 ⛈",
                                                                "followed_by_viewer": false,
                                                                "id": "4357961863",
                                                                "is_verified": true,
                                                                "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/443836249_472257882133285_6110715878806547766_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=HRRE1q0jfSoQ7kNvgEOjHsX&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDjLD4kGOXiJFcW68p1RUhvfAZhXeySU2mtCwR113Bayg&oe=6754BBCC&_nc_sid=8b3546",
                                                                "username": "trueno"
                                                            },
                                                            "x": 0.4961832061,
                                                            "y": 0.8583545377
                                                        }
                                                    }
                                                ]
                                            },
                                            "fact_check_overall_rating": null,
                                            "fact_check_information": null,
                                            "gating_info": null,
                                            "sharing_friction_info": {
                                                "should_have_sharing_friction": false,
                                                "bloks_app_url": null
                                            },
                                            "media_overlay_info": null,
                                            "media_preview": "ACIq58U2lp8Sb2C+pxQBFThjv1qxdQ+Ww6c+lVqW42raC4optFMQ/HapI1Aw3cc1N5sHdD+Bp02zarIMAg/Xg9/WgYy4czNubAOO1VBVyKMOGdiQqj9T2qXy7Q/xMP8AP0peSDzZnc0VoeTbH+M/5/CimIoGrcQQpsc4wcg/XqKrCnmgew+WQbdiZ2DnnqT6mocU/t/n2ptAtxMUUtFAH//Z",
                                            "owner": {
                                                "id": "25025320",
                                                "username": "instagram"
                                            },
                                            "is_video": false,
                                            "has_upcoming_event": false,
                                            "accessibility_caption": "A person wearing a black shirt and baseball hat."
                                        }
                                    },
                                    {
                                        "node": {
                                            "__typename": "GraphVideo",
                                            "id": "3502068812495737628",
                                            "shortcode": "DCZ2Qe7yFMc",
                                            "dimensions": {
                                                "height": 937,
                                                "width": 750
                                            },
                                            "display_url": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-15/466688950_18608510926001321_6434372692886204349_n.jpg?stp=dst-jpg_e15_tt6&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=105&_nc_ohc=i9aayu-vLlsQ7kNvgE3sJy1&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYCxj2rkXtxgSrdFOmiEgUM6mqJBSeipF6A1ZVCA2H_Aew&oe=6754AA28&_nc_sid=8b3546",
                                            "edge_media_to_tagged_user": {
                                                "edges": [
                                                    {
                                                        "node": {
                                                            "user": {
                                                                "full_name": "TR1 ⛈",
                                                                "followed_by_viewer": false,
                                                                "id": "4357961863",
                                                                "is_verified": true,
                                                                "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/443836249_472257882133285_6110715878806547766_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=HRRE1q0jfSoQ7kNvgEOjHsX&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDjLD4kGOXiJFcW68p1RUhvfAZhXeySU2mtCwR113Bayg&oe=6754BBCC&_nc_sid=8b3546",
                                                                "username": "trueno"
                                                            },
                                                            "x": 0,
                                                            "y": 0
                                                        }
                                                    }
                                                ]
                                            },
                                            "fact_check_overall_rating": null,
                                            "fact_check_information": null,
                                            "gating_info": null,
                                            "sharing_friction_info": {
                                                "should_have_sharing_friction": false,
                                                "bloks_app_url": null
                                            },
                                            "media_overlay_info": null,
                                            "media_preview": "ACIqzcVJGm9gvr39KjyatWrgOAc4P8+2a1k9HbczS1VyCZDGcGrlhdHcIT3+77e30qbUAu1Rjk55/pVOzTbMp9/6VC95XZb912Rv7TRT80VAzjBITxU6kHkdqlhtCwy6lc8A4xSyWDRRl+XYnOFHAHcnPPSjmvoNR6jnld8byTjpmltdxmUgEqOp9OvWrNpAtxECwA6jIznOe+cj3pkCGCQKTnI5xQn0BrqbO6iq2+igRUm1QdEHHqf8Kz7i/LrsHQjnHBP6VXm6/hVRutJaj2LcVyYgQmRu69M/gccVdtACN/ORx1z/AJzWQK1NP6H/AHh/I0xGmN1FOooGf//Z",
                                            "owner": {
                                                "id": "25025320",
                                                "username": "instagram"
                                            },
                                            "is_video": true,
                                            "has_upcoming_event": false,
                                            "accessibility_caption": null,
                                            "dash_info": {
                                                "is_dash_eligible": true,
                                                "video_dash_manifest": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<MPD xmlns=\"urn:mpeg:dash:schema:mpd:2011\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"urn:mpeg:dash:schema:mpd:2011 DASH-MPD.xsd\" profiles=\"urn:mpeg:dash:profile:isoff-on-demand:2011\" minBufferTime=\"PT2S\" type=\"static\" mediaPresentationDuration=\"PT48.925964S\" FBManifestIdentifier=\"FgAYEnIyZXZldnA5LXIxZ2VuMnZwORlmvpzd7czr8gGU6NWPyen5AbqKrfia7KQDkObs+NXRqgO238ermsjtBJaV4KzcwKMGIhgYZGFzaF9sbl9oZWFhY192YnIzX2F1ZGlvAA==\"><Period id=\"0\" duration=\"PT48.925964S\"><AdaptationSet id=\"0\" contentType=\"video\" frameRate=\"15344/640\" subsegmentAlignment=\"true\" par=\"4:5\" FBUnifiedUploadResolutionMos=\"360:76.5\"><Representation id=\"534012189452063vd\" bandwidth=\"93368\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q50\" FBContentLength=\"571016\" FBPlaybackResolutionMos=\"0:100,360:52.6,480:51.2,720:50.5,1080:52\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:82.7,480:78,720:70,1080:62\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBDefaultQuality=\"1\" FBQualityClass=\"hd\" FBQualityLabel=\"480p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQMcNKWkl99l3t_h_kEqXtQQZLWzUU9ahwkyn3IcirtyoxBurC3ApJegw55XmoncF8RZJEdmx6iam_c-W7Kf8GLo.mp4?strext=1&amp;_nc_cat=102&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=_WiygFB6sKQQ7kNvgH3MaDc&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTUwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYB2S07sWBgeLFMRNZwNx_vO7QGClJQ8bL1i_h2HiZ3Qbw&amp;oe=6754B8B7</BaseURL><SegmentBase indexRange=\"818-969\" timescale=\"15344\" FBMinimumPrefetchRange=\"970-10801\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"970-21743\" FBFirstSegmentRange=\"970-61837\" FBFirstSegmentDuration=\"5005\" FBSecondSegmentRange=\"61838-114494\" FBPrefetchSegmentRange=\"970-61837\" FBPrefetchSegmentDuration=\"5005\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"549370491222538v\" bandwidth=\"203798\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q60\" FBContentLength=\"1246382\" FBPlaybackResolutionMos=\"0:100,360:64.3,480:63.2,720:62.2,1080:62.5\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:93,480:90.6,720:85.7,1080:79.4\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"540p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQNIC9cv3Fla2F7mXcUHLN7YA8J9lUfTBH7p48aWwXaPQlOktsIJE8bvZC8o8NQjHLVj9LLozG0NQzuac7hOuZIM.mp4?strext=1&amp;_nc_cat=102&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=Apmh8SiXwHUQ7kNvgES-Yfg&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTYwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYB7uv77Y1amcqC7fFbTVx5yW4-5Z3lWKv2enThjr1ez7g&amp;oe=6754B777</BaseURL><SegmentBase indexRange=\"818-969\" timescale=\"15344\" FBMinimumPrefetchRange=\"970-17666\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"970-40536\" FBFirstSegmentRange=\"970-131774\" FBFirstSegmentDuration=\"5005\" FBSecondSegmentRange=\"131775-249569\" FBPrefetchSegmentRange=\"970-131774\" FBPrefetchSegmentDuration=\"5005\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"1366833927616475v\" bandwidth=\"330971\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q70\" FBContentLength=\"2024137\" FBPlaybackResolutionMos=\"0:100,360:68.8,480:68.2,720:67.4,1080:67.3\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:96.2,480:94.8,720:91.3,1080:86.3\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"640p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQOScHMdxNcpGRr1-w1-eU2l0JB4ufs3E6QC4jkIJU8_skt6ZBNiXFWnqdhjyPBb1jb7_wFNJeQDBnM76UMp2WXk.mp4?strext=1&amp;_nc_cat=111&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=NGhRBBUBf3MQ7kNvgE-tZ_q&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTcwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYCEoqTbIgYO7x6BPvnBvOvFcc9_ujVep4ABeT25Fa4-ug&amp;oe=6754A1E0</BaseURL><SegmentBase indexRange=\"818-969\" timescale=\"15344\" FBMinimumPrefetchRange=\"970-23219\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"970-59014\" FBFirstSegmentRange=\"970-213732\" FBFirstSegmentDuration=\"5005\" FBSecondSegmentRange=\"213733-411667\" FBPrefetchSegmentRange=\"970-213732\" FBPrefetchSegmentDuration=\"5005\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"1766927580792139v\" bandwidth=\"476838\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q80\" FBContentLength=\"2916222\" FBPlaybackResolutionMos=\"0:100,360:70.8,480:70.4,720:70,1080:69.8\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:97.7,480:96.9,720:94.4,1080:90.3\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"720p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQM7axZUl-XE8zCpckRleFesVK0e1smmKiWO2HZYXYoi_1sfs651f92LsPeLWUMRkMBIsuSTAoHPEY-yvt3Tc2JZ.mp4?strext=1&amp;_nc_cat=106&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=p9g6CS0tPmAQ7kNvgGaZhQW&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTgwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYCd9cD4IG5FP7s6Js6jIPlO2NGv4CXMtDxVhCy_YeMeDQ&amp;oe=675494DB</BaseURL><SegmentBase indexRange=\"818-969\" timescale=\"15344\" FBMinimumPrefetchRange=\"970-27413\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"970-88310\" FBFirstSegmentRange=\"970-307932\" FBFirstSegmentDuration=\"5005\" FBSecondSegmentRange=\"307933-594010\" FBPrefetchSegmentRange=\"970-307932\" FBPrefetchSegmentDuration=\"5005\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"925448809063069v\" bandwidth=\"691725\" codecs=\"vp09.00.40.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q90\" FBContentLength=\"4230416\" FBPlaybackResolutionMos=\"0:100,360:72.1,480:72,720:72,1080:72.5\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:98,480:97.3,720:95.7,1080:93.2\" FBAbrPolicyTags=\"avoid_on_cellular,avoid_on_cellular_intentional\" width=\"1080\" height=\"1350\" FBQualityClass=\"hd\" FBQualityLabel=\"1080p\"><BaseURL>https://scontent-atl3-3.cdninstagram.com/o1/v/t16/f2/m69/AQNqYESwwqDPW_f0zNLMpjAMkFhGvxbVzKp78CHhMGUeu7Fn0ow4uOvFbyEkm16ABk6ICnI0yLejupyp-2cj3gfz.mp4?strext=1&amp;_nc_cat=109&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-3.cdninstagram.com&amp;_nc_ohc=1MDBvDYAXgUQ7kNvgHMp8DU&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTkwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYDlbqMacETP95os6ybNvzdbHbp7dA4kzeCejGf0e1m3Qw&amp;oe=67549A56</BaseURL><SegmentBase indexRange=\"818-969\" timescale=\"15344\" FBMinimumPrefetchRange=\"970-37644\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"970-122372\" FBFirstSegmentRange=\"970-449550\" FBFirstSegmentDuration=\"5005\" FBSecondSegmentRange=\"449551-868014\" FBPrefetchSegmentRange=\"970-449550\" FBPrefetchSegmentDuration=\"5005\"><Initialization range=\"0-817\"/></SegmentBase></Representation></AdaptationSet><AdaptationSet id=\"1\" contentType=\"audio\" subsegmentStartsWithSAP=\"1\" subsegmentAlignment=\"true\"><Representation id=\"938187011496328ad\" bandwidth=\"93870\" codecs=\"mp4a.40.5\" mimeType=\"audio/mp4\" FBAvgBitrate=\"93870\" audioSamplingRate=\"44100\" FBEncodingTag=\"dash_ln_heaac_vbr3_audio\" FBContentLength=\"574930\" FBAbrPolicyTags=\"\" FBDefaultQuality=\"1\"><AudioChannelConfiguration schemeIdUri=\"urn:mpeg:dash:23003:3:audio_channel_configuration:2011\" value=\"2\"/><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQMo75twfyESg5otOp1qIuBShHAT-3zoY1hvlFY84mrYIYl9RQRkHy7IOZdt3PJJqjU9rViSqE5jGlabZYARTXMR.mp4?strext=1&amp;_nc_cat=101&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=XzcakT_XarsQ7kNvgFS_fI3&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9sbl9oZWFhY192YnIzX2F1ZGlvIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYBngDqrERhwwh9XJ48iycd8iP9DMsiY7-8kOUHGXt2WZA&amp;oe=6754B1B2</BaseURL><SegmentBase indexRange=\"824-1155\" timescale=\"44100\" FBMinimumPrefetchRange=\"1156-1499\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"1156-14086\" FBFirstSegmentRange=\"1156-27178\" FBFirstSegmentDuration=\"2021\" FBSecondSegmentRange=\"27179-50457\" FBPrefetchSegmentRange=\"1156-50457\" FBPrefetchSegmentDuration=\"4017\"><Initialization range=\"0-823\"/></SegmentBase></Representation></AdaptationSet></Period></MPD>\n",
                                                "number_of_qualities": 5
                                            },
                                            "has_audio": false,
                                            "tracking_token": "eyJ2ZXJzaW9uIjo1LCJwYXlsb2FkIjp7ImlzX2FuYWx5dGljc190cmFja2VkIjp0cnVlLCJ1dWlkIjoiYmM1MmYwZDVhMzU1NDI1Y2ExODI0ZWFjOGNmZTRlNzUzNTAyMDY4ODEyNDk1NzM3NjI4In0sInNpZ25hdHVyZSI6IiJ9",
                                            "video_url": "https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQOBQaPIW6CCfmERQfSg5V63ulomIvVFWmHtl6lv9h3lDC0u8kNBoiEimvY5YqbLqEuLUz4YnJWZYTuUNaG1JCSf.mp4?stp=dst-mp4&efg=eyJxZV9ncm91cHMiOiJbXCJpZ193ZWJfZGVsaXZlcnlfdnRzX290ZlwiXSIsInZlbmNvZGVfdGFnIjoidnRzX3ZvZF91cmxnZW4uY2Fyb3VzZWxfaXRlbS5jMi4xMDgwLmJhc2VsaW5lIn0&_nc_cat=110&vs=8595770473833518_366027092&_nc_vs=HBksFQIYOnBhc3N0aHJvdWdoX2V2ZXJzdG9yZS9HTE5JX0FJQ3FZdWItdkVEQU5NRkR2Uld4dzR1YnBSMUFBQUYVAALIAQAVAhg6cGFzc3Rocm91Z2hfZXZlcnN0b3JlL0dFLW4xQnU3bnVxWVdsQUdBRzJiTnpzQ09uNWdia1lMQUFBRhUCAsgBACgAGAAbABUAACbq%2FKe2z6%2FPPxUCKAJDMywXQEh2ZmZmZmYYFmRhc2hfYmFzZWxpbmVfMTA4MHBfdjERAHXuBwA%3D&ccb=9-4&oh=00_AYCmNi9enV4PMhqNgVYxF6sPc806ZxJywA9OgwIkSzzBdg&oe=6750CA25&_nc_sid=8b3546",
                                            "video_view_count": 1638281
                                        }
                                    },
                                    {
                                        "node": {
                                            "__typename": "GraphVideo",
                                            "id": "3502068812353180361",
                                            "shortcode": "DCZ2QezSRLJ",
                                            "dimensions": {
                                                "height": 937,
                                                "width": 750
                                            },
                                            "display_url": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-15/467362996_18608511001001321_1651678949293232140_n.jpg?stp=dst-jpg_e15_tt6&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=105&_nc_ohc=bPUWKrkSapIQ7kNvgFJ0OC0&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAerBkeERw9my05YeKxlPzcDwsFfyND69sZyoio6Aw1_Q&oe=6754A057&_nc_sid=8b3546",
                                            "edge_media_to_tagged_user": {
                                                "edges": [
                                                    {
                                                        "node": {
                                                            "user": {
                                                                "full_name": "TR1 ⛈",
                                                                "followed_by_viewer": false,
                                                                "id": "4357961863",
                                                                "is_verified": true,
                                                                "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/443836249_472257882133285_6110715878806547766_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=HRRE1q0jfSoQ7kNvgEOjHsX&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDjLD4kGOXiJFcW68p1RUhvfAZhXeySU2mtCwR113Bayg&oe=6754BBCC&_nc_sid=8b3546",
                                                                "username": "trueno"
                                                            },
                                                            "x": 0,
                                                            "y": 0
                                                        }
                                                    }
                                                ]
                                            },
                                            "fact_check_overall_rating": null,
                                            "fact_check_information": null,
                                            "gating_info": null,
                                            "sharing_friction_info": {
                                                "should_have_sharing_friction": false,
                                                "bloks_app_url": null
                                            },
                                            "media_overlay_info": null,
                                            "media_preview": "ACIqz4JAh6Z+vIH+NdZDco8YcsOB83bBrHFs8Q8qRFI52sO/1OM59OR+NVLqFkUKPx56dwPoPXuTU9RHTxTxzfcYNjripq42CKWGRWGOCD1OMe/Tj1rqreXzFBbG7HOKodmT0UYooAy55mc4xjn67R0z9ee1Q3E8EKLHyznkNjHI9fr0qo04xneoJ7ck/wAsf/rrIuJmkb5v4QBxUoq66GyLpIiHk+ZQc4HXP446da0WkjYCSLg4zgDGR6+mf59K46r9tPIqcEbV459+aNhX6s6YXL+1Fc/9qPoPzopXHdFc5GDnGO4H/wBb9apvgMcHI9amzxVc00QJU6AbeRUFS5+Ufj/Omxhu+tFR0UgP/9k=",
                                            "owner": {
                                                "id": "25025320",
                                                "username": "instagram"
                                            },
                                            "is_video": true,
                                            "has_upcoming_event": false,
                                            "accessibility_caption": null,
                                            "dash_info": {
                                                "is_dash_eligible": true,
                                                "video_dash_manifest": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<MPD xmlns=\"urn:mpeg:dash:schema:mpd:2011\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"urn:mpeg:dash:schema:mpd:2011 DASH-MPD.xsd\" profiles=\"urn:mpeg:dash:profile:isoff-on-demand:2011\" minBufferTime=\"PT2S\" type=\"static\" mediaPresentationDuration=\"PT14.848182S\" FBManifestIdentifier=\"FgAYEnIyZXZldnA5LXIxZ2VuMnZwORmGgvj85Mq9zgH00rr8vqT5Aeza6PXE//sB2qadkKzTpwPIkIDZ8IGsBIqkisDUjtUEup3YrMX+mAbwttbEm4PNCSIYGGRhc2hfbG5faGVhYWNfdmJyM19hdWRpbwA=\"><Period id=\"0\" duration=\"PT14.848182S\"><AdaptationSet id=\"0\" contentType=\"video\" frameRate=\"11988/500\" subsegmentAlignment=\"true\" par=\"4:5\" FBUnifiedUploadResolutionMos=\"360:70.5\"><Representation id=\"1313068743215365vd\" bandwidth=\"77694\" codecs=\"vp09.00.21.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q30\" FBContentLength=\"144203\" FBPlaybackResolutionMos=\"0:100,360:24.6,480:25.7,720:28.7,1080:33.6\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:60.6,480:52.6,720:42.5,1080:33.9\" FBAbrPolicyTags=\"\" width=\"360\" height=\"450\" FBDefaultQuality=\"1\" FBQualityClass=\"sd\" FBQualityLabel=\"270p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQMu4uEuUwLaLQ8kZ7fD0RP57bl6-_FWNyinGGJEWRlsfSYviLQvZc925MOOrGTdjqbfKwHtbxKqqvcQfbLMs7Qk.mp4?strext=1&amp;_nc_cat=101&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=07_XrpWY3acQ7kNvgEYAo7K&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTMwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYDbQhZyF7Rh4EZc-JMQVwdCAF2K7m3HKnMiL2L6sE0HVQ&amp;oe=67549236</BaseURL><SegmentBase indexRange=\"818-885\" timescale=\"11988\" FBMinimumPrefetchRange=\"886-5261\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"886-15867\" FBFirstSegmentRange=\"886-42677\" FBFirstSegmentDuration=\"5005\" FBSecondSegmentRange=\"42678-93344\" FBPrefetchSegmentRange=\"886-42677\" FBPrefetchSegmentDuration=\"5005\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"2702654816570808v\" bandwidth=\"141884\" codecs=\"vp09.00.30.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q40\" FBContentLength=\"263340\" FBPlaybackResolutionMos=\"0:100,360:32.5,480:33.1,720:35.1,1080:40\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:75.7,480:67.7,720:57.3,1080:47.1\" FBAbrPolicyTags=\"\" width=\"538\" height=\"674\" FBQualityClass=\"sd\" FBQualityLabel=\"360p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQPjUJNCoQ3bU-hcwWIiK7o-gU3I9VKYhdCmyAnv53SfKHMBGWHmURQaTYkkUvyoKRg9csQIixhtkXB-29w-kuEu.mp4?strext=1&amp;_nc_cat=105&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=PQJbcksYYHcQ7kNvgG8YtLA&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTQwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYALytn-r3Q2o9PO0eC1iBa7AHQo3xq8CiHudP-l2lxKlw&amp;oe=6754953A</BaseURL><SegmentBase indexRange=\"818-885\" timescale=\"11988\" FBMinimumPrefetchRange=\"886-7370\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"886-26778\" FBFirstSegmentRange=\"886-77156\" FBFirstSegmentDuration=\"5005\" FBSecondSegmentRange=\"77157-172469\" FBPrefetchSegmentRange=\"886-77156\" FBPrefetchSegmentDuration=\"5005\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"548183717926074v\" bandwidth=\"222522\" codecs=\"vp09.00.30.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q50\" FBContentLength=\"413007\" FBPlaybackResolutionMos=\"0:100,360:38.4,480:39.3,720:41.7,1080:46\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:85,480:78.6,720:68.2,1080:58.3\" FBAbrPolicyTags=\"\" width=\"538\" height=\"674\" FBQualityClass=\"sd\" FBQualityLabel=\"480p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQOlQjLsCCiJUEcU0jD9I0NGwMRQyqviTL36AGpKR3IeXxjGwzwyKut8p8cjnQZb_dXVEK4stGLzYwEfZC6CjiR6.mp4?strext=1&amp;_nc_cat=111&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=96nSzwxhDb4Q7kNvgEF1Wwg&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTUwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYCp3TI7j_32jyZ-4o2CnbCG01Z7kfKYqCi5XFVdL5bZxw&amp;oe=6754B048</BaseURL><SegmentBase indexRange=\"818-885\" timescale=\"11988\" FBMinimumPrefetchRange=\"886-9527\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"886-40117\" FBFirstSegmentRange=\"886-119995\" FBFirstSegmentDuration=\"5005\" FBSecondSegmentRange=\"119996-270270\" FBPrefetchSegmentRange=\"886-119995\" FBPrefetchSegmentDuration=\"5005\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"554145930876598v\" bandwidth=\"344501\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q60\" FBContentLength=\"639403\" FBPlaybackResolutionMos=\"0:100,360:43,480:44,720:46.4,1080:50.6\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:91.4,480:86.3,720:77.6,1080:68.1\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"540p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQO9EpNvV0syThCNKy5RJOfClYVZ_bi6sDayplSotUu0pj7yuaQSPflTfCLQrrHkSn63Sbu555RhSLiP6YzpoAsF.mp4?strext=1&amp;_nc_cat=100&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=frFKafPP0hkQ7kNvgG3X1XZ&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTYwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYB9g1Qbi41Rc3AE9Tf-ODFb2jZ4wbzJB9um2zFzwYK61w&amp;oe=6754C095</BaseURL><SegmentBase indexRange=\"818-885\" timescale=\"11988\" FBMinimumPrefetchRange=\"886-12393\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"886-58821\" FBFirstSegmentRange=\"886-181401\" FBFirstSegmentDuration=\"5005\" FBSecondSegmentRange=\"181402-411726\" FBPrefetchSegmentRange=\"886-181401\" FBPrefetchSegmentDuration=\"5005\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"454056800656897v\" bandwidth=\"552980\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q70\" FBContentLength=\"1026344\" FBPlaybackResolutionMos=\"0:100,360:47.2,480:48.8,720:51.5,1080:54.9\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:96.5,480:93.5,720:86.6,1080:78.3\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"640p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQNpe_DQzLDWlzf55KYUjKyHeAoqZu9qIFyoI3KCX5VDmv3-M-ByocvC09jyLeBG_kVXN6CaGv8ZDE3cbxKaskub.mp4?strext=1&amp;_nc_cat=101&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=kWeUV60zcdYQ7kNvgEOFkVu&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTcwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYAskw9aMjLnkesnEifjxlfB5L5k_DMDaQ02reWKjvT0Aw&amp;oe=6754A616</BaseURL><SegmentBase indexRange=\"818-885\" timescale=\"11988\" FBMinimumPrefetchRange=\"886-15886\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"886-90743\" FBFirstSegmentRange=\"886-284345\" FBFirstSegmentDuration=\"5005\" FBSecondSegmentRange=\"284346-658572\" FBPrefetchSegmentRange=\"886-284345\" FBPrefetchSegmentDuration=\"5005\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"1222689235665956v\" bandwidth=\"869426\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q80\" FBContentLength=\"1613675\" FBPlaybackResolutionMos=\"0:100,360:50.9,480:52.7,720:55.3,1080:58.4\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:98.41,480:97.1,720:93,1080:86.7\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"720p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQMVc1AfmleCcGvh3K5KjyQGhCggVPX3YFCtA3ZPdZMQkA7K1VBINqH0igMHN3ZmvQ3Woz7_8c8uv7axXyFw2tdV.mp4?strext=1&amp;_nc_cat=105&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=JbcB0oazDGIQ7kNvgHXaImz&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTgwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYDNxg2XRkmCCno7sKyGb4VE-NABZjq7f_Ds5yHoSS-44w&amp;oe=675496DE</BaseURL><SegmentBase indexRange=\"818-885\" timescale=\"11988\" FBMinimumPrefetchRange=\"886-20500\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"886-137877\" FBFirstSegmentRange=\"886-438786\" FBFirstSegmentDuration=\"5005\" FBSecondSegmentRange=\"438787-1037372\" FBPrefetchSegmentRange=\"886-438786\" FBPrefetchSegmentDuration=\"5005\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"1743800389797725v\" bandwidth=\"1372331\" codecs=\"vp09.00.40.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q90\" FBContentLength=\"2547079\" FBPlaybackResolutionMos=\"0:100,360:53.3,480:55.4,720:58.1,1080:61.6\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:99.251,480:98.44,720:96.4,1080:92.1\" FBAbrPolicyTags=\"\" width=\"1080\" height=\"1350\" FBQualityClass=\"hd\" FBQualityLabel=\"1080p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQPtRvr26Z9unOUqOzHj7d5tRv3Wjk4THxR-wVsBkkPaAou5U25_p63_E_ukZQQM1-4cNsIigl0vVX9xRws785co.mp4?strext=1&amp;_nc_cat=100&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=0fjU9-zBF3cQ7kNvgHqcGGD&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTkwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYCX6pPBeB0cCKIZ_Y6ohxYp_JXgf_-v51LpklX9TtICSA&amp;oe=6754C205</BaseURL><SegmentBase indexRange=\"818-885\" timescale=\"11988\" FBMinimumPrefetchRange=\"886-26934\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"886-207974\" FBFirstSegmentRange=\"886-684906\" FBFirstSegmentDuration=\"5005\" FBSecondSegmentRange=\"684907-1634060\" FBPrefetchSegmentRange=\"886-684906\" FBPrefetchSegmentDuration=\"5005\"><Initialization range=\"0-817\"/></SegmentBase></Representation></AdaptationSet><AdaptationSet id=\"1\" contentType=\"audio\" subsegmentStartsWithSAP=\"1\" subsegmentAlignment=\"true\"><Representation id=\"931618688838061ad\" bandwidth=\"92509\" codecs=\"mp4a.40.5\" mimeType=\"audio/mp4\" FBAvgBitrate=\"92509\" audioSamplingRate=\"44100\" FBEncodingTag=\"dash_ln_heaac_vbr3_audio\" FBContentLength=\"172242\" FBAbrPolicyTags=\"\" FBDefaultQuality=\"1\"><AudioChannelConfiguration schemeIdUri=\"urn:mpeg:dash:23003:3:audio_channel_configuration:2011\" value=\"2\"/><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQOgPO9D6HGnig3VMdFDd5AKbVcK18j7dXc8QRWSsXDjv5BiJGKB7nppkHOmfu3aZ-jNE44GZRMO3YtZWVGUSROt.mp4?strext=1&amp;_nc_cat=105&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=z1DP5j5C6OMQ7kNvgHF-jCj&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9sbl9oZWFhY192YnIzX2F1ZGlvIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYBd51VlWlkuTz8gKusj0hk1Rj4qhJV5y41a7FpWGDbumg&amp;oe=6754ADFA</BaseURL><SegmentBase indexRange=\"824-951\" timescale=\"44100\" FBMinimumPrefetchRange=\"952-1295\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"952-10614\" FBFirstSegmentRange=\"952-20504\" FBFirstSegmentDuration=\"2021\" FBSecondSegmentRange=\"20505-43623\" FBPrefetchSegmentRange=\"952-43623\" FBPrefetchSegmentDuration=\"4017\"><Initialization range=\"0-823\"/></SegmentBase></Representation></AdaptationSet></Period></MPD>\n",
                                                "number_of_qualities": 7
                                            },
                                            "has_audio": false,
                                            "tracking_token": "eyJ2ZXJzaW9uIjo1LCJwYXlsb2FkIjp7ImlzX2FuYWx5dGljc190cmFja2VkIjp0cnVlLCJ1dWlkIjoiYmM1MmYwZDVhMzU1NDI1Y2ExODI0ZWFjOGNmZTRlNzUzNTAyMDY4ODEyMzUzMTgwMzYxIn0sInNpZ25hdHVyZSI6IiJ9",
                                            "video_url": "https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQNxy4T4WmGptTgiccfdVXidz-llnZQb0rYmKxSjXNp5_S4753iRnL3qTbZSBVysnPUl1rcxhVT05Ckj9C0cQvsD.mp4?stp=dst-mp4&efg=eyJxZV9ncm91cHMiOiJbXCJpZ193ZWJfZGVsaXZlcnlfdnRzX290ZlwiXSIsInZlbmNvZGVfdGFnIjoidnRzX3ZvZF91cmxnZW4uY2Fyb3VzZWxfaXRlbS5jMi4xMDgwLmJhc2VsaW5lIn0&_nc_cat=110&vs=916262733930094_1767684383&_nc_vs=HBksFQIYOnBhc3N0aHJvdWdoX2V2ZXJzdG9yZS9HQVI2eGdMdGdEY1VoZDBEQUQ2UGpkQUNTU0FOYnBSMUFBQUYVAALIAQAVAhg6cGFzc3Rocm91Z2hfZXZlcnN0b3JlL0dIeFYyeHZVS1k0SGt2Y0JBQXRxc3l5cjFfSUFia1lMQUFBRhUCAsgBACgAGAAbABUAACb69qmkgs%2F%2FPxUCKAJDMywXQC3HKwIMSboYFmRhc2hfYmFzZWxpbmVfMTA4MHBfdjERAHXuBwA%3D&ccb=9-4&oh=00_AYD87j5a3x4K-eFc_R7clRWSNWdXgt-tM475mhURr1jN4w&oe=6750B4F2&_nc_sid=8b3546",
                                            "video_view_count": 239632
                                        }
                                    },
                                    {
                                        "node": {
                                            "__typename": "GraphVideo",
                                            "id": "3502068811329773534",
                                            "shortcode": "DCZ2Qd2SR_e",
                                            "dimensions": {
                                                "height": 937,
                                                "width": 750
                                            },
                                            "display_url": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-15/467043903_18608511058001321_8894438346481257919_n.jpg?stp=dst-jpg_e15&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=105&_nc_ohc=-gIUxSQAqpwQ7kNvgFDGRkz&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDQovju16Pn-982x0WcAflgsuJisrRYv1V0c35-gq7z4A&oe=6754A41A&_nc_sid=8b3546",
                                            "edge_media_to_tagged_user": {
                                                "edges": [
                                                    {
                                                        "node": {
                                                            "user": {
                                                                "full_name": "TR1 ⛈",
                                                                "followed_by_viewer": false,
                                                                "id": "4357961863",
                                                                "is_verified": true,
                                                                "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/443836249_472257882133285_6110715878806547766_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=HRRE1q0jfSoQ7kNvgEOjHsX&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDjLD4kGOXiJFcW68p1RUhvfAZhXeySU2mtCwR113Bayg&oe=6754BBCC&_nc_sid=8b3546",
                                                                "username": "trueno"
                                                            },
                                                            "x": 0,
                                                            "y": 0
                                                        }
                                                    }
                                                ]
                                            },
                                            "fact_check_overall_rating": null,
                                            "fact_check_information": null,
                                            "gating_info": null,
                                            "sharing_friction_info": {
                                                "should_have_sharing_friction": false,
                                                "bloks_app_url": null
                                            },
                                            "media_overlay_info": null,
                                            "media_preview": "ACIqxz7VatbcSEFsbc4x3P5VTGKv2EgSUDH3uM+lVLZiW6uR3Vv5LcdD0qbT5WWQR/wt+h9as6mxAVe3Jz9Kp2J/fL9f6UJ3WoNWeh0WyinbqKgZxSA5yegq0rA81eNnhAJFwR/EOf8AP41W+wMpyhDAdj3o5u5XL2BmP8XJHrzT7OJjMJRgKD0zznHYVamtVdAxIjI6kAj+Z4P+TUEG1ZcIcjHX8KE+wmrbm1uoqvvooEZc2oyOcfdX0HX86gXUNmRtz+P8+KrN1P41WNLfce2xce6MgKkHaTnGen0yM/rV2ywUz3Bx/hWOK1NO6n8P5GqEaYX3/wA/lRUlFIZ//9k=",
                                            "owner": {
                                                "id": "25025320",
                                                "username": "instagram"
                                            },
                                            "is_video": true,
                                            "has_upcoming_event": false,
                                            "accessibility_caption": null,
                                            "dash_info": {
                                                "is_dash_eligible": true,
                                                "video_dash_manifest": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<MPD xmlns=\"urn:mpeg:dash:schema:mpd:2011\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"urn:mpeg:dash:schema:mpd:2011 DASH-MPD.xsd\" profiles=\"urn:mpeg:dash:profile:isoff-on-demand:2011\" minBufferTime=\"PT2S\" type=\"static\" mediaPresentationDuration=\"PT56.725758S\" FBManifestIdentifier=\"FgAYEnIyZXZldnA5LXIxZ2VuMnZwORlW3ujkopSA+QHO0P/tgJOKA4j/5sPZk68D6PePs9yQpgTUi7Tltr+FBSIYGGRhc2hfbG5faGVhYWNfdmJyM19hdWRpbwA=\"><Period id=\"0\" duration=\"PT56.725758S\"><AdaptationSet id=\"0\" contentType=\"video\" frameRate=\"15344/640\" subsegmentAlignment=\"true\" par=\"4:5\" FBUnifiedUploadResolutionMos=\"360:76.6\"><Representation id=\"1209750070099444vd\" bandwidth=\"92868\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q60\" FBContentLength=\"658501\" FBPlaybackResolutionMos=\"0:100,360:57.6,480:55.6,720:54.3,1080:55.2\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:82.3,480:77.7,720:69.8,1080:61.5\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBDefaultQuality=\"1\" FBQualityClass=\"hd\" FBQualityLabel=\"540p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQM1CdD7HzrbddSbfLCrD4Fq9tfze9KKIpfSXtSu890PGdCq169OxkA6Qs8i8tjMlYcLNiJfBRD3PPG1Gjom9rXE.mp4?strext=1&amp;_nc_cat=101&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=En5LcozrATYQ7kNvgF1RunZ&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTYwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYBSlbEGFUKxcfeKu8PAqXgfXFzIOts5_Y0tz27TWje5wQ&amp;oe=6754AE56</BaseURL><SegmentBase indexRange=\"818-993\" timescale=\"15344\" FBMinimumPrefetchRange=\"994-9668\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"994-23398\" FBFirstSegmentRange=\"994-64580\" FBFirstSegmentDuration=\"5005\" FBSecondSegmentRange=\"64581-115595\" FBPrefetchSegmentRange=\"994-64580\" FBPrefetchSegmentDuration=\"5005\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"547559511464495v\" bandwidth=\"235659\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q70\" FBContentLength=\"1670996\" FBPlaybackResolutionMos=\"0:100,360:70.1,480:68.6,720:67.1,1080:66.8\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:93,480:90.7,720:86.3,1080:80.2\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"640p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQNfX8cYKjm6qt0MF_GPOETd2H2fxaCEA3dJ_st4KBdcehiI0yvdHLkvm69_oJ0TJ7TRe5AKJTwTdmG8wx54_Bcv.mp4?strext=1&amp;_nc_cat=106&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=J38_HVvWEFgQ7kNvgEo_NjZ&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTcwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYCxAnyjsZsi9i-wo5ds4RDmiqkAd_9t77mCzun53CxlCg&amp;oe=67549FC3</BaseURL><SegmentBase indexRange=\"818-993\" timescale=\"15344\" FBMinimumPrefetchRange=\"994-18634\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"994-52462\" FBFirstSegmentRange=\"994-160076\" FBFirstSegmentDuration=\"5005\" FBSecondSegmentRange=\"160077-293175\" FBPrefetchSegmentRange=\"994-160076\" FBPrefetchSegmentDuration=\"5005\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"1419459685679850v\" bandwidth=\"435345\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q80\" FBContentLength=\"3086910\" FBPlaybackResolutionMos=\"0:100,360:74.2,480:73.3,720:72.2,1080:71.7\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:96.3,480:95.3,720:92.5,1080:88\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"720p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQMJ4IBnln1tgUKbOUHaiJx0DgZgFAG-hbs2C9QwIxTZbvEZHe7fIKd1TTZam9vRq8plsf8yoWMLfBO7RUqqAjNV.mp4?strext=1&amp;_nc_cat=110&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=AOYOF0Wfx5cQ7kNvgGKnrsF&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTgwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYD_7t_8cqmVjM3Nm4PXFKrsi8j1V6gJZ6-fNRIbXbuFnA&amp;oe=6754B1BF</BaseURL><SegmentBase indexRange=\"818-993\" timescale=\"15344\" FBMinimumPrefetchRange=\"994-26296\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"994-86501\" FBFirstSegmentRange=\"994-299031\" FBFirstSegmentDuration=\"5005\" FBSecondSegmentRange=\"299032-544474\" FBPrefetchSegmentRange=\"994-299031\" FBPrefetchSegmentDuration=\"5005\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"866741695542311v\" bandwidth=\"657227\" codecs=\"vp09.00.40.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q90\" FBContentLength=\"4660213\" FBPlaybackResolutionMos=\"0:100,360:75.6,480:74.9,720:74.2,1080:74.4\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:97.1,480:96.3,720:94.7,1080:92.1\" FBAbrPolicyTags=\"\" width=\"1080\" height=\"1350\" FBQualityClass=\"hd\" FBQualityLabel=\"1080p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQPmVN76lWIZ4CeMLbVgC9_U-9oAdDLJdxrPQ352mqlrPHufsh3l_Q43BIPZfSCQaITWThKi3OuAlL47pzj4fMRy.mp4?strext=1&amp;_nc_cat=102&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=9icV38yD7swQ7kNvgFebjlm&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTkwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYDigNKKzd3lke6UteK095Q6M_LuFKgUl0t2G9uzBVdNug&amp;oe=6754B87B</BaseURL><SegmentBase indexRange=\"818-993\" timescale=\"15344\" FBMinimumPrefetchRange=\"994-36543\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"994-126387\" FBFirstSegmentRange=\"994-439822\" FBFirstSegmentDuration=\"5005\" FBSecondSegmentRange=\"439823-818993\" FBPrefetchSegmentRange=\"994-439822\" FBPrefetchSegmentDuration=\"5005\"><Initialization range=\"0-817\"/></SegmentBase></Representation></AdaptationSet><AdaptationSet id=\"1\" contentType=\"audio\" subsegmentStartsWithSAP=\"1\" subsegmentAlignment=\"true\"><Representation id=\"948117457133508ad\" bandwidth=\"97139\" codecs=\"mp4a.40.5\" mimeType=\"audio/mp4\" FBAvgBitrate=\"97139\" audioSamplingRate=\"44100\" FBEncodingTag=\"dash_ln_heaac_vbr3_audio\" FBContentLength=\"689695\" FBAbrPolicyTags=\"\" FBDefaultQuality=\"1\"><AudioChannelConfiguration schemeIdUri=\"urn:mpeg:dash:23003:3:audio_channel_configuration:2011\" value=\"2\"/><BaseURL>https://scontent-atl3-3.cdninstagram.com/o1/v/t16/f2/m69/AQMcQw_M191g1v64S2XUzhRfVTnSD0nM-rMByBXm3ky8ol8bNGFoSPW7KXDQj_e-AuInidkjEffTaBGUG6yMdkUB.mp4?strext=1&amp;_nc_cat=109&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-3.cdninstagram.com&amp;_nc_ohc=H5cI2FYrjbAQ7kNvgGTUEWG&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9sbl9oZWFhY192YnIzX2F1ZGlvIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYC6U3MZSJl5WymRJYx3AbBzpGekvBIRUO-xVwq28zmZMw&amp;oe=6754B942</BaseURL><SegmentBase indexRange=\"824-1203\" timescale=\"44100\" FBMinimumPrefetchRange=\"1204-1547\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"1204-14162\" FBFirstSegmentRange=\"1204-25832\" FBFirstSegmentDuration=\"2021\" FBSecondSegmentRange=\"25833-50718\" FBPrefetchSegmentRange=\"1204-50718\" FBPrefetchSegmentDuration=\"4017\"><Initialization range=\"0-823\"/></SegmentBase></Representation></AdaptationSet></Period></MPD>\n",
                                                "number_of_qualities": 4
                                            },
                                            "has_audio": false,
                                            "tracking_token": "eyJ2ZXJzaW9uIjo1LCJwYXlsb2FkIjp7ImlzX2FuYWx5dGljc190cmFja2VkIjp0cnVlLCJ1dWlkIjoiYmM1MmYwZDVhMzU1NDI1Y2ExODI0ZWFjOGNmZTRlNzUzNTAyMDY4ODExMzI5NzczNTM0In0sInNpZ25hdHVyZSI6IiJ9",
                                            "video_url": "https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQOjgHgkNwitRPRA8mJnRaRsFpw5xBEYeyh9DROGIjDB3SsXOqti3-dF9gYJ0Svv93PI7Af0cVa_gP7kbHzFGNuL.mp4?stp=dst-mp4&efg=eyJxZV9ncm91cHMiOiJbXCJpZ193ZWJfZGVsaXZlcnlfdnRzX290ZlwiXSIsInZlbmNvZGVfdGFnIjoidnRzX3ZvZF91cmxnZW4uY2Fyb3VzZWxfaXRlbS5jMi4xMDgwLmJhc2VsaW5lIn0&_nc_cat=101&vs=532806482968148_2112986147&_nc_vs=HBksFQIYOnBhc3N0aHJvdWdoX2V2ZXJzdG9yZS9HSUtjRFFOSDR5cHc5Z2tDQUNkbTRZZHdMbDk4YnBSMUFBQUYVAALIAQAVAhg6cGFzc3Rocm91Z2hfZXZlcnN0b3JlL0dNbEoxaHZhUF9jcUNwTUdBQVd3c29hR1NQd0Ria1lMQUFBRhUCAsgBACgAGAAbABUAACbUju7Fi9TcPxUCKAJDMywXQExczMzMzM0YFmRhc2hfYmFzZWxpbmVfMTA4MHBfdjERAHXuBwA%3D&ccb=9-4&oh=00_AYCqP-PQkaD_SXsE57NGHsCNlauIFKqATtHDxL-KrZfoNg&oe=6750CEF8&_nc_sid=8b3546",
                                            "video_view_count": 117827
                                        }
                                    },
                                    {
                                        "node": {
                                            "__typename": "GraphImage",
                                            "id": "3502071601355710281",
                                            "shortcode": "DCZ25EQyl9J",
                                            "dimensions": {
                                                "height": 1350,
                                                "width": 1080
                                            },
                                            "display_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.29350-15/466990055_501471772853563_5591763983799025630_n.jpg?stp=dst-jpg_e35&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=107&_nc_ohc=dycEJS02CqMQ7kNvgENP4E7&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBRUTgtFdXS0qlCE2I8u_0ZUZFmytPKLPXZlTyf73F_1w&oe=6754B7D7&_nc_sid=8b3546",
                                            "edge_media_to_tagged_user": {
                                                "edges": [
                                                    {
                                                        "node": {
                                                            "user": {
                                                                "full_name": "TR1 ⛈",
                                                                "followed_by_viewer": false,
                                                                "id": "4357961863",
                                                                "is_verified": true,
                                                                "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/443836249_472257882133285_6110715878806547766_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=HRRE1q0jfSoQ7kNvgEOjHsX&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDjLD4kGOXiJFcW68p1RUhvfAZhXeySU2mtCwR113Bayg&oe=6754BBCC&_nc_sid=8b3546",
                                                                "username": "trueno"
                                                            },
                                                            "x": 0.5029686175,
                                                            "y": 0.8642917727
                                                        }
                                                    }
                                                ]
                                            },
                                            "fact_check_overall_rating": null,
                                            "fact_check_information": null,
                                            "gating_info": null,
                                            "sharing_friction_info": {
                                                "should_have_sharing_friction": false,
                                                "bloks_app_url": null
                                            },
                                            "media_overlay_info": null,
                                            "media_preview": "ACIqjuLFYxmPk5HBPI9OR2+o+hrRRiygng9+c8/WsdrrMbE4LHAHsO568f41VW4baSx3ZI6k+h6EYx0oCx1IbgVXkmw21uM9D6n0qlHfKI13EEgD1qvdXAkKkYwOc8/T9P51RJoECiqX24e35UUxFM2FxjGw/p/jTDZTgY2H9P8AGuqLYqrIygEjnHzHHX/PFTYq5zm3bweCOv1pxfOSeSRj0/lVlkjjAllBfzMlUB7f7TevPQfjUN4kaFfLOQVyfb059fWkMr0VHmigZqvqJKkAYOODnpUK3QRQuM4HXPX9KrR/eH1pjU7k2LEkBC+buTB5ChgTz7e3eo4YRJklgoXHJ6cnGT7Dv39Kip6khGHY44pFFj7LF/z2T8moqlRQB//Z",
                                            "owner": {
                                                "id": "25025320",
                                                "username": "instagram"
                                            },
                                            "is_video": false,
                                            "has_upcoming_event": false,
                                            "accessibility_caption": "A collage of images of a person playing soccer and posing."
                                        }
                                    },
                                    {
                                        "node": {
                                            "__typename": "GraphImage",
                                            "id": "3502071601380869626",
                                            "shortcode": "DCZ25ESSkX6",
                                            "dimensions": {
                                                "height": 1350,
                                                "width": 1080
                                            },
                                            "display_url": "https://scontent-atl3-3.cdninstagram.com/v/t51.29350-15/467013443_573440741708925_2221117921107305761_n.jpg?stp=dst-jpg_e35_p1080x1080&_nc_ht=scontent-atl3-3.cdninstagram.com&_nc_cat=109&_nc_ohc=qmRFvrKj9xMQ7kNvgEO0pEf&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBLZ6BrFDeXyYDAm2nwVnd0XFk41c4hBFOUh_Jx-lqegw&oe=6754B037&_nc_sid=8b3546",
                                            "edge_media_to_tagged_user": {
                                                "edges": [
                                                    {
                                                        "node": {
                                                            "user": {
                                                                "full_name": "TR1 ⛈",
                                                                "followed_by_viewer": false,
                                                                "id": "4357961863",
                                                                "is_verified": true,
                                                                "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/443836249_472257882133285_6110715878806547766_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=HRRE1q0jfSoQ7kNvgEOjHsX&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDjLD4kGOXiJFcW68p1RUhvfAZhXeySU2mtCwR113Bayg&oe=6754BBCC&_nc_sid=8b3546",
                                                                "username": "trueno"
                                                            },
                                                            "x": 0.5156912638,
                                                            "y": 0.8727735369
                                                        }
                                                    }
                                                ]
                                            },
                                            "fact_check_overall_rating": null,
                                            "fact_check_information": null,
                                            "gating_info": null,
                                            "sharing_friction_info": {
                                                "should_have_sharing_friction": false,
                                                "bloks_app_url": null
                                            },
                                            "media_overlay_info": null,
                                            "media_preview": "ACIqu3UvlLk9T0rmvMZpCwPJq9czGZiT36D0H/16iisDICzHavY/zzntQO1hY7ts7cbyfTr+VTvIOhBU+jDB/X+lTW1vhAYOM4zIevvgZ6egxz3rN1EMJSGJbbjGfp1/GkBPmisncfU/nRTEaqLuNbTW67VQ8gdfQ+ufWsK0nxIoxnn/AD/+qtyKVpGKntg/n2/SkuxTLScisXU0JIlwQPunPt0rcC4Xj1/SsrUpyI/LK5DYw3GOOenXNMlGL5SnmimUUh2NG3kwu5lLHPGB/wDWq61xuHCP+Ax+uOajt/8AVr9KnBphdlQyuAdqSD/gVUHneUYcn8a2G6VgmgLhRTKKQz//2Q==",
                                            "owner": {
                                                "id": "25025320",
                                                "username": "instagram"
                                            },
                                            "is_video": false,
                                            "has_upcoming_event": false,
                                            "accessibility_caption": "A shirt and shoes in a closet."
                                        }
                                    },
                                    {
                                        "node": {
                                            "__typename": "GraphVideo",
                                            "id": "3502068812898630147",
                                            "shortcode": "DCZ2QfTy_oD",
                                            "dimensions": {
                                                "height": 937,
                                                "width": 750
                                            },
                                            "display_url": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-15/467043904_18608511187001321_7197347428605637457_n.jpg?stp=dst-jpg_e15_tt6&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=105&_nc_ohc=AxUeU7nGO00Q7kNvgFIR-Lu&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYA0rVIaH-exlSgNpiF3kwS05yCCQ2CzgRVIm83jsAdmZg&oe=67549FD2&_nc_sid=8b3546",
                                            "edge_media_to_tagged_user": {
                                                "edges": [
                                                    {
                                                        "node": {
                                                            "user": {
                                                                "full_name": "TR1 ⛈",
                                                                "followed_by_viewer": false,
                                                                "id": "4357961863",
                                                                "is_verified": true,
                                                                "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/443836249_472257882133285_6110715878806547766_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=HRRE1q0jfSoQ7kNvgEOjHsX&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDjLD4kGOXiJFcW68p1RUhvfAZhXeySU2mtCwR113Bayg&oe=6754BBCC&_nc_sid=8b3546",
                                                                "username": "trueno"
                                                            },
                                                            "x": 0,
                                                            "y": 0
                                                        }
                                                    }
                                                ]
                                            },
                                            "fact_check_overall_rating": null,
                                            "fact_check_information": null,
                                            "gating_info": null,
                                            "sharing_friction_info": {
                                                "should_have_sharing_friction": false,
                                                "bloks_app_url": null
                                            },
                                            "media_overlay_info": null,
                                            "media_preview": "ACIqwwM1swWq+WUbbuzyeuPbP88dKyBzW9p0gePZjDJ+oPf86JvT5jgrvUxZovLcr6Vd06VlkEf8Ln8j603UWLTHIwBgD6dc/rTbD/Xp9f6VW6Iej0Ok2UU+ioKOLhbaMnvVtXwcqSD6ipDZBhgcOOqnp/n0qK3hcvhvlC8855x6epouirNDmYHk8n3qSytZFlWU4CZJGSMkc9BQbJi20sNg6sP5YPf19KfbkLLhTkDIB/Ci/YVurNzdRUG6igRiSXrM+/GMDpVtLuOVcEjjnDf/AF/T2rIfqT9aqmptcu9jWvbkcRDJA5OCB+HA/wA96ksCChPcHH+FYgrV0z/WfhVWsib3NgL7/wCfyoqWigD/2Q==",
                                            "owner": {
                                                "id": "25025320",
                                                "username": "instagram"
                                            },
                                            "is_video": true,
                                            "has_upcoming_event": false,
                                            "accessibility_caption": null,
                                            "dash_info": {
                                                "is_dash_eligible": true,
                                                "video_dash_manifest": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<MPD xmlns=\"urn:mpeg:dash:schema:mpd:2011\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"urn:mpeg:dash:schema:mpd:2011 DASH-MPD.xsd\" profiles=\"urn:mpeg:dash:profile:isoff-on-demand:2011\" minBufferTime=\"PT2S\" type=\"static\" mediaPresentationDuration=\"PT46.423359S\" FBManifestIdentifier=\"FgAYEnIyZXZldnA5LXIxZ2VuMnZwORlmjoTyp8jzzQGyvvfx1YyBAsKMrbyz34oDoMyD08HM7APG9OzDjqrtA6TDr+fP34ZiIhgYZGFzaF9sbl9oZWFhY192YnIzX2F1ZGlvAA==\"><Period id=\"0\" duration=\"PT46.423359S\"><AdaptationSet id=\"0\" contentType=\"video\" frameRate=\"15344/640\" subsegmentAlignment=\"true\" par=\"4:5\" FBUnifiedUploadResolutionMos=\"360:75.9\"><Representation id=\"1084841969687843vd\" bandwidth=\"88022\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q50\" FBContentLength=\"510790\" FBPlaybackResolutionMos=\"0:100,360:54.9,480:53.1,720:52.4,1080:53.7\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:81.7,480:76.9,720:69.5,1080:62.1\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBDefaultQuality=\"1\" FBQualityClass=\"hd\" FBQualityLabel=\"480p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQOPF8lccHVFTw9eTcOoaNkK567WVKOwk8UgBcbT4HV-U9WIUDWE9bByHQHDAedLNNAmkGHP_mv70UNTROpR7g3H.mp4?strext=1&amp;_nc_cat=103&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=P-A61sdjdaYQ7kNvgG-kL9S&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTUwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYDNiqjb4sQsXCDIIa4rSNvJQQU_TvpHelbfim4qEX8KAg&amp;oe=6754C4E8</BaseURL><SegmentBase indexRange=\"818-969\" timescale=\"15344\" FBMinimumPrefetchRange=\"970-11148\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"970-20558\" FBFirstSegmentRange=\"970-50831\" FBFirstSegmentDuration=\"5005\" FBSecondSegmentRange=\"50832-100034\" FBPrefetchSegmentRange=\"970-50831\" FBPrefetchSegmentDuration=\"5005\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"565366663081881v\" bandwidth=\"204709\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q60\" FBContentLength=\"1187912\" FBPlaybackResolutionMos=\"0:100,360:66.9,480:65.5,720:64.3,1080:64.3\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:92.2,480:90,720:85.5,1080:79.5\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"540p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQP3_4DoyCQI6sKgVZQw8ChQvJwe0C3UGPhGAtCsRqvPvcpIBVbZpvLvZOS-vc58pAHeqbOUmw5oYi1O_j4xIK7g.mp4?strext=1&amp;_nc_cat=111&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=acuV-VfVMKAQ7kNvgEOfWyM&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTYwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYAYlkzAIbhbmb6XIIqFOa7_Hvry7l5jinhZ3JLKmtf86w&amp;oe=6754AA30</BaseURL><SegmentBase indexRange=\"818-969\" timescale=\"15344\" FBMinimumPrefetchRange=\"970-17210\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"970-39039\" FBFirstSegmentRange=\"970-115982\" FBFirstSegmentDuration=\"5005\" FBSecondSegmentRange=\"115983-231024\" FBPrefetchSegmentRange=\"970-115982\" FBPrefetchSegmentDuration=\"5005\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"452785157849351v\" bandwidth=\"345472\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q70\" FBContentLength=\"2004751\" FBPlaybackResolutionMos=\"0:100,360:71,480:70.1,720:69.2,1080:68.8\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:95.3,480:93.7,720:90.4,1080:85.2\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"640p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQPJs2pyBQEq_uiOWj4FG_TZRwO44lqImTfZ79gJUMa8kp7nF8w1_qZvUtnVJlGNV-V_yasuiMAeZ96iGRCSELLH.mp4?strext=1&amp;_nc_cat=104&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=_Ha39ZdmPA0Q7kNvgFxcxla&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTcwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYAN82LPQwYBKUJdU7hh8yt5tAW_AhgH-ZbP0BoTyfdCDg&amp;oe=6754AF11</BaseURL><SegmentBase indexRange=\"818-969\" timescale=\"15344\" FBMinimumPrefetchRange=\"970-22860\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"970-66382\" FBFirstSegmentRange=\"970-190474\" FBFirstSegmentDuration=\"5005\" FBSecondSegmentRange=\"190475-385424\" FBPrefetchSegmentRange=\"970-190474\" FBPrefetchSegmentDuration=\"5005\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"1083233923003152v\" bandwidth=\"527885\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q80\" FBContentLength=\"3063278\" FBPlaybackResolutionMos=\"0:100,360:73.1,480:72.4,720:71.9,1080:71.4\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:97,480:96,720:93.6,1080:89.3\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"720p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQOk0wfFN2A4Blv2lO97TcezvZT_pTA4bkp75A9u2DEpLsOxqYELq9-OVrhdp6CnJ2FgWmjJUhyLeDHBAJf4Mayq.mp4?strext=1&amp;_nc_cat=102&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=_xsB_l5CihUQ7kNvgHpEliI&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTgwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYAjHTTEOEpX-t7rj2YZxXrVEb3gxIUK6WKdeWOe3fsl1A&amp;oe=67549B63</BaseURL><SegmentBase indexRange=\"818-969\" timescale=\"15344\" FBMinimumPrefetchRange=\"970-27271\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"970-88988\" FBFirstSegmentRange=\"970-290257\" FBFirstSegmentDuration=\"5005\" FBSecondSegmentRange=\"290258-586311\" FBPrefetchSegmentRange=\"970-290257\" FBPrefetchSegmentDuration=\"5005\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"27599384656343250v\" bandwidth=\"753047\" codecs=\"vp09.00.40.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q90\" FBContentLength=\"4369874\" FBPlaybackResolutionMos=\"0:100,360:74.5,480:74.1,720:73.9,1080:74.3\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:97.4,480:96.6,720:95.2,1080:92.8\" FBAbrPolicyTags=\"\" width=\"1080\" height=\"1350\" FBQualityClass=\"hd\" FBQualityLabel=\"1080p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQMGq37Py9L0lvO0-bLIjssz2YuaFeQPaAH1zFfFfJGI4LpVEyK8fCIl65wMlHsmuSt3K58FHfpHFW5y0NCgh9Od.mp4?strext=1&amp;_nc_cat=106&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=zhSxUrO2h7sQ7kNvgEOngTD&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTkwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYAVj0dAuexent1jyC3KhxRAl8bndrV2G67JYUGhZttcow&amp;oe=6754C743</BaseURL><SegmentBase indexRange=\"818-969\" timescale=\"15344\" FBMinimumPrefetchRange=\"970-36027\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"970-121608\" FBFirstSegmentRange=\"970-421412\" FBFirstSegmentDuration=\"5005\" FBSecondSegmentRange=\"421413-849262\" FBPrefetchSegmentRange=\"970-421412\" FBPrefetchSegmentDuration=\"5005\"><Initialization range=\"0-817\"/></SegmentBase></Representation></AdaptationSet><AdaptationSet id=\"1\" contentType=\"audio\" subsegmentStartsWithSAP=\"1\" subsegmentAlignment=\"true\"><Representation id=\"868054158648097ad\" bandwidth=\"93044\" codecs=\"mp4a.40.5\" mimeType=\"audio/mp4\" FBAvgBitrate=\"93044\" audioSamplingRate=\"44100\" FBEncodingTag=\"dash_ln_heaac_vbr3_audio\" FBContentLength=\"540701\" FBAbrPolicyTags=\"\" FBDefaultQuality=\"1\"><AudioChannelConfiguration schemeIdUri=\"urn:mpeg:dash:23003:3:audio_channel_configuration:2011\" value=\"2\"/><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQPt1bW60S1UrK7NO-EjVhM4gb7GzQghqmC995XEaD1jC6AkWS_AU4ETdjnqM0iTntI4L3ZEax5-lfkod9Uchk80.mp4?strext=1&amp;_nc_cat=110&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=atCGWxQvO9MQ7kNvgGuf0BG&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9sbl9oZWFhY192YnIzX2F1ZGlvIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYDTZhatA_Of8WtcwIz0__fjwV3OpkjjpSKByiAujVPj9g&amp;oe=6754A963</BaseURL><SegmentBase indexRange=\"824-1143\" timescale=\"44100\" FBMinimumPrefetchRange=\"1144-1487\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"1144-13175\" FBFirstSegmentRange=\"1144-26809\" FBFirstSegmentDuration=\"2021\" FBSecondSegmentRange=\"26810-49298\" FBPrefetchSegmentRange=\"1144-49298\" FBPrefetchSegmentDuration=\"4017\"><Initialization range=\"0-823\"/></SegmentBase></Representation></AdaptationSet></Period></MPD>\n",
                                                "number_of_qualities": 5
                                            },
                                            "has_audio": false,
                                            "tracking_token": "eyJ2ZXJzaW9uIjo1LCJwYXlsb2FkIjp7ImlzX2FuYWx5dGljc190cmFja2VkIjp0cnVlLCJ1dWlkIjoiYmM1MmYwZDVhMzU1NDI1Y2ExODI0ZWFjOGNmZTRlNzUzNTAyMDY4ODEyODk4NjMwMTQ3In0sInNpZ25hdHVyZSI6IiJ9",
                                            "video_url": "https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQPGWhCCngTE5nTb3VKKcxVQ6nXLA23iudFMVZ1-2WFTauHk_MrEESFykariiHP8MSF-1hpGenPxvH6ZyF3S50ZS.mp4?stp=dst-mp4&efg=eyJxZV9ncm91cHMiOiJbXCJpZ193ZWJfZGVsaXZlcnlfdnRzX290ZlwiXSIsInZlbmNvZGVfdGFnIjoidnRzX3ZvZF91cmxnZW4uY2Fyb3VzZWxfaXRlbS5jMi4xMDgwLmJhc2VsaW5lIn0&_nc_cat=104&vs=546690911493181_1049658937&_nc_vs=HBksFQIYOnBhc3N0aHJvdWdoX2V2ZXJzdG9yZS9HR3F4R3dOSU5OTVdDdDBEQUthMDJtR3h6S2NZYnBSMUFBQUYVAALIAQAVAhg6cGFzc3Rocm91Z2hfZXZlcnN0b3JlL0dNMEoyUnZaeDRQb3p3WUNBS090a281U1ZKMWhia1lMQUFBRhUCAsgBACgAGAAbABUAACaq47Sbno3XQBUCKAJDMywXQEc2JN0vGqAYFmRhc2hfYmFzZWxpbmVfMTA4MHBfdjERAHXuBwA%3D&ccb=9-4&oh=00_AYBnEEHrMyJXfG2pvjLcC-roTm-E3MVKFqh6i2EpKWHngg&oe=6750AAE4&_nc_sid=8b3546",
                                            "video_view_count": 51994
                                        }
                                    },
                                    {
                                        "node": {
                                            "__typename": "GraphVideo",
                                            "id": "3502068813611550029",
                                            "shortcode": "DCZ2Qf-SkVN",
                                            "dimensions": {
                                                "height": 937,
                                                "width": 750
                                            },
                                            "display_url": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-15/467110675_18608511175001321_5506605182781114143_n.jpg?stp=dst-jpg_e15&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=105&_nc_ohc=CGICHDBtTkEQ7kNvgEaOSf_&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAKUIxBFLyysw48ZNtaQa1SFZI1iKVr5Fn3CkbxtvnnXw&oe=67549E42&_nc_sid=8b3546",
                                            "edge_media_to_tagged_user": {
                                                "edges": [
                                                    {
                                                        "node": {
                                                            "user": {
                                                                "full_name": "TR1 ⛈",
                                                                "followed_by_viewer": false,
                                                                "id": "4357961863",
                                                                "is_verified": true,
                                                                "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/443836249_472257882133285_6110715878806547766_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=HRRE1q0jfSoQ7kNvgEOjHsX&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDjLD4kGOXiJFcW68p1RUhvfAZhXeySU2mtCwR113Bayg&oe=6754BBCC&_nc_sid=8b3546",
                                                                "username": "trueno"
                                                            },
                                                            "x": 0,
                                                            "y": 0
                                                        }
                                                    }
                                                ]
                                            },
                                            "fact_check_overall_rating": null,
                                            "fact_check_information": null,
                                            "gating_info": null,
                                            "sharing_friction_info": {
                                                "should_have_sharing_friction": false,
                                                "bloks_app_url": null
                                            },
                                            "media_overlay_info": null,
                                            "media_preview": "ACIq0Kpum046CrdNkGR/OpYypdKiRHlScYxms+G6eTCEZ7celX3hT/Dn+X+NYsm+CU7cjP6/40aPQrWOpt7F9BRWIbtz/EaKXKx8yOnBodgBhiBn1NUbu42fKvU9az87uTzV2IuaW1MjHQDg1nXLskqyOPlGQoBHP19M56daQ3bp8owQOmaZb3ckJzgNzn5hnH0PUVKTRbkmhPKmP/LL/wAdopzXTMSSTk80VRmMuGbdtP3ieaXcPQ/n/wDWqzeAbie//wCuqGTihajas7EjMp7H8/8A61QMw7dKl6rzVZqYh2aKbRTA/9k=",
                                            "owner": {
                                                "id": "25025320",
                                                "username": "instagram"
                                            },
                                            "is_video": true,
                                            "has_upcoming_event": false,
                                            "accessibility_caption": null,
                                            "dash_info": {
                                                "is_dash_eligible": true,
                                                "video_dash_manifest": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<MPD xmlns=\"urn:mpeg:dash:schema:mpd:2011\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"urn:mpeg:dash:schema:mpd:2011 DASH-MPD.xsd\" profiles=\"urn:mpeg:dash:profile:isoff-on-demand:2011\" minBufferTime=\"PT2S\" type=\"static\" mediaPresentationDuration=\"PT18.394928S\" FBManifestIdentifier=\"FgAYEnIyZXZldnA5LXIxZ2VuMnZwORlW3vL25Zmt/gH+86DJuZaXA6zFyISKq7IE1L+gts6+pQmS4rfz08aFHyIYGGRhc2hfbG5faGVhYWNfdmJyM19hdWRpbwA=\"><Period id=\"0\" duration=\"PT18.394928S\"><AdaptationSet id=\"0\" contentType=\"video\" frameRate=\"11987/500\" subsegmentAlignment=\"true\" par=\"4:5\" FBUnifiedUploadResolutionMos=\"360:74.9\"><Representation id=\"895388149357823vd\" bandwidth=\"102433\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q60\" FBContentLength=\"235532\" FBPlaybackResolutionMos=\"0:100,360:62.9,480:59.8,720:57.3,1080:57.3\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:84.4,480:79.9,720:73.4,1080:66.6\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBDefaultQuality=\"1\" FBQualityClass=\"hd\" FBQualityLabel=\"540p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQMlF15sNK0QkexpH1yvVhC0h59dqIhx_goCfhgYErr8iJL-X4vfI23VPna4OMekmLIzApmwolyUrdxZTpPBf8QI.mp4?strext=1&amp;_nc_cat=103&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=bLOZn-CQcWYQ7kNvgEON7YN&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTYwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYAhAKTy-N-zkZu8sL_M-3lAuueX5UIJqkNG2p-yoILILQ&amp;oe=6754998C</BaseURL><SegmentBase indexRange=\"818-897\" timescale=\"11987\" FBMinimumPrefetchRange=\"898-10048\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"898-24827\" FBFirstSegmentRange=\"898-60108\" FBFirstSegmentDuration=\"5005\" FBSecondSegmentRange=\"60109-131025\" FBPrefetchSegmentRange=\"898-60108\" FBPrefetchSegmentDuration=\"5005\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"1236591150960982v\" bandwidth=\"273027\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q70\" FBContentLength=\"627790\" FBPlaybackResolutionMos=\"0:100,360:77.2,480:74.8,720:72.1,1080:70.7\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:95.5,480:93.8,720:90.1,1080:85.1\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"640p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQOK-hShkeCdy_CYHJjyBKHdElaYTGnX3wcBI5alBLWA4q9Egv9ql1-BNY6Ht__Lc8v1Qg13s0IhCj4g9dfWKU4w.mp4?strext=1&amp;_nc_cat=101&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=tMF12ThxOCIQ7kNvgGZ8rlE&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTcwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYDaqUyc44Q36urCRbsMOFLMnTrNceo5bAro4Cfe4cu7xQ&amp;oe=6754911A</BaseURL><SegmentBase indexRange=\"818-897\" timescale=\"11987\" FBMinimumPrefetchRange=\"898-17716\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"898-55369\" FBFirstSegmentRange=\"898-156288\" FBFirstSegmentDuration=\"5005\" FBSecondSegmentRange=\"156289-356999\" FBPrefetchSegmentRange=\"898-156288\" FBPrefetchSegmentDuration=\"5005\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"559328463346863v\" bandwidth=\"467602\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q80\" FBContentLength=\"1075189\" FBPlaybackResolutionMos=\"0:100,360:84.3,480:81.8,720:78.7,1080:76.9\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:97.8,480:96.9,720:94.9,1080:91.1\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"720p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQPGktdUW-GxFyjdGPmB-9Gj6ZPFeRhsVCmbPwf_UMTdr95IN1Xf9u_kEnKhmQdWfUe3BI3QDsqHRKbGEO1a78p-.mp4?strext=1&amp;_nc_cat=101&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=NK5fflspw8EQ7kNvgE1-BDe&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTgwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYBNi5A3y28JNdepckcZ8Yw-BjX61zePrSFLMahS2mvehQ&amp;oe=675493EE</BaseURL><SegmentBase indexRange=\"818-897\" timescale=\"11987\" FBMinimumPrefetchRange=\"898-24303\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"898-87482\" FBFirstSegmentRange=\"898-265868\" FBFirstSegmentDuration=\"5005\" FBSecondSegmentRange=\"265869-625523\" FBPrefetchSegmentRange=\"898-265868\" FBPrefetchSegmentDuration=\"5005\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"8737933246265481v\" bandwidth=\"683221\" codecs=\"vp09.00.40.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q90\" FBContentLength=\"1570977\" FBPlaybackResolutionMos=\"0:100,360:87.4,480:85.3,720:82.8,1080:81.6\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:98.43,480:97.9,720:96.6,1080:94.7\" FBAbrPolicyTags=\"avoid_on_cellular,avoid_on_cellular_intentional\" width=\"1080\" height=\"1350\" FBQualityClass=\"hd\" FBQualityLabel=\"1080p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQOfUrI0hJc7CoDGkdaFVafed5TtIEz3Od33THLAYCAx4tMglzFs9PeSimVCzZvf0QidAo3SN7yVxPC4AISJj8eN.mp4?strext=1&amp;_nc_cat=110&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=t0tSAS9a7HoQ7kNvgG88Rgs&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTkwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYCIXtYdFU8IcMD2fGM-T3qmyvg5e7IbEXoN3OKQ1mws_g&amp;oe=6754BA1F</BaseURL><SegmentBase indexRange=\"818-897\" timescale=\"11987\" FBMinimumPrefetchRange=\"898-32439\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"898-123636\" FBFirstSegmentRange=\"898-383662\" FBFirstSegmentDuration=\"5005\" FBSecondSegmentRange=\"383663-919648\" FBPrefetchSegmentRange=\"898-383662\" FBPrefetchSegmentDuration=\"5005\"><Initialization range=\"0-817\"/></SegmentBase></Representation></AdaptationSet><AdaptationSet id=\"1\" contentType=\"audio\" subsegmentStartsWithSAP=\"1\" subsegmentAlignment=\"true\"><Representation id=\"2615714328612842ad\" bandwidth=\"90223\" codecs=\"mp4a.40.5\" mimeType=\"audio/mp4\" FBAvgBitrate=\"90223\" audioSamplingRate=\"44100\" FBEncodingTag=\"dash_ln_heaac_vbr3_audio\" FBContentLength=\"208099\" FBAbrPolicyTags=\"\" FBDefaultQuality=\"1\"><AudioChannelConfiguration schemeIdUri=\"urn:mpeg:dash:23003:3:audio_channel_configuration:2011\" value=\"2\"/><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQOXP2ncjS0AZJmv-O7aWVfAwBXnUdh6fgQrXUxHw0fpaWGrh8wdPYzK9AaL71lNtNmwdGwtqJZUCZYFmjFa1c00.mp4?strext=1&amp;_nc_cat=105&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=1N0jPx-o71MQ7kNvgEujUBW&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9sbl9oZWFhY192YnIzX2F1ZGlvIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYD2QUGNWgwS2uGxysiPYZ0Vjjh7XVmXPCrAKZuHwXVJfA&amp;oe=6754C702</BaseURL><SegmentBase indexRange=\"824-975\" timescale=\"44100\" FBMinimumPrefetchRange=\"976-1319\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"976-12702\" FBFirstSegmentRange=\"976-23488\" FBFirstSegmentDuration=\"2021\" FBSecondSegmentRange=\"23489-45298\" FBPrefetchSegmentRange=\"976-45298\" FBPrefetchSegmentDuration=\"4017\"><Initialization range=\"0-823\"/></SegmentBase></Representation></AdaptationSet></Period></MPD>\n",
                                                "number_of_qualities": 4
                                            },
                                            "has_audio": false,
                                            "tracking_token": "eyJ2ZXJzaW9uIjo1LCJwYXlsb2FkIjp7ImlzX2FuYWx5dGljc190cmFja2VkIjp0cnVlLCJ1dWlkIjoiYmM1MmYwZDVhMzU1NDI1Y2ExODI0ZWFjOGNmZTRlNzUzNTAyMDY4ODEzNjExNTUwMDI5In0sInNpZ25hdHVyZSI6IiJ9",
                                            "video_url": "https://scontent-atl3-3.cdninstagram.com/o1/v/t16/f2/m69/AQNVzY7KV0WOYz3SvwHtKNx_WRIzSLnlQCuIuitJp4F799ZjG6QimyuvocUvyQS4KHmFsUBLJlSH-YRQa5uFakO_.mp4?stp=dst-mp4&efg=eyJxZV9ncm91cHMiOiJbXCJpZ193ZWJfZGVsaXZlcnlfdnRzX290ZlwiXSIsInZlbmNvZGVfdGFnIjoidnRzX3ZvZF91cmxnZW4uY2Fyb3VzZWxfaXRlbS5jMi4xMDgwLmJhc2VsaW5lIn0&_nc_cat=109&vs=2317460808612575_1065576968&_nc_vs=HBksFQIYOnBhc3N0aHJvdWdoX2V2ZXJzdG9yZS9HREo5NkFJY0RINmZZTjhEQUxCVHhsX05ySkl3YnBSMUFBQUYVAALIAQAVAhg6cGFzc3Rocm91Z2hfZXZlcnN0b3JlL0dMdjkxQnZuMWxQU3dOd0JBTzN4NXNWTjVkd1hia1lMQUFBRhUCAsgBACgAGAAbABUAACaegbrv0fy0PxUCKAJDMywXQDJvnbItDlYYFmRhc2hfYmFzZWxpbmVfMTA4MHBfdjERAHXuBwA%3D&ccb=9-4&oh=00_AYArdn7WdNQ0cMc3nra62we70mUfb95Q2pL4DCYWhKKJBQ&oe=67509E74&_nc_sid=8b3546",
                                            "video_view_count": 107453
                                        }
                                    },
                                    {
                                        "node": {
                                            "__typename": "GraphVideo",
                                            "id": "3502069856894407487",
                                            "shortcode": "DCZ2frmy1M_",
                                            "dimensions": {
                                                "height": 937,
                                                "width": 750
                                            },
                                            "display_url": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-15/467019877_18608511172001321_4631084548469235876_n.jpg?stp=dst-jpg_e15&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=105&_nc_ohc=j7myRINS5wAQ7kNvgF-GQ8u&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBcNXXI57bZ7N18f54cHsmcgDLRDMRGeMfRwHPy2vKMLg&oe=67549A31&_nc_sid=8b3546",
                                            "edge_media_to_tagged_user": {
                                                "edges": [
                                                    {
                                                        "node": {
                                                            "user": {
                                                                "full_name": "TR1 ⛈",
                                                                "followed_by_viewer": false,
                                                                "id": "4357961863",
                                                                "is_verified": true,
                                                                "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/443836249_472257882133285_6110715878806547766_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=HRRE1q0jfSoQ7kNvgEOjHsX&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDjLD4kGOXiJFcW68p1RUhvfAZhXeySU2mtCwR113Bayg&oe=6754BBCC&_nc_sid=8b3546",
                                                                "username": "trueno"
                                                            },
                                                            "x": 0,
                                                            "y": 0
                                                        }
                                                    }
                                                ]
                                            },
                                            "fact_check_overall_rating": null,
                                            "fact_check_information": null,
                                            "gating_info": null,
                                            "sharing_friction_info": {
                                                "should_have_sharing_friction": false,
                                                "bloks_app_url": null
                                            },
                                            "media_overlay_info": null,
                                            "media_preview": "ACIqoQ3bKcr07g1YuJ45MPk5I2lf1/T9aqm2kt/vLlfUcj/P1xSvtc7lwAO3p+FIZXLDPHSrSAum5sAE7c45Hofz4qkwwcVpREKgU+lMCcTKBjk470VFiioGPjuWHSqt3NtOVVcHqR6/hR5bJwwP1xgH+dWfJVRnkg8YOO/+FNB0MqVi+BjBpVuSTz7VYhi3y7PZhn8CM1SS3d38sD5hnrx0607iaNMSLiiovsUv95P++v8A61FK6AkS8kbA2hj6USXbngoFweSOo/CqsZwAR13L/WnuoLEkDkmhIdyswIZjnnrx71BkhsnOa0TwOOOVqvgEEnk7jzTEV99FSYHpRQB//9k=",
                                            "owner": {
                                                "id": "25025320",
                                                "username": "instagram"
                                            },
                                            "is_video": true,
                                            "has_upcoming_event": false,
                                            "accessibility_caption": null,
                                            "dash_info": {
                                                "is_dash_eligible": true,
                                                "video_dash_manifest": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<MPD xmlns=\"urn:mpeg:dash:schema:mpd:2011\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"urn:mpeg:dash:schema:mpd:2011 DASH-MPD.xsd\" profiles=\"urn:mpeg:dash:profile:isoff-on-demand:2011\" minBufferTime=\"PT2S\" type=\"static\" mediaPresentationDuration=\"PT3.919933S\" FBManifestIdentifier=\"FgAYEnIyZXZldnA5LXIxZ2VuMnZwORmGypbQ0MayowH6qeiNxMnyAZ6VpuGqk5sDzuy6k5u+4wPC3a6Euqz3A/LP1+iW7d0E2rqOx+yRggi4jfvHz6rZHSIYGGRhc2hfbG5faGVhYWNfdmJyM19hdWRpbwA=\"><Period id=\"0\" duration=\"PT3.919933S\"><AdaptationSet id=\"0\" contentType=\"video\" frameRate=\"19184/800\" subsegmentAlignment=\"true\" par=\"4:5\" FBUnifiedUploadResolutionMos=\"360:76.4\"><Representation id=\"904130714715471vd\" bandwidth=\"103746\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q30\" FBContentLength=\"50835\" FBPlaybackResolutionMos=\"0:100,360:48.7,480:45.2,720:43.4,1080:44.3\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:78.4,480:72,720:61.6,1080:51.2\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBDefaultQuality=\"1\" FBQualityClass=\"hd\" FBQualityLabel=\"270p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQOxYHZxYS_NMMi8srsZ9tgneiL_CHjhRSxPCvUOa9xcAFy23L7i-JT4tMJqHiUpaiVB61SUWfLArLq07qjlgcI-.mp4?strext=1&amp;_nc_cat=110&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=tpwSLsZRGYMQ7kNvgFoPY3w&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTMwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYBQO9yPS2lBPq4BFTt-AZAco4bkThLCpX5cgSOD158cbw&amp;oe=6754B7CF</BaseURL><SegmentBase indexRange=\"818-861\" timescale=\"19184\" FBMinimumPrefetchRange=\"862-8325\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"862-20686\" FBFirstSegmentRange=\"862-50834\" FBFirstSegmentDuration=\"3919\" FBPrefetchSegmentRange=\"862-50834\" FBPrefetchSegmentDuration=\"3919\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"1332284737909753v\" bandwidth=\"127394\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q40\" FBContentLength=\"62422\" FBPlaybackResolutionMos=\"0:100,360:54.5,480:51.1,720:48.3,1080:48.8\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:82.6,480:76.9,720:67.3,1080:57.1\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"360p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQPHrwrrI2a7KorSJsOONEiXyL1X4wVTJ7sbOApXmWcrM0Gq44xr52gs-zu_NRzJVtvWyaoaaqXaJRm4jEmlECtp.mp4?strext=1&amp;_nc_cat=104&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=L-6vCzsCWPMQ7kNvgFUmHkK&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTQwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYCyBLzS_CPHM2-3TE-rnbyVSi5CXyCZ1tx12pBgRbdixw&amp;oe=6754A415</BaseURL><SegmentBase indexRange=\"818-861\" timescale=\"19184\" FBMinimumPrefetchRange=\"862-9552\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"862-24532\" FBFirstSegmentRange=\"862-62421\" FBFirstSegmentDuration=\"3919\" FBPrefetchSegmentRange=\"862-62421\" FBPrefetchSegmentDuration=\"3919\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"8359219627516764v\" bandwidth=\"200950\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q50\" FBContentLength=\"98464\" FBPlaybackResolutionMos=\"0:100,360:67.5,480:63.8,720:60.2,1080:59.3\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:90,480:86.1,720:78.2,1080:69.8\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"480p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQNl9TFQUlbAj3h-dhdOFhZqcMGnUqnKz6w2nBvUerK2yGlP-xGaeNmyHEL582daSEZMAhvJWj6YxX4smwAsAvli.mp4?strext=1&amp;_nc_cat=106&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=g4Zed7Y4ymMQ7kNvgHfV7Cr&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTUwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYBqEtWObZDkqOvipgVCxMehpJvBY2tGJPeuKSrA_l3MNQ&amp;oe=6754C273</BaseURL><SegmentBase indexRange=\"818-861\" timescale=\"19184\" FBMinimumPrefetchRange=\"862-12915\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"862-36162\" FBFirstSegmentRange=\"862-98463\" FBFirstSegmentDuration=\"3919\" FBPrefetchSegmentRange=\"862-98463\" FBPrefetchSegmentDuration=\"3919\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"359309263898021v\" bandwidth=\"309788\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q60\" FBContentLength=\"151794\" FBPlaybackResolutionMos=\"0:100,360:76.1,480:72.9,720:69.1,1080:67.4\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:94.9,480:92.3,720:86.9,1080:80.3\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"540p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQNV7CLys2Yh4hm4Ypdviyne7bijebg6q9W8rVyUPFWlXphbDldqmGMi38ZhalWpONVKr2XWHgU3GYzY_ztH-An4.mp4?strext=1&amp;_nc_cat=111&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=oma98V639-gQ7kNvgFiua8V&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTYwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYBz5nu6OT64432JjChcJi-UHJOZGNAipLHncjsZOPv4bw&amp;oe=6754C4B4</BaseURL><SegmentBase indexRange=\"818-861\" timescale=\"19184\" FBMinimumPrefetchRange=\"862-17463\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"862-52895\" FBFirstSegmentRange=\"862-151793\" FBFirstSegmentDuration=\"3919\" FBPrefetchSegmentRange=\"862-151793\" FBPrefetchSegmentDuration=\"3919\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"1063197028604711v\" bandwidth=\"447556\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q70\" FBContentLength=\"219299\" FBPlaybackResolutionMos=\"0:100,360:82.1,480:78.1,720:74.6,1080:72.6\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:97.4,480:95.8,720:91.9,1080:86.7\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"640p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQP2WX5EkbD6UAkkqplPuEWC2VM5XA5l2WGo_BOoHPZHRYRcfBordpzQZcfXzz0sYOsoCx9Hsb582rABy49XSBSC.mp4?strext=1&amp;_nc_cat=105&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=BcWqyy6EIwAQ7kNvgFuttUC&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTcwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYB_A-jmHReM8DSa_lmtzBWHI_95Bzy2MA_KL6K6S56qWQ&amp;oe=6754BDB6</BaseURL><SegmentBase indexRange=\"818-861\" timescale=\"19184\" FBMinimumPrefetchRange=\"862-22458\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"862-72969\" FBFirstSegmentRange=\"862-219298\" FBFirstSegmentDuration=\"3919\" FBPrefetchSegmentRange=\"862-219298\" FBPrefetchSegmentDuration=\"3919\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"2256504488054445v\" bandwidth=\"615461\" codecs=\"vp09.00.31.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q80\" FBContentLength=\"301571\" FBPlaybackResolutionMos=\"0:100,360:85.8,480:82.4,720:78.1,1080:76\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:98.33,480:97.6,720:94.9,1080:90.7\" FBAbrPolicyTags=\"\" width=\"720\" height=\"900\" FBQualityClass=\"hd\" FBQualityLabel=\"720p\"><BaseURL>https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQMEtIsvQboa_4ghsDgzsx1j-KwQh1NkOORv1wEQDAcY2dNugrnErIyLICDI2v2xhsw8kcfL9ktycvaSeSgAi0OO.mp4?strext=1&amp;_nc_cat=108&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-1.cdninstagram.com&amp;_nc_ohc=Hjen8ffSaDkQ7kNvgFsB-lk&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTgwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYAuYLlelo0k2cSr-5pK5pZtE9beiKIkOWJ9-bm4tZhLdA&amp;oe=6754C3E1</BaseURL><SegmentBase indexRange=\"818-861\" timescale=\"19184\" FBMinimumPrefetchRange=\"862-26659\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"862-95310\" FBFirstSegmentRange=\"862-301570\" FBFirstSegmentDuration=\"3919\" FBPrefetchSegmentRange=\"862-301570\" FBPrefetchSegmentDuration=\"3919\"><Initialization range=\"0-817\"/></SegmentBase></Representation><Representation id=\"533426899585661v\" bandwidth=\"872372\" codecs=\"vp09.00.40.08.00.01.01.01.00\" mimeType=\"video/mp4\" sar=\"1:1\" FBEncodingTag=\"dash_r2evevp9-r1gen2vp9_q90\" FBContentLength=\"427455\" FBPlaybackResolutionMos=\"0:100,360:88.5,480:85.6,720:82,1080:79.8\" FBPlaybackResolutionMosConfidenceLevel=\"high\" FBPlaybackResolutionCsvqm=\"0:100,360:98.61,480:98.15,720:96.6,1080:93.9\" FBAbrPolicyTags=\"avoid_on_cellular,avoid_on_cellular_intentional\" width=\"1080\" height=\"1350\" FBQualityClass=\"hd\" FBQualityLabel=\"1080p\"><BaseURL>https://scontent-atl3-2.cdninstagram.com/o1/v/t16/f2/m69/AQOq-eo6TTACdBQX1D3FvLDZu2WnmeUezJhSs3Chfdh9paIkkJPI6tnm-_to0x3G1m7MsC7qGTzPoSEPeAh3V0M4.mp4?strext=1&amp;_nc_cat=102&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-2.cdninstagram.com&amp;_nc_ohc=FGc43QtHMLYQ7kNvgF7Jw-x&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9yMmV2ZXZwOS1yMWdlbjJ2cDlfcTkwIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYDY8ROngm5ybFx4Nzpdl3xiX-R73ngjEV88uEF9H-35NQ&amp;oe=67549E83</BaseURL><SegmentBase indexRange=\"818-861\" timescale=\"19184\" FBMinimumPrefetchRange=\"862-35870\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"862-134995\" FBFirstSegmentRange=\"862-427454\" FBFirstSegmentDuration=\"3919\" FBPrefetchSegmentRange=\"862-427454\" FBPrefetchSegmentDuration=\"3919\"><Initialization range=\"0-817\"/></SegmentBase></Representation></AdaptationSet><AdaptationSet id=\"1\" contentType=\"audio\" subsegmentStartsWithSAP=\"1\" subsegmentAlignment=\"true\"><Representation id=\"1106872400992097ad\" bandwidth=\"83944\" codecs=\"mp4a.40.5\" mimeType=\"audio/mp4\" FBAvgBitrate=\"83944\" audioSamplingRate=\"44100\" FBEncodingTag=\"dash_ln_heaac_vbr3_audio\" FBContentLength=\"41797\" FBAbrPolicyTags=\"\" FBDefaultQuality=\"1\"><AudioChannelConfiguration schemeIdUri=\"urn:mpeg:dash:23003:3:audio_channel_configuration:2011\" value=\"2\"/><BaseURL>https://scontent-atl3-3.cdninstagram.com/o1/v/t16/f2/m69/AQNeExEDBsr2_6yNJa-bFQ8iLUf4HSue8q517Ru1is0hpW7xj-evdCZzRPBA2F3RUKHB36_19qEGwUWOoogr0txF.mp4?strext=1&amp;_nc_cat=109&amp;_nc_sid=9ca052&amp;_nc_ht=scontent-atl3-3.cdninstagram.com&amp;_nc_ohc=FExE2HaI64MQ7kNvgFMG5ej&amp;efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNhcm91c2VsX2l0ZW0uYzItQzMuZGFzaF9sbl9oZWFhY192YnIzX2F1ZGlvIiwidmlkZW9faWQiOm51bGwsImNsaWVudF9uYW1lIjoiaWciLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&amp;ccb=9-4&amp;oh=00_AYBVPvhiV_EkY8pO5vIMWgw8zEZZ9orLVr9XBS88N8BfrA&amp;oe=6754926E</BaseURL><SegmentBase indexRange=\"824-879\" timescale=\"44100\" FBMinimumPrefetchRange=\"880-1223\" FBPartialPrefetchDuration=\"1000\" FBPartialPrefetchRange=\"880-11383\" FBFirstSegmentRange=\"880-22840\" FBFirstSegmentDuration=\"2021\" FBSecondSegmentRange=\"22841-41796\" FBPrefetchSegmentRange=\"880-41796\" FBPrefetchSegmentDuration=\"3898\"><Initialization range=\"0-823\"/></SegmentBase></Representation></AdaptationSet></Period></MPD>\n",
                                                "number_of_qualities": 7
                                            },
                                            "has_audio": false,
                                            "tracking_token": "eyJ2ZXJzaW9uIjo1LCJwYXlsb2FkIjp7ImlzX2FuYWx5dGljc190cmFja2VkIjp0cnVlLCJ1dWlkIjoiYmM1MmYwZDVhMzU1NDI1Y2ExODI0ZWFjOGNmZTRlNzUzNTAyMDY5ODU2ODk0NDA3NDg3In0sInNpZ25hdHVyZSI6IiJ9",
                                            "video_url": "https://scontent-atl3-1.cdninstagram.com/o1/v/t16/f2/m69/AQN9OrwU4X_GoDBHNXkFnHkP6YBPLIEWG6DkO_xIefbIaLRXAU7MDssLPnRYFnsu-LlubvSMLpfoy3nFUhzqeVQ8.mp4?stp=dst-mp4&efg=eyJxZV9ncm91cHMiOiJbXCJpZ193ZWJfZGVsaXZlcnlfdnRzX290ZlwiXSIsInZlbmNvZGVfdGFnIjoidnRzX3ZvZF91cmxnZW4uY2Fyb3VzZWxfaXRlbS5jMi4xMDgwLmJhc2VsaW5lIn0&_nc_cat=106&vs=880871674195965_2631933841&_nc_vs=HBksFQIYOnBhc3N0aHJvdWdoX2V2ZXJzdG9yZS9HR2VQTWdjR1VQbF9ZdlFCQUh5cWFwM1JMaTlFYnBSMUFBQUYVAALIAQAVAhg6cGFzc3Rocm91Z2hfZXZlcnN0b3JlL0dENU0yQnNFa2ltOG83TUJBRkRXcGNzVnpva3Nia1lMQUFBRhUCAsgBACgAGAAbABUAACbM873AnL%2FGPxUCKAJDMywXQA%2BwIMSbpeMYFmRhc2hfYmFzZWxpbmVfMTA4MHBfdjERAHXuBwA%3D&ccb=9-4&oh=00_AYA6QeEBxoL9CMawbJEuHf4FFQswmfV78BTYTSQcCXeDuw&oe=6750D377&_nc_sid=8b3546",
                                            "video_view_count": 98788
                                        }
                                    },
                                    {
                                        "node": {
                                            "__typename": "GraphImage",
                                            "id": "3502071601598933223",
                                            "shortcode": "DCZ25EfSajn",
                                            "dimensions": {
                                                "height": 1348,
                                                "width": 1080
                                            },
                                            "display_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.29350-15/466775560_412816185099754_7344076566787187923_n.jpg?stp=dst-jpg_e35_p1080x1080&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=110&_nc_ohc=AesiBR06MK8Q7kNvgFgc9c0&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAm70OcvaYSTWDwQpSfbKMu64e6bDmMPDPDBYqaLPVu8g&oe=6754AA0C&_nc_sid=8b3546",
                                            "edge_media_to_tagged_user": {
                                                "edges": [
                                                    {
                                                        "node": {
                                                            "user": {
                                                                "full_name": "TR1 ⛈",
                                                                "followed_by_viewer": false,
                                                                "id": "4357961863",
                                                                "is_verified": true,
                                                                "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/443836249_472257882133285_6110715878806547766_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=HRRE1q0jfSoQ7kNvgEOjHsX&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDjLD4kGOXiJFcW68p1RUhvfAZhXeySU2mtCwR113Bayg&oe=6754BBCC&_nc_sid=8b3546",
                                                                "username": "trueno"
                                                            },
                                                            "x": 0.49194232400000004,
                                                            "y": 0.8600508906000001
                                                        }
                                                    }
                                                ]
                                            },
                                            "fact_check_overall_rating": null,
                                            "fact_check_information": null,
                                            "gating_info": null,
                                            "sharing_friction_info": {
                                                "should_have_sharing_friction": false,
                                                "bloks_app_url": null
                                            },
                                            "media_overlay_info": null,
                                            "media_preview": "ACIqvVCZNqZHJ7fWpazmuVTaOCSen+f60iVuW4pGY4cAH2OfSpqoRz7pdmMYHfGc5+v+Jq9SRUtHYXmilzRTJKV5P5MeRwzcD+p/CsAHNaep5+X0Gf1qjAIznzPTjrjPvjmnsOOo4Io5JP1GDz+f5GteylMkfzckHGaynZNhCk47D/P9au6aflP1/pQtQmrGpRRRQRczL0ZXmsYVq3fQ/wCf4ayqSd0XazsvIXHGa2rJcKDWKOoroYOg+lURPoTZopKKCD//2Q==",
                                            "owner": {
                                                "id": "25025320",
                                                "username": "instagram"
                                            },
                                            "is_video": false,
                                            "has_upcoming_event": false,
                                            "accessibility_caption": "A person holding an award."
                                        }
                                    }
                                ]
                            }
                        }
                    },
                    {
                        "node": {
                            "__typename": "GraphSidecar",
                            "id": "3501993191795288936",
                            "shortcode": "DCZlEDqy2to",
                            "dimensions": {
                                "height": 1080,
                                "width": 1080
                            },
                            "display_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.29350-15/467036112_615105054173360_4047930205941473721_n.jpg?stp=dst-jpg_e35_s1080x1080&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=G7_NvTknmJsQ7kNvgFDeQ63&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYALYS55tluQM0KrY7p8stHGdFHcueeoFzty1WNItW1UKw&oe=6754C419&_nc_sid=8b3546",
                            "edge_media_to_tagged_user": {
                                "edges": [
                                    {
                                        "node": {
                                            "user": {
                                                "full_name": "🎀 your favorite girly page ♡",
                                                "followed_by_viewer": false,
                                                "id": "63942437706",
                                                "is_verified": false,
                                                "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/468847620_1124139249430435_2201988780750413167_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=fAY_j27axCkQ7kNvgF11Vrl&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYB8RxdZqFvTl6G8c9uZgWRvH93Tp67MFsvA4VG5ZPUarw&oe=67549102&_nc_sid=8b3546",
                                                "username": "roseberrylemonade"
                                            },
                                            "x": 0.5004240882000001,
                                            "y": 0.8668363020000001
                                        }
                                    }
                                ]
                            },
                            "fact_check_overall_rating": null,
                            "fact_check_information": null,
                            "gating_info": null,
                            "sharing_friction_info": {
                                "should_have_sharing_friction": false,
                                "bloks_app_url": null
                            },
                            "media_overlay_info": null,
                            "media_preview": null,
                            "owner": {
                                "id": "25025320",
                                "username": "instagram"
                            },
                            "is_video": false,
                            "has_upcoming_event": false,
                            "accessibility_caption": "Two dogs in bed with pink face masks on.",
                            "edge_media_to_caption": {
                                "edges": [
                                    {
                                        "node": {
                                            "text": "The best part of memes: sending them to your bestie 🫶 \n\n“Friendship is at the core of everything I create,” says meme creator @roseberrylemonade (Lynn Laney). “My content is a celebration of the small, meaningful moments I share with my friends — the laughter, the late-night talks, the support we offer each other during tough times.” \n \nToday on National Meme Day, Lynn is celebrating how universally relatable those moments are. “It reminds us that we’re never really alone, and that the people in our lives are here to lift us up.” ✨\n\nMemes by @roseberrylemonade"
                                        }
                                    }
                                ]
                            },
                            "edge_media_to_comment": {
                                "count": 3334
                            },
                            "comments_disabled": false,
                            "taken_at_timestamp": 1731690142,
                            "edge_liked_by": {
                                "count": 196071
                            },
                            "edge_media_preview_like": {
                                "count": 196071
                            },
                            "location": null,
                            "nft_asset_info": null,
                            "thumbnail_src": "https://scontent-atl3-1.cdninstagram.com/v/t51.29350-15/467036112_615105054173360_4047930205941473721_n.jpg?stp=dst-jpg_e35_s640x640_sh0.08&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=G7_NvTknmJsQ7kNvgFDeQ63&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBC4dwRFXy28C2zHX4AsQv8HYqrM-glNuevleJ-a4G8Ug&oe=6754C419&_nc_sid=8b3546",
                            "thumbnail_resources": [
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.29350-15/467036112_615105054173360_4047930205941473721_n.jpg?stp=dst-jpg_e35_s150x150&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xMTcweDExNzAuc2RyLmYyOTM1MC5kZWZhdWx0X2ltYWdlIn0&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=G7_NvTknmJsQ7kNvgFDeQ63&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBbmVu6Q6miqldFRpa3OoGmh59UjbGiKvra1u4IhnyfRg&oe=6754C419&_nc_sid=8b3546",
                                    "config_width": 150,
                                    "config_height": 150
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.29350-15/467036112_615105054173360_4047930205941473721_n.jpg?stp=dst-jpg_e35_s240x240&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xMTcweDExNzAuc2RyLmYyOTM1MC5kZWZhdWx0X2ltYWdlIn0&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=G7_NvTknmJsQ7kNvgFDeQ63&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYD2f7n3xFXYX4sg5IZYCv9fnRtWb1pnC1aO2XYJNsK0IA&oe=6754C419&_nc_sid=8b3546",
                                    "config_width": 240,
                                    "config_height": 240
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.29350-15/467036112_615105054173360_4047930205941473721_n.jpg?stp=dst-jpg_e35_s320x320&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xMTcweDExNzAuc2RyLmYyOTM1MC5kZWZhdWx0X2ltYWdlIn0&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=G7_NvTknmJsQ7kNvgFDeQ63&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYADjMnYW66L2RtRUhpWqBRvf3Rqe6pbz1-VF3gbXh36VQ&oe=6754C419&_nc_sid=8b3546",
                                    "config_width": 320,
                                    "config_height": 320
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.29350-15/467036112_615105054173360_4047930205941473721_n.jpg?stp=dst-jpg_e35_s480x480&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xMTcweDExNzAuc2RyLmYyOTM1MC5kZWZhdWx0X2ltYWdlIn0&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=G7_NvTknmJsQ7kNvgFDeQ63&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDwUTE5ctVuktaxRSDB-pEWxkPhJRTqXfty-XjvHMUA1w&oe=6754C419&_nc_sid=8b3546",
                                    "config_width": 480,
                                    "config_height": 480
                                },
                                {
                                    "src": "https://scontent-atl3-1.cdninstagram.com/v/t51.29350-15/467036112_615105054173360_4047930205941473721_n.jpg?stp=dst-jpg_e35_s640x640_sh0.08&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xMTcweDExNzAuc2RyLmYyOTM1MC5kZWZhdWx0X2ltYWdlIn0&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=G7_NvTknmJsQ7kNvgFDeQ63&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBC4dwRFXy28C2zHX4AsQv8HYqrM-glNuevleJ-a4G8Ug&oe=6754C419&_nc_sid=8b3546",
                                    "config_width": 640,
                                    "config_height": 640
                                }
                            ],
                            "coauthor_producers": [
                                {
                                    "id": "63942437706",
                                    "is_verified": false,
                                    "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/468847620_1124139249430435_2201988780750413167_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=fAY_j27axCkQ7kNvgF11Vrl&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYB8RxdZqFvTl6G8c9uZgWRvH93Tp67MFsvA4VG5ZPUarw&oe=67549102&_nc_sid=8b3546",
                                    "username": "roseberrylemonade"
                                }
                            ],
                            "pinned_for_users": [
                                {
                                    "id": "63942437706",
                                    "is_verified": false,
                                    "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/468847620_1124139249430435_2201988780750413167_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=fAY_j27axCkQ7kNvgF11Vrl&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYB8RxdZqFvTl6G8c9uZgWRvH93Tp67MFsvA4VG5ZPUarw&oe=67549102&_nc_sid=8b3546",
                                    "username": "roseberrylemonade"
                                }
                            ],
                            "viewer_can_reshare": true,
                            "like_and_view_counts_disabled": false,
                            "edge_sidecar_to_children": {
                                "edges": [
                                    {
                                        "node": {
                                            "__typename": "GraphImage",
                                            "id": "3501993181745770188",
                                            "shortcode": "DCZlD6Ty-7M",
                                            "dimensions": {
                                                "height": 1080,
                                                "width": 1080
                                            },
                                            "display_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.29350-15/467036112_615105054173360_4047930205941473721_n.jpg?stp=dst-jpg_e35_s1080x1080&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=G7_NvTknmJsQ7kNvgFDeQ63&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYALYS55tluQM0KrY7p8stHGdFHcueeoFzty1WNItW1UKw&oe=6754C419&_nc_sid=8b3546",
                                            "edge_media_to_tagged_user": {
                                                "edges": [
                                                    {
                                                        "node": {
                                                            "user": {
                                                                "full_name": "🎀 your favorite girly page ♡",
                                                                "followed_by_viewer": false,
                                                                "id": "63942437706",
                                                                "is_verified": false,
                                                                "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/468847620_1124139249430435_2201988780750413167_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=fAY_j27axCkQ7kNvgF11Vrl&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYB8RxdZqFvTl6G8c9uZgWRvH93Tp67MFsvA4VG5ZPUarw&oe=67549102&_nc_sid=8b3546",
                                                                "username": "roseberrylemonade"
                                                            },
                                                            "x": 0.5004240882000001,
                                                            "y": 0.8668363020000001
                                                        }
                                                    }
                                                ]
                                            },
                                            "fact_check_overall_rating": null,
                                            "fact_check_information": null,
                                            "gating_info": null,
                                            "sharing_friction_info": {
                                                "should_have_sharing_friction": false,
                                                "bloks_app_url": null
                                            },
                                            "media_overlay_info": null,
                                            "media_preview": "ACoq6MsKjXcMfNn14oNNZwuM0AOy3GW7c8frQNx/iH/fP/16aWGM9qUOBQOxImVGGO4+uMU7cKjDBulLigRHK+1S3oCazYbtpxuYbB0HORx/jWhJIF+tVJQM4wAB6UmyloJDIGfjOCc8+3B/XpTvtCuxCNkDjsRmq8XyNnoT0p6WyRjKDG45P1pXHctQPmrWaoR5HTmp9x9DTTJYrxksD1x/kUqxjG1upyan70ySnYRQlhbjGDt61K3MakVYfvTUHC/Q0rDuRICBz1PapM0rd6KAP//Z",
                                            "owner": {
                                                "id": "25025320",
                                                "username": "instagram"
                                            },
                                            "is_video": false,
                                            "has_upcoming_event": false,
                                            "accessibility_caption": "Two dogs in bed with pink face masks on."
                                        }
                                    },
                                    {
                                        "node": {
                                            "__typename": "GraphImage",
                                            "id": "3501993181745607938",
                                            "shortcode": "DCZlD6TyXUC",
                                            "dimensions": {
                                                "height": 1080,
                                                "width": 1080
                                            },
                                            "display_url": "https://scontent-atl3-2.cdninstagram.com/v/t51.29350-15/467115305_1912430849251562_344329053730363300_n.jpg?stp=dst-jpg_e35_s1080x1080&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=102&_nc_ohc=L5DPiEFzLz4Q7kNvgGRkd5w&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBVv4t5u_8NBMBfqi1BWKsnnPafx0MfXuQBZe5T8dU-lA&oe=6754A3B4&_nc_sid=8b3546",
                                            "edge_media_to_tagged_user": {
                                                "edges": [
                                                    {
                                                        "node": {
                                                            "user": {
                                                                "full_name": "🎀 your favorite girly page ♡",
                                                                "followed_by_viewer": false,
                                                                "id": "63942437706",
                                                                "is_verified": false,
                                                                "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/468847620_1124139249430435_2201988780750413167_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=fAY_j27axCkQ7kNvgF11Vrl&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYB8RxdZqFvTl6G8c9uZgWRvH93Tp67MFsvA4VG5ZPUarw&oe=67549102&_nc_sid=8b3546",
                                                                "username": "roseberrylemonade"
                                                            },
                                                            "x": 0.5199321459,
                                                            "y": 0.8659881255
                                                        }
                                                    }
                                                ]
                                            },
                                            "fact_check_overall_rating": null,
                                            "fact_check_information": null,
                                            "gating_info": null,
                                            "sharing_friction_info": {
                                                "should_have_sharing_friction": false,
                                                "bloks_app_url": null
                                            },
                                            "media_overlay_info": null,
                                            "media_preview": "ACoq6QsOnSolLDGWB9eKU5NAp2FcQF+PmHTnjv60At3Yfkf8aXFL1osFwQkD5juPrjFP3Cm7RS7KA1EqC5kMcZZfvdB9arrO4AGQT6mmtLIwxlSD1GP5VHMhjxdERbz94DnIOMjr0/zxU1pP9ojDkAHkce3f8apK77CgII5BB757UIXVQEKrj0HvTuHyNakrO82bP3lxj0pRPN/sfr/hS5kBU3+lNBNMqRelYAPBJ79aaW29aafvflTe9MCcOTR5lQmnmi4z/9k=",
                                            "owner": {
                                                "id": "25025320",
                                                "username": "instagram"
                                            },
                                            "is_video": false,
                                            "has_upcoming_event": false,
                                            "accessibility_caption": "Two people running through a field with yellow flowers."
                                        }
                                    },
                                    {
                                        "node": {
                                            "__typename": "GraphImage",
                                            "id": "3501993181896649456",
                                            "shortcode": "DCZlD6cyirw",
                                            "dimensions": {
                                                "height": 1080,
                                                "width": 1080
                                            },
                                            "display_url": "https://scontent-atl3-3.cdninstagram.com/v/t51.29350-15/467050498_1221512649146697_6115848822084944029_n.jpg?stp=dst-jpg_e35_s1080x1080_tt6&_nc_ht=scontent-atl3-3.cdninstagram.com&_nc_cat=109&_nc_ohc=2MloJ8p8PI0Q7kNvgHjN8eh&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYCZznLmpvRVtCn39GbzFN9WPibcE_G7YX4zTQ6LKLVDIQ&oe=6754AEDE&_nc_sid=8b3546",
                                            "edge_media_to_tagged_user": {
                                                "edges": [
                                                    {
                                                        "node": {
                                                            "user": {
                                                                "full_name": "🎀 your favorite girly page ♡",
                                                                "followed_by_viewer": false,
                                                                "id": "63942437706",
                                                                "is_verified": false,
                                                                "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/468847620_1124139249430435_2201988780750413167_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=fAY_j27axCkQ7kNvgF11Vrl&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYB8RxdZqFvTl6G8c9uZgWRvH93Tp67MFsvA4VG5ZPUarw&oe=67549102&_nc_sid=8b3546",
                                                                "username": "roseberrylemonade"
                                                            },
                                                            "x": 0.5046649703,
                                                            "y": 0.8524173028
                                                        }
                                                    }
                                                ]
                                            },
                                            "fact_check_overall_rating": null,
                                            "fact_check_information": null,
                                            "gating_info": null,
                                            "sharing_friction_info": {
                                                "should_have_sharing_friction": false,
                                                "bloks_app_url": null
                                            },
                                            "media_overlay_info": null,
                                            "media_preview": "ACoq6QsPWohvGMsD68UVG0oU4PHp7/59KYXJPn4+YdOeO/rQC/dh+R/xpFJIyeD6UtAh6EgfMdx9cYp24VFRQFwqrMAzDP8ADyKs1Tl5JqZAieOUMduDkd+1I0207TjPb3/z39KSHCJmqobe2e4ouM0aKajZH0p1UIj81ahcBs4YDNUKjana5NzUVV27WOec8cUmxMkg9fpWX/DUYAJo5UHMbSuqDAP60eevqPzFZSouOg/KjYvoPyp2C5//2Q==",
                                            "owner": {
                                                "id": "25025320",
                                                "username": "instagram"
                                            },
                                            "is_video": false,
                                            "has_upcoming_event": false,
                                            "accessibility_caption": "Two polar bear cubs in the snow."
                                        }
                                    },
                                    {
                                        "node": {
                                            "__typename": "GraphImage",
                                            "id": "3501993181753967970",
                                            "shortcode": "DCZlD6USQVi",
                                            "dimensions": {
                                                "height": 1080,
                                                "width": 1080
                                            },
                                            "display_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.29350-15/466998285_528994299948138_4901095257996482893_n.jpg?stp=dst-jpg_e35_s1080x1080&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=106&_nc_ohc=x6CRODNVy2cQ7kNvgERcipG&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYCBVMdMdyhbWIKF0nUzUKllj-0XBLXhxlgaQpCIemqT3w&oe=6754993A&_nc_sid=8b3546",
                                            "edge_media_to_tagged_user": {
                                                "edges": [
                                                    {
                                                        "node": {
                                                            "user": {
                                                                "full_name": "🎀 your favorite girly page ♡",
                                                                "followed_by_viewer": false,
                                                                "id": "63942437706",
                                                                "is_verified": false,
                                                                "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/468847620_1124139249430435_2201988780750413167_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=fAY_j27axCkQ7kNvgF11Vrl&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYB8RxdZqFvTl6G8c9uZgWRvH93Tp67MFsvA4VG5ZPUarw&oe=67549102&_nc_sid=8b3546",
                                                                "username": "roseberrylemonade"
                                                            },
                                                            "x": 0.5156912638,
                                                            "y": 0.8566581849
                                                        }
                                                    }
                                                ]
                                            },
                                            "fact_check_overall_rating": null,
                                            "fact_check_information": null,
                                            "gating_info": null,
                                            "sharing_friction_info": {
                                                "should_have_sharing_friction": false,
                                                "bloks_app_url": null
                                            },
                                            "media_overlay_info": null,
                                            "media_preview": "ACoq6JnBHBwfWot5H8Q6eh61BFIJBkcU40rjJfMP94dPQ9aPMPdh/wB8n/Gqkkqx9evoOtQGdsFjgY/hOc/5NK4WNJZlUfM2fwxTvtMfr+h/wrLeUFSy81U81qLjtctQzrEpByST0H+NNkunkyEGAOp74/kKhRQzgHoSBVu4kSJTEowSO3v61IytaMPM+bknoff/AOvWmRWGpwcjj3qWdgzZU5GPpzRcRZnhBOV4P86qbG9KcJ2AwefQ1Hk0DJ4f9Yv1qa+To/4H+lQw/wCsX61bvf8AV/iKOgGXRRRSGFLSUUAf/9k=",
                                            "owner": {
                                                "id": "25025320",
                                                "username": "instagram"
                                            },
                                            "is_video": false,
                                            "has_upcoming_event": false,
                                            "accessibility_caption": "Shadows of people making hearts with their fingers."
                                        }
                                    },
                                    {
                                        "node": {
                                            "__typename": "GraphImage",
                                            "id": "3501993182089521731",
                                            "shortcode": "DCZlD6oSSpD",
                                            "dimensions": {
                                                "height": 1080,
                                                "width": 1080
                                            },
                                            "display_url": "https://scontent-atl3-2.cdninstagram.com/v/t51.29350-15/466991731_451907167924013_4832187844884525909_n.jpg?stp=dst-jpg_e35_s1080x1080_tt6&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=105&_nc_ohc=hBVkqp9gxooQ7kNvgFcKoCq&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYB6P5DMXTdifcelve6fazomad5PvFKUWxksvXj9OxwH8A&oe=675499FC&_nc_sid=8b3546",
                                            "edge_media_to_tagged_user": {
                                                "edges": [
                                                    {
                                                        "node": {
                                                            "user": {
                                                                "full_name": "🎀 your favorite girly page ♡",
                                                                "followed_by_viewer": false,
                                                                "id": "63942437706",
                                                                "is_verified": false,
                                                                "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/468847620_1124139249430435_2201988780750413167_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=fAY_j27axCkQ7kNvgF11Vrl&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYB8RxdZqFvTl6G8c9uZgWRvH93Tp67MFsvA4VG5ZPUarw&oe=67549102&_nc_sid=8b3546",
                                                                "username": "roseberrylemonade"
                                                            },
                                                            "x": 0.5089058524,
                                                            "y": 0.8549618321
                                                        }
                                                    }
                                                ]
                                            },
                                            "fact_check_overall_rating": null,
                                            "fact_check_information": null,
                                            "gating_info": null,
                                            "sharing_friction_info": {
                                                "should_have_sharing_friction": false,
                                                "bloks_app_url": null
                                            },
                                            "media_overlay_info": null,
                                            "media_preview": "ACoq2zfQ7c7uD0OD/hUK3sfXzAR3+U1jNyqgds5pvlntSuM2/tycDzB05+U/n/Knrdq3O8Yxk/KR/OsLZSnrjj6UrhY3Y7yIDDPuPrgj+lP+2wj+L9D/AIVzwI608nmi4DSjdRg1GJCDgda2Cimq7ryysBgjI/8ArGpTHYz92OR34/H1psu5GAHfkf4Uy4G3DL3AOPr/AIH+dWioljJkzngjHbA6D/PPWqAhWQN06nt3H1p+Kdbp5nzZGSOfXjuan8k1LYWLxyelROpIPHbpTh1/z6UDpWZZlToRgYOdvQeo61etl+QZ5Hb1qzGPnB9qiHBb6/1qnqhDkQR5xgA9RgZ/OnYHpTG5WnjpUjP/2Q==",
                                            "owner": {
                                                "id": "25025320",
                                                "username": "instagram"
                                            },
                                            "is_video": false,
                                            "has_upcoming_event": false,
                                            "accessibility_caption": "Two donkeys eating hay."
                                        }
                                    }
                                ]
                            }
                        }
                    }
                ]
            },
            "edge_saved_media": {
                "count": 0,
                "page_info": {
                    "has_next_page": false,
                    "end_cursor": null
                },
                "edges": []
            },
            "edge_media_collections": {
                "count": 0,
                "page_info": {
                    "has_next_page": false,
                    "end_cursor": null
                },
                "edges": []
            },
            "edge_related_profiles": {
                "edges": [
                    {
                        "node": {
                            "id": "8663171404",
                            "full_name": "Instagram’s @Creators",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/119646629_642282316704510_1723953247090248138_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=v5_DxTDXxJgQ7kNvgEtwkIc&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYCAHFbl9WTTrrmuivz_q-2p6h3TVLQ9KQ1tDXnVI_4eyQ&oe=67549729&_nc_sid=8b3546",
                            "username": "creators"
                        }
                    },
                    {
                        "node": {
                            "id": "628480450",
                            "full_name": "Shah Rukh Khan",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/366511099_854249308975102_1258044491966579690_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=kqlIzwFRZw8Q7kNvgHhx4Sm&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYCLgJoWfm8HUQh6UJ1VmgL2RQ8Q5XDVy3pqY0rQvYInmQ&oe=67549F6C&_nc_sid=8b3546",
                            "username": "iamsrk"
                        }
                    },
                    {
                        "node": {
                            "id": "259925762",
                            "full_name": "Alia Bhatt 💛",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/464538274_1601713827416466_8257661166762653400_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=lGtp5yVg3IEQ7kNvgEtAjyK&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYApmTWFxo2nu0JIYlji_CYnWzbFbyn3hkB4FfX8TdybDQ&oe=6754BECA&_nc_sid=8b3546",
                            "username": "aliaabhatt"
                        }
                    },
                    {
                        "node": {
                            "id": "3250708946",
                            "full_name": "Elvish Raosahab",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/449664239_1048729143481779_1981270344812862766_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=VkSIFHlIwAQQ7kNvgGzE_3S&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYARYVA8TMzZDtZIU5U4WDxPi_MG_njBnihxS4er4fcAbA&oe=6754C886&_nc_sid=8b3546",
                            "username": "elvish_yadav"
                        }
                    },
                    {
                        "node": {
                            "id": "2493037651",
                            "full_name": "Bhuvan Bam",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/117754145_304438314002037_858894047041076878_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=woIcV2MfxrMQ7kNvgE1QjdF&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYC20H1xzp5qFdbZ7vLgnhuV_Y-RugvreuDMTemum7JRcw&oe=6754C822&_nc_sid=8b3546",
                            "username": "bhuvan.bam22"
                        }
                    },
                    {
                        "node": {
                            "id": "26669533",
                            "full_name": "Neymar Jr",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/449145924_360354716767223_4217895415241173090_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=mQnOlMGk9fMQ7kNvgHK1WR5&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAWrxB2JCCt4Re7BcRuAl9anb3PFKqqM5_fxNAWEzN3kQ&oe=67549E09&_nc_sid=8b3546",
                            "username": "neymarjr"
                        }
                    },
                    {
                        "node": {
                            "id": "550150293",
                            "full_name": "Shahid Kapoor",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/456890828_871922194838579_6805230517646733711_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=7GC2AlJRu24Q7kNvgGAC759&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYCJSkixoKLwXbF9jqIS1f3L8pcG2BVBnY3CZ3qjioFgNg&oe=6754C65F&_nc_sid=8b3546",
                            "username": "shahidkapoor"
                        }
                    },
                    {
                        "node": {
                            "id": "248312442",
                            "full_name": "Younes Zarou",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/120720768_345665359852193_8736856106012305951_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=Fya8IQpQVxIQ7kNvgHcjI9X&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYCEPX7PD-vkuRb9ydeHhGEOAXwXvf4Qkorlp8qyPQVmig&oe=6754A7DB&_nc_sid=8b3546",
                            "username": "youneszarou"
                        }
                    },
                    {
                        "node": {
                            "id": "407964088",
                            "full_name": "KATY PERRY",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/450376836_499121602505977_7808961802809383936_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=VqoyTxMQjooQ7kNvgFkrQJ_&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAjMDCqjE-1nuUrITbEZN1JhijrtEL0V_bbA8USH1Zn2g&oe=6754998D&_nc_sid=8b3546",
                            "username": "katyperry"
                        }
                    },
                    {
                        "node": {
                            "id": "1962023419",
                            "full_name": "Sachin Tendulkar",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/358768461_3390909287831163_5567728346172820606_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=KPdA2DaFxZQQ7kNvgFgDBse&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYB7MIoiJ7BFx1_Y94EQbSst8tg__fZJwDzIqhHPcECkHA&oe=6754C156&_nc_sid=8b3546",
                            "username": "sachintendulkar"
                        }
                    },
                    {
                        "node": {
                            "id": "456689389",
                            "full_name": "KARTIK AARYAN",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/463296190_913352324015136_2966496389299823388_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=0cxsJSeRzlcQ7kNvgFBraES&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYB-JpwJgSO7-u0bsaTwA3igKtjw8Os_p5vcuflcVb74LA&oe=6754BB71&_nc_sid=8b3546",
                            "username": "kartikaaryan"
                        }
                    },
                    {
                        "node": {
                            "id": "8012033210",
                            "full_name": "LISA",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/452728789_7992596010855640_9098153361134866365_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=ko6NnbRD-vMQ7kNvgEi0hYf&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBqo8OvNDlT4wCKdvWFytnZqgckuQsnFlZXl8IMVrXSjw&oe=6754BAB3&_nc_sid=8b3546",
                            "username": "lalalalisa_m"
                        }
                    },
                    {
                        "node": {
                            "id": "259220806",
                            "full_name": "9GAG: Go Fun The World",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/370567515_318435303994381_993276187258308098_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=PZ1-M0w3d1IQ7kNvgESQP3P&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYC-LcbmG6x8HHrkieWKVFGwIN-vlSr5grwL7BT-qh9HcQ&oe=67549DBC&_nc_sid=8b3546",
                            "username": "9gag"
                        }
                    },
                    {
                        "node": {
                            "id": "3439002676",
                            "full_name": "Millie Bobby Brown",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/327491797_1244847992906692_4663719201043342227_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=g0aOYm8-PucQ7kNvgGFNL7N&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAAJvEYMojg2lg66rAVbzd8pkKv5RwlwlMxbFBHuAIDjg&oe=675494AD&_nc_sid=8b3546",
                            "username": "milliebobbybrown"
                        }
                    },
                    {
                        "node": {
                            "id": "181436401",
                            "full_name": "Instant Bollywood",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/449699279_1422655125100006_6872418739321432167_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=3hEaKMHqXXkQ7kNvgFggNV6&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBzN6yrsv7q7M1KueVAkWJlMDWiB7NwAF6mTHUBvBvDrw&oe=6754A57E&_nc_sid=8b3546",
                            "username": "instantbollywood"
                        }
                    },
                    {
                        "node": {
                            "id": "210862092",
                            "full_name": "Dhruv Rathee",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/38540802_494678747626293_4673257651675594752_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=K2SL8uPsnWEQ7kNvgGJVG1E&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYCtJd4fDhXnBasFefZ-5ajS6hzUaHKr6UH4XFwvhVOdfw&oe=6754B2AC&_nc_sid=8b3546",
                            "username": "dhruvrathee"
                        }
                    },
                    {
                        "node": {
                            "id": "56569236340",
                            "full_name": "Bhajan Marg Official",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/345017002_198438626342966_4565261707911869280_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=7AQ7K5Bv1d8Q7kNvgFpsCoR&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYCgBXxYUGB88vCl3mhylZ-gRuD6AznfhPubbp96nq0jTw&oe=6754B0A5&_nc_sid=8b3546",
                            "username": "bhajanmarg_official"
                        }
                    },
                    {
                        "node": {
                            "id": "1506896522",
                            "full_name": "Ranveer Singh",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/457867757_846024494331760_6122840647561871668_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=nY_6eJWWbD4Q7kNvgFkj8TW&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYCG7AzkyS1nU3iU7fQEWxny2gU-1LEnXHCJs4BU_Ky2sQ&oe=67549E75&_nc_sid=8b3546",
                            "username": "ranveersingh"
                        }
                    },
                    {
                        "node": {
                            "id": "18428658",
                            "full_name": "Kim Kardashian",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/314397231_636674618202803_1672434101401302981_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=tiUwwFag7FYQ7kNvgG_g62v&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBFBLwh65Kbnij5UEvQtYcLdysnfSlm_-bh8Qj47eZB3A&oe=675490DE&_nc_sid=8b3546",
                            "username": "kimkardashian"
                        }
                    },
                    {
                        "node": {
                            "id": "277509338",
                            "full_name": "Guru Randhawa",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/450367123_1494006801209332_1719712273189628640_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=f0RhVbKxW7wQ7kNvgHG7qRr&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAbb2f8vO03uQm6_ljWe6NVkGc6H2QvdAiYjR30i4uMSg&oe=6754B495&_nc_sid=8b3546",
                            "username": "gururandhawa"
                        }
                    },
                    {
                        "node": {
                            "id": "510093911",
                            "full_name": "disha patani (paatni) 🦋",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/432159744_425237043297302_3857508968798805701_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=bKWttgIAF84Q7kNvgElU0BM&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDqMIgoEQV6VQKImMmnLNTpxdjhDjSuO1uFBJ_L_ziWRw&oe=67549AF6&_nc_sid=8b3546",
                            "username": "dishapatani"
                        }
                    },
                    {
                        "node": {
                            "id": "314761038",
                            "full_name": "Amitabh Bachchan",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/11326955_555464427941510_1950201812_a.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=fO1RAucNe98Q7kNvgEXDMBG&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYCRnBezxQetqcpzY1rMPa3mN_MZaY2Z0qLotQyTgY9j0A&oe=6754C8D6&_nc_sid=8b3546",
                            "username": "amitabhbachchan"
                        }
                    },
                    {
                        "node": {
                            "id": "2302078745",
                            "full_name": "FAISAL SHAIKH",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/449624389_1466960630856558_1882676435654516440_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=CGZnk2wsSdIQ7kNvgE_pvkT&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBeuHMFsQCJRMPAY0ZdxPhdzn19kxznbyg1mUaO14H0Jg&oe=6754C26F&_nc_sid=8b3546",
                            "username": "mr_faisu_07"
                        }
                    },
                    {
                        "node": {
                            "id": "5844880699",
                            "full_name": "MC STΔN 💔",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/460301043_540291191785855_9121109864137969123_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=VrAOiK8mkHQQ7kNvgHFHVYZ&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYCs219OH-KBKJ0RrRX_dDcg4t77OMz77xx7zEZFhQCn-g&oe=67549757&_nc_sid=8b3546",
                            "username": "m___c___stan"
                        }
                    },
                    {
                        "node": {
                            "id": "1060870984",
                            "full_name": "Tamannaah Bhatia",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/453498039_496253672899083_5512805518227434987_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=aMh_tfK5LWwQ7kNvgGQo1Gp&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYB6wQEGw48wPTuPgNbVNBablmC-Evl8rS881k9oSOsh7A&oe=6754B85E&_nc_sid=8b3546",
                            "username": "tamannaahspeaks"
                        }
                    },
                    {
                        "node": {
                            "id": "243103112",
                            "full_name": "Neha Kakkar",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/468823506_1762861897839248_6951382891908269699_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=-xt5nuLMTVAQ7kNvgFxoDZi&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBPAAcGlsyLrevnI6xhaU5J_7PxQ8qQHlykbmg16Q9KiQ&oe=6754B4A9&_nc_sid=8b3546",
                            "username": "nehakakkar"
                        }
                    },
                    {
                        "node": {
                            "id": "419183879",
                            "full_name": "Surya Kumar Yadav (SKY)",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/450499735_408081858932705_6439420903584100631_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=UvRhwjhtj1oQ7kNvgHFXHOa&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAdVxgehrWOmC9cHTikU3TbyK810wK26-8_FA1AjDZPHw&oe=6754A17C&_nc_sid=8b3546",
                            "username": "surya_14kumar"
                        }
                    },
                    {
                        "node": {
                            "id": "8713286",
                            "full_name": "Sabrina Carpenter",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/447443351_468024175608791_5218768552235673662_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=EIdUATr89K8Q7kNvgFttR1v&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBVrZx2Iu4_1flL0SvtZ174IkSqIUyCcI-598TqOeV_sw&oe=6754B085&_nc_sid=8b3546",
                            "username": "sabrinacarpenter"
                        }
                    },
                    {
                        "node": {
                            "id": "44545955",
                            "full_name": "Shivam malik",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/139560857_837234770172880_6738104371477472785_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=FdPdRcxR3DkQ7kNvgFQXDzu&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYC1MHLLEK5PJg8SYORMARKdo-Eu6d-zePjChHEcsPXqxg&oe=67549A6C&_nc_sid=8b3546",
                            "username": "shivammalik09"
                        }
                    },
                    {
                        "node": {
                            "id": "368908448",
                            "full_name": "KIARA",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/453540166_477721808336638_4892586193589052378_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=5nvOmZPEhY0Q7kNvgHnYLTR&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBOjypKy27FEqIFCUaEroeODBWawcXCQqzmCh7UdfmHmw&oe=6754A6FA&_nc_sid=8b3546",
                            "username": "kiaraaliaadvani"
                        }
                    },
                    {
                        "node": {
                            "id": "284634734",
                            "full_name": "Disney",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/468842723_1080331463410743_7618177420542337085_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=pz3nOWEpRMMQ7kNvgHxAib9&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYCsAGLgwlIXPZCSk5S7AXf32BXH6gRKQZjTXuVxICioHw&oe=6754A03E&_nc_sid=8b3546",
                            "username": "disney"
                        }
                    },
                    {
                        "node": {
                            "id": "198154074",
                            "full_name": "Vogue",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/449319957_831601858493538_3317994094257200831_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=yfVJ8TNfKgEQ7kNvgEcSVkS&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAPTqXclbHGHxzx8847QFZ4i_69cfz4QlOSuKFPiguYtw&oe=6754ADC4&_nc_sid=8b3546",
                            "username": "voguemagazine"
                        }
                    },
                    {
                        "node": {
                            "id": "451573056",
                            "full_name": "Barbie",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/396151239_1054203065610193_3726580813507887042_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=GLwMu4VDBlIQ7kNvgEzjXuz&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYA00EUMB8G9U4qjv_T4HqivXtr_IR96SIWPgJS__hRniA&oe=6754AA4B&_nc_sid=8b3546",
                            "username": "nickiminaj"
                        }
                    },
                    {
                        "node": {
                            "id": "8179014770",
                            "full_name": "Arijit Singh",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/258874952_1115934952480051_2100666748796338283_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=6hlrP2SeTbYQ7kNvgFzrS1P&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYCHu0e7BQJnUNh4-bU60RY6PZyPFp_YzuE5hySz7lhpSA&oe=6754A38A&_nc_sid=8b3546",
                            "username": "arijitsingh"
                        }
                    },
                    {
                        "node": {
                            "id": "18240208",
                            "full_name": "shreyaghoshal",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/455072863_1447690989272698_6369489793168199411_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=S73TAVxcewQQ7kNvgHHk1m5&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYB2WH8yKZACgbV9ert5_H7V-UgItwCIso4ZV5hzgGbBJA&oe=6754A79C&_nc_sid=8b3546",
                            "username": "shreyaghoshal"
                        }
                    },
                    {
                        "node": {
                            "id": "3105117886",
                            "full_name": "Shikhar Dhawan",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/435093137_1155205448717904_407058117099144506_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=beEYOIijVowQ7kNvgF6CQSa&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAvoJFE-VMnirRS1zoEjf5BbzxBaFdXTwA299cxjMdiog&oe=67549384&_nc_sid=8b3546",
                            "username": "shikhardofficial"
                        }
                    },
                    {
                        "node": {
                            "id": "2336762476",
                            "full_name": "Hania Aamir 哈尼亚·阿米尔",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/464612808_1554746128745778_8465757470130506622_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=VKbCV2bpK_kQ7kNvgFsbEW3&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYC-2N-PFJ2MoQY-onovcCTbdn0vwvZZLIuqIQ61Vu9jXQ&oe=67549E2C&_nc_sid=8b3546",
                            "username": "haniaheheofficial"
                        }
                    },
                    {
                        "node": {
                            "id": "9156769353",
                            "full_name": "Yash",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/468212309_580614411121933_8745846147792073256_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=r3GV5yDqpYIQ7kNvgF9-eEq&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBzf5HeToSYJYF0gPZB-uI2NcNSqSq-ujKLwK2UZAGFxA&oe=6754A4FB&_nc_sid=8b3546",
                            "username": "thenameisyash"
                        }
                    },
                    {
                        "node": {
                            "id": "369719055",
                            "full_name": "URVASHI RAUTELA",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/467822822_9011080928956401_7851330330516900567_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=LILnKJFl-kYQ7kNvgHCblU0&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYA5CMqc4Pe7V4T2M5ZO62xi9kEJYMWCOawKw7Bb_l9jKA&oe=6754AF67&_nc_sid=8b3546",
                            "username": "urvashirautela"
                        }
                    },
                    {
                        "node": {
                            "id": "488476647",
                            "full_name": "Mumbai Indians",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/366549059_224060397255012_3260333162373351407_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=MkSU64s6ZvsQ7kNvgHm8WKR&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYB_-Yw_V1L2LrJ4POjTcEWwcjbxEixwok2-qeJUqAQ6hQ&oe=6754A829&_nc_sid=8b3546",
                            "username": "mumbaiindians"
                        }
                    },
                    {
                        "node": {
                            "id": "1386731284",
                            "full_name": "Jaya Sharma",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/325581232_153400157480686_5099185752934405016_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=gItXDSjVSbUQ7kNvgFZG7r0&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBSaqfU5TJKaWylTRo-GNVanWw-FYi4-PjUe61vWFwN-g&oe=675496F5&_nc_sid=8b3546",
                            "username": "iamjayakishori"
                        }
                    },
                    {
                        "node": {
                            "id": "595476198",
                            "full_name": "Emiway Bantai",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/462419082_372260192519050_7435916567777763608_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=110&_nc_ohc=totilfkK0w8Q7kNvgGnJwuQ&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBBF2fBGhq37Qa456EA2XPS8ARado8FXlHSFl9pD_omsw&oe=6754A6A8&_nc_sid=8b3546",
                            "username": "emiwaybantai"
                        }
                    },
                    {
                        "node": {
                            "id": "2713831542",
                            "full_name": "NAUGHTYWORLD",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/305745299_798267234545662_187865815135337091_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=k18SChiEHHMQ7kNvgFSbSH7&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAwOss0JsymxZwrKb0hJ8_-cjw4ZU4s6bnikzxrk1Bx6A&oe=6754ACC0&_nc_sid=8b3546",
                            "username": "naughtyworld"
                        }
                    },
                    {
                        "node": {
                            "id": "349445827",
                            "full_name": "Riteish Deshmukh",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/417794773_1125045142238934_8945869523580880824_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=E1fsS-fkMKcQ7kNvgEWRhvt&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDKRyCwamiVOFLmjbuAXWmu2lzodXwurttlxJ6yMz4xxw&oe=67549CEB&_nc_sid=8b3546",
                            "username": "riteishd"
                        }
                    },
                    {
                        "node": {
                            "id": "185546187",
                            "full_name": "Ed Sheeran",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/403394818_617019747102914_7351029689940325246_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=H7ibIPwHgrkQ7kNvgEkiGYx&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAOGNRUT0lPKIZIoNfvFrgJXpMRbs-11n6iUCFmdYIBWw&oe=6754A897&_nc_sid=8b3546",
                            "username": "teddysphotos"
                        }
                    },
                    {
                        "node": {
                            "id": "6860189",
                            "full_name": "Justin Bieber",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/464759654_2373923582944615_864489531494442281_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=CUB_2uYrpk0Q7kNvgFcuRHF&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYCxeXOAKp9UkFv7TgEE7N__SO55OU1qjqSwgNYG41l_4g&oe=6754BC8D&_nc_sid=8b3546",
                            "username": "justinbieber"
                        }
                    },
                    {
                        "node": {
                            "id": "5375738344",
                            "full_name": "Payal Gaming",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/465004262_779888560929719_7330679440484510249_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=pzWA729aBnUQ7kNvgG_eZLp&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAOfR7Qi6f91zlLhngG9nnoLWfgnvcQIOnutG3bGpZ3jQ&oe=675490CA&_nc_sid=8b3546",
                            "username": "payalgamingg"
                        }
                    },
                    {
                        "node": {
                            "id": "5388789693",
                            "full_name": "Shehnaaz Gill",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/461157410_505040299051761_1725322905686885214_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=0jAMtvUh1wYQ7kNvgEX0gM9&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDifl_WmNtwRibnF36xDMoKNbUrF3Aj8Wb91LDFfYNCIg&oe=6754B346&_nc_sid=8b3546",
                            "username": "shehnaazgill"
                        }
                    },
                    {
                        "node": {
                            "id": "1512489027",
                            "full_name": "B PRAAK",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/457010310_1022850675971519_1192241305511389630_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=elC35U5T9kUQ7kNvgGb2KYG&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBlkbJX0i036FtKgMCxifmvEtCFpoC3NziviS1EsKqnMA&oe=6754BE9C&_nc_sid=8b3546",
                            "username": "bpraak"
                        }
                    },
                    {
                        "node": {
                            "id": "10489193178",
                            "full_name": "Asaduddin Owaisi",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/120855441_184441303206688_273395917215733174_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=IvtR0ng6FuMQ7kNvgF9wg9W&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYALiL0yUX15rzxi8Lapchiw2oOCQTwFS6OkHJBLhDu4SA&oe=67549A5D&_nc_sid=8b3546",
                            "username": "asadowaisiofficial"
                        }
                    },
                    {
                        "node": {
                            "id": "187619120",
                            "full_name": "Louis Vuitton",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/338921586_107877965603626_7185510600648776838_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=e4dzNSHHYfkQ7kNvgEzS290&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYB-EaiuPIq4BE7gY19ChbE00OrMUMPLUzBPfM5QCFbsCg&oe=6754A50A&_nc_sid=8b3546",
                            "username": "louisvuitton"
                        }
                    },
                    {
                        "node": {
                            "id": "50538586528",
                            "full_name": "jhope",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/465894561_941479337880096_4292921755010665266_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=-BskjGyVrBQQ7kNvgHXNfEF&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBDDHE17GFsXtqoGEOXi_QIUFQ8fWfhE14ti8pecohYVQ&oe=6754A496&_nc_sid=8b3546",
                            "username": "uarmyhope"
                        }
                    },
                    {
                        "node": {
                            "id": "260375673",
                            "full_name": "FC Barcelona",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/459336167_505010198817792_2847686350039604361_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=Iny5Fxe7DRoQ7kNvgEzMecP&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBJxJ54cJsFIWJqBP7k9M3uhoOkuLuoWk5ko35QVHYsjg&oe=6754B661&_nc_sid=8b3546",
                            "username": "fcbarcelona"
                        }
                    },
                    {
                        "node": {
                            "id": "253625977",
                            "full_name": "433",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/430327608_1062280485005615_6382647912198003779_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=cI7yhHo03dAQ7kNvgHA-uUX&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYCkaWEXtk7aybyHHNqCilqf5v2X117jKKELjWfkVcFyHg&oe=6754A33E&_nc_sid=8b3546",
                            "username": "433"
                        }
                    },
                    {
                        "node": {
                            "id": "1625608507",
                            "full_name": "Olivia Rodrigo",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/376563093_980501436499585_839510698765422923_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=xT5g9NBWkPsQ7kNvgG2j2HD&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDrkLfypjQppFj4RzaKhGxgci_f-9YtYOMZC64z-hLIwQ&oe=6754A329&_nc_sid=8b3546",
                            "username": "oliviarodrigo"
                        }
                    },
                    {
                        "node": {
                            "id": "4213518589",
                            "full_name": "Kylian Mbappé",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/252713041_231066042425309_8989807381344431608_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=zSsHpVXqMKUQ7kNvgH-bbhW&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYD-5B9IENeozSHt4rZA7tzcssVfF-ES43ekIpX_VCGcyQ&oe=67549982&_nc_sid=8b3546",
                            "username": "k.mbappe"
                        }
                    },
                    {
                        "node": {
                            "id": "266439562",
                            "full_name": "Virginia Fonseca Serrão Costa",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/460160257_486327757709947_6804819831953332341_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=3ZvfVrs12bAQ7kNvgGZBKf4&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYC9u3wG5xJuUWUPuAlngWZhBL43KSwC_wrNrtr4Bgza1A&oe=6754C061&_nc_sid=8b3546",
                            "username": "virginia"
                        }
                    },
                    {
                        "node": {
                            "id": "1942463581",
                            "full_name": "Ryan Reynolds",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/449143556_467997939146713_110351252986464115_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=YwT_RKGSpXAQ7kNvgEz3IRG&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYCWs_k8Us2oss12EahD1CkTyrSCINgz75t3WztGvGdbyw&oe=67549477&_nc_sid=8b3546",
                            "username": "vancityreynolds"
                        }
                    },
                    {
                        "node": {
                            "id": "277798026",
                            "full_name": "Jubin Nautiyal",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/461711791_904798501541599_6044040688067184037_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=GWABRSyTC54Q7kNvgE0GpXK&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAesWL26La6OlPVmgaXSpzVlVEFNCKQyi1tEj0K3Kuelg&oe=675492CE&_nc_sid=8b3546",
                            "username": "jubin_nautiyal"
                        }
                    },
                    {
                        "node": {
                            "id": "3160772264",
                            "full_name": "Aaj Tak",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/299646105_737610433992585_5609042780834749475_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=GF5x3VzRy-EQ7kNvgHBqu28&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYC7_gGNKBLggMpfH_BbBsiM7OejmXuQC21P4VGmG-2zPw&oe=67549DB8&_nc_sid=8b3546",
                            "username": "aajtak"
                        }
                    },
                    {
                        "node": {
                            "id": "28806024763",
                            "full_name": "Total Gaming",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/327927939_1904141943255338_3306386808365877153_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=BFmfCY_eTmIQ7kNvgGTOxKL&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYC8kDUou7-Aad0KLFHqb8cRf_oYxmbeEyBUZ05vadlhoA&oe=67549F4E&_nc_sid=8b3546",
                            "username": "totalgaming_official"
                        }
                    },
                    {
                        "node": {
                            "id": "544032892",
                            "full_name": "Shakti Mohan",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/468283460_1277285860363933_9119165316774487610_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=sIQX9y-QrxEQ7kNvgEAavSN&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYApdYl2QpsZtPHOt-KCVSK_vBv8YoZn4FRjJhAAZNjCbw&oe=6754AAE2&_nc_sid=8b3546",
                            "username": "mohanshakti"
                        }
                    },
                    {
                        "node": {
                            "id": "208502444",
                            "full_name": "Premier League",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/416087893_260046536900534_2170846689513596883_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=mCd5OYnnspMQ7kNvgGaCrTb&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAvxogvqgEgFM8O3lvwj1S6cn9RHDD2n8MfKlHanmu4vg&oe=6754C566&_nc_sid=8b3546",
                            "username": "premierleague"
                        }
                    },
                    {
                        "node": {
                            "id": "4775926762",
                            "full_name": "MR. INDIAN HACKER",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/100368814_2613629482186109_6586377991033454592_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=64mGjWAVGYwQ7kNvgG4R1JE&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDXRjOGHWQo48Ewx4iG4FmdGkgYSWRQBhDfy2QZTiLHBw&oe=67549F0A&_nc_sid=8b3546",
                            "username": "dilraj_singh_rawat"
                        }
                    },
                    {
                        "node": {
                            "id": "3556810281",
                            "full_name": "Nitesh Soni",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/458777763_874836950769893_1964458491238834716_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=4yAfwtxRF1AQ7kNvgH6_9Er&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBkEQnN6KkYIZXnjo4FsDUevY2vhpCMwvZaO1ThRV4dVQ&oe=6754BF82&_nc_sid=8b3546",
                            "username": "niteshsoniy"
                        }
                    },
                    {
                        "node": {
                            "id": "1900092139",
                            "full_name": "Adah Sharma",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/318877147_497039235576954_5077097726660717102_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=AP4jw6rWltgQ7kNvgHWy8EM&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYCFRTDxVWAM2HWHx49_qWTZ6HC_tjxvbJWa7uaBskCuCg&oe=6754A0A4&_nc_sid=8b3546",
                            "username": "adah_ki_adah"
                        }
                    },
                    {
                        "node": {
                            "id": "296283961",
                            "full_name": "Remo Dsouza",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/100480915_665662153984258_1168832223839780864_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=kiQJJd0VtfsQ7kNvgG-iIb5&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYCu7-AeZ1bwBKP895HYiNuMmTV-11wi3zqmtzS5LN9YiA&oe=675493D9&_nc_sid=8b3546",
                            "username": "remodsouza"
                        }
                    },
                    {
                        "node": {
                            "id": "18900337",
                            "full_name": "flame",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/11348214_1481558242162220_192850898_a.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=cggANhx8XuMQ7kNvgEn5CAm&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDzV1Nhy8FqTc5nYktp7Tc7qWWPllvLFHhpF3YkRs5T5g&oe=6754C421&_nc_sid=8b3546",
                            "username": "travisscott"
                        }
                    },
                    {
                        "node": {
                            "id": "1132553746",
                            "full_name": "Congress",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/434763501_1348110855850799_3111972662983277908_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=hyGsrAZ9tZsQ7kNvgF7LYTi&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYB2YpptG9VVQgJczgiC3aEmB9MlkHwBWByQfqB3nQYg0g&oe=6754AD89&_nc_sid=8b3546",
                            "username": "incindia"
                        }
                    },
                    {
                        "node": {
                            "id": "6950924339",
                            "full_name": "Aamir Trt",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/432794600_205420135998694_5789975248821408159_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=B-jG5ekzZ5QQ7kNvgGDYBim&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDDHJQHfc0NlcZasU0bOauDq7X33_1dTp1-kLC5UIJoYg&oe=6754C78F&_nc_sid=8b3546",
                            "username": "aamir.trt"
                        }
                    },
                    {
                        "node": {
                            "id": "1287006597",
                            "full_name": "Vin Diesel",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/82920451_2831151230281357_9147763080388673536_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=-dqfUVKlrU8Q7kNvgECl6dQ&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAw9C4sdCSnlANLSuu-nhQH3S1T9RfjM5Rbw-oh942tWg&oe=6754AC73&_nc_sid=8b3546",
                            "username": "vindiesel"
                        }
                    },
                    {
                        "node": {
                            "id": "2373567638",
                            "full_name": "Ajay Devgn",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/434148454_7000073053424336_4414837427989339451_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=HulG3qI6BpIQ7kNvgHDSPrL&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYCAZ-Wg59FRhMwX0noUZokIN838gh3gCDLZVolVf7Frgw&oe=6754B7F2&_nc_sid=8b3546",
                            "username": "ajaydevgn"
                        }
                    },
                    {
                        "node": {
                            "id": "208560325",
                            "full_name": "Khloé Kardashian",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/426155842_1329990584314844_1040329979907140346_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=o7w_soTsaAsQ7kNvgEFvoiR&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYCOYNMoxE97rlDUT07An5LXBmiuCVeCiUxy9hTvieQ09Q&oe=6754C0F6&_nc_sid=8b3546",
                            "username": "khloekardashian"
                        }
                    },
                    {
                        "node": {
                            "id": "5880761",
                            "full_name": "Manchester City",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/465986871_1259245451984451_4093367974632806447_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=Hpi4TlAK8TgQ7kNvgEE8noR&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYB89N_kekAYhdM9a64JsFRsljWit0ircWSyu644QamAyw&oe=6754B9DA&_nc_sid=8b3546",
                            "username": "mancity"
                        }
                    },
                    {
                        "node": {
                            "id": "46335750",
                            "full_name": "Doja Cat",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-3.cdninstagram.com/v/t51.2885-19/434738393_932768658404073_6245331167789051293_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-3.cdninstagram.com&_nc_cat=109&_nc_ohc=F1Q7UTMzKKIQ7kNvgEeTsJK&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYB7J-8ldlenzj1ODe8Yv_Aq0OVCsfcU4N6r6fScuU1dbQ&oe=6754B94C&_nc_sid=8b3546",
                            "username": "dojacat"
                        }
                    },
                    {
                        "node": {
                            "id": "291056203",
                            "full_name": "mon",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/468303127_493983332991083_8916304607624113964_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=ZF05UK-wILcQ7kNvgEGSbfV&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBIZgAUaXwe3b2y5Msmjk51Us_mZ3bhHuRLzGxZfCaxsw&oe=6754955B&_nc_sid=8b3546",
                            "username": "imouniroy"
                        }
                    },
                    {
                        "node": {
                            "id": "1491142059",
                            "full_name": "ghantaa",
                            "is_private": false,
                            "is_verified": false,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/239641404_1066981620499551_8231249129691433902_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=6YZt5gNV7EoQ7kNvgEt3J-w&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYDVExIggY3EOaiAHExYZZ2R3BDTS9HKUpHEoAbbfeEuNg&oe=6754C32D&_nc_sid=8b3546",
                            "username": "ghantaa"
                        }
                    },
                    {
                        "node": {
                            "id": "2323569232",
                            "full_name": "Shreyas Iyer",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/428395793_409934608108418_4367497671503613259_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=OGBdYQIUgbEQ7kNvgHNTfAr&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBhsI8LIpgF5YVc1sj4IGiGUcvQa_GRFw38aDQl44TwoA&oe=6754983E&_nc_sid=8b3546",
                            "username": "shreyasiyer96"
                        }
                    },
                    {
                        "node": {
                            "id": "3589848130",
                            "full_name": "prime video IN",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/455252351_3726466170960191_7180958096176508553_n.jpg?stp=dst-jpg_s150x150&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=5RT2HA8uIlEQ7kNvgE1zLd_&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAptA-9DpbBTIVBp-Vj7ZYpTZWskpCCiQp10nDwlPxCdQ&oe=6754AFC0&_nc_sid=8b3546",
                            "username": "primevideoin"
                        }
                    },
                    {
                        "node": {
                            "id": "1423380971",
                            "full_name": "Trolls Official",
                            "is_private": false,
                            "is_verified": true,
                            "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/412700181_1185678402838273_5383548015509103285_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=1&_nc_ohc=gMdzFj8Rqj8Q7kNvgEbDIOH&_nc_gid=bc52f0d5a355425ca1824eac8cfe4e75&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYBxU6ivAg03X9A6Ddk4-iz1DDnNKga75VWKVovQ0Oe8jw&oe=6754B2CB&_nc_sid=8b3546",
                            "username": "trolls_official"
                        }
                    }
                ]
            }
        }
    },
    "status": "ok"
}