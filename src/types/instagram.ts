export interface InstagramPost {
  id: string;
  code: string;
  shortcode?: string;
  image_versions?: {
    url: string;
    width: number;
    height: number;
  }[];
  // Formato alternativo para image_versions usado pela ScrapingDog API
  image_versions2?: {
    candidates?: {
      url: string;
      width: number;
      height: number;
    }[];
    items?: {
      url: string;
      width?: number;
      height?: number;
    }[];
  };
  like_count: number;
  comment_count: number;
  views_count?: number;
  view_count?: number;
  video_view_count?: number;
  is_video?: boolean;
  is_carousel?: boolean;
  is_reel?: boolean;
  product_type?: string;
  caption?: string | {
    text: string;
  };
  edge_media_to_caption?: {
    edges: {
      node: {
        text: string;
      };
    }[];
  };
  link: string;
  media_type?: number | string;
  video_url?: string;
  video_duration?: number;
  thumbnail_url?: string;
  image_url?: string;
  display_url?: string;
  permalink?: string;
  instagram_url?: string;
  selected?: boolean;
  displayName?: string;
  // Campos adicionais da ScrapingDog API
  __typename?: string;
  edge_media_preview_like?: {
    count: number;
  };
  edge_media_to_comment?: {
    count: number;
  };
  thumbnail_resources?: {
    src: string;
    config_width: number;
    config_height: number;
  }[];
  type?: string;
}
