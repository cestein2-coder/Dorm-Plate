import React, { useEffect, useState } from 'react';
import { Heart, Bookmark, Clock, ChefHat, Users, Loader2, AlertCircle, Plus } from 'lucide-react';
import { communityHelpers } from '../../lib/mvp-supabase';
import { useAuth } from '../auth/AuthProvider';
import type { CommunityPost } from '../../lib/mvp-types';

interface CommunityFeedProps {
  onCreatePost?: () => void;
}

const CommunityFeed: React.FC<CommunityFeedProps> = ({ onCreatePost }) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadPosts();
  }, [user]);

  const loadPosts = async () => {
    setLoading(true);
    setError('');
    
    try {
      const { data, error: fetchError } = await communityHelpers.getAllPosts(user?.id);
      
      if (fetchError) {
        console.error('Error loading posts:', fetchError);
        
        // Check if it's a table doesn't exist error
        if (fetchError.message?.includes('relation') && fetchError.message?.includes('does not exist')) {
          setError('Community feature not yet set up. Please run the database migration first. Check COMMUNITY_FEATURE_GUIDE.md for instructions.');
        } else {
          setError(`Failed to load community posts: ${fetchError.message || 'Unknown error'}`);
        }
      } else if (data) {
        setPosts(data as any);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string, isCurrentlyLiked: boolean) => {
    if (!user) {
      setError('Please sign in to like posts');
      return;
    }

    setActionLoading(postId);
    
    try {
      if (isCurrentlyLiked) {
        await communityHelpers.unlikePost(postId);
        setPosts(posts.map(post => 
          post.id === postId 
            ? { ...post, likes_count: post.likes_count - 1, is_liked_by_user: false }
            : post
        ));
      } else {
        await communityHelpers.likePost(postId);
        setPosts(posts.map(post => 
          post.id === postId 
            ? { ...post, likes_count: post.likes_count + 1, is_liked_by_user: true }
            : post
        ));
      }
    } catch (err) {
      console.error('Error toggling like:', err);
      setError('Failed to update like');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSave = async (postId: string, isCurrentlySaved: boolean) => {
    if (!user) {
      setError('Please sign in to save posts');
      return;
    }

    setActionLoading(postId);
    
    try {
      if (isCurrentlySaved) {
        await communityHelpers.unsavePost(postId);
        setPosts(posts.map(post => 
          post.id === postId 
            ? { ...post, saves_count: post.saves_count - 1, is_saved_by_user: false }
            : post
        ));
      } else {
        await communityHelpers.savePost(postId);
        setPosts(posts.map(post => 
          post.id === postId 
            ? { ...post, saves_count: post.saves_count + 1, is_saved_by_user: true }
            : post
        ));
      }
    } catch (err) {
      console.error('Error toggling save:', err);
      setError('Failed to update save');
    } finally {
      setActionLoading(null);
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-food-orange" />
        <span className="ml-3 text-gray-600">Loading community posts...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Post button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-food-brown">Community Picks</h2>
          <p className="text-gray-600 mt-1">Trending meals from students</p>
        </div>
        {onCreatePost && (
          <button
            onClick={onCreatePost}
            className="flex items-center space-x-2 bg-food-orange text-white px-6 py-3 rounded-lg font-semibold hover:bg-food-orange-dark transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Share Your Meal</span>
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Posts Grid */}
      {posts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No posts yet</h3>
          <p className="text-gray-600 mb-6">Be the first to share a meal recommendation!</p>
          {onCreatePost && (
            <button
              onClick={onCreatePost}
              className="bg-food-orange text-white px-6 py-3 rounded-lg font-semibold hover:bg-food-orange-dark transition-colors"
            >
              Create First Post
            </button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-100"
            >
              {/* Post Image */}
              {post.image_url && (
                <div className="relative h-48 bg-gray-200">
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-5">
                {/* Post Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-food-brown mb-1">{post.title}</h3>
                    <div className="flex items-center text-sm text-gray-500 space-x-2">
                      <Users className="h-4 w-4" />
                      <span>{(post as any).user_name || 'Anonymous'}</span>
                      {(post as any).user_university && (
                        <>
                          <span>•</span>
                          <span>{(post as any).user_university}</span>
                        </>
                      )}
                    </div>
                  </div>
                  {post.difficulty && (
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getDifficultyColor(post.difficulty)}`}>
                      {post.difficulty}
                    </span>
                  )}
                </div>

                {/* Description */}
                {post.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{post.description}</p>
                )}

                {/* Ingredients */}
                {post.ingredients && post.ingredients.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-2">
                      {post.ingredients.slice(0, 5).map((ingredient, idx) => (
                        <span
                          key={idx}
                          className="bg-food-yellow px-2 py-1 rounded-full text-xs font-medium text-food-brown"
                        >
                          {ingredient}
                        </span>
                      ))}
                      {post.ingredients.length > 5 && (
                        <span className="text-xs text-gray-500 py-1">
                          +{post.ingredients.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Metadata */}
                <div className="flex items-center text-sm text-gray-500 space-x-4 mb-4">
                  {post.prep_time && (
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{post.prep_time}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <ChefHat className="h-4 w-4" />
                    <span>{post.difficulty || 'medium'}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleLike(post.id, post.is_liked_by_user || false)}
                    disabled={actionLoading === post.id}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      post.is_liked_by_user
                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Heart
                      className={`h-5 w-5 ${post.is_liked_by_user ? 'fill-current' : ''}`}
                    />
                    <span>{post.likes_count}</span>
                  </button>

                  <button
                    onClick={() => handleSave(post.id, post.is_saved_by_user || false)}
                    disabled={actionLoading === post.id}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      post.is_saved_by_user
                        ? 'bg-food-green text-white hover:bg-green-600'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Bookmark
                      className={`h-5 w-5 ${post.is_saved_by_user ? 'fill-current' : ''}`}
                    />
                    <span>{post.is_saved_by_user ? 'Saved' : 'Save'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommunityFeed;
