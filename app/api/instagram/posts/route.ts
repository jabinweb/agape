import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/instagram/posts
 * Fetch Instagram posts from a public profile
 * WARNING: This is against Instagram's ToS and may stop working at any time
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username') || 'atelier7x.art';
    const limit = parseInt(searchParams.get('limit') || '12');

    // Use the working Instagram API endpoint
    const instagramUrl = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`;
    
    const response = await fetch(instagramUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'identity',
        'Referer': `https://www.instagram.com/${username}/`,
        'X-Requested-With': 'XMLHttpRequest',
        'X-IG-App-ID': '936619743392459',
        'X-IG-WWW-Claim': '0',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Ch-UA': '"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"',
        'Sec-Ch-UA-Mobile': '?0',
        'Sec-Ch-UA-Platform': '"Windows"',
        // Add some cookies to appear more like a real browser
        'Cookie': 'ig_nrcb=1; datr=vh4BZ4obBQOdoEq48HQD4Oku; ig_did=6E629010-0814-4D26-AB85-63C4590DBFE5; mid=aApVwgALAAHJoJjwWvlcf7hvn4Tl; dpr=1.25; ps_l=1; ps_n=1; wd=1282x778',
      },
    });

    if (!response.ok) {
      console.warn(`Instagram API failed with status: ${response.status}`);
      return NextResponse.json({
        success: false,
        message: 'Instagram API unavailable, using placeholder data',
        posts: generatePlaceholderPosts(limit)
      });
    }

    // Log response headers and content type for debugging
    const contentType = response.headers.get('content-type') || '';
    console.log('Instagram API response content-type:', contentType);
    
    if (!contentType.includes('application/json')) {
      console.warn('Instagram returned non-JSON response, likely blocked');
      const text = await response.text();
      console.log('Response preview:', text.substring(0, 200));
      return NextResponse.json({
        success: false,
        message: 'Instagram blocked the request, using placeholder data',
        posts: generatePlaceholderPosts(limit)
      });
    }

    // Get response as text first to check if it's JSONP
    const responseText = await response.text();
    console.log('Response preview:', responseText.substring(0, 100));
    
    let data;
    try {
      // Check if response is JSONP (starts with function call or parentheses)
      if (responseText.trim().startsWith('(') && responseText.trim().endsWith(')')) {
        console.log('Detected JSONP format, extracting JSON content');
        // Remove outer parentheses for JSONP format
        const jsonContent = responseText.trim().slice(1, -1);
        data = JSON.parse(jsonContent);
      } else if (responseText.includes('callback(') || responseText.includes('window._sharedData')) {
        console.log('Detected callback JSONP format');
        // Try to extract JSON from callback pattern
        const jsonMatch = responseText.match(/(?:callback\(|window\._sharedData\s*=\s*)(.+?)(?:\);?|;)/);
        if (jsonMatch && jsonMatch[1]) {
          data = JSON.parse(jsonMatch[1]);
        } else {
          throw new Error('Could not extract JSON from JSONP callback');
        }
      } else {
        // Try to parse as regular JSON
        data = JSON.parse(responseText);
      }
    } catch (parseError) {
      console.error('Failed to parse Instagram response:', parseError);
      console.log('Raw response length:', responseText.length);
      console.log('First 500 chars:', responseText.substring(0, 500));
      return NextResponse.json({
        success: false,
        message: 'Instagram response format error, using placeholder data',
        posts: generatePlaceholderPosts(limit)
      });
    }
    
    // Extract posts from the Instagram API response structure
    // Handle both possible response structures:
    // 1. Direct: data.edge_owner_to_timeline_media.edges
    // 2. Nested: data.data.user.edge_owner_to_timeline_media.edges
    const posts = data?.edge_owner_to_timeline_media?.edges || 
                  data?.data?.user?.edge_owner_to_timeline_media?.edges || [];
    
    console.log('Found posts:', posts.length);
    
    const formattedPosts = posts.slice(0, limit).map((edge: any) => {
      const post = edge.node;
      const originalImageUrl = post.display_url || post.thumbnail_src || '';
      
      // Create a proxied URL to bypass CORS restrictions
      const proxiedImageUrl = originalImageUrl 
        ? `/api/instagram/proxy?url=${encodeURIComponent(originalImageUrl)}`
        : '';
      
      return {
        id: post.id,
        imageUrl: proxiedImageUrl,
        caption: post.edge_media_to_caption?.edges?.[0]?.node?.text || '',
        likes: post.edge_liked_by?.count || 0,
        comments: post.edge_media_to_comment?.count || 0,
        permalink: `https://www.instagram.com/p/${post.shortcode}/`,
        timestamp: post.taken_at_timestamp,
      };
    });

    const res = NextResponse.json({
      success: true,
      posts: formattedPosts,
      username
    });
    res.headers.set("Access-Control-Allow-Origin", "*"); 
    res.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.headers.set("Access-Control-Allow-Headers", "Content-Type");
    return res;


  } catch (error) {
    console.error('Error fetching Instagram posts:', error);
    
    // Return placeholder data as fallback
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch Instagram posts, using placeholder data',
      posts: generatePlaceholderPosts(12)
    });
  }
}

function generatePlaceholderPosts(count: number) {
  const placeholderImages = [
    'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1143754/pexels-photo-1143754.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1187079/pexels-photo-1187079.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1143754/pexels-photo-1143754.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1187079/pexels-photo-1187079.jpeg?auto=compress&cs=tinysrgb&w=400',
  ];

  return Array.from({ length: count }, (_, index) => ({
    id: `placeholder-${index}`,
    imageUrl: placeholderImages[index % placeholderImages.length],
    caption: `Beautiful artwork #${index + 1} from our gallery`,
    likes: Math.floor(Math.random() * 100) + 10,
    comments: Math.floor(Math.random() * 20) + 1,
    permalink: `https://www.instagram.com/p/placeholder${index}/`,
    timestamp: Date.now() - (index * 24 * 60 * 60 * 1000), // Days ago
  }));
}


